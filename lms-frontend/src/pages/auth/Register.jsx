import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';
import { ROLES } from '../../utils/constants';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.STUDENT,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    await register(registerData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-900 dark:to-dark-800 p-4">
      <div className="w-full max-w-md">
        <div className="card animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
              <GraduationCap className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Start your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                required
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                required
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                required
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label className="label">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: ROLES.STUDENT })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === ROLES.STUDENT
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-700 hover:border-primary-400'
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">Learn</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">As a student</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: ROLES.INSTRUCTOR })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === ROLES.INSTRUCTOR
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-dark-700 hover:border-primary-400'
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">Teach</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">As an instructor</p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader size="sm" />}
              Create Account
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-dark-700"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-dark-700"></div>
          </div>

          <p className="text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="link font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;