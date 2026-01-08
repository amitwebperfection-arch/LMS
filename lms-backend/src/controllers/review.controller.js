const Review = require('../models/Review.model');
const Enrollment = require('../models/Enrollment.model');
const Course = require('../models/Course.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { PAGINATION, REVIEW_STATUS } = require('../utils/constants');

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return errorResponse(res, 403, 'You must be enrolled to review this course');
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (existingReview) {
      return errorResponse(res, 400, 'You have already reviewed this course');
    }

    const review = await Review.create({
      user: req.user._id,
      course: courseId,
      rating,
      comment,
      status: REVIEW_STATUS.PENDING,
    });

    successResponse(res, 201, 'Review submitted successfully', { review });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get course reviews
// @route   GET /api/reviews/course/:courseId
// @access  Public
const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      rating,
    } = req.query;

    const query = {
      course: courseId,
      status: REVIEW_STATUS.APPROVED,
    };

    if (rating) {
      query.rating = Number(rating);
    }

    const skip = (page - 1) * limit;
    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    const ratingDistribution = await Review.aggregate([
      {
        $match: {
          course: courseId,
          status: REVIEW_STATUS.APPROVED,
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    paginatedResponse(res, 200, 'Reviews fetched successfully', reviews, {
      page: Number(page),
      limit: Number(limit),
      total,
      ratingDistribution,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get user's review for a course
// @route   GET /api/reviews/my-review/:courseId
// @access  Private
const getMyReview = async (req, res) => {
  try {
    const { courseId } = req.params;

    const review = await Review.findOne({
      user: req.user._id,
      course: courseId,
    }).populate('course', 'title');

    if (!review) {
      return successResponse(res, 200, 'No review found', { review: null });
    }

    successResponse(res, 200, 'Review fetched successfully', { review });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    review.rating = rating !== undefined ? rating : review.rating;
    review.comment = comment !== undefined ? comment : review.comment;
    review.isEdited = true;
    review.status = REVIEW_STATUS.PENDING; 

    await review.save();

    successResponse(res, 200, 'Review updated successfully', { review });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    await review.deleteOne();

    successResponse(res, 200, 'Review deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all reviews (admin)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      courseId,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (courseId) query.course = courseId;

    const skip = (page - 1) * limit;
    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    paginatedResponse(res, 200, 'Reviews fetched successfully', reviews, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Approve review
// @route   PUT /api/reviews/:id/approve
// @access  Private/Admin
const approveReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    review.status = REVIEW_STATUS.APPROVED;
    await review.save();

   

    successResponse(res, 200, 'Review approved successfully', { review });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Reject review
// @route   PUT /api/reviews/:id/reject
// @access  Private/Admin
const rejectReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    review.status = REVIEW_STATUS.REJECTED;
    await review.save();

    successResponse(res, 200, 'Review rejected successfully', { review });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get instructor's course reviews
// @route   GET /api/reviews/instructor/courses
// @access  Private/Instructor
const getInstructorReviews = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      courseId,
    } = req.query;

    
    const instructorCourses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = instructorCourses.map((c) => c._id);

    const query = {
      course: courseId ? courseId : { $in: courseIds },
      status: REVIEW_STATUS.APPROVED,
    };

    const skip = (page - 1) * limit;
    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .populate('course', 'title')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    paginatedResponse(res, 200, 'Reviews fetched successfully', reviews, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

const replyToReview = async (req, res) => {
  try {
    const { message } = req.body;
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId).populate('course');
    
    if (!review) {
      return errorResponse(res, 404, 'Review not found');
    }

    
    if (review.course.instructor.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Only course instructor can reply');
    }

    review.instructorReply = {
      message,
      repliedAt: new Date(),
    };

    await review.save();

    successResponse(res, 200, 'Reply added successfully', { review });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

module.exports = {
  addReview,
  getCourseReviews,
  getMyReview,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview,
  rejectReview,
  getInstructorReviews,
  replyToReview,
};