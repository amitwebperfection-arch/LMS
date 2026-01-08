import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { getAllCourses, approveCourse, rejectCourse } from '../../api/admin.api';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, search, statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getAllCourses({
        page: currentPage,
        limit: 10,
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
            <img
              src={course.thumbnail?.url}
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              By {course.instructor?.name}
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={course.isApproved ? 'success' : 'warning'}>
                {course.isApproved ? 'Approved' : 'Pending'}
              </Badge>
              <span className={`badge ${getStatusColor(course.status)}`}>
                {course.status}
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {course.enrollmentCount} students
              </span>
              <span className="font-bold text-primary-600">
                {formatCurrency(course.price)}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCourse(course)}
                className="btn btn-secondary"
              >
                <Eye className="h-4 w-4" />
              </button>
              {!course.isApproved && (
                <>
                  <button
                    onClick={() => handleApproveCourse(course._id)}
                    className="btn bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRejectCourse(course._id)}
                    className="btn btn-danger"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* Course Details Modal */}
      <Modal
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        title="Course Details"
        size="lg"
      >
        {selectedCourse && (
          <div className="space-y-4">
            <img
              src={selectedCourse.thumbnail?.url}
              alt={selectedCourse.title}
              className="w-full h-64 object-cover rounded-lg"
            />
            <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{selectedCourse.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instructor</p>
                <p className="font-medium">{selectedCourse.instructor?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                <p className="font-medium">{formatCurrency(selectedCourse.price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                <p className="font-medium">{selectedCourse.enrollmentCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                <p className="font-medium">⭐ {selectedCourse.rating || 0}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Courses;