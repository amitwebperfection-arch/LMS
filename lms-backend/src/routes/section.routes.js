const express = require('express');
const router = express.Router();
const {
  createSection,
  getSections,
  getSection,
  updateSection,
  reorderSections,
  deleteSection,
} = require('../controllers/section.controller');
const { protect } = require('../middleware/auth.middleware');
const { instructorOnly } = require('../middleware/role.middleware');

router.use(protect, instructorOnly);

router.post('/', createSection);
router.get('/', getSections);
router.get('/:id', getSection);
router.put('/:id', updateSection);
router.put('/reorder', reorderSections);
router.delete('/:id', deleteSection);

module.exports = router;