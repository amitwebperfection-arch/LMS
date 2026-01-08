import { useState, useEffect } from 'react';
import { getMyOrders } from '../../api/payment.api';
import { Loader } from '../../components/common/Loader';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getMyOrders();
      

      if (response.success) {
        // ✅ data itself is array
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order History</h1>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
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
                <td>{order.course?.title}</td>
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