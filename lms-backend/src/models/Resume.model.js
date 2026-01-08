const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    htmlCode: {
      type: String,
      required: [true, 'HTML code is required'],
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    tags: [String],
    category: {
      type: String,
      enum: ['modern', 'classic', 'creative', 'minimal', 'professional', 'custom'],
      default: 'custom',
    },
    formData: {
      name: String,
      email: String,
      phone: String,
      address: String,
      summary: String,
      education: Array,
      experience: Array,
      skills: Array,
    },
  },
  {
    timestamps: true,
  }
);

resumeSchema.index({ title: 'text', tags: 'text' });
resumeSchema.index({ isTemplate: 1, isPublic: 1 });
resumeSchema.index({ user: 1 });

module.exports = mongoose.model('Resume', resumeSchema);