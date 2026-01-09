import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Eye, Star, Clock, Users, Globe } from 'lucide-react';
import { getAllCourses, approveCourse, rejectCourse } from '../../api/admin.api';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate, getStatusColor, getDifficultyColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [limit, setLimit] = useState(getLimitByScreen());


  useEffect(() => {
    fetchCourses();
  }, [currentPage, search, statusFilter, limit]);

  useEffect(() => {
    const handleResize = () => {
      const newLimit = getLimitByScreen();
      setLimit(prev => {
        if (prev !== newLimit) {
          setCurrentPage(1); // reset page
          return newLimit;
        }
        return prev;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getAllCourses({
        page: currentPage,
        limit,
        search,
        status: statusFilter,
      });
      if (response.success) {
        setCourses(response.data || []); 
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  function getLimitByScreen() {
    const width = window.innerWidth;

    if (width >= 1536) return 12;
    if (width >= 1280) return 9;
    if (width >= 1024) return 6;
    if (width >= 768) return 4;
    return 2;
  }

  const handleApproveCourse = async (courseId) => {
    try {
      await approveCourse(courseId);
      toast.success('Course approved successfully');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to approve course');
    }
  };

  const handleRejectCourse = async (courseId) => {
    try {
      await rejectCourse(courseId);
      toast.success('Course rejected');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to reject course');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0h 0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleViewDetails = (courseId) => {
    navigate(`/admin/courses/${courseId}`);
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and approve courses</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input sm:w-48"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="card">
            {/* Thumbnail with Badges */}
            <div className="relative mb-4">
              <img
                src={course.thumbnail?.url}
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {course.isFeatured && (
                  <span className="badge bg-yellow-400 text-gray-900 text-xs">
                    ⭐ Featured
                  </span>
                )}
                {course.isFree && (
                  <span className="badge bg-green-500 text-white text-xs">
                    Free
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              By {course.instructor?.name}
            </p>
            
            {/* Status Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant={course.isApproved ? 'success' : 'warning'}>
                {course.isApproved ? 'Approved' : 'Pending'}
              </Badge>
              <span className={`badge ${getStatusColor(course.status)}`}>
                {course.status}
              </span>
              <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty}
              </span>
            </div>

            {/* Course Stats */}
            <div className="space-y-2 mb-3 text-sm">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollmentCount || 0} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{course.rating?.toFixed(1) || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.totalDuration)}</span>
                </div>
                {course.language && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>{course.language}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-primary-600">
                {course.isFree ? (
                  'Free'
                ) : course.discountPrice ? (
                  <div className="flex items-center gap-2">
                    <span>{formatCurrency(course.discountPrice)}</span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(course.price)}
                    </span>
                  </div>
                ) : (
                  formatCurrency(course.price)
                )}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleViewDetails(course._id)}
                className="btn btn-secondary flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                <span>View Details</span>
              </button>

              {!course.isApproved && (
                <>
                  <button
                    onClick={() => handleApproveCourse(course._id)}
                    className="btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                    title="Approve"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleRejectCourse(course._id)}
                    className="btn btn-danger flex items-center justify-center"
                    title="Reject"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No courses found</p>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};

export default Courses;