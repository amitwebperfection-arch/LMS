const express = require('express');
const router = express.Router();
const {
  getCourseProgress,
  completeLesson,
  updateWatchTime,
  resetProgress,
  getLessonProgress,
  getAllUserProgress,
  getMyProgress,
} = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/user/all', getAllUserProgress);
router.get('/:courseId', getCourseProgress);
router.post('/complete-lesson', completeLesson);
router.put('/watch-time', updateWatchTime);
router.delete('/:courseId/reset', resetProgress);
router.get('/:courseId/lesson/:lessonId', getLessonProgress);
router.get('/my-progress', getMyProgress);

module.exports = router;