import axiosInstance from './axios';

export const generateCertificate = async (courseId) => {
  try {
    const response = await axiosInstance.post(`/certificates/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Generate certificate API error:', error.response?.data || error);
    throw error;
  }
};


export const getCertificateByCourse = async (courseId) => {
  const response = await axiosInstance.get(`/certificates/${courseId}`);
  return response.data;
};

export const getUserCertificates = async () => {
  const response = await axiosInstance.get('/certificates');
  return response.data;
};

export const verifyCertificate = async (certificateId) => {
  const response = await axiosInstance.get(`/certificates/verify/${certificateId}`);
  return response.data;
};

export const getMyCertificates = async () => {
  try {
    const response = await axiosInstance.get('/certificates');
    return response.data;
  } catch (error) {
    console.error('Get certificates error:', error.response?.data || error);
    throw error;
  }
};

export const getInstructorCertificates = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/certificates/instructor/my-courses', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Get instructor certificates error:', error.response?.data || error);
    throw error;
  }
};

export const getInstructorCertificateStats = async () => {
  try {
    const response = await axiosInstance.get('/certificates/instructor/stats');
    return response.data;
  } catch (error) {
    console.error('Get instructor stats error:', error.response?.data || error);
    throw error;
  }
};

export const downloadStudentCertificate = async (certificateId) => {
  try {
    const response = await axiosInstance.get(
      `/certificates/instructor/download/${certificateId}`,
      {
        responseType: 'blob',
      }
    );
    return response;
  } catch (error) {
    console.error('Download error:', error.response?.data || error);
    throw error;
  }
};