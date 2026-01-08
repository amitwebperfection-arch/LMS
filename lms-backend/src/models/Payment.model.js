const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../utils/constants');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentMethod: String,
    paymentDate: Date,
    refund: {
      amount: Number,
      refundId: String,
      refundDate: Date,
      reason: String,
    },
    metadata: {
      type: Map,
      of: String,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
    failureReason: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);