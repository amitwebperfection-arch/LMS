import axiosInstance from './axios';

export const getAdminDashboard = async () => {
  const response = await axiosInstance.get('/admin/dashboard');
  return response.data;
};

export const getUsers = async (params) => {
  const response = await axiosInstance.get('/admin/users', { params });
  return response.data;
};

export const getUser = async (id) => {
  const response = await axiosInstance.get(`/admin/users/${id}`);
  return response.data;
};

export const blockUser = async (id) => {
  const response = await axiosInstance.put(`/admin/users/${id}/block`);
  return response.data;
};

export const unblockUser = async (id) => {
  const response = await axiosInstance.put(`/admin/users/${id}/unblock`);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await axiosInstance.put(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const getAllCourses = async (params) => {
  const response = await axiosInstance.get('/admin/courses', { params });
  return response.data;
};

export const approveCourse = async (id) => {
  const response = await axiosInstance.put(`/admin/courses/${id}/approve`);
  return response.data;
};

export const rejectCourse = async (id) => {
  const response = await axiosInstance.put(`/admin/courses/${id}/reject`);
  return response.data;
};

export const deleteCourse = async (id) => {
  const response = await axiosInstance.delete(`/admin/courses/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await axiosInstance.get('/admin/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post('/admin/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await axiosInstance.put(`/admin/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`/admin/categories/${id}`);
  return response.data;
};

export const getSalesReport = async (params) => {
  const response = await axiosInstance.get('/admin/reports/sales', { params });
  return response.data;
};

export const getUserReport = async () => {
  const response = await axiosInstance.get('/admin/reports/users');
  return response.data;
};