const Course = require('../models/Course.model');
const Section = require('../models/Section.model');
const Lesson = require('../models/Lesson.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { generateSlug } = require('../utils/slugify');
const { COURSE_STATUS, PAGINATION } = require('../utils/constants');

// @desc    Get all courses (public)
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      category,
      subCategory,
      difficulty,
      search,
      minPrice,
      maxPrice,
      sort = '-createdAt',
      isFree,
      visibility = 'public',
      isFeatured,
      language,
    } = req.query;

    const query = { 
      status: COURSE_STATUS.PUBLISHED, 
      isApproved: true,
      visibility: visibility || 'public',
    };

    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (difficulty) query.difficulty = difficulty;
    if (language) query.language = language;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    
    if (isFree !== undefined) {
      query.isFree = isFree === 'true';
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar instructorProfile')
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Course.countDocuments(query);

    paginatedResponse(res, 200, 'Courses fetched successfully', courses, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:slug
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', 'name avatar bio')
      .populate('category', 'name')
      .populate({
        path: 'sections',
        populate: {
          path: 'lessons',
          select: 'title duration order isPreview',
        },
      });

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    successResponse(res, 200, 'Course fetched successfully', { course });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

module.exports = {
  getCourses,
  getCourse,
};