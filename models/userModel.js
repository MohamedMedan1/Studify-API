const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = require("validator");

/*
Enable Generalization S = Student , A = Admin , I = Instructor
  User
  / | \
  S I A
*/
const options = { discriminatorKey: "type", collection: "users" };

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, "User name should be at least 3 characters"],
    maxLength: [30, "User name should be at most 30 characters"],
    required: [true, "Please provide user name!"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide email!"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "Password length should be at least 8 characters"],
    maxLength: [16, "Password length should be at most 16 characters"],
    validate: [
      validator.isStrongPassword,
      "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special symbol.",
    ],
    select:false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm a password"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Your confirmed password must be equal to original password",
    },
  },
  role: {
    type: String,
    enum: {
      values: ["instructor","student","admin", "super admin"],
      message: "Admin role only can be instructor, student, admin or super admin",
    },
    required: [true, "Please provide user role"],
  },
  image: {
    type: String,
    default: "/img/user.png",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default:Date.now,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires:Date
},options);

// Create an index to optimize queries performance
userSchema.index({name:1,email:1})

// Pre document middleware to lower case the gender value
userSchema.pre("save", function (next) {
  this.role = this.role?.toLowerCase();
  next();
});

// Pre document middleware to hash password when user create account for the first time or password has been updated
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

// Pre document middleware to set passwordChangedAt time  when user update password
userSchema.pre("save", function (next) {
  if (this.isModified("password") && !this.isNew) {
    this.passwordChangedAt = Date.now();
  }
  next();
});

// Instance Function that check if user entered password is correct or not
userSchema.methods.isCorrectPassword = async function (candidatePassword, adminPassword) {
  return await bcrypt.compare(candidatePassword, adminPassword);
};

// Instance Method to check if password was changed after login or not 
userSchema.methods.isPasswordChangedAfterLogin = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(new Date(this.passwordChangedAt).getTime() / 1000);
    return passwordChangedTimeStamp > jwtTimeStamp;
  }
  return false;
};

// Instance Method to generate reset password token, hash it and save into user doc
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + (10 * 60 * 1000);

  return resetToken;
}  

// Intance Method to check if reset token not expires
userSchema.methods.isResetTokenStillValid = function () {
  return Date.now() < this.passwordResetExpires;
}

const User = mongoose.model("User", userSchema);
module.exports = User;