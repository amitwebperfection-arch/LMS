const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
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
    certificateId: {
      type: String,
      unique: true,
      sparse: true, 
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    pdfUrl: String,
    verificationUrl: String,
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    templateId: {
      type: String,
      default: 'default',
      enum: ['default', 'premium', 'gold', 'platinum'],
    },
    status: {
      type: String,
      enum: ['issued', 'revoked'],
      default: 'issued',
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.pre('save', function (next) {
  if (this.isNew && !this.certificateId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.certificateId = `CERT-${timestamp}-${random}`;
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.verificationUrl = `${frontendUrl}/verify-certificate/${this.certificateId}`;
    
    console.log('Generated certificate ID:', this.certificateId);
  }
  next();
});

certificateSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);