const Instructor = require("../models/instructorModel");
const Enrollment = require("../models/enrollmentModel");
const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");
const {
  getAll,
  getOne,
  createOne,
  deleteOne,
  updateOne,
  deActivate,
  deActivateMe,
  getMe,
  updateMe,
} = require("./handlerFactory");
const {
  login,
  updatePassword,
  resetPassword,
  forgotPassword,
} = require("./authController");
const AppError = require("../utils/appError");

// Middleware to remove deleted instructor form courses instructors list and make him null in any enrollment
exports.removeInstructorRef = catchAsync(async (req, res, next) => {
  const instructorId = req.params.id;

  // Remove deleted Instructor from instructors list in any course
  await Course.updateMany(
    { instructors: { $in: [instructorId] } },
    { $pull: { instructors: instructorId } }
  );

  // so if instructor was deActivated so we don't need to make him/her null in any enrollment
  if (req.path.endsWith("/deactivate")) return next();


  // To get Enrollment Course Id
  const enrollments = await Enrollment.find({ instructor: instructorId });
  const courses = enrollments.map(curEnrollment => curEnrollment.course);
  
  await Promise.all(courses.map(async (curCourse) => {
    const anotherInstructor = (await Instructor.findOne({ courses: { $in: [curCourse] },isActive: true })).select('_id');

    if(anotherInstructor){
      // Replace instructor by another in case if instructor was deleted
      await Enrollment.updateMany(
        { instructor: instructorId,course:curCourse },
        { instructor: anotherInstructor }
      );
    }
  }))

  next();
});

exports.checkIfCourseExist = catchAsync(async (req, res, next) => {
  if (!req.body.courses || req.body.courses.length === 0) return next();

  const existingCount = await Course.countDocuments({
    _id: { $in: req.body.courses },
  });

  if (existingCount !== req.body.courses.length) {
    return next(new AppError("There is course/s no exist in our courses", 404));
  }

  next();
});

// ===================  USER Actions  ===================
exports.deActivateMe = deActivateMe(Instructor);
exports.getMe = getMe(Instructor);
exports.updateMe = updateMe(Instructor);

// ===================  CRUD Actions  ===================
exports.getAllInstructors = getAll(Instructor, {
  path: "courses",
  select: "name",
});
exports.createNewInstructor = createOne(Instructor);
exports.getInstructor = getOne(Instructor, { path: "courses", select: "name" });
exports.updateInstructor = updateOne(Instructor);
exports.deleteInstructor = deleteOne(Instructor);
exports.deActivateInstructor = deActivate(Instructor);

// ===================  AUTH Actions  ===================
exports.instructorLogin = login(Instructor);
exports.instructorForgotPassword = forgotPassword(Instructor);
exports.instructorResetPassword = resetPassword(Instructor);
exports.instructorUpdatePassword = updatePassword(Instructor);
