const express = require('express');
const router = express.Router();
const { getCourses, getCourse } = require('../controllers/course.controller');

router.get('/', getCourses);
router.get('/:slug', getCourse);

module.exports = router;