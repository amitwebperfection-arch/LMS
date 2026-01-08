import axiosInstance from './axios';

/**
 * Get all courses with advanced filters
 * @param {Object} params - Filter parameters
 * @returns {Promise} - Course data
 */
export const getCourses = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Pagination
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  // Category filters
  if (params.category) queryParams.append('category', params.category);
  if (params.subCategory) queryParams.append('subCategory', params.subCategory);
  
  // Difficulty & Language
  if (params.difficulty) queryParams.append('difficulty', params.difficulty);
  if (params.language) queryParams.append('language', params.language);
  
  // Search
  if (params.search) queryParams.append('search', params.search);
  
  // Price filters
  if (params.minPrice) queryParams.append('minPrice', params.minPrice);
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
  if (params.isFree !== undefined) queryParams.append('isFree', params.isFree);
  
  // Visibility (mainly for admin/instructor)
  if (params.visibility) queryParams.append('visibility', params.visibility);
  
  // Featured courses
  if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured);
  
  // Sorting
  if (params.sort) {
    queryParams.append('sort', params.sort);
  } else {
    queryParams.append('sort', '-createdAt'); // Default: newest first
  }

  const response = await axiosInstance.get(`/courses?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get single course by slug
 * @param {string} slug - Course slug
 * @returns {Promise} - Course data
 */
export const getCourse = async (slug) => {
  const response = await axiosInstance.get(`/courses/${slug}`);
  return response.data;
};

/**
 * Search courses (simplified - uses getCourses internally)
 * @param {string} searchTerm - Search query
 * @returns {Promise} - Course data
 */
export const searchCourses = async (searchTerm) => {
  return getCourses({ search: searchTerm });
};

/**
 * Get all public categories
 * @returns {Promise} - Categories data
 */
export const getPublicCategories = async () => {
  try {
    const res = await axiosInstance.get('/categories');
    return res.data;
  } catch (error) {
    console.error(error.response?.data);
    throw error;
  }
};
/**
 * Get featured categories
 * @returns {Promise} - Featured categories
 */
export const getFeaturedCategories = async () => {
  const response = await axiosInstance.get('/categories?isFeatured=true');
  return response.data;
};

/**
 * Get subcategories by parent category
 * @param {string} parentId - Parent category ID
 * @returns {Promise} - Subcategories
 */
export const getSubCategories = async (parentId) => {
  const response = await axiosInstance.get(`/categories?parentCategory=${parentId}`);
  return response.data;
};

/**
 * Enroll in a course
 * @param {string} courseId - Course ID
 * @returns {Promise} - Enrollment data
 */
export const enrollInCourse = async (courseId) => {
  const response = await axiosInstance.post(`/courses/${courseId}/enroll`);
  return response.data;
};

/**
 * Get free courses
 * @returns {Promise} - Free courses
 */
export const getFreeCourses = async () => {
  return getCourses({ isFree: true });
};

/**
 * Get featured courses
 * @returns {Promise} - Featured courses
 */
export const getFeaturedCourses = async () => {
  return getCourses({ isFeatured: true, limit: 8 });
};

/**
 * Get courses by category
 * @param {string} categoryId - Category ID
 * @param {Object} additionalParams - Additional filter params
 * @returns {Promise} - Courses in category
 */
export const getCoursesByCategory = async (categoryId, additionalParams = {}) => {
  return getCourses({ category: categoryId, ...additionalParams });
};

/**
 * Get courses by subcategory
 * @param {string} subCategoryId - Subcategory ID
 * @param {Object} additionalParams - Additional filter params
 * @returns {Promise} - Courses in subcategory
 */
export const getCoursesBySubCategory = async (subCategoryId, additionalParams = {}) => {
  return getCourses({ subCategory: subCategoryId, ...additionalParams });
};

/**
 * Get courses by instructor
 * @param {string} instructorId - Instructor ID
 * @returns {Promise} - Instructor's courses
 */
export const getCoursesByInstructor = async (instructorId) => {
  const response = await axiosInstance.get(`/courses?instructor=${instructorId}`);
  return response.data;
};

/**
 * Get similar courses
 * @param {string} courseId - Course ID to find similar courses for
 * @returns {Promise} - Similar courses
 */
export const getSimilarCourses = async (courseId) => {
  const response = await axiosInstance.get(`/courses/${courseId}/similar`);
  return response.data;
};

/**
 * Check if user can enroll in course
 * @param {string} courseId - Course ID
 * @returns {Promise} - Enrollment eligibility
 */
export const checkEnrollmentEligibility = async (courseId) => {
  const response = await axiosInstance.get(`/courses/${courseId}/can-enroll`);
  return response.data;
};

/**
 * Get course reviews
 * @param {string} courseId - Course ID
 * @param {Object} params - Pagination params
 * @returns {Promise} - Reviews data
 */
export const getCourseReviews = async (courseId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const response = await axiosInstance.get(
    `/courses/${courseId}/reviews?${queryParams.toString()}`
  );
  return response.data;
};

/**
 * Apply coupon to course
 * @param {string} courseId - Course ID
 * @param {string} couponCode - Coupon code
 * @returns {Promise} - Discount details
 */
export const applyCoupon = async (courseId, couponCode) => {
  const response = await axiosInstance.post(`/courses/${courseId}/apply-coupon`, {
    couponCode,
  });
  return response.data;
};

export default {
  getCourses,
  getCourse,
  searchCourses,
  getPublicCategories,
  getFeaturedCategories,
  getSubCategories,
  enrollInCourse,
  getFreeCourses,
  getFeaturedCourses,
  getCoursesByCategory,
  getCoursesBySubCategory,
  getCoursesByInstructor,
  getSimilarCourses,
  checkEnrollmentEligibility,
  getCourseReviews,
  applyCoupon,
};