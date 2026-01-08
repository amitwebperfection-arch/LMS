import axios from 'axios';
import { API_URL, STORAGE_KEYS } from '../utils/constants';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }

      if (status === 403) {
        toast.error(data.message || 'You do not have permission to perform this action.');
      }

      if (status === 404) {
        toast.error(data.message || 'Resource not found.');
      }

      if (status >= 500) {
        toast.error('Server error. Please try again later.');
      }

      return Promise.reject(error);
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    } else {
      toast.error('An error occurred. Please try again.');
      return Promise.reject(error);
    }
  }
);

export default axiosInstance;