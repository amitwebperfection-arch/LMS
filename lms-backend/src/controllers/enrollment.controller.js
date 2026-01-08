const Enrollment = require('../models/Enrollment.model');
const Course = require('../models/Course.model');
const Order = require('../models/Order.model');
const Progress = require('../models/Progress.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { ORDER_STATUS } = require('../utils/constants');

// @desc    Create enrollment (manual - for testing/admin)
// @route   POST /api/enrollments
// @access  Private/Admin
const createEnrollment = async (req, res) => {
  try {
    const { userId, courseId, enrollmentSource } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    if (!course.canEnroll()) {
      return errorResponse(res, 400, 'Course enrollment limit reached');
    }

    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      return errorResponse(res, 400, 'User already enrolled in this course');
    }

    let accessExpiresAt = null;
    if (course.accessDuration !== 'lifetime') {
      const days = Number(course.accessDuration);
      accessExpiresAt = new Date();
      accessExpiresAt.setDate(accessExpiresAt.getDate() + days);
    }

    const order = await Order.create({
      user: userId,
      course: courseId,
      amount: course.isFree ? 0 : (course.discountPrice || course.price),
      originalPrice: course.price,
      discount: course.price - (course.discountPrice || course.price),
      status: ORDER_STATUS.COMPLETED,
      paymentGateway: course.isFree ? 'free' : 'stripe',
      invoice: {
        invoiceNumber: `INV-${Date.now()}`,
      },
    });

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      order: order._id,
      accessExpiresAt,
      enrollmentSource: enrollmentSource || 'web',
    });

    await Progress.create({
      user: userId,
      course: courseId,
    });

    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 },
    });

    await User.findByIdAndUpdate(course.instructor, {
      $inc: { 'instructorProfile.totalStudents': 1 },
    });

    successResponse(res, 201, 'Enrollment created successfully', { enrollment });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Private
const getEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('course', 'title thumbnail instructor')
      .populate('order');

    if (!enrollment) {
      return errorResponse(res, 404, 'Enrollment not found');
    }

    if (
      enrollment.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      const course = await Course.findById(enrollment.course._id);
      if (course.instructor.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, 'Unauthorized');
      }
    }

    const progress = await Progress.findOne({
      user: enrollment.user._id,
      course: enrollment.course._id,
    });

    successResponse(res, 200, 'Enrollment fetched successfully', {
      enrollment,
      progress,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all enrollments for a course
// @route   GET /api/enrollments/course/:courseId
// @access  Private/Instructor/Admin
const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (req.user.role === 'instructor') {
      const course = await Course.findOne({
        _id: courseId,
        instructor: req.user._id,
      });

      if (!course) {
        return errorResponse(res, 403, 'Unauthorized');
      }
    }

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('user', 'name email avatar')
      .populate('order', 'amount status createdAt')
      .sort('-enrolledAt');

    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await Progress.findOne({
          user: enrollment.user._id,
          course: enrollment.course,
        });

        return {
          ...enrollment.toObject(),
          progress: progress ? progress.progressPercentage : 0,
        };
      })
    );

    successResponse(res, 200, 'Enrollments fetched successfully', {
      enrollments: enrollmentsWithProgress,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get user's enrollments
// @route   GET /api/enrollments/user/:userId
// @access  Private
const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (
      userId !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'title thumbnail slug instructor rating')
      .sort('-enrolledAt');

    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const progress = await Progress.findOne({
          user: userId,
          course: enrollment.course._id,
        });

        return {
          ...enrollment.toObject(),
          progress: progress ? progress.progressPercentage : 0,
        };
      })
    );

    successResponse(res, 200, 'Enrollments fetched successfully', {
      enrollments: enrollmentsWithProgress,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Verify enrollment
// @route   GET /api/enrollments/verify/:courseId
// @access  Private
const verifyEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    successResponse(res, 200, 'Enrollment verified', {
      isEnrolled: !!enrollment,
      enrollment: enrollment || null,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Update enrollment completion status
// @route   PUT /api/enrollments/:id/complete
// @access  Private
const updateEnrollmentCompletion = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return errorResponse(res, 404, 'Enrollment not found');
    }

    if (enrollment.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    if (enrollment.isCompleted) {
      return errorResponse(res, 400, 'Course already completed');
    }

    enrollment.isCompleted = true;
    enrollment.completedAt = new Date();
    enrollment.progress = 100;
    await enrollment.save();

    successResponse(res, 200, 'Enrollment marked as completed', { enrollment });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete enrollment (admin only)
// @route   DELETE /api/enrollments/:id
// @access  Private/Admin
const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return errorResponse(res, 404, 'Enrollment not found');
    }

    await Progress.deleteOne({
      user: enrollment.user,
      course: enrollment.course,
    });

    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { enrollmentCount: -1 },
    });

    await enrollment.deleteOne();

    successResponse(res, 200, 'Enrollment deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createEnrollment,
  getEnrollment,
  getCourseEnrollments,
  getUserEnrollments,
  verifyEnrollment,
  updateEnrollmentCompletion,
  deleteEnrollment,
};