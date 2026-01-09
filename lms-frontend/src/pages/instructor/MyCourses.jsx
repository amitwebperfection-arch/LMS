import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen, Search, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getInstructorCourses, deleteInstructorCourse, toggleCourseStatus, getInstructorCategories } from '../../api/instructor.api';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, course: null });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9; // 3x3 grid
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subCategory: '',
    status: '',
    isApproved: '',
    isFree: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [courses, filters]);

  // Update pagination when filtered courses change
  useEffect(() => {
    const pages = Math.ceil(filteredCourses.length / itemsPerPage);
    setTotalPages(pages || 1);
    // Reset to page 1 if current page exceeds total pages
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1);
    }
  }, [filteredCourses, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    if (filters.category) {
      const subs = categories.filter(
        cat => cat.parentCategory === filters.category || cat.parentCategory?._id === filters.category
      );
      setSubCategories(subs);
    } else {
      setSubCategories([]);
    }
  }, [filters.category, categories]);

  const fetchCategories = async () => {
    try {
      const response = await getInstructorCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

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

  const applyFilters = () => {
    let filtered = [...courses];

    // Search filter - improved to handle null/undefined values
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      filtered = filtered.filter(course => {
        const titleMatch = course.title?.toLowerCase().includes(searchLower);
        const descMatch = course.description?.toLowerCase().includes(searchLower);
        const tagsMatch = course.tags?.some(tag => 
          tag?.toLowerCase().includes(searchLower)
        );
        return titleMatch || descMatch || tagsMatch;
      });
    }

// Category filter (SAFE)
if (filters.category) {
  filtered = filtered.filter(course => {
    if (!course.category) return false;

    const courseCategory =
      typeof course.category === 'object'
        ? course.category._id
        : course.category;

    return courseCategory === filters.category;
  });
}


// Sub Category filter (SAFE)
if (filters.subCategory) {
  filtered = filtered.filter(course => {
    if (!course.subCategory) return false;

    const courseSubCategory =
      typeof course.subCategory === 'object'
        ? course.subCategory._id
        : course.subCategory;

    return courseSubCategory === filters.subCategory;
  });
}

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(course => course.status === filters.status);
    }

    // Approval filter
    if (filters.isApproved !== '') {
      filtered = filtered.filter(course => course.isApproved === (filters.isApproved === 'true'));
    }

    // Free/Paid filter
    if (filters.isFree !== '') {
      filtered = filtered.filter(course => course.isFree === (filters.isFree === 'true'));
    }

    setFilteredCourses(filtered);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      subCategory: '',
      status: '',
      isApproved: '',
      isFree: '',
    });
    setCurrentPage(1);
  };

  const handleViewDetails = (courseId) => {
    navigate(`/instructor/course/${courseId}`);
  };

const handleDelete = async () => {
  try {
    await deleteInstructorCourse(deleteDialog.course._id);
    toast.success('Course deleted successfully');
    setDeleteDialog({ isOpen: false, course: null });
    fetchCourses();
  } catch (error) {
    toast.error(
      error.response?.data?.message || 'Failed to delete course'
    );
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get paginated courses
  const getPaginatedCourses = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCourses.slice(startIndex, endIndex);
  };

  const paginatedCourses = getPaginatedCourses();
  const parentCategories = categories.filter(cat => !cat.parentCategory);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredCourses.length} of {courses.length} courses
          </p>
        </div>
        <button
          onClick={() => navigate('/instructor/create-course')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Course
        </button>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title, description, or tags..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Filter className="h-5 w-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={filters.category}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category: e.target.value,
                    subCategory: '',
                  })
                }
              >
                <option value="">All Categories</option>
                {parentCategories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category */}
            <div>
              <label className="label">Sub Category</label>
              <select
                className="input"
                value={filters.subCategory}
                onChange={(e) =>
                  setFilters({ ...filters, subCategory: e.target.value })
                }
                disabled={!filters.category || subCategories.length === 0}
              >
                <option value="">All Sub Categories</option>
                {subCategories.map(sub => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Approval Status */}
            <div>
              <label className="label">Approval Status</label>
              <select
                className="input"
                value={filters.isApproved}
                onChange={(e) => setFilters({ ...filters, isApproved: e.target.value })}
              >
                <option value="">All</option>
                <option value="true">Approved</option>
                <option value="false">Pending</option>
              </select>
            </div>

            {/* Free/Paid */}
            <div>
              <label className="label">Price Type</label>
              <select
                className="input"
                value={filters.isFree}
                onChange={(e) => setFilters({ ...filters, isFree: e.target.value })}
              >
                <option value="">All Courses</option>
                <option value="true">Free Only</option>
                <option value="false">Paid Only</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          {courses.length === 0 ? (
            <>
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
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try adjusting your filters to find courses
              </p>
              <button
                onClick={clearFilters}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((course) => (
              <div key={course._id} className="card">
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={course.thumbnail?.url || 'https://via.placeholder.com/400x225'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  
                  {/* Status badges on image */}
                  <div className="absolute top-2 right-2 flex gap-2 flex-wrap">
                    <span className={`badge ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                    {course.isApproved && (
                      <Badge variant="success">Approved</Badge>
                    )}
                    {course.isFree && (
                      <Badge variant="info">Free</Badge>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {course.title}
                </h3>

                {/* Category & Sub Category */}
                {(course.category || course.subCategory) && (
                  <div className="flex flex-wrap gap-1 mb-2 text-xs">
                    {course.category && (
                      <span className="badge badge-secondary">
                        {typeof course.category === 'object' ? course.category.name : course.category}
                      </span>
                    )}
                    {course.subCategory && (
                      <span className="badge badge-secondary">
                        {typeof course.subCategory === 'object' ? course.subCategory.name : course.subCategory}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    👥 {course.enrollmentCount || 0} students
                  </span>
                  <span className="font-bold text-primary-600">
                    {course.isFree ? 'FREE' : formatCurrency(course.price)}
                  </span>
                </div>

                {/* Primary Action Buttons */}
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
                      disabled={course.enrollmentCount > 0}
                      onClick={() => setDeleteDialog({ isOpen: true, course })}
                      className={`btn btn-danger ${
                        course.enrollmentCount > 0
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      title={
                        course.enrollmentCount > 0
                          ? 'Cannot delete course with enrolled students'
                          : 'Delete Course'
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleViewDetails(course._id)}
                      className="btn btn-secondary flex items-center justify-center flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>

                    {!course.isApproved && (
                      <>
                        <button
                          onClick={() => handleApproveCourse(course._id)}
                          className="btn bg-green-600 hover:bg-green-700 text-white w-12 flex items-center justify-center"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleRejectCourse(course._id)}
                          className="btn btn-danger w-12 flex items-center justify-center"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>


                {/* Additional Course Info */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>
                      {course.sections?.length || 0} sections • {course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0} lessons
                    </span>
                    <span>
                      {course.totalDuration ? `${Math.floor(course.totalDuration / 60)}min` : '0min'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </>
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