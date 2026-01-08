const express = require('express');
const router = express.Router();
const { getPublicCategories } = require('../controllers/category.controller');


router.get('/', getPublicCategories);

module.exports = router;
