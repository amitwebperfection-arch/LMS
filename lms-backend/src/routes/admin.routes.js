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
  getCourseById,
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');


router.use(protect, adminOnly);


router.get('/dashboard', getDashboardStats);


router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.put('/users/:id/role', updateUserRole);


router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseById);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);
router.delete('/courses/:id', deleteCourseAdmin);


router.post('/categories', createCategory);
router.get('/categories', getCategories);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);


router.get('/reports/sales', getSalesReport);
router.get('/reports/users', getUserReport);

module.exports = router;