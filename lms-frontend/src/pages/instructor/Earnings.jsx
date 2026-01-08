import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';
import { getInstructorEarnings } from '../../api/instructor.api';
import { Loader } from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';

const Earnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await getInstructorEarnings();
      if (response.success) {
        setEarnings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch earnings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Earnings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(earnings?.totalEarnings || 0)}
              </p>
            </div>
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900">
              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(earnings?.monthlyEarnings || 0)}
              </p>
            </div>
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900">
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {earnings?.totalSales || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;