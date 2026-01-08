import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Loader } from '../../components/common/Loader';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/student/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 mb-6 animate-scale-in">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Successful!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You have successfully enrolled in the course.
        </p>
        <Loader size="md" />
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;