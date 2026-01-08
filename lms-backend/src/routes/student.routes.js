const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getMyCourses,
  getMyCourseDetails,
  checkEnrollment,
  getMyCertificates,
  getLearningStatistics,
  getStudentCategories,
} = require('../controllers/student.controller');
const { protect } = require('../middleware/auth.middleware');
const { studentOnly } = require('../middleware/role.middleware');

router.use(protect, studentOnly);

router.get('/dashboard', getStudentDashboard);
router.get('/my-courses', getMyCourses);
router.get('/my-courses/:courseId', getMyCourseDetails);
router.get('/check-enrollment/:courseId', checkEnrollment);
router.get('/certificates', getMyCertificates);
router.get('/statistics', getLearningStatistics);
router.get('/categories', protect, studentOnly, getStudentCategories);

module.exports = router;