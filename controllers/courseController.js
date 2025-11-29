const Course = require("../models/courseModel");
const Level = require("../models/levelModel");
const Student = require("../models/studentModel");
const Grade = require("../models/gradeModel");
const Instructor = require("../models/instructorModel");

const catchAsync = require("../utils/catchAsync");
const { getAll, createOne, getOne, updateOne, deleteOne, deleteAll } = require("./handlerFactory");
const AppError = require("../utils/appError");

// Ref = requiredCourses in levels and completedCourses in students
exports.removeCourseFromRef = catchAsync(async (req, res, next) => {
  const courseID = req.params.id;

  if (!courseID) {
    return next(new AppError("Please provide courseID to be able to continue", 400));
  }

  const { level } = await Course.findById(courseID);

  // Remove Course from requiredCourses in his level
  await Level.findByIdAndUpdate(level._id, { $pull: { requiredCourses: courseID } });

  // Remove Course from completedCourse in student
  await Student.updateMany(
    { completedCourses: { $in: [courseID] } },
    { $pull: { completedCourses: courseID } });
  
  // Remove any grade with this removed course
  await Grade.deleteMany({ course: courseID });

  // Remove deleted course from instructor courses
  await Instructor.updateMany(
    { course: { $in: [courseID] } },
    {$pull:{courses:courseID}}
  );

  next();
});

exports.checkIfLevelExist = catchAsync(async (req, res, next) => {
  const isExist = await Level.findById(req.body.level);

  if (!isExist) {
    return next(new AppError("There is no level with that ID", 404));
  }
  next();
}) 

exports.getAllCourses = getAll(Course,{path:'instructors' , select:'name gender image'});
exports.createNewCourse = createOne(Course);

exports.getCourse = getOne(Course,{ path: 'level' ,select:'name'});
exports.updateCourse = updateOne(Course);
exports.deleteCourse = deleteOne(Course);
