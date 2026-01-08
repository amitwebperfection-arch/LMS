import { useAuth } from './useAuth';

export const useRole = () => {
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isInstructor = user?.role === 'instructor';
  const isStudent = user?.role === 'student';

  const hasRole = (roles) => {
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.role) : user.role === roles;
  };

  return {
    role: user?.role,
    isAdmin,
    isInstructor,
    isStudent,
    hasRole,
  };
};