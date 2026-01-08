import { useState, useEffect } from 'react';
import { Users, BookOpen, DollarSign, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { getAdminDashboard } from '../../api/admin.api';
import { Loader } from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getAdminDashboard();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.users?.total || 0}
          icon={Users}
          trend={5}
          color="blue"
        />
        <StatsCard
          title="Total Courses"
          value={stats?.courses?.total || 0}
          icon={BookOpen}
          trend={3}
          color="green"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.revenue?.total || 0)}
          icon={DollarSign}
          trend={8}
          color="purple"
        />
        <StatsCard
          title="Enrollments"
          value={stats?.enrollments || 0}
          icon={ShoppingCart}
          trend={-2}
          color="orange"
        />
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Students</span>
              <span className="font-semibold">{stats?.users?.students || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Instructors</span>
              <span className="font-semibold">{stats?.users?.instructors || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Course Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Published</span>
              <span className="font-semibold">{stats?.courses?.published || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Pending Approval</span>
              <span className="font-semibold badge badge-warning">{stats?.courses?.pendingApproval || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Revenue</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">This Month</span>
              <span className="font-semibold text-green-600">{formatCurrency(stats?.revenue?.monthly || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total</span>
              <span className="font-semibold">{formatCurrency(stats?.revenue?.total || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {stats?.recentOrders?.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{order.user?.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{order.course?.title}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatCurrency(order.amount)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
          <div className="space-y-3">
            {stats?.recentUsers?.map((user) => (
              <div key={user._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                </div>
                <span className="badge badge-info text-xs">{user.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, trend, color }) => {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${colors[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;