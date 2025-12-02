const Enrollment = require("../models/enrollmentModel");
const Grade = require("../models/gradeModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { getAll } = require("./handlerFactory");
const Instructor = require("../models/instructorModel");

// To prevent make enroll course with inActive Instructor
exports.preventEnrollCourseWithInActiveInstructor = catchAsync(async (req, res, next) => {
  const { instructor } = req.body;

  const curInstructor = await Instructor.findById(instructor);

  if (!curInstructor) {
    return next(new AppError("There is no instructor with that Id", 404));
  }

  if (!curInstructor.isActive) {
    return next(new AppError("This Instructor is inActive now choose another instructor and try again ", 400));
  }

  next();
});

// Middleware to check if std complete the course then he couldn't cancel enrollment
exports.checkIfStdCompleteTheCourse = catchAsync(async (req, res, next) => {
  const { studentId, enrollId } = req.params;

  const enroll = await Enrollment.findOne({
    _id: enrollId,
    student: studentId,
  }); //{student,course}

  if (!enroll) {
    return next(new AppError("There is no enroll with that Id", 404));
  }

  const courseId = enroll.course;

  if (!courseId) {
    return next(new AppError("This Enroll doesn't have course Id", 400));
  }

  const enrollGrade = await Grade.findOne({
    course: courseId,
    student: studentId,
  });

  if (enrollGrade) {
    return next(
      new AppError(
        `Student: ${studentId} already completed this course and get grade: ${enrollGrade.grade}`
      )
    );
  }

  next();
});

exports.checkStudentEnrollments = catchAsync(async (req, res, next) => {
  const studentId = req.params.studentId || req.user._id;
  const courseId = req.body.course;

  const existing = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existing) {
    return next(new AppError("You already enrolled this course once", 400));
  }

  next();
});

exports.getAllStudentsEnrollments = getAll(
  Enrollment,
  { path: "student", select: "name email" },
  { path: "course", select: "name level" }
);

exports.getAllEnrollments = catchAsync(async (req, res, next) => {
  const filter = req.params.studentId ? { student: req.params.studentId } : {};

  const enrollments = await Enrollment.find(filter)
    .populate({ path: "student", select: "name email" })
    .populate({ path: "course", select: "name level" });

  res.status(200).json({
    status: "success",
    results: enrollments.length,
    data: enrollments,
  });
});

exports.createNewEnrollment = catchAsync(async (req, res, next) => {
  const student = req.params.studentId || req.user._id;

  const newEnrollment = await Enrollment.create({ ...req.body, student });

  res.status(201).json({
    status: "success",
    data: newEnrollment,
  });
});

exports.getEnrollment = catchAsync(async (req, res, next) => {
  const { studentId, enrollId } = req.params;

  const filter = { _id: enrollId };
  if (studentId) filter.student = studentId;

  const enrollment = await Enrollment.findOne(filter)
    .populate({ path: "student", select: "name email" })
    .populate({ path: "course", select: "name level" })
    .populate({ path: "instructor", select: "name" });
  
  if (!enrollment) {
    const msg = studentId
      ? `Student: ${studentId} doesn't have enrollment with ID: ${enrollId}`
      : `No enrollment found with ID: ${enrollId}`;

    return next(new AppError(msg, 404));
  }

  res.status(200).json({
    status: "success",
    data: enrollment,
  });
});

exports.deleteEnrollment = catchAsync(async (req, res, next) => {
  const { studentId, enrollId } = req.params;

  const filter = { _id: enrollId };
  if (studentId) filter.student = studentId;

  const deleted = await Enrollment.findOneAndDelete(filter);

  if (!deleted) {
    const msg = studentId
      ? `Student: ${studentId} doesn't have enrollment with ID: ${enrollId}`
      : `No enrollment found with ID: ${enrollId}`;
    return next(new AppError(msg, 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
