const User = require('../models/User.model');
const Course = require('../models/Course.model');
const Category = require('../models/Category.model');
const Order = require('../models/Order.model');
const Payment = require('../models/Payment.model');
const Enrollment = require('../models/Enrollment.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { generateSlug } = require('../utils/slugify');
const { PAGINATION, ROLES } = require('../utils/constants');
const { sendCourseApprovalEmail } = require('../services/email.service');



// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    
    const totalStudents = await User.countDocuments({ role: ROLES.STUDENT });
    const totalInstructors = await User.countDocuments({ role: ROLES.INSTRUCTOR });
    const totalUsers = await User.countDocuments();

    
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    const pendingApproval = await Course.countDocuments({ isApproved: false });

    
    const completedOrders = await Order.find({ status: 'completed' });
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);

   
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyOrders = completedOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.amount, 0);

    
    const totalEnrollments = await Enrollment.countDocuments();

    
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort('-createdAt')
      .limit(5);

    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort('-createdAt')
      .limit(5);

    successResponse(res, 200, 'Dashboard stats fetched successfully', {
      users: {
        total: totalUsers,
        students: totalStudents,
        instructors: totalInstructors,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        pendingApproval,
      },
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
      },
      enrollments: totalEnrollments,
      recentOrders,
      recentUsers,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      role,
      search,
      isBlocked,
    } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    paginatedResponse(res, 200, 'Users fetched successfully', users, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    let stats = {};
    if (user.role === ROLES.INSTRUCTOR) {
      const courses = await Course.countDocuments({ instructor: user._id });
      const enrollments = await Enrollment.countDocuments({
        course: { $in: await Course.find({ instructor: user._id }).select('_id') },
      });
      stats = { totalCourses: courses, totalStudents: enrollments };
    } else if (user.role === ROLES.STUDENT) {
      const enrollments = await Enrollment.countDocuments({ user: user._id });
      const completed = await Enrollment.countDocuments({ user: user._id, isCompleted: true });
      stats = { enrolledCourses: enrollments, completedCourses: completed };
    }

    successResponse(res, 200, 'User fetched successfully', { user, stats });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Block user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user.role === ROLES.ADMIN) {
      return errorResponse(res, 400, 'Cannot block admin users');
    }

    user.isBlocked = true;
    await user.save();

    successResponse(res, 200, 'User blocked successfully', { user });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Unblock user
// @route   PUT /api/admin/users/:id/unblock
// @access  Private/Admin
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    user.isBlocked = false;
    await user.save();

    successResponse(res, 200, 'User unblocked successfully', { user });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!Object.values(ROLES).includes(role)) {
      return errorResponse(res, 400, 'Invalid role');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    user.role = role;
    await user.save();

    successResponse(res, 200, 'User role updated successfully', { user });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all courses (admin)
// @route   GET /api/admin/courses
// @access  Private/Admin
const getAllCourses = async (req, res) => {
  try {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      status,
      isApproved,
      search,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .populate('category', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Course.countDocuments(query);

    paginatedResponse(res, 200, 'Courses fetched successfully', courses, {
      page: Number(page),
      limit: Number(limit),
      total,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Approve course
// @route   PUT /api/admin/courses/:id/approve
// @access  Private/Admin
const approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor');

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    course.isApproved = true;
    await course.save();

    try {
      await sendCourseApprovalEmail(course.instructor, course, true);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    successResponse(res, 200, 'Course approved successfully', { course });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Reject course
// @route   PUT /api/admin/courses/:id/reject
// @access  Private/Admin
const rejectCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor');

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    course.isApproved = false;
    course.status = 'draft';
    await course.save();

    try {
      await sendCourseApprovalEmail(course.instructor, course, false);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    successResponse(res, 200, 'Course rejected successfully', { course });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete course (admin)
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
const deleteCourseAdmin = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    await course.deleteOne();

    successResponse(res, 200, 'Course deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, description, order, isFeatured, isActive, parentCategory } = req.body;
    
    const category = await Category.create({
      name,
      description,
      order: order || 0,
      isFeatured: isFeatured || false,
      isActive: isActive !== false,
      parentCategory: parentCategory || null,
      slug: generateSlug(name),
    });
    
    successResponse(res, 201, 'Category created', { category });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1, name: 1 })
      .populate('parentCategory', 'name');
    
    successResponse(res, 200, 'Categories fetched', { categories });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }

    successResponse(res, 200, 'Category updated successfully', { category });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }

    const coursesCount = await Course.countDocuments({ category: category._id });
    if (coursesCount > 0) {
      return errorResponse(res, 400, 'Cannot delete category with existing courses');
    }

    await category.deleteOne();

    successResponse(res, 200, 'Category deleted successfully');
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get sales report
// @route   GET /api/admin/reports/sales
// @access  Private/Admin
const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { status: 'completed' };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('course', 'title');

    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const totalOrders = orders.length;

    successResponse(res, 200, 'Sales report fetched successfully', {
      totalRevenue,
      totalOrders,
      orders,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get user statistics report
// @route   GET /api/admin/reports/users
// @access  Private/Admin
const getUserReport = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: ROLES.STUDENT });
    const instructorCount = await User.countDocuments({ role: ROLES.INSTRUCTOR });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1),
      },
    });

    successResponse(res, 200, 'User report fetched successfully', {
      totalUsers,
      studentCount,
      instructorCount,
      blockedUsers,
      newUsersThisMonth,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// @desc    Get single course by ID (admin)
// @route   GET /api/admin/courses/:id
// @access  Admin
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio instructorProfile')
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate({
        path: 'sections',
        populate: {
          path: 'lessons',
          select: 'title duration order isPreview type',
        },
      });

    if (!course) {
      return errorResponse(res, 404, 'Course not found');
    }

    successResponse(res, 200, 'Course fetched successfully', { course });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

module.exports = {
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
};