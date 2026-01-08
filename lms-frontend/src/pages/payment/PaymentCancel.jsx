import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900 mb-6">
          <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Your payment was cancelled. No charges were made.
        </p>
        <button
          onClick={() => navigate('/courses')}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Courses
        </button>
      </div>
    </div>
  );
};

export default PaymentCancel;