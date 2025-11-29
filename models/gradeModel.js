const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  degree: {
    type: Number,
    required: [true, "Please provide student degree"],
    min: [0, "Student degree should be greater than or equal 0"],
    validate: {
      validator: async function (value) {
        const Course = mongoose.model("Course");
        const course = await Course.findById(this.course);
        return value <= course.maxDegree;
      },
      message: "Student degree cannot be greater than the course maxDegree!",
    },
  },
  grade: {
    type: String,
    enum: {
      values: ["F", "D", "C", "B", "A", "A+"],
      message: "Student Grade can be only {F, D, C, B, A, A+}",
    },
  },
  course: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Please provide Course ID"],
    ref: "Course",
  },
  student: {
    type: mongoose.Schema.ObjectId,
    required: [true, "Please provide Student ID"],
    ref: "Student",
  },
  status: {
    type: String,
    enum: {
      values: ["success", "fail"],
      message: "Student Status can only be success or fail",
    },
    default: "success",
  },
  percentage: {
    type: Number,  
    min: [0, "Grade percentage should be greater than or equal 0"],
    max: [100, "Grade percentage should be smaller than or equal 100"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Post Document Middleware to push course Id in completedCourses in Student doc if he success in that course 
gradeSchema.post("save", async function (doc, next) {
  if (doc.grade !== "F") {
    const Student = mongoose.model("Student");
    const curStudent = await Student.findByIdAndUpdate(doc.student, { $push: { completedCourses: doc.course } }, {
      new: true,
      runValidators:true,
    });


    // Student Info his/her (level and completedCourses)
    const curLevel = curStudent.level;
    const stdCompletedCourses = curStudent.completedCourses;

    const Level = mongoose.model("Level");
    const {requiredCourses} = await Level.findById(curLevel._id);

    // Check if student completedCourses is the same of level requiredCourses
    // If true then we upgrade student to next level
    const isCompleted = requiredCourses.every(reqCourse => stdCompletedCourses.includes(reqCourse));

    if (isCompleted) {
      curStudent.completedLevels = [...curStudent.completedLevels, curLevel];
      curStudent.level = await Level.findOne({ number: curLevel.number + 1 });
      await curStudent.save({validateBeforeSave: false});
    }
  }

  next();
});

// Pre Document Middleware to calculate Grade
gradeSchema.pre("save", async function (next) {
  const Course = mongoose.model("Course");
  const { maxDegree } = await Course.findById(this.course);

  if (this.degree >= maxDegree - 5) this.grade = "A+";
  else if (this.degree >= maxDegree - 15) this.grade = "A";
  else if (this.degree >= maxDegree - 25) this.grade = "C";
  else if (this.degree >= maxDegree / 2) this.grade = "D";
  else {
    this.grade = "F";
    this.status = "fail";
  }

  // if 95.666 then * 10 956 then / 10 95.6 
  this.percentage = Math.round(((this.degree / maxDegree) * 100) * 10)/10 ;

  next();
});

// Pre Query Middleware to populate student and course fields
gradeSchema.pre(/^find/, function (next) {
  this.populate({ path: "student", select: "name email age" }).populate({
    path: "course",
    select: "name maxDegree",
  });
  next();
});

const Grade = mongoose.model("Grade", gradeSchema);
module.exports = Grade;
