const express = require('express');
const router = express.Router();
const {
  createEnrollment,
  getEnrollment,
  getCourseEnrollments,
  getUserEnrollments,
  verifyEnrollment,
  updateEnrollmentCompletion,
  deleteEnrollment,
} = require('../controllers/enrollment.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

router.use(protect);

router.post('/', adminOnly, createEnrollment);
router.get('/:id', getEnrollment);
router.get('/course/:courseId', getCourseEnrollments);
router.get('/user/:userId', getUserEnrollments);
router.get('/verify/:courseId', verifyEnrollment);
router.put('/:id/complete', updateEnrollmentCompletion);
router.delete('/:id', adminOnly, deleteEnrollment);

module.exports = router;