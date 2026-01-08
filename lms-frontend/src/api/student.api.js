import axiosInstance from './axios';

export const getStudentCategories = async () => {
  try {
    const res = await axiosInstance.get('/student/categories'); 
    return res.data; 
  } catch (error) {
    console.error(error.response?.data || error);
    throw error;
  }
};


export const getStudentDashboard = async () => {
  const response = await axiosInstance.get('/student/dashboard');
  return response.data;
};

export const getMyCourses = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  const response = await axiosInstance.get(
    `/student/my-courses?${queryParams.toString()}`
  );
  return response.data;
};

export const getMyCourseDetails = async (courseId) => {
  const response = await axiosInstance.get(`/student/my-courses/${courseId}`);
  return response.data;
};

export const checkEnrollment = async (courseId) => {
  try {
    const response = await axiosInstance.get(`/student/check-enrollment/${courseId}`);
    return response.data;
  } catch (error) {
    return { success: true, data: { isEnrolled: false } };
  }
};

export const getCourseProgress = async (courseId) => {
  const response = await axiosInstance.get(`/progress/${courseId}`);
  return response.data;
};

export const updateLessonProgress = async (data) => {
  const response = await axiosInstance.post('/progress/complete-lesson', data);
  return response.data;
};


export const getStudentStats = async () => {
  const response = await axiosInstance.get('/student/statistics');
  return response.data;
};

export const getMyOrders = async () => {
  const response = await axiosInstance.get('/orders/my-orders');
  return response.data;
};

export default {
  getStudentDashboard,
  getMyCourses,
  getMyCourseDetails,
  checkEnrollment,
  getCourseProgress,
  updateLessonProgress,
  getStudentStats,
  getMyOrders,
  getStudentCategories
};