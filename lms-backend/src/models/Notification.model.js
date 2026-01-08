const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'enrollment',
        'course_update',
        'payment',
        'review',
        'certificate',
        'announcement',
        'reminder',
        'other',
      ],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
    },
    link: String,
    metadata: {
      type: Map,
      of: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    // NEW FIELDS
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);