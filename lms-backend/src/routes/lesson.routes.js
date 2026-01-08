const express = require('express');
const router = express.Router();
const {
  createLesson,
  getLessons,
  getLesson,
  updateLesson,
  reorderLessons,
  deleteLesson,
  togglePreview,
} = require('../controllers/lesson.controller');
const { protect } = require('../middleware/auth.middleware');
const { instructorOnly } = require('../middleware/role.middleware');
const { uploadLessonFiles  } = require('../middleware/upload.middleware');


router.use(protect, instructorOnly);
router.post('/', uploadLessonFiles, createLesson);
router.get('/', getLessons);
router.get('/:id', getLesson);
router.put('/:id', uploadLessonFiles, updateLesson);
router.put('/reorder', reorderLessons);
router.delete('/:id', deleteLesson);
router.put('/:id/preview', togglePreview);

module.exports = router;