const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide level name'],
    minlength: [3, "Level name must be at least 3 characters"],
    maxlength: [20, "Level name must be at most 20 characters"],
  },
  number: {
    type: Number,
    min: [1, "Level number must be at least 1"],
    required: [true, "Please provide level number"],
    unique:true
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'medium', 'hard'],
      message:"Level difficulty can only be easy,medium and hard"
    },
    required:[true,"Please provide level difficulty"]
  },
  requiredCourses: [
    {
      type: mongoose.Schema.ObjectId,
      ref:'Course'
    }
  ],
  createdAt: {
    type: Date,
    default:Date.now
  }
});

const Level = mongoose.model('Level', levelSchema);
module.exports = Level;