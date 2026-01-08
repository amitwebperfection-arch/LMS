import { useState, useEffect } from 'react';
import { BookOpen, Users, DollarSign, TrendingUp } from 'lucide-react';
import { getInstructorDashboard } from '../../api/instructor.api';
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
      const response = await getInstructorDashboard();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Instructor Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your teaching performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.totalCourses || 0}
              </p>
            </div>
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.publishedCourses || 0}
              </p>
            </div>
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900">
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.totalStudents || 0}
              </p>
            </div>
            <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900">
              <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats?.totalEarnings || 0)}
              </p>
            </div>
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900">
              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Enrollments</h3>
        <div className="space-y-3">
          {stats?.recentEnrollments?.map((enrollment) => (
            <div
              key={enrollment._id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                    {enrollment.user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{enrollment.user?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{enrollment.course?.title}</p>
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(enrollment.enrolledAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;