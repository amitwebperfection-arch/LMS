import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authAPI from '../api/auth.api';
import { STORAGE_KEYS, ROLES } from '../utils/constants';
import toast from 'react-hot-toast';
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          const response = await authAPI.getMe();
          if (response.success) {
            setUser(response.data.user);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error('Failed to load user:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        const { user, token } = response.data;
        
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
        
        if (user.role === ROLES.ADMIN) {
          navigate('/admin/dashboard');
        } else if (user.role === ROLES.INSTRUCTOR) {
          navigate('/instructor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user, token } = response.data;
        
        
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        
      
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Registration successful!');
        
        if (user.role === ROLES.ADMIN) {
          navigate('/admin/dashboard');
        } else if (user.role === ROLES.INSTRUCTOR) {
          navigate('/instructor/dashboard');
        } else {
          navigate('/student/dashboard');
        }
        
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success('Logged out successfully!');
      navigate('/login');
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};