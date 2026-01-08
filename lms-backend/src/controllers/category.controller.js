const Category = require('../models/Category.model');

// GET /api/categories
const getPublicCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('_id name slug parentCategory')
      .sort('name');

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = { getPublicCategories };
