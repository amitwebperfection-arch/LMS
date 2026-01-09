import axiosInstance from './axios';


export const getCourses = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  if (params.category) queryParams.append('category', params.category);
  if (params.subCategory) queryParams.append('subCategory', params.subCategory);
  
  if (params.difficulty) queryParams.append('difficulty', params.difficulty);
  if (params.language) queryParams.append('language', params.language);
  
  if (params.search) queryParams.append('search', params.search);
  
  if (params.minPrice) queryParams.append('minPrice', params.minPrice);
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
  if (params.isFree !== undefined) queryParams.append('isFree', params.isFree);
  
  if (params.visibility) queryParams.append('visibility', params.visibility);
  
  if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured);
  
  if (params.sort) {
    queryParams.append('sort', params.sort);
  } else {
    queryParams.append('sort', '-createdAt'); 
  }

  const response = await axiosInstance.get(`/courses?${queryParams.toString()}`);
  return response.data;
};


export const getCourse = async (slug) => {
  const response = await axiosInstance.get(`/courses/${slug}`);
  return response.data;
};

export const searchCourses = async (searchTerm) => {
  return getCourses({ search: searchTerm });
};

export const getPublicCategories = async () => {
  try {
    const res = await axiosInstance.get('/categories');
    return res.data;
  } catch (error) {
    console.error(error.response?.data);
    throw error;
  }
};

export const getFeaturedCategories = async () => {
  const response = await axiosInstance.get('/categories?isFeatured=true');
  return response.data;
};

export const getSubCategories = async (parentId) => {
  const response = await axiosInstance.get(`/categories?parentCategory=${parentId}`);
  return response.data;
};

export const enrollInCourse = async (courseId) => {
  const response = await axiosInstance.post(`/courses/${courseId}/enroll`);
  return response.data;
};

export const getFreeCourses = async () => {
  return getCourses({ isFree: true });
};

export const getFeaturedCourses = async () => {
  return getCourses({ isFeatured: true, limit: 8 });
};

export const getCoursesByCategory = async (categoryId, additionalParams = {}) => {
  return getCourses({ category: categoryId, ...additionalParams });
};

export const getCoursesBySubCategory = async (subCategoryId, additionalParams = {}) => {
  return getCourses({ subCategory: subCategoryId, ...additionalParams });
};

export const getCoursesByInstructor = async (instructorId) => {
  const response = await axiosInstance.get(`/courses?instructor=${instructorId}`);
  return response.data;
};

export const getSimilarCourses = async (courseId) => {
  const response = await axiosInstance.get(`/courses/${courseId}/similar`);
  return response.data;
};

export const checkEnrollmentEligibility = async (courseId) => {
  const response = await axiosInstance.get(`/courses/${courseId}/can-enroll`);
  return response.data;
};

export const getCourseReviews = async (courseId, params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  
  const response = await axiosInstance.get(
    `/courses/${courseId}/reviews?${queryParams.toString()}`
  );
  return response.data;
};

export const applyCoupon = async (courseId, couponCode) => {
  const response = await axiosInstance.post(`/courses/${courseId}/apply-coupon`, {
    couponCode,
  });
  return response.data;
};

export const getAdminCourse = async (id) => {
  const { data } = await axiosInstance.get(`/admin/courses/${id}`);
  return data;
};

export const getInstructorCourseDetails = async (id) => {
  const { data } = await axiosInstance.get(`/instructor/courses/${id}/details`);
  return data;
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
  getAdminCourse,
  getInstructorCourseDetails,
};