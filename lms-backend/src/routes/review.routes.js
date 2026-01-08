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

router.get('/course/:courseId', getCourseReviews);

router.use(protect);

router.post('/', addReview);
router.get('/my-review/:courseId', getMyReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

router.get('/instructor/courses', instructorOnly, getInstructorReviews);
router.post('/:id/reply', instructorOnly, replyToReview);

router.get('/admin/all', adminOnly, getAllReviews);
router.put('/:id/approve', adminOnly, approveReview);
router.put('/:id/reject', adminOnly, rejectReview);

module.exports = router;