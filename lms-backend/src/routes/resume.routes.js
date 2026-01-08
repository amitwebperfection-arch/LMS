const express = require('express');
const router = express.Router();
const {
  createResume,
  getMyResumes,
  getResumeById,
  getPublicTemplates,
  useTemplate,
  updateResume,
  deleteResume,
  getAllResumesAdmin,
  getResumeStats,
} = require('../controllers/resume.controller');
const { protect, authorize } = require('../middleware/auth.middleware');


router.get('/admin/stats', protect, authorize('admin'), getResumeStats);
router.get('/admin/all', protect, authorize('admin'), getAllResumesAdmin);


router.get('/templates', protect, getPublicTemplates);
router.get('/my-resumes', protect, getMyResumes);
router.post('/', protect, createResume);
router.post('/use-template/:id', protect, useTemplate);


router.route('/:id')
  .get(protect, getResumeById)
  .put(protect, updateResume)
  .delete(protect, deleteResume);

module.exports = router;