import { useState, useEffect } from 'react';
import { BookOpen, Award, TrendingUp, Clock } from 'lucide-react';
import { getStudentDashboard } from '../../api/student.api';
import { Loader } from '../../components/common/Loader';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getStudentDashboard();
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back! 👋</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Continue your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.stats?.totalEnrolled || 0}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.stats?.completedCourses || 0}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.stats?.inProgressCourses || 0}
              </p>
            </div>
            <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats?.stats?.totalCertificates || 0}
              </p>
            </div>
            <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900">
              <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Continue Watching */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Continue Watching</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.continueWatching?.map((progress) => (
            <div
              key={progress._id}
              className="flex gap-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
              onClick={() => navigate(`/student/course/${progress.course?._id}`)}
            >
              <img
                src={progress.course?.thumbnail?.url}
                alt={progress.course?.title}
                className="w-32 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium mb-2">{progress.course?.title}</h4>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress.progressPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {progress.progressPercentage}% Complete
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recently Enrolled</h3>
        <div className="space-y-3">
          {stats?.recentEnrollments?.map((enrollment) => (
            <div
              key={enrollment._id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <img
                  src={enrollment.course?.thumbnail?.url}
                  alt={enrollment.course?.title}
                  className="w-16 h-12 object-cover rounded-lg"
                />
                <div>
                  <p className="font-medium">{enrollment.course?.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(enrollment.enrolledAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/student/course/${enrollment.course?._id}`)}
                className="btn btn-primary text-sm"
              >
                Start Learning
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;