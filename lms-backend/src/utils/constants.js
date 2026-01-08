const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
};

const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ALL_LEVELS: 'all_levels',
};

const UPLOAD_LIMITS = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,
  VIDEO_MAX_SIZE: 500 * 1024 * 1024, 
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime'],
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const CERTIFICATE_TEMPLATES = {
  DEFAULT: 'default',
  PREMIUM: 'premium',
  GOLD: 'gold',
  PLATINUM: 'platinum',
};

const LESSON_TYPES = {
  VIDEO: 'video',
  QUIZ: 'quiz',
  ASSIGNMENT: 'assignment',
  READING: 'reading',
};

const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

const COURSE_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  UNLISTED: 'unlisted',
};

const ENROLLMENT_SOURCES = {
  WEB: 'web',
  MOBILE: 'mobile',
  ADMIN: 'admin',
  FREE: 'free',
};

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