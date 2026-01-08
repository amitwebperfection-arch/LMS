import axiosInstance from './axios';

export const getInstructorDashboard = async () => {
  const response = await axiosInstance.get('/instructor/dashboard');
  return response.data;
};

export const getInstructorCourses = async (params) => {
  const response = await axiosInstance.get('/instructor/courses', { params });
  return response.data;
};

export const getInstructorCourse = async (id) => {
  const response = await axiosInstance.get(`/instructor/courses/${id}`);
  return response.data;
};

export const createCourse = async (courseData) => {
  const token = localStorage.getItem('token');
  const response = await axiosInstance.post('/instructor/courses', courseData, {
    headers: { 
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`, 
    },
  });
  return response.data;
};

export const updateCourse = async (id, courseData) => {
  const response = await axiosInstance.put(`/instructor/courses/${id}`, courseData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteInstructorCourse = async (id) => {
  const response = await axiosInstance.delete(`/instructor/courses/${id}`);
  return response.data;
};

export const toggleCourseStatus = async (id) => {
  const response = await axiosInstance.put(`/instructor/courses/${id}/publish`);
  return response.data;
};

export const getInstructorEnrollments = async (params) => {
  const response = await axiosInstance.get('/instructor/enrollments', { params });
  return response.data;
};

export const getInstructorEarnings = async () => {
  const response = await axiosInstance.get('/instructor/earnings');
  return response.data;
};

export const getSections = async (courseId) => {
  const response = await axiosInstance.get('/instructor/sections', {
    params: { courseId },
  });
  return response.data;
};

export const createSection = async (data) => {
  const response = await axiosInstance.post('/instructor/sections', data); 
  return response.data;
};

export const updateSection = async (id, data) => {
  const response = await axiosInstance.put(`/instructor/sections/${id}`, data);
  return response.data;
};

export const deleteSection = async (id) => {
  const response = await axiosInstance.delete(`/instructor/sections/${id}`);
  return response.data;
};

export const createLesson = async (lessonData) => {
  const response = await axiosInstance.post('/instructor/lessons', lessonData, { 
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateLesson = async (id, lessonData) => {
  const response = await axiosInstance.put(`/instructor/lessons/${id}`, lessonData, { 
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteLesson = async (id) => {
  const response = await axiosInstance.delete(`/instructor/lessons/${id}`); 
  return response.data;
};

export const getInstructorCategories = async () => {
  try {
    const res = await axiosInstance.get('/categories');
    return res.data;
  } catch (error) {
    console.error(error.response?.data);
    throw error;
  }
};

export const getInstructorProfile = async () => {
  const res = await axiosInstance.get('/instructor/profile');
  return res.data;
};

export const updateInstructorProfile = async (formData) => {
  const res = await axiosInstance.put('/instructor/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};