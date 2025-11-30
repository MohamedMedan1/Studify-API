const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const User = require("../models/userModel");

const generateJWTAndSendResponse = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: "none",
  });


  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
};

exports.login = (Model) =>
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new AppError("Please provide your email and password while login", 400)
      );
    }

    const user = await Model.findOne({ email }).select("+password");

    if (!user || !(await user.isCorrectPassword(password, user.password))) {
      return next(new AppError("Your email or password is in correct", 400));
    }

    generateJWTAndSendResponse(user, res);
  });

exports.protect = catchAsync(async (req, res, next) => {
  // 1)- Catch JWT
  const token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new AppError("You are not logged in! Please log in.", 401));
  }

  // 2)- Check Token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decode.id);

  // 3)- Check if user is still exist
  if (!user) {
    return next(new AppError("There is no user with that Id", 404));
  }

  // 4)- Check if user doesn't change password after login
  if (await user.isPasswordChangedAfterLogin(decode.iat)) {
    return next(
      new AppError("You changed password after login please, log in again", 401)
    );
  }

  // Append user into request details
  req.user = user;
  next();
});

exports.updatePassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return next(
        new AppError(
          "Please provide old password , new password and confirm new password",
          400
        )
      );
    }

    const user = await Model.findById(req.user._id).select("+password");

    if (!user) {
      return next(new AppError("There is no user with that Id", 404));
    }

    // 3)- Check if old password is same as the saved one
    if (!(await user.isCorrectPassword(currentPassword, user.password))) {
      return next(new AppError("Incorrect password", 400));
    }

    // Updates Layer
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    generateJWTAndSendResponse(user, res);
  });

// Middleware
exports.forgotPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const email = req.body.email;

    if (!email) {
      return next(
        new AppError("Please provide email to send reset token via email", 400)
      );
    }

    // 1)- Create Reset Token By Crypto
    const user = await Model.findOne({ email });

    if (!user) {
      return next(new AppError("Please provide account email", 404));
    }

    const resetToken = user.generateResetToken();
    await user.save({ validateBeforeSave: false });

    // Email Message =>> https://127.0.0.1/api/v1/admins/resetPassword/resetToken(132ada13ird7ey2)
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/admins/resetPassword/${resetToken}`;

    // 2)- Send Reset Token To User Via Email
    try {
      const options = {
        to: user.email,
        subject: "Your password reset token (valid for 10 minutes)",
        content: resetURL,
      };
      await sendEmail(options);
      // send res
      res.status(200).json({
        status: "success",
        message: "Reset token sent to your email!",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email. Try again later!",
          500
        )
      );
    }
  });

exports.resetPassword = (Model) =>
  catchAsync(async (req, res, next) => {
    const resetToken = req.params.resetToken;
    const { newPassword, newPasswordConfirm } = req.body;

    // 1)- Compare sended reset token with saved hashed reset token
    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await Model.findOne({ passwordResetToken: hashedResetToken });

    if (!user) {
      return next(new AppError("Your reset token is invalid", 404));
    }

    // 2)- Check if reset token is still valid
    if (!user.isResetTokenStillValid()) {
      return next(
        new AppError(
          "Reset Token was expired please, go to forgotPassword again",
          400
        )
      );
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    generateJWTAndSendResponse(user, res);
  });

// ====== Authorization  ======
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next();
    }
    return next(
      new AppError("You are not authorized to perform that action", 403)
    );
  };
};
