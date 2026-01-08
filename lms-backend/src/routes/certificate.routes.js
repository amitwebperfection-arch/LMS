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


router.get('/verify/:certificateId', verifyCertificate);


router.use(protect);

router.get('/instructor/stats', instructorOnly, getInstructorCertificateStats);
router.get('/instructor/my-courses', instructorOnly, getInstructorCourseCertificates);
router.get('/instructor/download/:certificateId', instructorOnly, downloadStudentCertificate);

router.get('/admin/all', adminOnly, getAllCertificates);

router.get('/', getUserCertificates);
router.post('/:courseId', generateCertificate);
router.get('/:courseId/download', downloadCertificate);
router.get('/:courseId', getCertificateByCourse); 

router.delete('/:id', adminOnly, deleteCertificate);

module.exports = router;