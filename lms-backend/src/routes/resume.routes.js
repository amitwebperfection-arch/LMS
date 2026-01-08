// routes/resume.routes.js
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

// Public/Student routes
router.post('/', protect, createResume);
router.get('/my-resumes', protect, getMyResumes);
router.get('/templates', protect, getPublicTemplates);
router.post('/use-template/:id', protect, useTemplate);
router.get('/:id', protect, getResumeById);
router.put('/:id', protect, updateResume);
router.delete('/:id', protect, deleteResume);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllResumesAdmin);
router.get('/admin/stats', protect, authorize('admin'), getResumeStats);

module.exports = router;