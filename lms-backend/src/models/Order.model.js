const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../utils/constants');

const orderSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Please provide order amount'],
      min: [0, 'Amount cannot be negative'],
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    paymentIntentId: String,
    invoice: {
      invoiceNumber: String,
      invoiceUrl: String,
    },
    paymentGateway: {
      type: String,
      enum: ['stripe', 'paypal', 'razorpay', 'free'],
      default: 'stripe',
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'completed', 'failed'],
      default: 'none',
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('save', async function (next) {
  if (!this.invoice) this.invoice = {};
  if (!this.invoice.invoiceNumber) {
    const timestamp = Date.now();
    this.invoice.invoiceNumber = `INV-${timestamp}-${this._id.toString().slice(-6).toUpperCase()}`;
  }
  next();
});


module.exports = mongoose.model('Order', orderSchema);