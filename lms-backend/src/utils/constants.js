// User Roles
const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
};

// Course Status
const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// Order Status
const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Course Difficulty
const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ALL_LEVELS: 'all_levels',
};

// File Upload Limits
const UPLOAD_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  VIDEO_MAX_SIZE: 500 * 1024 * 1024, // 500MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime'],
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Review Status
const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Certificate Templates
const CERTIFICATE_TEMPLATES = {
  DEFAULT: 'default',
  PREMIUM: 'premium',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

// Lesson Types
const LESSON_TYPES = {
  VIDEO: 'video',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  READING: 'reading',
};

// Notification Priority
const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Course Visibility
const COURSE_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  UNLISTED: 'unlisted',
};

// Enrollment Sources
const ENROLLMENT_SOURCES = {
  WEB: 'web',
  MOBILE: 'mobile',
  ADMIN: 'admin',
  FREE: 'free',
};

// Payment Gateways
const PAYMENT_GATEWAYS = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  RAZORPAY: 'razorpay',
  FREE: 'free',
};

module.exports = {
  ROLES,
  COURSE_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  DIFFICULTY_LEVELS,
  UPLOAD_LIMITS,
  PAGINATION,
  REVIEW_STATUS,
  CERTIFICATE_TEMPLATES,
  LESSON_TYPES,
  NOTIFICATION_PRIORITY,
  COURSE_VISIBILITY,
  ENROLLMENT_SOURCES,
  PAYMENT_GATEWAYS,
};