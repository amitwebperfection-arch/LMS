const Payment = require('../models/Payment.model');
const Order = require('../models/Order.model');
const Enrollment = require('../models/Enrollment.model');
const Progress = require('../models/Progress.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const { stripe } = require('../config/stripe');
const { PAYMENT_STATUS, ORDER_STATUS } = require('../utils/constants');

// @desc    Handle Stripe webhook
// @route   POST /api/payment/webhook
// @access  Public (Stripe only)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log('✅ Webhook verified:', event.type);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log('💳 Payment succeeded:', paymentIntent.id);

      // Check if already processed
      const existingPayment = await Payment.findOne({
        stripePaymentIntentId: paymentIntent.id,
        status: PAYMENT_STATUS.SUCCESS,
      });

      if (existingPayment) {
        console.log('⚠️ Payment already processed');
        return res.json({ received: true });
      }

      // Find order
      const order = await Order.findOne({ 
        paymentIntentId: paymentIntent.id 
      })
      .populate('course')
      .populate('user');

      if (!order) {
        console.error('❌ Order not found:', paymentIntent.id);
        return res.status(404).send('Order not found');
      }

      console.log('📦 Order found:', order._id);

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({
        user: order.user._id,
        course: order.course._id,
      });

      if (existingEnrollment) {
        console.log('⚠️ Already enrolled, updating order only');
        order.status = ORDER_STATUS.COMPLETED;
        await order.save();
        return res.json({ received: true });
      }

      // Create Payment record
      await Payment.create({
        order: order._id,
        user: order.user._id,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        status: PAYMENT_STATUS.SUCCESS,
        paymentMethod: paymentIntent.payment_method,
        paymentDate: new Date(),
      });

      console.log('✅ Payment record created');

      // Update order
      order.status = ORDER_STATUS.COMPLETED;
      await order.save();

      console.log('✅ Order status updated');

      // Calculate access expiry
      let accessExpiresAt = null;
      if (order.course.accessDuration !== 'lifetime') {
        const days = Number(order.course.accessDuration);
        accessExpiresAt = new Date();
        accessExpiresAt.setDate(accessExpiresAt.getDate() + days);
      }

      // Create Enrollment
      const enrollment = await Enrollment.create({
        user: order.user._id,
        course: order.course._id,
        order: order._id,
        enrollmentSource: 'web',
        accessExpiresAt,
      });

      console.log('✅ Enrollment created:', enrollment._id);

      // Create Progress
      await Progress.create({
        user: order.user._id,
        course: order.course._id,
      });

      console.log('✅ Progress initialized');

      // Update course enrollment count
      await Course.findByIdAndUpdate(order.course._id, {
        $inc: { enrollmentCount: 1 },
      });

      // Update instructor stats
      if (order.course.instructor) {
        await User.findByIdAndUpdate(order.course.instructor, {
          $inc: { 'instructorProfile.totalStudents': 1 },
        });
      }

      console.log('✅ Stats updated');
      console.log('🎉 Enrollment process completed successfully');

      // Try to send email (optional)
      try {
        const { sendEnrollmentEmail } = require('../services/email.service');
        await sendEnrollmentEmail(order.user, order.course);
      } catch (emailError) {
        console.error('Email failed (non-critical):', emailError.message);
      }
    } 
    else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      console.log('❌ Payment failed:', paymentIntent.id);

      const order = await Order.findOne({ 
        paymentIntentId: paymentIntent.id 
      });

      if (order) {
        order.status = ORDER_STATUS.FAILED;
        await order.save();

        await Payment.create({
          order: order._id,
          user: order.user,
          stripePaymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          status: PAYMENT_STATUS.FAILED,
          failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        });
      }
    }

    res.json({ received: true, type: event.type });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// @desc    Verify payment and enrollment status
// @route   GET /api/payment/verify/:orderId
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    const enrollment = await Enrollment.findOne({
      order: orderId,
      user: req.user._id,
    });

    res.json({
      success: true,
      data: {
        orderStatus: order.status,
        isEnrolled: !!enrollment,
        enrollment: enrollment || null,
      },
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  handleWebhook,
  verifyPayment,
};
