import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  BookOpen,
  Star,
  Clock,
  Users,
  Video,
  Globe,
  DollarSign,
  Lock,
  PlayCircle,
  Award,
  Target,
  CheckCircle,
  AlertCircle,
  Eye,
  Tag,
  FileText,
  Shield,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { getInstructorCourseDetails } from '../../api/course.api';
import { getCourseReviews } from '../../api/review.api';
import { Loader } from '../../components/common/Loader';
import { formatCurrency, getDifficultyColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);
  useEffect(() => {
  if (showAllReviews) {
    fetchReviews();
  }
}, [reviewsPage, showAllReviews]);


  useEffect(() => {
    if (showAllReviews) {
      fetchReviews();
    }
  }, [reviewsPage, showAllReviews]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await getInstructorCourseDetails(id);
      if (res?.success) {
        setCourse(res.data.course);
      } else {
        toast.error('Course not found');
      }
    } catch (error) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await getCourseReviews(id, {
        page: reviewsPage,
        limit: showAllReviews ? 10 : 3,
      });
      if (res?.success) {
        setReviews(res.data.reviews);
        setTotalReviews(res.data.total);
      }
    } catch (error) {
      console.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (loading) return <Loader fullScreen />;

  if (!course) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/instructor/courses')}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Course
          </button>

          <button
            onClick={() =>
              navigate(`/instructor/courses/${course._id}/curriculum`)
            }
            className="btn btn-secondary flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Curriculum
          </button>
        </div>
      </div>

      {/* Thumbnail & Promo Video */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {course.thumbnail?.url && (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Course Thumbnail</h3>
            <img
              src={course.thumbnail.url}
              alt={course.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
        
        {course.promoVideo?.url && (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Promotional Video</h3>
            <video
              src={course.promoVideo.url}
              controls
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        {course.shortDescription && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">{course.shortDescription}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          {course.difficulty && (
            <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
              {course.difficulty}
            </span>
          )}
          {course.language && (
            <span className="badge badge-info flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {course.language}
            </span>
          )}
          {course.isFree && (
            <span className="badge badge-success">Free</span>
          )}
          {course.certificateEnabled && (
            <span className="badge badge-warning flex items-center gap-1">
              <Award className="h-3 w-3" />
              Certificate
            </span>
          )}
          {course.visibility && (
            <span className="badge badge-secondary flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {course.visibility}
            </span>
          )}
        </div>

        {course.description && (
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold mb-2">Full Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {course.description}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Users className="mx-auto mb-2 text-blue-500" />
          <p className="text-xl font-bold">{course.enrollmentCount || 0}</p>
          <p className="text-sm text-gray-500">Students Enrolled</p>
        </div>

        <div className="card text-center">
          <Star className="mx-auto mb-2 text-yellow-500" />
          <p className="text-xl font-bold">
            {course.rating?.toFixed(1) || '0.0'}
          </p>
          <p className="text-sm text-gray-500">Average Rating</p>
        </div>

        <div className="card text-center">
          <DollarSign className="mx-auto mb-2 text-green-500" />
          <p className="text-xl font-bold">
            {course.isFree ? 'Free' : formatCurrency(course.price || 0)}
          </p>
          {course.discountPrice && !course.isFree && (
            <p className="text-sm line-through text-gray-400">
              {formatCurrency(course.discountPrice)}
            </p>
          )}
          <p className="text-sm text-gray-500">Course Price</p>
        </div>

        <div className="card text-center">
          <Clock className="mx-auto mb-2 text-purple-500" />
          <p className="text-xl font-bold">
            {course.accessDuration === 'lifetime' ? '∞' : `${course.accessDuration} days`}
          </p>
          <p className="text-sm text-gray-500">Access Duration</p>
        </div>
      </div>

      {/* What You'll Learn */}
      {course.whatYouWillLearn?.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            What You'll Learn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {course.whatYouWillLearn.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {course.requirements?.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            Requirements
          </h2>
          <ul className="space-y-2">
            {course.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Target Audience */}
      {course.targetAudience?.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Who This Course Is For
          </h2>
          <ul className="space-y-2">
            {course.targetAudience.map((audience, index) => (
              <li key={index} className="flex items-start gap-2">
                <Users className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">{audience}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {course.tags?.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {course.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Course Settings */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Course Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {course.visibility && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Visibility</span>
              <span className="font-medium capitalize">{course.visibility}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-gray-600 dark:text-gray-400">Certificate</span>
            <span className="font-medium">
              {course.certificateEnabled ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Enabled
                </span>
              ) : (
                <span className="text-gray-500">Disabled</span>
              )}
            </span>
          </div>

          {course.maxEnrollments && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Max Enrollments</span>
              <span className="font-medium">{course.maxEnrollments}</span>
            </div>
          )}

          {course.status && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className={`badge ${
                course.status === 'published' ? 'badge-success' : 
                course.status === 'draft' ? 'badge-warning' : 
                'badge-secondary'
              }`}>
                {course.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SEO Information */}
      {(course.seoTitle || course.seoDescription || (course.seoKeywords && course.seoKeywords.length > 0)) && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            SEO Information
          </h2>
          <div className="space-y-3">
            {course.seoTitle && (
              <div>
                <label className="text-sm font-medium text-gray-500">SEO Title</label>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{course.seoTitle}</p>
              </div>
            )}
            {course.seoDescription && (
              <div>
                <label className="text-sm font-medium text-gray-500">SEO Description</label>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{course.seoDescription}</p>
              </div>
            )}
            {course.seoKeywords?.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">SEO Keywords</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {course.seoKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Information */}
      {(course.category || course.subCategory) && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Category Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.category && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-500">Category</span>
                <p className="font-medium mt-1">{course.category?.name || course.category}</p>
              </div>
            )}
            {course.subCategory && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-500">Sub-Category</span>
                <p className="font-medium mt-1">{course.subCategory?.name || course.subCategory}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Curriculum Preview */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Video className="h-5 w-5" />
          Course Curriculum
        </h2>

        {course.sections?.length > 0 ? (
          <div className="space-y-4">
            {course.sections.map((section, i) => (
              <div
                key={section._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Section {i + 1}: {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {section.lessons?.length || 0} lessons
                  </div>
                </div>

                <div className="space-y-2">
                  {section.lessons && section.lessons.length > 0 ? (
                    section.lessons.map((lesson, j) => (
                      <div
                        key={lesson._id}
                        className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
                      >
                        <div className="flex items-center gap-2">
                          {lesson.isPreview ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-gray-500">{j + 1}.</span>
                          <span className="font-medium">{lesson.title}</span>
                          {lesson.type && (
                            <span className="badge badge-sm badge-secondary">
                              {lesson.type}
                            </span>
                          )}
                        </div>
                        {lesson.duration > 0 && (
                          <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="h-3 w-3" />
                            {Math.floor(lesson.duration / 60)} min
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No lessons added yet
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No curriculum added yet</p>
            <button
              onClick={() => navigate(`/instructor/courses/${course._id}/curriculum`)}
              className="btn btn-primary mt-4"
            >
              Add Curriculum
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;