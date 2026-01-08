const Course = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { generateSlug } = require('../utils/slugify');
const { uploadImage, uploadVideo } = require('../config/cloudinary'); // ADD uploadVideo here
const { COURSE_STATUS, PAGINATION } = require('../utils/constants');

// @desc    Create course
// @route   POST /api/instructor/courses
// @access  Private/Instructor
const createCourse = async (req, res) => {
  try {
    console.log('Received course creation request');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const {
      title,
      description,
      shortDescription,
      category,
      subCategory,
      price,
      discountPrice,
      difficulty,
      language,
      requirements,
      whatYouWillLearn,
      targetAudience,
      tags,
      isFree,
      visibility,
      certificateEnabled,
      accessDuration,
      seoTitle,
      seoDescription,
      seoKeywords,
      prerequisiteCourse,
      maxEnrollments,
    } = req.body;

    if (!title || !description || !category) {
      return errorResponse(res, 400, 'Please provide title, description, and category');
    }

    if (!req.files || !req.files.thumbnail || !req.files.thumbnail[0]) {
      return errorResponse(res, 400, 'Please upload a course thumbnail');
    }

    let slug = generateSlug(title);
    
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      slug = `${slug}-${Date.now()}`;
    }

    console.log('Uploading thumbnail...');
    const thumbnailResult = await uploadImage(
      req.files.thumbnail[0].path, 
      'lms/courses'
    );
    
    const thumbnail = {
      url: thumbnailResult.url,
      publicId: thumbnailResult.publicId,
    };

    let promoVideo = null;
    if (req.files && req.files.promoVideo && req.files.promoVideo[0]) {
      console.log('Uploading promo video...');
      try {
        const videoResult = await uploadVideo(
          req.files.promoVideo[0].path, 
          'lms/promo'
        );
        promoVideo = {
          url: videoResult.url,
          publicId: videoResult.publicId,
          duration: videoResult.duration || 0,
        };
      } catch (videoError) {
        console.error('Promo video upload failed:', videoError);
        promoVideo = null;
      }
    }

    const parseArray = (str) => {
      if (!str) return [];
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return str.split(',').map(item => item.trim()).filter(item => item);
      }
    };

    const courseData = {
      title,
      slug,
      description,
      shortDescription: shortDescription || '',
      instructor: req.user._id,
      category,
      subCategory: subCategory || null,
      thumbnail,
      price: isFree === 'true' ? 0 : Number(price) || 0,
      discountPrice: discountPrice ? Number(discountPrice) : null,
      difficulty: difficulty || 'beginner',
      language: language || 'English',
      requirements: parseArray(requirements),
      whatYouWillLearn: parseArray(whatYouWillLearn),
      targetAudience: parseArray(targetAudience),
      tags: parseArray(tags),
      isFree: isFree === 'true',
      visibility: visibility || 'public',
      certificateEnabled: certificateEnabled !== 'false',
      accessDuration: accessDuration || 'lifetime',
      promoVideo,
      seoTitle: seoTitle || '',
      seoDescription: seoDescription || '',
      seoKeywords: parseArray(seoKeywords),
      prerequisiteCourse: prerequisiteCourse || null,
      maxEnrollments: maxEnrollments ? Number(maxEnrollments) : null,
      status: COURSE_STATUS.DRAFT,
      isApproved: false,
      lastUpdatedAt: new Date(),
    };

    console.log('Creating course with data:', courseData);

    const course = await Course.create(courseData);
    
    console.log('Course created successfully:', course._id);

    await course.populate('instructor', 'name email avatar');
    await course.populate('category', 'name');
    if (course.subCategory) {
      await course.populate('subCategory', 'name');
    }

    successResponse(res, 201, 'Course created successfully', { course });
  } catch (error) {
    console.error('Create course error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get instructor courses
// @route   GET /api/instructor/courses
// @access  Private/Instructor
const getInstructorCourses = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      search,
    } = req.query;

    const query = { instructor: req.user._id };

    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const courses = await Course.find(query)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .sort('-createdAt')
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

// @desc    Get single course (instructor)
// @route   GET /api/instructor/courses/:id
// @access  Private/Instructor
const getInstructorCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id,
    })
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate({
        path: 'sections',
        populate: {
          path: 'lessons',
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

// @desc    Update course
// @route   PUT /api/instructor/courses/:id
// @access  Private/Instructor
const updateCourse = async (req, res) => {
  try {
    let course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id,
    });

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    const parseArray = (str) => {
      if (!str) return [];
      try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return str.split(',').map(item => item.trim()).filter(item => item);
      }
    };

    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const uploadResult = await uploadImage(req.files.thumbnail[0].path, 'lms/courses');
      req.body.thumbnail = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      };
    }

    if (req.files && req.files.promoVideo && req.files.promoVideo[0]) {
      try {
        const videoResult = await uploadVideo(req.files.promoVideo[0].path, 'lms/promo');
        req.body.promoVideo = {
          url: videoResult.url,
          publicId: videoResult.publicId,
          duration: videoResult.duration || 0,
        };
      } catch (videoError) {
        console.error('Promo video upload failed:', videoError);
      }
    }

    if (req.body.requirements) {
      req.body.requirements = parseArray(req.body.requirements);
    }
    if (req.body.whatYouWillLearn) {
      req.body.whatYouWillLearn = parseArray(req.body.whatYouWillLearn);
    }
    if (req.body.targetAudience) {
      req.body.targetAudience = parseArray(req.body.targetAudience);
    }
    if (req.body.tags) {
      req.body.tags = parseArray(req.body.tags);
    }
    if (req.body.seoKeywords) {
      req.body.seoKeywords = parseArray(req.body.seoKeywords);
    }

    if (req.body.isFree !== undefined) {
      req.body.isFree = req.body.isFree === 'true';
      if (req.body.isFree) {
        req.body.price = 0;
      }
    }
    if (req.body.certificateEnabled !== undefined) {
      req.body.certificateEnabled = req.body.certificateEnabled !== 'false';
    }

    req.body.lastUpdatedAt = new Date();

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name').populate('subCategory', 'name');

    successResponse(res, 200, 'Course updated successfully', { course });
  } catch (error) {
    console.error('Update course error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete course
// @route   DELETE /api/instructor/courses/:id
// @access  Private/Instructor
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id,
    });

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    const enrollmentCount = await Enrollment.countDocuments({
      course: course._id,
    });

    if (enrollmentCount > 0) {
      return errorResponse(
        res,
        400,
        'Cannot delete course with active enrollments'
      );
    }

    await course.deleteOne();

    successResponse(res, 200, 'Course deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Publish/Unpublish course
// @route   PUT /api/instructor/courses/:id/publish
// @access  Private/Instructor
const toggleCourseStatus = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      instructor: req.user._id,
    });

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    if (course.status === COURSE_STATUS.DRAFT) {
      course.status = COURSE_STATUS.PUBLISHED;
    } else {
      course.status = COURSE_STATUS.DRAFT;
    }

    await course.save();

    successResponse(res, 200, 'Course status updated successfully', { course });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get instructor enrollments
// @route   GET /api/instructor/enrollments
// @access  Private/Instructor
const getInstructorEnrollments = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      courseId,
    } = req.query;

    const instructorCourses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = instructorCourses.map((c) => c._id);

    const query = { course: { $in: courseIds } };
    if (courseId) query.course = courseId;

    const skip = (page - 1) * limit;
    const enrollments = await Enrollment.find(query)
      .populate('user', 'name email avatar')
      .populate('course', 'title thumbnail')
      .sort('-enrolledAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Enrollment.countDocuments(query);

    paginatedResponse(res, 200, 'Enrollments fetched successfully', enrollments, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get instructor earnings
// @route   GET /api/instructor/earnings
// @access  Private/Instructor
const getInstructorEarnings = async (req, res) => {
  try {
    const instructorCourses = await Course.find({ instructor: req.user._id }).select('_id');
    const courseIds = instructorCourses.map((c) => c._id);

    const orders = await Order.find({
      course: { $in: courseIds },
      status: 'completed',
    });

    const totalEarnings = orders.reduce((sum, order) => sum + order.amount, 0);
    const totalSales = orders.length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    const monthlyEarnings = monthlyOrders.reduce(
      (sum, order) => sum + order.amount,
      0
    );

    const courseEarnings = {};
    for (const order of orders) {
      const courseId = order.course.toString();
      if (!courseEarnings[courseId]) {
        courseEarnings[courseId] = {
          sales: 0,
          earnings: 0,
        };
      }
      courseEarnings[courseId].sales += 1;
      courseEarnings[courseId].earnings += order.amount;
    }

    successResponse(res, 200, 'Earnings fetched successfully', {
      totalEarnings,
      totalSales,
      monthlyEarnings,
      monthlySales: monthlyOrders.length,
      courseEarnings,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get instructor dashboard stats
// @route   GET /api/instructor/dashboard
// @access  Private/Instructor
const getInstructorDashboard = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map((c) => c._id);

    const totalCourses = courses.length;

    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds },
    });

    const orders = await Order.find({
      course: { $in: courseIds },
      status: 'completed',
    });
    const totalEarnings = orders.reduce((sum, order) => sum + order.amount, 0);

    const publishedCourses = courses.filter(
      (c) => c.status === COURSE_STATUS.PUBLISHED
    ).length;

    const recentEnrollments = await Enrollment.find({
      course: { $in: courseIds },
    })
      .populate('user', 'name email avatar')
      .populate('course', 'title')
      .sort('-enrolledAt')
      .limit(5);

    successResponse(res, 200, 'Dashboard stats fetched successfully', {
      totalCourses,
      publishedCourses,
      totalStudents,
      totalEarnings,
      recentEnrollments,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const instructor = await User.findById(req.user._id);
    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    res.json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        instructor,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const instructor = await User.findById(req.user._id);
    if (!instructor) {
      return res.status(404).json({ success: false, message: 'Instructor not found' });
    }

    const { name, bio, website } = req.body;
    if (name) instructor.name = name;
    if (bio) instructor.bio = bio;
    if (website) instructor.website = website;

    if (req.file) {
      instructor.image = req.file.path; 
    }

    await instructor.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: instructor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createCourse,
  getInstructorCourses,
  getInstructorCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  getInstructorEnrollments,
  getInstructorEarnings,
  getInstructorDashboard,
  getProfile,
  updateProfile,
};