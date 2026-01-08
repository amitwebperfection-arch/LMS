import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 dark:bg-red-900 mb-6">
          <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">403</h1>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link to="/" className="btn btn-primary inline-flex items-center gap-2">
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;