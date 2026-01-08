import { useState, useEffect } from 'react';
import { getCourses } from '../../api/course.api';
import { getPublicCategories } from '../../api/course.api';
import { Link } from 'react-router-dom';
import { Loader } from '../../components/common/Loader';
import { Search, Filter, Star, Clock, DollarSign, Globe } from 'lucide-react';
import { formatCurrency, getDifficultyColor } from '../../utils/helpers';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    subCategory: '',
    difficulty: '',
    language: '',
    minPrice: '',
    maxPrice: '',
    isFree: '',
    visibility: 'public',
    isFeatured: '',
    sort: '-createdAt',
  });
  const [showFilters, setShowFilters] = useState(false);

  
  const parentCategories = categories.filter(cat => !cat.parentCategory);
  useEffect(() => {
    if (!filters.category) {
      setSubCategories([]);
      return;
    }

    const subs = categories.filter(
      cat => cat.parentCategory === filters.category
    );

    setSubCategories(subs);
  }, [filters.category, categories]);


  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filters]);

useEffect(() => {
  if (!filters.category) {
    setSubCategories([]);
    return;
  }

  const subs = categories.filter(cat =>
    cat.parentCategory === filters.category ||
    cat.parentCategory?._id === filters.category
  );

  setSubCategories(subs);
}, [filters.category, categories]);


  const fetchCategories = async () => {
    try {
      const response = await getPublicCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getCourses(filters);
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      subCategory: '',
      difficulty: '',
      language: '',
      minPrice: '',
      maxPrice: '',
      isFree: '',
      visibility: 'public',
      isFeatured: '',
      sort: '-createdAt',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Header />

      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Explore Courses</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {courses.length} courses available
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center gap-2 md:hidden"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Search Bar - Always Visible */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title, description, or tags..."
              className="input pl-10"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>

        {/* Advanced Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block mb-6`}>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              {/* Difficulty */}
              <div>
                <label className="label">Difficulty</label>
                <select
                  className="input"
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all_levels">All Levels</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="label">Language</label>
                <select
                  className="input"
                  value={filters.language}
                  onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                >
                  <option value="">All Languages</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              {/* Price Type */}
              <div>
                <label className="label">Price</label>
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

              {/* Min Price */}
              <div>
                <label className="label">Min Price ($)</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  disabled={filters.isFree === 'true'}
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="label">Max Price ($)</label>
                <input
                  type="number"
                  min="0"
                  className="input"
                  placeholder="1000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  disabled={filters.isFree === 'true'}
                />
              </div>

              {/* Sort */}
              <div>
                <label className="label">Sort By</label>
                <select
                  className="input"
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-rating">Highest Rated</option>
                  <option value="-enrollmentCount">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Featured Only */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={filters.isFeatured === 'true'}
                onChange={(e) => setFilters({ ...filters, isFeatured: e.target.checked ? 'true' : '' })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isFeatured" className="label mb-0">
                Show featured courses only
              </label>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <Loader />
        ) : courses.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No courses found matching your criteria
            </p>
            <button
              onClick={clearFilters}
              className="btn btn-primary mt-4"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Link
                key={course._id}
                to={`/courses/${course.slug}`}
                className="card card-hover group"
              >
                <div className="relative">
                  <img
                    src={course.thumbnail?.url}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  {course.isFeatured && (
                    <span className="absolute top-2 right-2 badge badge-warning">
                      Featured
                    </span>
                  )}
                  {course.isFree && (
                    <span className="absolute top-2 left-2 badge badge-success">
                      Free
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary-600 transition">
                  {course.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {course.instructor?.name}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{course.rating?.toFixed(1) || 0}</span>
                    <span className="text-xs text-gray-500">({course.reviewCount || 0})</span>
                  </div>
                  <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                  {course.language && (
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <Globe className="h-3 w-3" />
                      {course.language}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                  <Clock className="h-4 w-4" />
                  <span>{Math.floor((course.totalDuration || 0) / 3600)}h {Math.floor(((course.totalDuration || 0) % 3600) / 60)}m</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-dark-700">
                  <div>
                    {course.isFree ? (
                      <span className="text-lg font-bold text-green-600">Free</span>
                    ) : course.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary-600">
                          {formatCurrency(course.discountPrice)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(course.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(course.price)}
                      </span>
                    )}
                  </div>
                  
                  {course.enrollmentCount > 0 && (
                    <span className="text-xs text-gray-500">
                      {course.enrollmentCount} enrolled
                    </span>
                  )}
                </div>

                {course.accessDuration && course.accessDuration !== 'lifetime' && (
                  <div className="mt-2 text-xs text-gray-500">
                    Access: {course.accessDuration} days
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CourseList;