const mongoose = require('mongoose');
const { REVIEW_STATUS } = require('../utils/constants');

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(REVIEW_STATUS),
      default: REVIEW_STATUS.PENDING,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    // NEW FIELDS
    instructorReply: {
      message: String,
      repliedAt: Date,
    },
    reportedCount: {
      type: Number,
      default: 0,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per course
reviewSchema.index({ user: 1, course: 1 }, { unique: true });

// Update course rating after review save
reviewSchema.post('save', async function () {
  const Course = mongoose.model('Course');
  
  const stats = await this.constructor.aggregate([
    {
      $match: { 
        course: this.course,
        status: REVIEW_STATUS.APPROVED 
      },
    },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(this.course, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);