// API Base URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Stripe
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
};

// Course Status
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ALL_LEVELS: 'all_levels',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Review Status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Pagination
export const ITEMS_PER_PAGE = 10;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'lms_token',
  USER: 'lms_user',
  THEME: 'lms_theme',
};

// Navigation Items
export const ADMIN_NAV = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
  { name: 'Users', path: '/admin/users', icon: 'Users' },
  { name: 'Courses', path: '/admin/courses', icon: 'BookOpen' },
  { name: 'Categories', path: '/admin/categories', icon: 'FolderTree' },
  { name: 'Orders', path: '/admin/orders', icon: 'ShoppingCart' },
  { name: 'Resume', path: '/admin/resume', icon: 'FileText' },
  { name: 'Message', path: '/admin/messages', icon: 'Mail' },
  { name: 'Reviews', path: '/admin/reviews', icon: 'Star' },
  { name: 'Reports', path: '/admin/reports', icon: 'BarChart3' },
  { name: 'Settings', path: '/admin/settings', icon: 'Settings' },
  { name: 'About Us', path: '/admin/aboutus', icon: 'Info' },
];

export const INSTRUCTOR_NAV = [
  { name: 'Dashboard', path: '/instructor/dashboard', icon: 'LayoutDashboard' },
  { name: 'My Courses', path: '/instructor/courses', icon: 'BookOpen' },
  { name: 'Create Course', path: '/instructor/create-course', icon: 'Plus' },
  { name: 'Students', path: '/instructor/students', icon: 'Users' },
  { name: 'Contact Us', path: '/instructor/contact', icon: 'Mail' },
  { name: 'Certificates', path: '/instructor/certificates', icon: 'Award' },
  { name: 'Earnings', path: '/instructor/earnings', icon: 'DollarSign' },
  { name: 'Reviews', path: '/instructor/reviews', icon: 'Star' },
  { name: 'Profile', path: '/instructor/profile', icon: 'User' },
  { name: 'About Us', path: '/instructor/aboutus', icon: 'Info' },
];

export const STUDENT_NAV = [
  { name: 'Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
  { name: 'Course List', path: '/student/course-list', icon: 'BookOpen' },
  { name: 'My Courses', path: '/student/courses', icon: 'BookOpen' },
  { name: 'Orders', path: '/student/orders', icon: 'ShoppingCart' },
  { name: 'Resume', path: '/student/resume', icon: 'FileText' },
  { name: 'Contact Us', path: '/student/contact', icon: 'Mail' },
  { name: 'Certificates', path: '/student/certificates', icon: 'Award' },
  { name: 'Profile', path: '/student/profile', icon: 'User' },
  { name: 'About Us', path: '/student/aboutus', icon: 'Info' },
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully!',
  REGISTER: 'Registration successful!',
  COURSE_CREATED: 'Course created successfully!',
  COURSE_UPDATED: 'Course updated successfully!',
  COURSE_DELETED: 'Course deleted successfully!',
  ENROLLMENT_SUCCESS: 'Successfully enrolled in the course!',
  REVIEW_ADDED: 'Review added successfully!',
};

// Certificate Templates
export const CERTIFICATE_TEMPLATES = {
  DEFAULT: 'default',
  PREMIUM: 'premium',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

// Lesson Types
export const LESSON_TYPES = {
  VIDEO: 'video',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  READING: 'reading',
};

// Notification Priority
export const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Course Visibility
export const COURSE_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  UNLISTED: 'unlisted',
};

// Enrollment Sources
export const ENROLLMENT_SOURCES = {
  WEB: 'web',
  MOBILE: 'mobile',
  ADMIN: 'admin',
  FREE: 'free',
};

// Payment Gateways
export const PAYMENT_GATEWAYS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  RAZORPAY: 'razorpay',
  FREE: 'free',
};