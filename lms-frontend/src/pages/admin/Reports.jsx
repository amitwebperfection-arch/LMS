import { useEffect, useState } from 'react';
import { Users, DollarSign, ShoppingCart } from 'lucide-react';
import { getSalesReport, getUserReport } from '../../api/admin.api';
import { Loader } from '../../components/common/Loader';
import { formatCurrency } from '../../utils/helpers';

const Reports = () => {
  const [userReport, setUserReport] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [usersRes, salesRes] = await Promise.all([
        getUserReport(),
        getSalesReport(),
      ]);

      if (usersRes?.success) {
        setUserReport(usersRes.data);
      }

      if (salesRes?.success) {
        setSalesReport(salesRes.data);
      }
    } catch (error) {
      console.error('REPORT FETCH ERROR 👉', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Platform analytics and performance overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Users"
          value={userReport?.totalUsers || 0}
          icon={Users}
          color="blue"
        />
        <ReportCard
          title="Total Orders"
          value={salesReport?.totalOrders || 0}
          icon={ShoppingCart}
          color="green"
        />
        <ReportCard
          title="Total Revenue"
          value={formatCurrency(salesReport?.totalRevenue || 0)}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* User Report */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">User Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatRow label="Students" value={userReport?.studentCount || 0} />
          <StatRow label="Instructors" value={userReport?.instructorCount || 0} />
          <StatRow label="Blocked Users" value={userReport?.blockedUsers || 0} />
          <StatRow label="New Users This Month" value={userReport?.newUsersThisMonth || 0} />
        </div>
      </div>

      {/* Sales Orders Table */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Course</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {salesReport?.orders?.length > 0 ? (
                salesReport.orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.user?.name}</td>
                    <td>{order.course?.title}</td>
                    <td className="font-semibold">
                      {formatCurrency(order.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* -------------------- Small Components -------------------- */

const ReportCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-full ${colors[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value }) => (
  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default Reports;
