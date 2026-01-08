const Section = require('../models/Section.model');
const Course = require('../models/Course.model');
const Lesson = require('../models/Lesson.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create section
// @route   POST /api/instructor/sections
// @access  Private/Instructor
const createSection = async (req, res) => {
  try {
    const { title, courseId, order, description } = req.body;

    const course = await Course.findOne({
      _id: courseId,
      instructor: req.user._id,
    });

    if (!course) {
      return errorResponse(res, 404, 'Course not found or unauthorized');
    }

    const lastSection = await Section.findOne({ course: courseId })
      .sort('-order')
      .select('order');

    const newOrder = order !== undefined ? order : (lastSection?.order || 0) + 1;

    const section = await Section.create({
      title,
      course: courseId,
      order: newOrder,
      description,
    });

    successResponse(res, 201, 'Section created successfully', { section });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all sections for a course
// @route   GET /api/instructor/sections?courseId=xxx
// @access  Private/Instructor
const getSections = async (req, res) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return errorResponse(res, 400, 'Course ID is required');
    }

    const course = await Course.findById(courseId);

    if (!course || course.instructor.toString() !== req.user._id.toString()) {
      return errorResponse(res, 404, 'Course not found or unauthorized');
    }

    const sections = await Section.find({ course: courseId })
      .sort('order')
      .populate('lessons');

    return successResponse(res, 200, 'Sections fetched successfully', { sections });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};


// @desc    Get single section
// @route   GET /api/instructor/sections/:id
// @access  Private/Instructor
const getSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id)
      .populate('course')
      .populate('lessons');

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

    successResponse(res, 200, 'Section fetched successfully', { section });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Update section
// @route   PUT /api/instructor/sections/:id
// @access  Private/Instructor
const updateSection = async (req, res) => {
  try {
    let section = await Section.findById(req.params.id).populate('course');

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

    section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    successResponse(res, 200, 'Section updated successfully', { section });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Update section order
// @route   PUT /api/instructor/sections/reorder
// @access  Private/Instructor
const reorderSections = async (req, res) => {
  try {
    const { sections } = req.body; 

    if (!sections || !Array.isArray(sections)) {
      return errorResponse(res, 400, 'Sections array is required');
    }

    const sectionIds = sections.map((s) => s.id);
    const dbSections = await Section.find({ _id: { $in: sectionIds } }).populate('course');

    for (const section of dbSections) {
      const course = await Course.findOne({
        _id: section.course._id,
        instructor: req.user._id,
      });

      if (!course) {
        return errorResponse(res, 403, 'Unauthorized to reorder these sections');
      }
    }

    const updatePromises = sections.map((s) =>
      Section.findByIdAndUpdate(s.id, { order: s.order })
    );

    await Promise.all(updatePromises);

    successResponse(res, 200, 'Sections reordered successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete section
// @route   DELETE /api/instructor/sections/:id
// @access  Private/Instructor
const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate('course');

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

    await Lesson.deleteMany({ section: section._id });

    await section.deleteOne();

    successResponse(res, 200, 'Section and its lessons deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createSection,
  getSections,
  getSection,
  updateSection,
  reorderSections,
  deleteSection,
};