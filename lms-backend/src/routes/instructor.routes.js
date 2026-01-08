// const express = require('express');
// const router = express.Router();
// const {
//   createCourse,
//   getInstructorCourses,
//   getInstructorCourse,
//   updateCourse,
//   deleteCourse,
//   toggleCourseStatus,
//   getInstructorEnrollments,
//   getInstructorEarnings,
//   getInstructorDashboard,
//   getProfile,
//   updateProfile,
//   uploadCourseFiles, 
//   handleUploadError, 
// } = require('../controllers/instructor.controller');
// const { protect } = require('../middleware/auth.middleware');
// const { instructorOnly } = require('../middleware/role.middleware');
// const { uploadImage } = require('../middleware/upload.middleware');
// const Category = require('../models/Category.model');

// // All routes require auth and instructor role
// router.use(protect, instructorOnly);


// // Dashboard & Stats
// router.get('/dashboard', getInstructorDashboard);
// router.get('/enrollments', getInstructorEnrollments);
// router.get('/earnings', getInstructorEarnings);
// router.get('/profile', protect, getProfile);       
// router.put('/profile', protect, updateProfile);

// // categories management
// router.get('/categories', async (req, res) => {
//   try {
//     const categories = await Category.find();
//     res.status(200).json({ success: true, data: categories });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// // Course Management
// // router.post('/courses', uploadImage, createCourse);
// router.post('/courses', uploadCourseFiles, handleUploadError, createCourse);
// router.get('/courses', getInstructorCourses);
// router.get('/courses/:id', getInstructorCourse);
// router.put('/courses/:id', uploadImage, updateCourse);
// router.delete('/courses/:id', deleteCourse);
// router.put('/courses/:id/publish', toggleCourseStatus);

// module.exports = router;


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
} = require('../controllers/instructor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { 
  uploadCourseFiles, 
  handleUploadError 
} = require('../middleware/upload.middleware');

// Protect all routes
router.use(protect);
router.use(authorize('instructor'));

// Dashboard
router.get('/dashboard', getInstructorDashboard);

// Profile routes
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// Course routes
router.route('/courses')
  .get(getInstructorCourses)
  .post(uploadCourseFiles, handleUploadError, createCourse);

router.route('/courses/:id')
  .get(getInstructorCourse)
  .put(uploadCourseFiles, handleUploadError, updateCourse)
  .delete(deleteCourse);

router.put('/courses/:id/publish', toggleCourseStatus);

// Enrollments
router.get('/enrollments', getInstructorEnrollments);

// Earnings
router.get('/earnings', getInstructorEarnings);

module.exports = router;