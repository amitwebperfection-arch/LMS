const express = require('express');
const router = express.Router();
const { getCourses, getCourse } = require('../controllers/course.controller');

// Public routes
router.get('/', getCourses);
router.get('/:slug', getCourse);

module.exports = router;