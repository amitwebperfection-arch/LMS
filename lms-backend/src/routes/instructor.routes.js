const express = require('express');
const router = express.Router();
const {
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
  getCourseInstructorById,
} = require('../controllers/instructor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { 
  uploadCourseFiles, 
  handleUploadError 
} = require('../middleware/upload.middleware');

router.use(protect);
router.use(authorize('instructor'));

router.get('/dashboard', getInstructorDashboard);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.route('/courses')
  .get(getInstructorCourses)
  .post(uploadCourseFiles, handleUploadError, createCourse);

router.route('/courses/:id')
  .get(getInstructorCourse)
  .put(uploadCourseFiles, handleUploadError, updateCourse)
  .delete(deleteCourse);
router.get('/courses/:id/details', getCourseInstructorById);
router.put('/courses/:id/publish', toggleCourseStatus);

router.get('/enrollments', getInstructorEnrollments);

router.get('/earnings', getInstructorEarnings);

module.exports = router;