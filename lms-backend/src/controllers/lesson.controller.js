const Lesson = require('../models/Lesson.model');
const Section = require('../models/Section.model');
const Course = require('../models/Course.model');
const { uploadVideo, deleteMedia } = require('../config/cloudinary');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create lesson
// @route   POST /api/instructor/lessons
// @access  Private/Instructor
const createLesson = async (req, res) => {
  try {
    const { title, sectionId, order, description, isPreview, duration, type, quiz, content, resourceUrl } = req.body;

    console.log('Creating lesson:', { title, sectionId, duration, type });

    if (!sectionId) {
      return errorResponse(res, 400, 'Section ID is required');
    }

    const section = await Section.findById(sectionId).populate('course');
    if (!section) {
      return errorResponse(res, 404, 'Section not found');
    }

    const course = await Course.findOne({
      _id: section.course._id,
      instructor: req.user._id,
    });
    if (!course) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    const lastLesson = await Lesson.findOne({ section: sectionId })
      .sort('-order')
      .select('order');

    const newOrder = order !== undefined ? parseInt(order) : (lastLesson?.order || 0) + 1;

    const lessonData = {
      title,
      section: sectionId,
      order: newOrder,
      duration: parseInt(duration) || 0,
      description: description || '',
      isPreview: isPreview === 'true' || isPreview === true,
      type,
    };

    if (type === 'video') {
      const videoFile = req.files?.['video']?.[0];
      if (!videoFile) {
        return errorResponse(res, 400, 'Please provide a video file');
      }

      console.log('Uploading video to Cloudinary...');
      const uploadResult = await uploadVideo(videoFile.path, 'lms/videos');
      lessonData.videoUrl = uploadResult.url;
      lessonData.videoPublicId = uploadResult.publicId;
      lessonData.duration = uploadResult.duration || lessonData.duration;
      console.log('Video uploaded:', uploadResult.url);

    } else if (type === 'quiz') {
      if (!quiz) {
        return errorResponse(res, 400, 'Quiz data is required for quiz lessons');
      }

      const quizData = typeof quiz === 'string' ? JSON.parse(quiz) : quiz;
      
      if (!quizData.questions || quizData.questions.length === 0) {
        return errorResponse(res, 400, 'At least one question is required');
      }

      lessonData.quiz = {
        questions: quizData.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || '',
        })),
        passingScore: quizData.passingScore || 70,
      };

    } else if (type === 'reading' || type === 'assignment') {
      if (!content) {
        return errorResponse(res, 400, `Content is required for ${type} lessons`);
      }

      lessonData.content = content;

      if (resourceUrl) {
        lessonData.resources = [{
          title: 'Resource',
          url: resourceUrl,
          type: 'link',
        }];
      }
    }

    const lesson = await Lesson.create(lessonData);
    console.log('Lesson created:', lesson._id);

    const allLessons = await Lesson.find({
      section: { $in: await Section.find({ course: section.course._id }).select('_id') },
    });
    const totalDuration = allLessons.reduce((sum, l) => sum + (l.duration || 0), 0);
    await Course.findByIdAndUpdate(section.course._id, { totalDuration });

    successResponse(res, 201, 'Lesson created successfully', { lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all lessons for a section
// @route   GET /api/instructor/lessons?sectionId=xxx
// @access  Private/Instructor
const getLessons = async (req, res) => {
  try {
    const { sectionId } = req.query;

    if (!sectionId) {
      return errorResponse(res, 400, 'Section ID is required');
    }

    const section = await Section.findById(sectionId).populate('course');
    if (!section) {
      return errorResponse(res, 404, 'Section not found');
    }

    const course = await Course.findOne({
      _id: section.course._id,
      instructor: req.user._id,
    });
    if (!course) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    const lessons = await Lesson.find({ section: sectionId }).sort('order');

    successResponse(res, 200, 'Lessons fetched successfully', { lessons });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get single lesson
// @route   GET /api/instructor/lessons/:id
// @access  Private/Instructor
const getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate({
      path: 'section',
      populate: { path: 'course' },
    });

    if (!lesson) {
      return errorResponse(res, 404, 'Lesson not found');
    }

    const course = await Course.findOne({
      _id: lesson.section.course._id,
      instructor: req.user._id,
    });
    if (!course) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    successResponse(res, 200, 'Lesson fetched successfully', { lesson });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Update lesson
// @route   PUT /api/instructor/lessons/:id
// @access  Private/Instructor
const updateLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.id).populate({
      path: 'section',
      populate: { path: 'course' },
    });

    if (!lesson) {
      return errorResponse(res, 404, 'Lesson not found');
    }

    const course = await Course.findOne({
      _id: lesson.section.course._id,
      instructor: req.user._id,
    });
    if (!course) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    console.log('Update lesson body:', req.body);
    console.log('Update lesson files:', req.files);

    const { type, quiz, content, resourceUrl, title, description, duration, isPreview } = req.body;

    
    const updateData = {
      title: title || lesson.title,
      description: description || lesson.description,
      duration: parseInt(duration) || lesson.duration,
      isPreview: isPreview === 'true' || isPreview === true || lesson.isPreview,
    };

    
    if (type) {
      updateData.type = type;
    }

    
    if (type === 'video' || lesson.type === 'video') {
      const videoFile = req.files?.['video']?.[0];

      if (videoFile) {
        
        if (lesson.videoPublicId) {
          try {
            await deleteMedia(lesson.videoPublicId, 'video');
            console.log('Old video deleted');
          } catch (err) {
            console.error('Failed to delete old video:', err);
          }
        }

        
        console.log('Uploading new video...');
        const uploadResult = await uploadVideo(videoFile.path, 'lms/videos');
        updateData.videoUrl = uploadResult.url;
        updateData.videoPublicId = uploadResult.publicId;
        updateData.duration = uploadResult.duration || updateData.duration;
        console.log('New video uploaded:', uploadResult.url);
      }
    }

    
    if (type === 'quiz') {
      if (quiz) {
        const quizData = typeof quiz === 'string' ? JSON.parse(quiz) : quiz;
        console.log('Quiz data parsed:', quizData);
        
        updateData.quiz = {
          questions: quizData.questions || [],
          passingScore: quizData.passingScore || 70,
        };
      }
      
      
      updateData.videoUrl = undefined;
      updateData.videoPublicId = undefined;
    }

    
    if (type === 'reading' || type === 'assignment') {
      if (content) {
        updateData.content = content;
        console.log('Content updated');
      }
      
      if (resourceUrl) {
        updateData.resources = [{
          title: 'Resource',
          url: resourceUrl,
          type: 'link',
        }];
        console.log('Resource added:', resourceUrl);
      }

      
      updateData.videoUrl = undefined;
      updateData.videoPublicId = undefined;
    }

    console.log('Final update data:', updateData);

    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        lesson[key] = updateData[key];
      }
    });

    await lesson.save({ validateBeforeSave: false });

    console.log('Lesson updated successfully:', lesson._id);

    
    const allLessons = await Lesson.find({
      section: { $in: await Section.find({ course: lesson.section.course._id }).select('_id') },
    });
    const totalDuration = allLessons.reduce((sum, l) => sum + (l.duration || 0), 0);
    await Course.findByIdAndUpdate(lesson.section.course._id, { totalDuration });

    successResponse(res, 200, 'Lesson updated successfully', { lesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Update lesson order
// @route   PUT /api/instructor/lessons/reorder
// @access  Private/Instructor
const reorderLessons = async (req, res) => {
  try {
    const { lessons } = req.body;

    if (!lessons || !Array.isArray(lessons)) {
      return errorResponse(res, 400, 'Lessons array is required');
    }

    const lessonIds = lessons.map((l) => l.id);
    const dbLessons = await Lesson.find({ _id: { $in: lessonIds } }).populate({
      path: 'section',
      populate: { path: 'course' },
    });

    for (const lesson of dbLessons) {
      const course = await Course.findOne({
        _id: lesson.section.course._id,
        instructor: req.user._id,
      });

      if (!course) {
        return errorResponse(res, 403, 'Unauthorized to reorder these lessons');
      }
    }

    const updatePromises = lessons.map((l) =>
      Lesson.findByIdAndUpdate(l.id, { order: l.order })
    );

    await Promise.all(updatePromises);

    successResponse(res, 200, 'Lessons reordered successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete lesson
// @route   DELETE /api/instructor/lessons/:id
// @access  Private/Instructor
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate({
      path: 'section',
      populate: { path: 'course' },
    });

    if (!lesson) {
      return errorResponse(res, 404, 'Lesson not found');
    }

    const course = await Course.findOne({
      _id: lesson.section.course._id,
      instructor: req.user._id,
    });
    if (!course) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    
    if (lesson.videoPublicId) {
      try {
        await deleteMedia(lesson.videoPublicId, 'video');
      } catch (err) {
        console.error('Failed to delete video:', err);
      }
    }

    await lesson.deleteOne();

  
    const allLessons = await Lesson.find({
      section: { $in: await Section.find({ course: lesson.section.course._id }).select('_id') },
    });
    const totalDuration = allLessons.reduce((sum, l) => sum + (l.duration || 0), 0);
    await Course.findByIdAndUpdate(lesson.section.course._id, { totalDuration });

    successResponse(res, 200, 'Lesson deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Toggle lesson preview status
// @route   PUT /api/instructor/lessons/:id/preview
// @access  Private/Instructor
const togglePreview = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate({
      path: 'section',
      populate: { path: 'course' },
    });

    if (!lesson) {
      return errorResponse(res, 404, 'Lesson not found');
    }

    const course = await Course.findOne({
      _id: lesson.section.course._id,
      instructor: req.user._id,
    });
    if (!course) {
      return errorResponse(res, 403, 'Unauthorized');
    }

    lesson.isPreview = !lesson.isPreview;
    await lesson.save();

    successResponse(res, 200, 'Lesson preview status updated', { lesson });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createLesson,
  getLessons,
  getLesson,
  updateLesson,
  reorderLessons,
  deleteLesson,
  togglePreview,
};