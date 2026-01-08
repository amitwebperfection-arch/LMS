import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { getSalesReport } from '../../api/admin.api';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getSalesReport();
      if (response.success) {
        setOrders(response.data.orders);
        setStats({
          totalRevenue: response.data.totalRevenue,
          totalOrders: response.data.totalOrders,
        });
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders & Sales</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View all orders and sales data</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats.totalRevenue)}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalOrders}
              </p>
            </div>
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900">
              <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats.totalRevenue / stats.totalOrders || 0)}
              </p>
            </div>
            <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900">
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Course</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="font-mono text-sm">#{order._id.slice(-8)}</td>
                <td>{order.user?.name}</td>
                <td className="max-w-xs truncate">{order.course?.title}</td>
                <td className="font-semibold">{formatCurrency(order.amount)}</td>
                <td>
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;