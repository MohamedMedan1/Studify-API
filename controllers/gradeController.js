const Grade = require("../models/gradeModel");
const Enrollment = require("../models/enrollmentModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { updateOne, deleteOne } = require("./handlerFactory");

// Check if student enrolled this course before create grade on it
exports.isEnrolledCourse = async (req, res, next) => {
  const student = req.params.studentId;
  const course =  req.body.course;

  const isExisting = await Enrollment.findOne({ student, course });

  if (!isExisting) {
    return next(new AppError("Please Enroll this course to be able to get grade on it!", 400));
  }

  next();
}

exports.getAllStudentGrades = catchAsync(async (req, res, next) => {
  const studentId = req.params.studentId || req.user._id;

  const grades = await Grade.find({ student: studentId });
  
  res.status(200).json({
    status: 'success',
    data: grades,
  });
});

exports.createNewGrade = catchAsync(async (req, res, next) => {
  const studentId = req.params.studentId || req.user._id;

  const newGrade = await Grade.create({ ...req.body,student:studentId });

  res.status(201).json({
    status: "success",
    data: newGrade,
  });
});

exports.getStudentGradeByCourseID = catchAsync(async (req, res, next) => {
  const studentId = req.params.studentId || req.user._id;
  const courseId = req.params.courseId;

  const grade = await Grade.findOne({ student: studentId, course: courseId });

  if (!grade) {
    return next(new AppError(`There is no grade for student: ${studentId} in course: ${courseId}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: grade
  });
});

exports.getStudentGradeByGradeID =  catchAsync(async (req, res, next) => {
  const studentId = req.params.studentId || req.user._id;
  const gradeId = req.params.id;
  
  const grade = await Grade.findOne({ student: studentId, _id: gradeId });

  if (!grade) {
    return next(new AppError(`There is no grade for student: ${studentId} with that grade Id: ${gradeId}`, 404));
  }

  res.status(200).json({
    status: 'success',
    data: grade
  });
});

exports.updateGrade = updateOne(Grade);
