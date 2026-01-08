import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react'; // ⭐ BookOpen import
import { useNavigate } from 'react-router-dom';
import { getInstructorCourses, deleteInstructorCourse, toggleCourseStatus } from '../../api/instructor.api';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, course: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getInstructorCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInstructorCourse(deleteDialog.course._id);
      toast.success('Course deleted successfully');
      setDeleteDialog({ isOpen: false, course: null });
      fetchCourses();
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const handleToggleStatus = async (courseId) => {
    try {
      await toggleCourseStatus(courseId);
      toast.success('Course status updated');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your courses</p>
        </div>
        <button
          onClick={() => navigate('/instructor/create-course')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Course
        </button>
      </div>

      {/* ⭐ EMPTY STATE */}
      {courses.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first course to start teaching
          </p>
          <button
            onClick={() => navigate('/instructor/create-course')}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="card">
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={course.thumbnail?.url || 'https://via.placeholder.com/400x225'}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                
                {/* Status badges on image */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className={`badge ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                  {course.isApproved && (
                    <Badge variant="success">Approved</Badge>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {course.title}
              </h3>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  👥 {course.enrollmentCount || 0} students
                </span>
                <span className="font-bold text-primary-600">
                  {course.isFree ? 'FREE' : formatCurrency(course.price)}
                </span>
              </div>

              {/* ⭐ PRIMARY ACTION BUTTONS */}
              <div className="space-y-2">
                {/* Curriculum Button - Most Important */}
                <button
                  onClick={() => navigate(`/instructor/courses/${course._id}/curriculum`)}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Manage Curriculum
                </button>

                {/* Secondary Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                    className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                    title="Edit Course"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  
                  <button
                    onClick={() => handleToggleStatus(course._id)}
                    className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                    title={course.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    {course.status === 'published' ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        <span className="hidden sm:inline">Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">Publish</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, course })}
                    className="btn btn-danger"
                    title="Delete Course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ⭐ Additional Course Info */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>
                    {course.sections?.length || 0} sections • {course.lessons?.length || 0} lessons
                  </span>
                  <span>
                    {course.totalDuration ? `${Math.floor(course.totalDuration / 60)}min` : '0min'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, course: null })}
        onConfirm={handleDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${deleteDialog.course?.title}"? This action cannot be undone.`}
        type="danger"
      />
    </div>
  );
};

export default MyCourses;