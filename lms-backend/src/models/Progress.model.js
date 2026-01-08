const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedLessons: [
      {
        lesson: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Lesson',
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
        watchTime: Number,
        watchPercentage: Number,
        quizScore: Number,
      },
    ],
    lastWatchedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    totalWatchTime: {
      type: Number,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    sectionProgress: [
      {
        section: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Section',
        },
        completedLessons: Number,
        totalLessons: Number,
        isCompleted: Boolean,
      },
    ],
    completionDate: Date,
  },
  {
    timestamps: true,
  }
);

progressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);