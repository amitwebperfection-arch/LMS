const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a section title'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    // NEW FIELDS
    totalDuration: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for lessons
sectionSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'section',
});

// Calculate total duration
sectionSchema.methods.calculateDuration = async function () {
  const Lesson = mongoose.model('Lesson');
  const lessons = await Lesson.find({ section: this._id });
  this.totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
  await this.save();
};

// Index for sorting
sectionSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Section', sectionSchema);