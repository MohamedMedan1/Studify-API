const mongoose = require("mongoose");
const User = require("./userModel");

const instructorSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, "Please provide instructor phone number !"],
    minlength: [11, "Phone number must be 11 characters"],
    maxlength: [11, "Phone number must be 11 characters"],
    trim: true,
    unique: true,
  },
  specialization: {
    type: String,
    required:[true,"Please provide instructor specialization"],
    maxlength:[30,"Instructor specialization must be at most 30 characters"],
    default: "General"
  },
  gender: {
    type: String,
    required: [true, "Please provide instructor gender!"],
    enum: {
      values: ["male", "female"],
      message: "Instructor gender can be only male or female",
    },
  },
  courses: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Course",
    },
  ],
});

instructorSchema.post("save", async function (doc, next) {
  const Course = mongoose.model("Course");

  // Catch All Instructor Courses Id's In Array ["q2121212","jkjadsahad"]
  const instructorCourses = doc.courses.map((course) => course._id);

  await Promise.all(
    instructorCourses.map(async (curCourseID) => {
      await Course.findByIdAndUpdate(curCourseID, {
        $push: { instructors: doc._id },
      });
    })
  );

  next();
});

const Instructor = User.discriminator("Instructor", instructorSchema);
module.exports = Instructor;
