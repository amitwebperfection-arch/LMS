const Order = require('../models/Order.model');
const Course = require('../models/Course.model');
const Coupon = require('../models/Coupon.model');
const Enrollment = require('../models/Enrollment.model');
const Progress = require('../models/Progress.model');
const User = require('../models/User.model');
const { createPaymentIntent } = require('../config/stripe');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { ORDER_STATUS, PAGINATION } = require('../utils/constants');
const { sendEnrollmentEmail } = require('../services/email.service');

// @desc    Create order and handle enrollment
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { courseId, couponCode } = req.body;

    if (!courseId) {
      return errorResponse(res, 400, 'Please provide course ID');
    }

    // Get course with instructor details
    const course = await Course.findById(courseId).populate('instructor');
    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    // Check if course is available
    if (course.status !== 'published' || !course.isApproved) {
      return errorResponse(res, 400, 'Course is not available for enrollment');
    }

    // Check enrollment limit
    if (course.maxEnrollments && course.enrollmentCount >= course.maxEnrollments) {
      return errorResponse(res, 400, 'Course has reached maximum enrollments');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (existingEnrollment) {
      return errorResponse(res, 400, 'You are already enrolled in this course');
    }

    // Calculate price
    let finalPrice = course.discountPrice || course.price;
    let discount = 0;
    let coupon = null;

    // Apply coupon if provided
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      
      if (!coupon || !coupon.isValid()) {
        return errorResponse(res, 400, 'Invalid or expired coupon');
      }

      // Check minimum purchase
      if (coupon.minPurchase && finalPrice < coupon.minPurchase) {
        return errorResponse(res, 400, `Minimum purchase of $${coupon.minPurchase} required`);
      }

      // Check if coupon applies to this course
      if (coupon.applicableCourses?.length > 0 && 
          !coupon.applicableCourses.includes(courseId)) {
        return errorResponse(res, 400, 'Coupon is not applicable to this course');
      }

      // Check if coupon applies to this category
      if (coupon.applicableCategories?.length > 0 && 
          !coupon.applicableCategories.includes(course.category)) {
        return errorResponse(res, 400, 'Coupon is not applicable to this course category');
      }

      discount = coupon.calculateDiscount(finalPrice);
      finalPrice = Math.max(0, finalPrice - discount);
    }

    // FOR FREE COURSES - Complete enrollment immediately
    if (course.isFree || finalPrice === 0) {
      // Create completed order
      const order = await Order.create({
        user: req.user._id,
        course: courseId,
        amount: 0,
        originalPrice: course.price,
        discount: course.price,
        coupon: coupon?._id,
        status: ORDER_STATUS.COMPLETED,
        paymentGateway: 'free',
        currency: 'USD',
      });

      // Calculate access expiry
      let accessExpiresAt = null;
      if (course.accessDuration !== 'lifetime') {
        const days = Number(course.accessDuration);
        accessExpiresAt = new Date();
        accessExpiresAt.setDate(accessExpiresAt.getDate() + days);
      }

      // Create enrollment
      const enrollment = await Enrollment.create({
        user: req.user._id,
        course: courseId,
        order: order._id,
        enrollmentSource: 'web',
        accessExpiresAt,
      });

      // Initialize progress
      await Progress.create({
        user: req.user._id,
        course: courseId,
      });

      // Update course enrollment count
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrollmentCount: 1 },
      });

      // Update instructor stats
      if (course.instructor) {
        await User.findByIdAndUpdate(course.instructor._id, {
          $inc: { 'instructorProfile.totalStudents': 1 },
        });
      }

      // Update coupon usage
      if (coupon) {
        coupon.usedCount += 1;
        await coupon.save();
      }

      // Send enrollment email
      try {
        await sendEnrollmentEmail(req.user, course);
      } catch (emailError) {
        console.error('Failed to send enrollment email:', emailError);
      }

      return successResponse(res, 201, 'Successfully enrolled in free course', {
        order,
        enrollment,
        message: 'Free course enrollment completed',
      });
    }

    // FOR PAID COURSES - Create order and payment intent
    try {
      // Create pending order
      const order = await Order.create({
        user: req.user._id,
        course: courseId,
        amount: finalPrice,
        originalPrice: course.price,
        discount,
        coupon: coupon?._id,
        status: ORDER_STATUS.PENDING,
        paymentGateway: 'stripe',
        currency: 'usd',
      });

      // Create payment intent
      const paymentIntent = await createPaymentIntent({
        amount: finalPrice,
        currency: 'usd',
        user: req.user,
        order: order,
      });

      // Update order with payment intent ID
      order.paymentIntentId = paymentIntent.id;
      await order.save();

      // Update payment intent metadata
      await require('../config/stripe').stripe.paymentIntents.update(
        paymentIntent.id,
        {
          metadata: {
            orderId: order._id.toString(),
            userId: req.user._id.toString(),
            courseId: courseId.toString(),
          },
        }
      );

      // Update coupon usage (will be counted when payment succeeds)
      if (coupon) {
        coupon.usedCount += 1;
        await coupon.save();
      }

      return successResponse(res, 201, 'Order created successfully', {
        order,
        clientSecret: paymentIntent.client_secret,
        message: 'Complete payment to enroll',
      });

    } catch (stripeError) {
      console.error('Stripe payment intent error:', stripeError);
      return errorResponse(res, 500, 'Failed to create payment. Please try again.');
    }

  } catch (error) {
    console.error('Create order error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
    } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('course', 'title thumbnail price')
      .populate('coupon', 'code discountValue')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    paginatedResponse(res, 200, 'Orders fetched successfully', orders, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('course', 'title thumbnail instructor price')
      .populate('coupon', 'code discountValue discountType');

    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }

    successResponse(res, 200, 'Order fetched successfully', { order });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      userId,
      courseId,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (userId) query.user = userId;
    if (courseId) query.course = courseId;

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('course', 'title thumbnail')
      .populate('coupon', 'code')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    // Calculate stats
    const stats = await Order.aggregate([
      { $match: { status: ORDER_STATUS.COMPLETED } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    paginatedResponse(res, 200, 'Orders fetched successfully', orders, {
      page: Number(page),
      limit: Number(limit),
      total,
      stats: stats[0] || { totalRevenue: 0, totalOrders: 0 },
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
};