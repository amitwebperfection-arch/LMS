import axiosInstance from './axios';
export const getCourseProgress = async (courseId) => {
  const response = await axiosInstance.get(`/progress/${courseId}`);
  return response.data;
};

export const completeLesson = async (data) => {
  const response = await axiosInstance.post('/progress/complete-lesson', data);
  return response.data;
};

export const updateWatchTime = async (data) => {
  const response = await axiosInstance.put('/progress/watch-time', data);
  return response.data;
};

export const getMyProgress = async () => {
  try {
    const response = await axiosInstance.get('/progress/my-progress');
    return response.data;
  } catch (error) {
    console.error('Get my progress error:', error.response?.data || error);
    throw error;
  }
};
