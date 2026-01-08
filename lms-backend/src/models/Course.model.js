const mongoose = require('mongoose');
const { COURSE_STATUS, DIFFICULTY_LEVELS } = require('../utils/constants');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a course title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a course description'],
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot be more than 500 characters'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    thumbnail: {
      url: {
        type: String,
        required: [true, 'Please provide a thumbnail'],
      },
      publicId: String,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY_LEVELS),
      default: DIFFICULTY_LEVELS.BEGINNER,
    },
    status: {
      type: String,
      enum: Object.values(COURSE_STATUS),
      default: COURSE_STATUS.DRAFT,
    },
    language: {
      type: String,
      default: 'English',
    },
    requirements: [String],
    whatYouWillLearn: [String],
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    tags: [String],
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // NEW FIELDS - MUST ADD
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public',
    },
    promoVideo: {
      url: String,
      publicId: String,
      duration: Number,
    },
    certificateEnabled: {
      type: Boolean,
      default: true,
    },
    targetAudience: [String],
    accessDuration: {
      type: String,
      enum: ['lifetime', '30', '60', '90', '180', '365'],
      default: 'lifetime',
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    // ADVANCED FIELDS
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String],
    prerequisiteCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    maxEnrollments: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for sections
courseSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'course',
});

// Virtual for reviews
courseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'course',
});

// Check if enrollment limit reached
courseSchema.methods.canEnroll = function () {
  if (this.maxEnrollments && this.enrollmentCount >= this.maxEnrollments) {
    return false;
  }
  return true;
};

// Index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, subCategory: 1, isFeatured: 1 });

module.exports = mongoose.model('Course', courseSchema);