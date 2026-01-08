import axiosInstance from './axios';

// Create new resume
export const createResume = async (data) => {
  const response = await axiosInstance.post('/resumes', data);
  return response.data;
};

// Get my resumes
export const getMyResumes = async () => {
  const response = await axiosInstance.get('/resumes/my-resumes');
  return response.data;
};

// Get single resume
export const getResumeById = async (id) => {
  const response = await axiosInstance.get(`/resumes/${id}`);
  return response.data;
};

// Get public templates
export const getPublicTemplates = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);
  
  const response = await axiosInstance.get(`/resumes/templates?${queryParams.toString()}`);
  return response.data;
};

// Use template (clone)
export const useTemplate = async (id, title) => {
  const response = await axiosInstance.post(`/resumes/use-template/${id}`, { title });
  return response.data;
};

// Update resume
export const updateResume = async (id, data) => {
  const response = await axiosInstance.put(`/resumes/${id}`, data);
  return response.data;
};

// Delete resume
export const deleteResume = async (id) => {
  const response = await axiosInstance.delete(`/resumes/${id}`);
  return response.data;
};

// Admin: Get all resumes
export const getAllResumesAdmin = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.category) queryParams.append('category', params.category);
  
  const response = await axiosInstance.get(`/resumes/admin/all?${queryParams.toString()}`);
  return response.data;
};

// Admin: Get resume stats
export const getResumeStats = async () => {
  const response = await axiosInstance.get('/resumes/admin/stats');
  return response.data;
};

export default {
  createResume,
  getMyResumes,
  getResumeById,
  getPublicTemplates,
  useTemplate,
  updateResume, 
  deleteResume,
  getAllResumesAdmin,
  getResumeStats,
};