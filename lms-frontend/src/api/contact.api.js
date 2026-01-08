import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL; 

export const submitContactMessage = async (formData) => {
  try {
    const res = await axios.post(`${API_URL}/contact`, formData);
    return res.data;
  } catch (error) {
    console.error('Contact API error:', error.response?.data || error);
    return { success: false, message: error.response?.data?.message || error.message };
  }
};

export const getContactMessages = async () => {
  try {
    const res = await axios.get(`${API_URL}/contact`);
    return res.data;
  } catch (error) {
    console.error('Fetch messages error:', error);
    return { success: false };
  }
};

export const updateMessageStatus = async (id, status) => {
  try {
    const res = await axios.patch(`${API_URL}/contact/${id}/status`, { status });
    return res.data;
  } catch (error) {
    console.error('Update status error:', error);
    return { success: false };
  }
};

export const deleteMessage = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/contact/${id}`);
    return res.data;
  } catch (error) {
    console.error('Delete message error:', error);
    return { success: false };
  }
};

export const archiveMessage = async (id) => {
  try {
    const res = await axios.patch(`${API_URL}/contact/${id}/archive`);
    return res.data;
  } catch (error) {
    console.error('Archive message error:', error);
    return { success: false };
  }
};