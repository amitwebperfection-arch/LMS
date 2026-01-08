const Enrollment = require('../models/Enrollment.model');
const Progress = require('../models/Progress.model');
const Course = require('../models/Course.model');
const Certificate = require('../models/Certificate.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { PAGINATION } = require('../utils/constants');
const Category = require('../models/Category.model');


// @desc    Get student dashboard
// @route   GET /api/student/dashboard
// @access  Private/Student
const getStudentDashboard = async (req, res) => {
  try {
    const totalEnrolled = await Enrollment.countDocuments({
      user: req.user._id,
    });

    const completedCourses = await Enrollment.countDocuments({
      user: req.user._id,
      isCompleted: true,
    });

    const inProgressCourses = totalEnrolled - completedCourses;

    const totalCertificates = await Certificate.countDocuments({
      user: req.user._id,
    });

    const recentProgress = await Progress.find({
      user: req.user._id,
    })
      .populate({
        path: 'course',
        select: 'title thumbnail slug',
      })
      .populate({
        path: 'lastWatchedLesson',
        select: 'title',
      })
      .sort('-updatedAt')
      .limit(5);

    const recentEnrollments = await Enrollment.find({
      user: req.user._id,
    })
      .populate('course', 'title thumbnail slug instructor')
      .sort('-enrolledAt')
      .limit(5);

    successResponse(res, 200, 'Dashboard fetched successfully', {
      stats: {
        totalEnrolled,
        completedCourses,
        inProgressCourses,
        totalCertificates,
      },
      continueWatching: recentProgress,
      recentEnrollments,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get enrolled courses
// @route   GET /api/student/my-courses
// @access  Private/Student

const getMyCourses = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { user: req.user._id };
    if (status === 'completed') {
      query.isCompleted = true;
    } else if (status === 'in-progress') {
      query.isCompleted = false;
    }

    const skip = (page - 1) * limit;

    const enrollments = await Enrollment.find(query)
      .populate({
        path: 'course',
        select: 'title thumbnail slug instructor rating difficulty totalDuration',
        populate: {
          path: 'instructor',
          select: 'name avatar',
        },
      })
      .sort('-enrolledAt')
      .skip(skip)
      .limit(Number(limit));

    console.log(`Found ${enrollments.length} enrollments`);

    const total = await Enrollment.countDocuments(query);

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        if (!enrollment.course) {
          console.warn('Enrollment without course:', enrollment._id);
          return null;
        }

        const progress = await Progress.findOne({
          user: req.user._id,
          course: enrollment.course._id,
        });

        return {
          _id: enrollment._id,
          course: enrollment.course,
          enrolledAt: enrollment.enrolledAt,
          lastAccessedAt: enrollment.lastAccessedAt,
          lastAccessedLesson: enrollment.lastAccessedLesson,
          isCompleted: enrollment.isCompleted,
          completedAt: enrollment.completedAt,
          progress: enrollment.progress || 0,
          certificateIssued: enrollment.certificateIssued,
          accessExpiresAt: enrollment.accessExpiresAt,
          progressPercentage: progress ? progress.progressPercentage : 0,
          totalWatchTime: progress ? progress.totalWatchTime : 0,
          completedLessons: progress ? progress.completedLessons.length : 0,
        };
      })
    );

    // Filter out null values
    const validCourses = coursesWithProgress.filter(c => c !== null);

    console.log(`Returning ${validCourses.length} valid courses`);

    successResponse(res, 200, 'My courses fetched successfully', validCourses, {
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get my courses error:', error);
    errorResponse(res, 500, error.message);
  }
};



// @desc    Get single enrolled course details
// @route   GET /api/student/my-courses/:courseId
// @access  Private/Student
const getMyCourseDetails = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
    }).populate({
      path: 'course',
      populate: [
        {
          path: 'instructor',
          select: 'name avatar bio',
        },
        {
          path: 'sections',
          populate: {
            path: 'lessons',
          },
        },
      ],
    });

    if (!enrollment) {
      return errorResponse(res, 404, 'Enrollment not found');
    }

    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.params.courseId,
    }).populate('lastWatchedLesson');

    successResponse(res, 200, 'Course details fetched successfully', {
      enrollment,
      progress,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};


// @desc    Check enrollment status
// @route   GET /api/student/check-enrollment/:courseId
// @access  Private
const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log('Checking enrollment:', { 
      userId: req.user._id, 
      courseId 
    });

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    })
    .populate('course', 'title thumbnail')
    .populate('order', 'status amount');

    if (!enrollment) {
      console.log('Not enrolled');
      return successResponse(res, 200, 'Not enrolled', {
        isEnrolled: false,
        enrollment: null,
      });
    }


    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    successResponse(res, 200, 'Enrollment status retrieved', {
      isEnrolled: true,
      enrollment: {
        ...enrollment.toObject(),
        progress: progress ? progress.progressPercentage : 0,
        completedLessons: progress ? progress.completedLessons.length : 0,
      },
    });
  } catch (error) {
    console.error('Check enrollment error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get student certificates
// @route   GET /api/student/certificates
// @access  Private/Student
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      user: req.user._id,
    })
      .populate('course', 'title thumbnail instructor')
      .sort('-issuedAt');

    successResponse(res, 200, 'Certificates fetched successfully', {
      certificates,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get learning statistics
// @route   GET /api/student/statistics
// @access  Private/Student
const getLearningStatistics = async (req, res) => {
  try {
    const progressRecords = await Progress.find({
      user: req.user._id,
    });

    const totalWatchTime = progressRecords.reduce(
      (sum, p) => sum + (p.totalWatchTime || 0),
      0
    );
    const totalWatchTimeHours = Math.round(totalWatchTime / 3600);

    const avgProgress =
      progressRecords.length > 0
        ? progressRecords.reduce((sum, p) => sum + p.progressPercentage, 0) /
          progressRecords.length
        : 0;

    const enrollments = await Enrollment.find({
      user: req.user._id,
    }).populate({
      path: 'course',
      populate: {
        path: 'category',
        select: 'name',
      },
    });

    const categoriesMap = {};
    enrollments.forEach((e) => {
      if (e.course && e.course.category) {
        const categoryName = e.course.category.name;
        categoriesMap[categoryName] = (categoriesMap[categoryName] || 0) + 1;
      }
    });

    const coursesByCategory = Object.entries(categoriesMap).map(
      ([name, count]) => ({
        category: name,
        count,
      })
    );

    successResponse(res, 200, 'Statistics fetched successfully', {
      totalWatchTimeHours,
      averageProgress: Math.round(avgProgress),
      totalCoursesInProgress: progressRecords.filter(
        (p) => p.progressPercentage < 100
      ).length,
      coursesByCategory,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all categories (student view)
// @route   GET /api/student/categories
// @access  Private/Student
const getStudentCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort('name'); 
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudentDashboard,
  getMyCourses,
  getMyCourseDetails,
  checkEnrollment,
  getMyCertificates,
  getLearningStatistics,
  getStudentCategories,
};