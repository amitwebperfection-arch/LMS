import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth.api';
import { Loader } from '../../components/common/Loader';
import { ArrowLeft, GraduationCap, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setSent(true);
        toast.success('Password reset email sent!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-900 dark:to-dark-800 p-4">
      <div className="w-full max-w-md">
        <div className="card animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
              <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Forgot Password?</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {sent
                ? 'Check your email for reset instructions'
                : 'Enter your email to reset your password'}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading && <Loader size="sm" />}
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the email? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="link">
                  try again
                </button>
              </p>
            </div>
          )}

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 mt-6 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;