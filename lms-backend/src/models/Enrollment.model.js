const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
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
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    isCompleted: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100'],
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    lastAccessedLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    accessExpiresAt: Date,
    enrollmentSource: {
      type: String,
      enum: ['web', 'mobile', 'admin', 'free'],
      default: 'web',
    },
  },
  {
    timestamps: true,
  }
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

enrollmentSchema.methods.hasAccess = function () {
  if (!this.accessExpiresAt) return true;
  return this.accessExpiresAt > new Date();
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);