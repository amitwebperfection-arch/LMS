const express = require('express');
const router = express.Router();
const {
  addReview,
  getCourseReviews,
  getMyReview,
  updateReview,
  deleteReview,
  getAllReviews,
  approveReview,
  rejectReview,
  getInstructorReviews,
  replyToReview,
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly, instructorOnly } = require('../middleware/role.middleware');

// Public routes
router.get('/course/:courseId', getCourseReviews);

// Protected routes
router.use(protect);

router.post('/', addReview);
router.get('/my-review/:courseId', getMyReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

// Instructor routes
router.get('/instructor/courses', instructorOnly, getInstructorReviews);
router.post('/:id/reply', instructorOnly, replyToReview);

// Admin routes
router.get('/admin/all', adminOnly, getAllReviews);
router.put('/:id/approve', adminOnly, approveReview);
router.put('/:id/reject', adminOnly, rejectReview);

module.exports = router;