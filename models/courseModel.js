const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide course name!'],
    unique: true,
    minlength: [2, "Course name must be at least 3 characters"],
    maxlength: [50, "Course name must be at most 30 characters"],
  },
  maxDegree: {
    type: Number,
    default: 10,
    validate: {
      validator: function (value) {
        return value >= 10;
      },
      message:"Any course degree should be greater than or equal 10 at least"
    }
  },
  level:{
    type: mongoose.Schema.ObjectId,
    ref: 'Level',
    required: [true, 'Please provide course level!'],
  },
  description: {
    type: String,
    required:[true,"Please provide course description"],
    maxlength:[120,"Course description must be maximum 120 letters"]
  },
  instructors: [
    {
      type: mongoose.Schema.ObjectId,
      ref:'Instructor'
    }
  ],
  createdAt: {
    type: Date,
    default:Date.now,
  }
});


courseSchema.post('save', async function (doc, next) {
  const Level = mongoose.model("Level");
  await Level.findByIdAndUpdate(doc.level, { $push: { requiredCourses: doc._id } });
  
  next();
});

courseSchema.pre(/^find/, function (next) {
  this.populate({ path: "level",select:'name number' });
  next();
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;