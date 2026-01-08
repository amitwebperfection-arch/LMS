import axiosInstance from './axios';

// Register
export const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  return response.data;
};

// Login
export const login = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

// Get current user
export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

// Logout
export const logout = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  const response = await axiosInstance.post('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
};


export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await axiosInstance.put('/auth/change-password', {
      currentPassword, 
      newPassword,     
    });
    return response.data;
  } catch (error) {
    console.error('Error in changing password:', error);
    throw error;
  }
};


export const updateProfile = async (formData) => {
  const response = await axiosInstance.put("/auth/update-profile", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const getDefaultAvatar = () => {
  return user?.avatar?.url || DefaultAvatar;
};
