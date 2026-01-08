const Progress = require('../models/Progress.model');
const Certificate = require('../models/Certificate.model');
const Enrollment = require('../models/Enrollment.model');
const Lesson = require('../models/Lesson.model');
const Section = require('../models/Section.model');
const Course = require('../models/Course.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get course progress
// @route   GET /api/progress/:courseId
// @access  Private
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return errorResponse(res, 403, 'Not enrolled in this course');
    }

    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    })
      .populate('lastWatchedLesson')
      .populate({
        path: 'completedLessons.lesson',
        select: 'title order section',
      });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
      });
    }

    successResponse(res, 200, 'Progress fetched successfully', { progress });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/progress/complete-lesson
// @access  Private
const completeLesson = async (req, res) => {
  try {
    const { courseId, lessonId, watchTime, watchPercentage, quizScore } = req.body;
    
    // Validation
    if (!courseId || !lessonId) {
      return errorResponse(res, 400, 'Course ID and Lesson ID are required');
    }

    // Find or create progress
    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        course: courseId,
        completedLessons: [],
      });
    }

    // Check if lesson already completed
    const lessonIndex = progress.completedLessons.findIndex(
      (cl) => cl.lesson.toString() === lessonId
    );

    if (lessonIndex === -1) {
      // Add new completed lesson
      progress.completedLessons.push({
        lesson: lessonId,
        completedAt: new Date(),
        watchTime: watchTime || 0,
        watchPercentage: watchPercentage || 100,
        quizScore: quizScore || null,
      });
    } else {
      // Update existing completed lesson
      progress.completedLessons[lessonIndex].watchTime = watchTime || progress.completedLessons[lessonIndex].watchTime;
      progress.completedLessons[lessonIndex].watchPercentage = watchPercentage || 100;
      if (quizScore !== undefined && quizScore !== null) {
        progress.completedLessons[lessonIndex].quizScore = quizScore;
      }
    }

    // ✅ Calculate progress percentage
    const course = await Course.findById(courseId).populate({
      path: 'sections',
      populate: { path: 'lessons' }
    });

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    const totalLessons = course.sections.reduce(
      (sum, section) => sum + (section.lessons?.length || 0),
      0
    );

    const progressPercentage = totalLessons > 0 
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;

    progress.progressPercentage = progressPercentage;
    progress.lastAccessedAt = new Date();

    await progress.save();

    // ✅ Update enrollment when course is completed
    if (progressPercentage === 100) {
      console.log('🎉 Course 100% completed, updating enrollment...');
      
      const enrollment = await Enrollment.findOne({
        user: req.user._id,
        course: courseId,
      });

      if (enrollment && !enrollment.isCompleted) {
        enrollment.isCompleted = true;
        enrollment.completedAt = new Date();
        enrollment.progress = 100;
        await enrollment.save();
        
        console.log('✅ Enrollment updated:', {
          isCompleted: enrollment.isCompleted,
          completedAt: enrollment.completedAt
        });
      }
    }

    // Update enrollment's last accessed lesson and progress
    await Enrollment.findOneAndUpdate(
      { user: req.user._id, course: courseId },
      {
        lastAccessedLesson: lessonId,
        lastAccessedAt: new Date(),
        progress: progressPercentage,
      }
    );

    successResponse(res, 200, 'Lesson marked as complete', {
      progress,
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Update watch time
// @route   PUT /api/progress/watch-time
// @access  Private
const updateWatchTime = async (req, res) => {
  try {
    const { courseId, lessonId, watchTime } = req.body;

    
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return errorResponse(res, 403, 'Not enrolled in this course');
    }

    
    let progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.user._id,
        course: courseId,
      });
    }

    
    progress.lastWatchedLesson = lessonId;

    
    const lessonIndex = progress.completedLessons.findIndex(
      (cl) => cl.lesson.toString() === lessonId
    );

    if (lessonIndex !== -1) {
      progress.completedLessons[lessonIndex].watchTime = watchTime;
    }

    await progress.save();

    successResponse(res, 200, 'Watch time updated successfully', { progress });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Reset course progress
// @route   DELETE /api/progress/:courseId/reset
// @access  Private
const resetProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return errorResponse(res, 403, 'Not enrolled in this course');
    }

    
    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!progress) {
      return errorResponse(res, 404, 'Progress not found');
    }

    progress.completedLessons = [];
    progress.lastWatchedLesson = null;
    progress.totalWatchTime = 0;
    progress.progressPercentage = 0;

    await progress.save();

    
    enrollment.isCompleted = false;
    enrollment.completedAt = null;
    enrollment.progress = 0;
    await enrollment.save();

    successResponse(res, 200, 'Progress reset successfully', { progress });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get lesson completion status
// @route   GET /api/progress/:courseId/lesson/:lessonId
// @access  Private
const getLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return errorResponse(res, 403, 'Not enrolled in this course');
    }

    const progress = await Progress.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!progress) {
      return successResponse(res, 200, 'Lesson progress fetched', {
        isCompleted: false,
        watchTime: 0,
      });
    }

    const lessonProgress = progress.completedLessons.find(
      (cl) => cl.lesson.toString() === lessonId
    );

    successResponse(res, 200, 'Lesson progress fetched', {
      isCompleted: !!lessonProgress,
      watchTime: lessonProgress ? lessonProgress.watchTime : 0,
      completedAt: lessonProgress ? lessonProgress.completedAt : null,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all user progress (for dashboard)
// @route   GET /api/progress/user/all
// @access  Private
const getAllUserProgress = async (req, res) => {
  try {
    const progressRecords = await Progress.find({
      user: req.user._id,
    })
      .populate({
        path: 'course',
        select: 'title thumbnail slug',
      })
      .populate('lastWatchedLesson', 'title')
      .sort('-updatedAt');

    successResponse(res, 200, 'All progress fetched successfully', {
      progress: progressRecords,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all user progress
// @route   GET /api/progress/my-progress
// @access  Private
const getMyProgress = async (req, res) => {
  try {
    const progressRecords = await Progress.find({
      user: req.user._id,
    })
      .populate({
        path: 'course',
        select: 'title thumbnail slug',
      })
      .populate('lastWatchedLesson', 'title')
      .sort('-updatedAt');

    successResponse(res, 200, 'Progress fetched successfully', {
      progress: progressRecords,
    });
  } catch (error) {
    console.error('Get my progress error:', error);
    errorResponse(res, 500, error.message);
  }
};

module.exports = {
  getCourseProgress,
  completeLesson,
  updateWatchTime,
  resetProgress,
  getLessonProgress,
  getAllUserProgress,
  getMyProgress,
};