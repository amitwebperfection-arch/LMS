import { useState, useEffect } from 'react';
import { getMyCourses } from '../../api/student.api';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Clock, Award, PlayCircle, CheckCircle, 
  Calendar, TrendingUp 
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, [filter]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await getMyCourses(params);
      
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (enrollment) => {
    if (enrollment.isCompleted) {
      return (
        <span className="badge badge-success flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Completed
        </span>
      );
    }
    if (enrollment.progress > 0) {
      return (
        <span className="badge badge-warning flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          In Progress
        </span>
      );
    }
    return (
      <span className="badge badge-info flex items-center gap-1">
        <PlayCircle className="h-3 w-3" />
        Not Started
      </span>
    );
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Continue learning from where you left off
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold">
                {courses.filter(e => e.progress > 0 && !e.isCompleted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold">
                {courses.filter(e => e.isCompleted).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificates</p>
              <p className="text-2xl font-bold">
                {courses.filter(e => e.certificateIssued).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Courses ({courses.length})
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`btn ${filter === 'in-progress' ? 'btn-primary' : 'btn-secondary'}`}
        >
          In Progress ({courses.filter(e => e.progress > 0 && !e.isCompleted).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Completed ({courses.filter(e => e.isCompleted).length})
        </button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description={
            filter === 'all' 
              ? "You haven't enrolled in any courses yet. Browse our course catalog to get started!"
              : `You don't have any ${filter} courses yet.`
          }
          action={
            <button
              className="btn btn-primary"
              onClick={() => navigate('/courses')}
            >
              Browse Courses
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((enrollment) => {
            const course = enrollment.course;
            
            if (!course) return null;

            return (
              <div
                key={enrollment._id}
                className="card card-hover cursor-pointer group"
                onClick={() => navigate(`/student/course/${course._id}`)}
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={course.thumbnail?.url || 'https://via.placeholder.com/400x225'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(enrollment)}
                  </div>
                </div>

                {/* Course Info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {course.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    by {course.instructor?.name || 'Unknown'}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-semibold">{enrollment.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getProgressColor(enrollment.progress || 0)}`}
                        style={{ width: `${enrollment.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Enrolled {formatDate(enrollment.enrolledAt)}</span>
                    </div>
                    
                    {enrollment.lastAccessedAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last: {formatDate(enrollment.lastAccessedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Certificate Badge */}
                  {enrollment.certificateIssued && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium">
                      <Award className="h-4 w-4" />
                      <span>Certificate Earned</span>
                    </div>
                  )}

                  {/* Access Expiry Warning */}
                  {enrollment.accessExpiresAt && new Date(enrollment.accessExpiresAt) > new Date() && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Access expires: {formatDate(enrollment.accessExpiresAt)}
                    </div>
                  )}
                </div>

                {/* Continue Button */}
                <button
                  className="btn btn-primary w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/student/course/${course._id}`);
                  }}
                >
                  {enrollment.isCompleted ? 'Review Course' : 
                   enrollment.progress > 0 ? 'Continue Learning' : 'Start Course'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;