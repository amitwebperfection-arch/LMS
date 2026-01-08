const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide a coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Please provide discount value'],
      min: [0, 'Discount value cannot be negative'],
    },
    maxDiscount: {
      type: Number,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide expiry date'],
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    applicableCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // NEW FIELDS
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    applicableUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    autoApply: {
      type: Boolean,
      default: false,
    },
    usagePerUser: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Check if coupon is valid
couponSchema.methods.isValid = function () {
  if (!this.isActive) return false;
  if (this.startDate > new Date()) return false;
  if (this.expiryDate < new Date()) return false;
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  return true;
};

// Calculate discount
couponSchema.methods.calculateDiscount = function (price) {
  if (!this.isValid()) return 0;

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (price * this.discountValue) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }

  return Math.min(discount, price);
};

module.exports = mongoose.model('Coupon', couponSchema);