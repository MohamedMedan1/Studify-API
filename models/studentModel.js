const mongoose = require("mongoose");
const User = require("./userModel");

const studentSchema = new mongoose.Schema({
  phone: {
    type: String,
    minlength: [11, "Phone number must be 11 characters"],
    maxlength: [11, "Phone number must be 11 characters"],
    trim: true,
    unique: true,
  },
  gender: {
    type: String,
    required: [true, "Please provide student gender!"],
    enum: {
      values: ["male", "female"],
      message: "Student gender can be only male or female",
    },
  },
  age: {
    type: Number,
    required: [true, "Please Provide Student age!"],
    min: 5,
    max: 20,
    validate: {
      validator: function (value) {
        return value === parseInt(value);
      },
      message: "Student Age must be integer like 10 not 10.5",
    },
  },
  parent: {
    type: {
      name: {
        type: String,
        required: [true, "Please provide parent name!"],
        minlength: [3, "Parent name must be at least 3 characters"],
        maxlength: [30, "Parent name must be at most 30 characters"],
      },
      phone: {
        type: String,
        required: [true, "Please provide parent phone number!"],
        minlength: [11, "Phone number must be 11 characters"],
        maxlength: [11, "Phone number must be 11 characters"],
        trim: true,
      },
      gender: {
        type: String,
        required: [true, "Please provide parent gender!"],
        enum: {
          values: ["male", "female"],
          message: "Parent gender can be only male or female",
        },
      },
      job: {
        type: String,
        required: [true, "Please provide parent job!"],
        minlength: [5, "Parent job must be at least 3 characters"],
        maxlength: [30, "Parent job must be at most 30 characters"],
      },
    },
    required: [true, "Student must have at least one parent!"],
  },
  level: {
    type: mongoose.Schema.ObjectId,
    ref: "Level",
    default: "692a110d75ac8df331f38cc3",
  },
  completedLevels: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Level",
    },
  ],
  completedCourses: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Course",
    },
  ],
});

// Pre document middleware to lower case the gender value
studentSchema.pre("save", function (next) {
  this.gender = this.gender?.toLowerCase();
  if (this.parent) {
    this.parent.gender = this.parent.gender?.toLowerCase();
  }  
  next();
});

studentSchema.pre(/^find/, function (next) {
  this.populate({ path: "level", select: "name number" });
  next();
});

const Student = User.discriminator("Student", studentSchema);
module.exports = Student;
