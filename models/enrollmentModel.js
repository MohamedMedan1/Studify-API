const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: "Student",
    required: [true, "Please provide enrollment student"],
  },
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: [true, "Please provide enrollment cousre"],
  },
  instructor: {
    type: mongoose.Schema.ObjectId,
    ref: "Instructor",
    required: [true, "Please provide enrollment Instructor"],
  },
  enrolledAt:{
  type: Date,
    default:Date.now,
  }
});

// Pre Document Middleware to prevent Student to enroll high level courses 
enrollmentSchema.pre('save', async function (next) {
  const {level: courseLevel } = await mongoose.model("Course").findById(this.course);
  const {level:studentLevel} = await mongoose.model("Student").findById(this.student);

  if (!courseLevel || !studentLevel) {
    return next(new AppError("There is no student level or course level", 400));
  }
  
  if (courseLevel.number > studentLevel.number) {
    return next(new AppError(`Your level(${studentLevel.name}) is lower than the enroll course level(${courseLevel.name})`, 403));
  }

  next();
})

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
module.exports = Enrollment;