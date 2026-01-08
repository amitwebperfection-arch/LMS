const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a lesson title'],
      trim: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['video', 'quiz', 'assignment', 'reading'],
      default: 'video',
    },
    // ===== VIDEO FIELDS =====
    videoUrl: {
      type: String,
      required: function () {
        return this.type === 'video';
      },
    },
    videoPublicId: String,
    
    // ===== COMMON FIELDS =====
    duration: {
      type: Number,
      default: 0,
      min: [0, 'Duration cannot be negative'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
    
    // ===== READING/ASSIGNMENT FIELDS =====
    content: {
      type: String,
      maxlength: [10000, 'Content cannot be more than 10000 characters'],
    },
    
    resources: [
      {
        title: String,
        url: String,
        type: {
          type: String,
          enum: ['pdf', 'doc', 'link', 'other'],
        },
      },
    ],
    
    // ===== QUIZ FIELDS =====
    quiz: {
      questions: [
        {
          question: String,
          options: [String],
          correctAnswer: Number,
          explanation: String,
        },
      ],
      passingScore: {
        type: Number,
        default: 70,
        min: 0,
        max: 100,
      },
    },
    
    // ===== ADDITIONAL FIELDS =====
    isLocked: {
      type: Boolean,
      default: false,
    },
    completionCriteria: {
      watchPercentage: {
        type: Number,
        default: 90,
        min: 0,
        max: 100,
      },
      requiresSubmission: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting
lessonSchema.index({ section: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);