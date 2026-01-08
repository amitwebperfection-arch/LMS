import axiosInstance from './axios';

export const createOrder = async (orderData) => {
  const response = await axiosInstance.post('/orders', orderData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await axiosInstance.get('/orders/my-orders');
  return response.data;
};

