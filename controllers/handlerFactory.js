const fs = require('fs');
const path = require('path');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const filterFields = require("../utils/filterFields");
const multer = require("multer");
const sharp = require("sharp");
const supabase = require("../utils/supabase");
const User = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");

exports.appendUserEmail = (req, _, next) => {
  req.body.email = req.body.email || req.user.email;
  next();
};

exports.setDefaultUserImage = (req, _, next) => {
  if (!req.file) {
    const defaultImagePath = path.join(__dirname, "../public/images/user.png");
    const buffer = fs.readFileSync(defaultImagePath); 

    req.file = {
      originalname: 'user.png',
      buffer: buffer,
      mimetype: 'image/png',
      filename: 'user.png', 
      fieldname: 'image', 
    };
  }
  next();
};

const multerStorage = multer.memoryStorage();
const filterImages = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Only images are allowed", 403));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: filterImages,
});

// Append file info into req.file
exports.uploadUserImage = upload.single("image");

exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.file || req.file.fieldname !== "image") return next();

  const fileName = `user-${req.body.email.split("@")[0]}.jpg`;

  const editedImageBuffer = await sharp(req.file.buffer)
    .resize(1000)
    .jpeg({ quality: 90 })
    .toBuffer();

  const { error } = await supabase.storage
    .from("uploads")
    .upload(fileName, editedImageBuffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.log(error);
    return next(error);
  }

  const { data } = supabase.storage.from("uploads").getPublicUrl(fileName);

  req.body.image = data.publicUrl;
  next();
});

exports.removeUserImage = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (user.image) {
    const path = user.image.split("uploads/")[1];
    const { error } = await supabase.storage.from("uploads").remove([path]);
    
    if (error) {
      console.log(error);
      return next(error);
    }
  }
  next();
});

exports.appendDeActiveBody = (req, _, next) => {
  req.body = { isActive: false };
  next();
};

exports.preventUnWantedFields = (req, _, next) => {
  req.body = filterFields(
    req.body,
    "password",
    "passwordConfirm",
    "role",
    "isActive"
  );
  next();
};

exports.reqBodylowerCase = (req, _, next) => {
  const fieldsToLower = ["gender", "role"];
  fieldsToLower.forEach((cur) => {
    if (req.body[cur]) req.body[cur] = req.body[cur].toLowerCase();
  });

  next();
};

exports.getAll = (Model, ...populateOptions) =>
  catchAsync(async (req, res, next) => {
    const docQuery = new APIFeatures(Model.find(),req.query)
      .filter().sort().limit().paginate().query;

    if (populateOptions.length > 0) {
      populateOptions.forEach((popOption) => docQuery.populate(popOption));
    }

    const docs = await docQuery;

    res.status(200).json({
      status: "success",
      results: docs.length,
      data: docs,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: newDoc,
    });
  });

exports.getOne = (Model, ...populateOptions) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const docQuery = Model.findById(id);

    if (populateOptions.length > 0) {
      populateOptions.forEach((popOption) => docQuery.populate(popOption));
    }
    const doc = await docQuery;

    if (!doc) {
      return next(new AppError("There is no Document with that Id", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const updatedDoc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) {
      return next(new AppError("There is no Document with that Id", 404));
    }

    res.status(200).json({
      status: "success",
      data: updatedDoc,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const deleted = await Model.findByIdAndDelete(id);

    if (!deleted) {
      return next(new AppError("There is no Document with that Id", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.deleteAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const deletedDocs = await Model.deleteMany();

    if (deletedDocs.deletedCount === 0) {
      return next(new AppError("There is no Document with that Id", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.deActivate = (Model) =>
  catchAsync(async (req, res, next) => {
    const docId = req.params.id;

    if (Object.keys(req.body).length > 1) {
      return next(
        new AppError("You only can enter isActive field in req.body", 403)
      );
    }

    const deActivatedDocument = await Model.findByIdAndUpdate(docId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!deActivatedDocument) {
      return next(new AppError("There is no doc with that Id", 404));
    }

    res.status(200).json({
      status: "success",
      data: deActivatedDocument,
    });
  });

// ======== Me Methods  ========
exports.getMe = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.user._id) {
      return next(new AppError("You are no logged in", 401));
    }

    const doc = await Model.findById(req.user._id);

    if (!doc) {
      return next(new AppError("There is no document with that Id", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.updateMe = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.user._id) {
      return next(new AppError("You are no logged in", 401));
    }

    const doc = await Model.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("There is no document with that Id", 404));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.deActivateMe = (Model) =>
  catchAsync(async (req, res, next) => {
    if (!req.user?._id) {
      return next(new AppError("You are no logged in", 401));
    }

    const deActivatedDocument = await Model.findByIdAndUpdate(
      req.user._id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deActivatedDocument) {
      return next(new AppError("There is no doc with that Id", 404));
    }

    res.status(200).json({
      status: "success",
      data: deActivatedDocument,
    });
  });
