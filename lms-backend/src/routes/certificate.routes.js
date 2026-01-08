const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/certificate.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly, instructorOnly } = require('../middleware/role.middleware');

// ✅ PUBLIC ROUTES FIRST
router.get('/verify/:certificateId', verifyCertificate);

// ✅ PROTECTED ROUTES
router.use(protect);

// ✅ INSTRUCTOR ROUTES (SPECIFIC PATHS FIRST - before dynamic params)
router.get('/instructor/stats', instructorOnly, getInstructorCertificateStats);
router.get('/instructor/my-courses', instructorOnly, getInstructorCourseCertificates);
router.get('/instructor/download/:certificateId', instructorOnly, downloadStudentCertificate);

// ✅ ADMIN ROUTES (SPECIFIC PATHS)
router.get('/admin/all', adminOnly, getAllCertificates);

// ✅ STUDENT/USER ROUTES (GENERAL)
router.get('/', getUserCertificates); // Get all user certificates
router.post('/:courseId', generateCertificate);
router.get('/:courseId/download', downloadCertificate);
router.get('/:courseId', getCertificateByCourse); // This should be LAST among GET routes with params

// ✅ ADMIN DELETE (DYNAMIC PARAM)
router.delete('/:id', adminOnly, deleteCertificate);

module.exports = router;