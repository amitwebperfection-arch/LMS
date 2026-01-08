const Certificate = require('../models/Certificate.model');
const Enrollment = require('../models/Enrollment.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const { generateCertificatePDF } = require('../services/certificate.service');
const { sendCertificateEmail } = require('../services/email.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const path = require('path');
const fs = require('fs');

// @desc    Generate certificate
// @route   POST /api/certificates/:courseId
// @access  Private
const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log('📝 Generate certificate request for course:', courseId);
    console.log('👤 User:', req.user._id);

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    console.log('📚 Enrollment:', enrollment);

    if (!enrollment) {
      console.log('❌ No enrollment found');
      return errorResponse(
        res,
        403,
        'You must be enrolled in this course'
      );
    }

    console.log('✅ Enrollment status:', {
      isCompleted: enrollment.isCompleted,
      progress: enrollment.progress,
      certificateIssued: enrollment.certificateIssued
    });

    if (!enrollment.isCompleted) {
      console.log('❌ Course not completed');
      return errorResponse(
        res,
        403,
        'You must complete the course (100%) to get a certificate'
      );
    }

    let certificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (certificate) {
      console.log('ℹ️ Certificate already exists:', certificate.certificateId);
      return successResponse(res, 200, 'Certificate already exists', {
        certificate,
      });
    }

    // ✅ Populate instructor to get their name
    const course = await Course.findById(courseId)
      .select('title instructor certificateEnabled')
      .populate('instructor', 'name email'); // ⭐ Populate instructor

    console.log('🎓 Course:', {
      title: course?.title,
      instructor: course?.instructor?.name,
      certificateEnabled: course?.certificateEnabled
    });

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    if (!course.certificateEnabled) {
      return errorResponse(res, 403, 'Certificates are disabled for this course');
    }

    console.log('✅ Creating certificate...');

    certificate = new Certificate({
      user: req.user._id,
      course: courseId,
      instructor: course.instructor._id,
    });

    await certificate.save();
    console.log('✅ Certificate saved with ID:', certificate.certificateId);

    // ✅ Generate PDF with instructor details
    console.log('📄 Generating PDF with instructor:', course.instructor.name);
    const fileName = await generateCertificatePDF(
      certificate,
      req.user,
      course // This now includes populated instructor
    );
    console.log('✅ PDF generated:', fileName);

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    certificate.pdfUrl = `${backendUrl}/uploads/certificates/${fileName}`;
    
    await certificate.save();
    console.log('✅ Certificate URL:', certificate.pdfUrl);

    enrollment.certificateIssued = true;
    await enrollment.save();
    console.log('✅ Enrollment updated - certificate issued');

    try {
      await sendCertificateEmail(req.user, course, certificate.pdfUrl);
      console.log('✅ Email sent');
    } catch (emailError) {
      console.error('⚠️ Email error:', emailError.message);
    }

    return successResponse(res, 201, 'Certificate generated successfully', {
      certificate,
    });
  } catch (error) {
    console.error('❌ Generate certificate error:', error);
    return errorResponse(res, 500, error.message);
  }
};

// @desc    Get certificate by course
// @route   GET /api/certificates/:courseId
// @access  Private
const getCertificateByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const certificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId,
    })
      .populate('course', 'title thumbnail')
      .populate('user', 'name email');

    if (!certificate) {
      return errorResponse(res, 404, 'Certificate not found');
    }

    successResponse(res, 200, 'Certificate fetched successfully', {
      certificate,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all user certificates
// @route   GET /api/certificates
// @access  Private
const getUserCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate('course', 'title thumbnail instructor')
      .sort('-issuedAt');

    successResponse(res, 200, 'Certificates fetched successfully', {
      certificates,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all certificates for instructor's courses
// @route   GET /api/certificates/instructor/my-courses
// @access  Private/Instructor
const getInstructorCourseCertificates = async (req, res) => {
  try {
    const { courseId, page = 1, limit = 10 } = req.query;

    
    const instructorCourses = await Course.find({ 
      instructor: req.user._id 
    }).select('_id title');

    if (!instructorCourses || instructorCourses.length === 0) {
      return successResponse(res, 200, 'No courses found', {
        certificates: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0,
        },
      });
    }

    const courseIds = instructorCourses.map(c => c._id);

    
    const query = { course: { $in: courseIds } };
    if (courseId) {
      query.course = courseId;
    }

    const skip = (page - 1) * limit;

    const certificates = await Certificate.find(query)
      .populate('user', 'name email avatar')
      .populate('course', 'title thumbnail')
      .sort('-issuedAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Certificate.countDocuments(query);

    successResponse(res, 200, 'Certificates fetched successfully', {
      certificates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get instructor certificates error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get certificate statistics for instructor
// @route   GET /api/certificates/instructor/stats
// @access  Private/Instructor
const getInstructorCertificateStats = async (req, res) => {
  try {
    
    const instructorCourses = await Course.find({ 
      instructor: req.user._id 
    }).select('_id title');

    if (!instructorCourses || instructorCourses.length === 0) {
      return successResponse(res, 200, 'No courses found', {
        totalCertificates: 0,
        courseStats: [],
      });
    }

    const courseIds = instructorCourses.map(c => c._id);

    
    const totalCertificates = await Certificate.countDocuments({
      course: { $in: courseIds }
    });

   
    const courseStats = await Certificate.aggregate([
      {
        $match: { course: { $in: courseIds } }
      },
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 },
          latestIssue: { $max: '$issuedAt' }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseDetails'
        }
      },
      {
        $unwind: '$courseDetails'
      },
      {
        $project: {
          courseId: '$_id',
          courseTitle: '$courseDetails.title',
          courseThumbnail: '$courseDetails.thumbnail',
          certificateCount: '$count',
          latestIssue: 1
        }
      },
      {
        $sort: { certificateCount: -1 }
      }
    ]);

    successResponse(res, 200, 'Certificate stats fetched successfully', {
      totalCertificates,
      courseStats,
    });
  } catch (error) {
    console.error('Get certificate stats error:', error);
    errorResponse(res, 500, error.message);
  }
};

// @desc    Verify certificate
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('user', 'name email')
      .populate('course', 'title instructor');

    if (!certificate) {
      return errorResponse(res, 404, 'Certificate not found or invalid');
    }

    successResponse(res, 200, 'Certificate verified successfully', {
      isValid: true,
      certificate: {
        certificateId: certificate.certificateId,
        userName: certificate.user.name,
        courseTitle: certificate.course.title,
        issuedAt: certificate.issuedAt,
        verificationUrl: certificate.verificationUrl,
      },
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Download certificate (Student)
// @route   GET /api/certificates/:courseId/download
// @access  Private
const downloadCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const certificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (!certificate) {
      return errorResponse(res, 404, 'Certificate not found');
    }

    if (!certificate.pdfUrl) {
      return errorResponse(res, 404, 'Certificate PDF not generated yet');
    }

    const fileName = path.basename(certificate.pdfUrl);
    
    // ✅ FIX: Correct path resolution
    const filePath = path.join(
      __dirname,
      '../../uploads/certificates', // Go up 2 levels from controllers folder
      fileName
    );

    console.log('Download path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));

    if (!fs.existsSync(filePath)) {
      return errorResponse(res, 404, 'Certificate file not found on server');
    }

    return res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        return errorResponse(res, 500, 'Error downloading certificate');
      }
    });
  } catch (error) {
    console.error('Student download error:', error);
    return errorResponse(res, 500, 'Failed to download certificate');
  }
};

// @desc    Get all certificates (admin)
// @route   GET /api/certificates/admin/all
// @access  Private/Admin
const getAllCertificates = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, courseId } = req.query;

    const query = {};
    if (userId) query.user = userId;
    if (courseId) query.course = courseId;

    const skip = (page - 1) * limit;
    const certificates = await Certificate.find(query)
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort('-issuedAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Certificate.countDocuments(query);

    successResponse(res, 200, 'Certificates fetched successfully', {
      certificates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete certificate (admin)
// @route   DELETE /api/certificates/:id
// @access  Private/Admin
const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return errorResponse(res, 404, 'Certificate not found');
    }

    await certificate.deleteOne();

    await Enrollment.updateOne(
      {
        user: certificate.user,
        course: certificate.course,
      },
      {
        certificateIssued: false,
      }
    );

    successResponse(res, 200, 'Certificate deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Download any certificate by ID (instructor)
// @route   GET /api/certificates/instructor/download/:certificateId
// @access  Private/Instructor
const downloadStudentCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('course', 'instructor');

    if (!certificate) {
      return errorResponse(res, 404, 'Certificate not found');
    }

    // Check if this instructor owns the course
    if (certificate.course.instructor.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'You can only download certificates from your courses');
    }

    if (!certificate.pdfUrl) {
      return errorResponse(res, 404, 'Certificate PDF not generated yet');
    }

    const fileName = path.basename(certificate.pdfUrl);
    
    // ✅ FIX: Correct path resolution
    const filePath = path.join(
      __dirname,
      '../../uploads/certificates',
      fileName
    );

    console.log('Instructor download path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));

    if (!fs.existsSync(filePath)) {
      return errorResponse(res, 404, 'Certificate file not found on server');
    }

    return res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Instructor download error:', err);
        return errorResponse(res, 500, 'Error downloading certificate');
      }
    });
  } catch (error) {
    console.error('Download student certificate error:', error);
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  generateCertificate,
  getCertificateByCourse,
  getUserCertificates,
  verifyCertificate,
  downloadCertificate,
  getAllCertificates,
  deleteCertificate,
  getInstructorCourseCertificates, 
  getInstructorCertificateStats, 
  downloadStudentCertificate,
};