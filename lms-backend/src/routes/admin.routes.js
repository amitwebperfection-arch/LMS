const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  getUser,
  blockUser,
  unblockUser,
  updateUserRole,
  getAllCourses,
  approveCourse,
  rejectCourse,
  deleteCourseAdmin,
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getSalesReport,
  getUserReport,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

// All routes require auth and admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.put('/users/:id/role', updateUserRole);

// Course Management
router.get('/courses', getAllCourses);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);
router.delete('/courses/:id', deleteCourseAdmin);

// Category Management
router.post('/categories', createCategory);
router.get('/categories', getCategories);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Reports
router.get('/reports/sales', getSalesReport);
router.get('/reports/users', getUserReport);

module.exports = router;