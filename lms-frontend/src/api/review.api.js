import axiosInstance from './axios';

// Student Review Functions
export const addReview = async (reviewData) => {
  const response = await axiosInstance.post('/reviews', reviewData);
  return response.data;
};

export const getCourseReviews = async (courseId, params) => {
  const response = await axiosInstance.get(`/reviews/course/${courseId}`, { params });
  return response.data;
};

export const getMyReview = async (courseId) => {
  const response = await axiosInstance.get(`/reviews/my-review/${courseId}`);
  return response.data;
};

export const updateReview = async (id, reviewData) => {
  const response = await axiosInstance.put(`/reviews/${id}`, reviewData);
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await axiosInstance.delete(`/reviews/${id}`);
  return response.data;
};

// Instructor Review Functions
export const getInstructorReviews = async (params) => {
  const response = await axiosInstance.get('/reviews/instructor/courses', { params });
  return response.data;
};

export const replyToReview = async (reviewId, replyData) => {
  const response = await axiosInstance.post(`/reviews/${reviewId}/reply`, replyData);
  return response.data;
};

// Admin Review Functions
export const getAllReviews = async (params) => {
  const response = await axiosInstance.get('/reviews/admin/all', { params });
  return response.data;
};

export const approveReview = async (id) => {
  const response = await axiosInstance.put(`/reviews/${id}/approve`);
  return response.data;
};

export const rejectReview = async (id) => {
  const response = await axiosInstance.put(`/reviews/${id}/reject`);
  return response.data;
};