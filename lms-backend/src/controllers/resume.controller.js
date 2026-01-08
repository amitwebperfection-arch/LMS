const Resume = require('../models/Resume.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
const createResume = async (req, res) => {
  try {
    const { title, htmlCode, isTemplate, isPublic, tags, category, formData } = req.body;

    const resume = await Resume.create({
      user: req.user._id,
      title,
      htmlCode,
      isTemplate: isTemplate || false,
      isPublic: isPublic || false,
      tags: tags || [],
      category: category || 'custom',
      formData,
    });

    successResponse(res, 201, 'Resume created successfully', { resume });
  } catch (error) {
    console.error('Create resume error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all user's resumes
// @route   GET /api/resumes/my-resumes
// @access  Private
const getMyResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .sort('-createdAt')
      .select('-htmlCode');

    successResponse(res, 200, 'Resumes fetched successfully', { resumes });
  } catch (error) {
    console.error('Get my resumes error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get single resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id).populate(
      'user',
      'name email avatar'
    );

    if (!resume) {
      return errorResponse(res, 404, 'Resume not found');
    }

    if (
      resume.user._id.toString() !== req.user._id.toString() &&
      !resume.isPublic
    ) {
      return errorResponse(res, 403, 'Not authorized to view this resume');
    }

    resume.views += 1;
    await resume.save();

    successResponse(res, 200, 'Resume fetched successfully', { resume });
  } catch (error) {
    console.error('Get resume error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all public templates
// @route   GET /api/resumes/templates
// @access  Private
const getPublicTemplates = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { isTemplate: true, isPublic: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const templates = await Resume.find(query)
      .populate('user', 'name avatar')
      .sort('-usedCount -createdAt')
      .select('-htmlCode');

    successResponse(res, 200, 'Templates fetched successfully', { templates });
  } catch (error) {
    console.error('Get templates error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Use a template (clone it)
// @route   POST /api/resumes/use-template/:id
// @access  Private
const useTemplate = async (req, res) => {
  try {
    const template = await Resume.findById(req.params.id);

    if (!template || !template.isPublic) {
      return errorResponse(res, 404, 'Template not found');
    }

    template.usedCount += 1;
    await template.save();

    const { title } = req.body;
    const newResume = await Resume.create({
      user: req.user._id,
      title: title || `${template.title} - Copy`,
      htmlCode: template.htmlCode,
      isTemplate: false,
      isPublic: false,
      category: template.category,
      formData: template.formData,
      tags: template.tags,
    });

    successResponse(res, 201, 'Template cloned successfully', {
      resume: newResume,
    });
  } catch (error) {
    console.error('Use template error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return errorResponse(res, 404, 'Resume not found');
    }

    // Check ownership
    if (resume.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to update this resume');
    }

    const { title, htmlCode, isTemplate, isPublic, tags, category, formData } =
      req.body;

    if (title) resume.title = title;
    if (htmlCode) resume.htmlCode = htmlCode;
    if (typeof isTemplate !== 'undefined') resume.isTemplate = isTemplate;
    if (typeof isPublic !== 'undefined') resume.isPublic = isPublic;
    if (tags) resume.tags = tags;
    if (category) resume.category = category;
    if (formData) resume.formData = formData;

    await resume.save();

    successResponse(res, 200, 'Resume updated successfully', { resume });
  } catch (error) {
    console.error('Update resume error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return errorResponse(res, 404, 'Resume not found');
    }

    // Check ownership
    if (resume.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Not authorized to delete this resume');
    }

    await resume.deleteOne();

    successResponse(res, 200, 'Resume deleted successfully');
  } catch (error) {
    console.error('Delete resume error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all resumes (Admin only)
// @route   GET /api/resumes/admin/all
// @access  Private/Admin
const getAllResumesAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const resumes = await Resume.find(query)
      .populate('user', 'name email avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .select('-htmlCode');

    const total = await Resume.countDocuments(query);

    successResponse(res, 200, 'All resumes fetched successfully', {
      resumes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all resumes error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get resume statistics (Admin only)
// @route   GET /api/resumes/admin/stats
// @access  Private/Admin
const getResumeStats = async (req, res) => {
  try {
    const totalResumes = await Resume.countDocuments();
    const totalTemplates = await Resume.countDocuments({ isTemplate: true });
    const publicResumes = await Resume.countDocuments({ isPublic: true });

    const topTemplates = await Resume.find({ isTemplate: true })
      .sort('-usedCount')
      .limit(5)
      .populate('user', 'name')
      .select('title usedCount views category');

    const categoryStats = await Resume.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    successResponse(res, 200, 'Stats fetched successfully', {
      totalResumes,
      totalTemplates,
      publicResumes,
      topTemplates,
      categoryStats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createResume,
  getMyResumes,
  getResumeById,
  getPublicTemplates,
  useTemplate,
  updateResume,
  deleteResume,
  getAllResumesAdmin,
  getResumeStats,
};