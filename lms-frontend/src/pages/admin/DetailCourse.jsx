import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, Star, Clock, Users, Video, Award, Globe, 
  Calendar, DollarSign, Tag, Target, BookOpen, Lock, PlayCircle, Edit 
} from 'lucide-react';
import { getAdminCourse  } from '../../api/course.api';
import { approveCourse, rejectCourse } from '../../api/admin.api';
import { Loader } from '../../components/common/Loader';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate, getStatusColor, getDifficultyColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DetailCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
  if (!id) {
    toast.error('Invalid course ID');
    return;
  }

  try {
    setLoading(true);
    const response = await getAdminCourse(id);
    if (response?.success) {
      setCourse(response.data.course);
    } else {
      toast.error('Course not found');
    }
  } catch (error) {
    console.error('Failed to fetch course details', error);
    toast.error('Failed to load course details');
  } finally {
    setLoading(false);
  }
};


  const handleApproveCourse = async () => {
    try {
      await approveCourse(course._id);
      toast.success('Course approved successfully');
      fetchCourseDetails();
    } catch (error) {
      toast.error('Failed to approve course');
    }
  };

  const handleRejectCourse = async () => {
    try {
      await rejectCourse(course._id);
      toast.success('Course rejected');
      fetchCourseDetails();
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

  if (loading) return <Loader fullScreen />;

  if (!course) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/admin/courses')}
          className="btn btn-secondary flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to Courses</span>
        </button>

        <div className="card text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            The course you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/courses')}
          className="btn btn-secondary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </button>
        
        {!course.isApproved && (
          <div className="flex gap-3">
            <button
              onClick={handleApproveCourse}
              className="btn bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Approve Course
            </button>
            <button
              onClick={handleRejectCourse}
              className="btn btn-danger"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Reject Course
            </button>
          </div>
        )}
      </div>

      {/* Course Details */}
      <div className="space-y-6">
        {/* Thumbnail & Promo Video */}
        <div className="card">
          <img
            src={course.thumbnail?.url}
            alt={course.title}
            className="w-full h-96 object-cover rounded-lg"
          />
          {course.promoVideo?.url && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Promo Video:</p>
              <video controls className="w-full rounded-lg">
                <source src={course.promoVideo.url} type="video/mp4" />
              </video>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="card">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-3xl font-bold flex-1">{course.title}</h1>
            <div className="flex gap-2 flex-wrap">
              {course.isFeatured && (
                <span className="badge bg-yellow-400 text-gray-900">⭐ Featured</span>
              )}
              {course.isFree && (
                <span className="badge bg-green-500 text-white">Free</span>
              )}
              <Badge variant={course.isApproved ? 'success' : 'warning'}>
                {course.isApproved ? 'Approved' : 'Pending Approval'}
              </Badge>
            </div>
          </div>
          
          {course.shortDescription && (
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              {course.shortDescription}
            </p>
          )}
          
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
            {course.description}
          </p>
        </div>

        {/* Key Stats */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Course Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="font-medium mt-1">
                <span className={`badge ${getStatusColor(course.status)}`}>
                  {course.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty</p>
              <p className="font-medium mt-1">
                <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Language</p>
              <p className="font-medium flex items-center gap-1 mt-1">
                <Globe className="h-4 w-4" />
                {course.language || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visibility</p>
              <p className="font-medium mt-1">{course.visibility || 'public'}</p>
            </div>
          </div>
        </div>

        {/* Pricing & Enrollment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pricing Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Original Price:</span>
                <span className="font-bold text-lg">
                  {course.isFree ? 'Free' : formatCurrency(course.price)}
                </span>
              </div>
              {course.discountPrice && !course.isFree && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Discount Price:</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatCurrency(course.discountPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">You Save:</span>
                    <span className="font-bold text-green-600">
                      {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center pt-3 border-t dark:border-dark-700">
                <span className="text-gray-600 dark:text-gray-400">Access Duration:</span>
                <span className="font-bold">
                  {course.accessDuration === 'lifetime' 
                    ? 'Lifetime Access' 
                    : `${course.accessDuration} days`}
                </span>
              </div>
            </div>
          </div>

          {/* Enrollment Info */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enrollment Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Students:</span>
                <span className="font-bold text-lg">{course.enrollmentCount || 0}</span>
              </div>
              {course.maxEnrollments && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Max Enrollments:</span>
                    <span className="font-bold">{course.maxEnrollments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Available Seats:</span>
                    <span className="font-bold text-green-600">
                      {course.maxEnrollments - (course.enrollmentCount || 0)}
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center pt-3 border-t dark:border-dark-700">
                <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                <span className="font-bold flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {course.rating?.toFixed(1) || 0} ({course.reviewCount || 0} reviews)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Certificate:</span>
                <span className="font-bold flex items-center gap-1">
                  {course.certificateEnabled ? (
                    <>
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Enabled</span>
                    </>
                  ) : (
                    <span className="text-gray-500">Disabled</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Instructor Information</h3>
          <div className="flex items-start gap-4">
            {course.instructor?.avatar?.url ? (
              <img
                src={course.instructor.avatar.url}
                alt={course.instructor.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
                  {course.instructor?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xl font-bold">{course.instructor?.name}</p>
                {course.instructor?.instructorProfile?.isVerified && (
                  <span className="badge badge-success text-xs">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    Verified Instructor
                  </span>
                )}
              </div>
              {course.instructor?.instructorProfile?.headline && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {course.instructor.instructorProfile.headline}
                </p>
              )}
              {course.instructor?.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {course.instructor.bio}
                </p>
              )}
              {course.instructor?.instructorProfile && (
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Courses: </span>
                    <span className="font-bold">{course.instructor.instructorProfile.totalCourses || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Students: </span>
                    <span className="font-bold">{course.instructor.instructorProfile.totalStudents || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Rating: </span>
                    <span className="font-bold">{course.instructor.instructorProfile.rating?.toFixed(1) || 0} ⭐</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Video className="h-5 w-5" />
            Course Content Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Duration</p>
              <p className="text-2xl font-bold text-primary-600">{formatDuration(course.totalDuration)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sections</p>
              <p className="text-2xl font-bold text-primary-600">{course.sections?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Lessons</p>
              <p className="text-2xl font-bold text-primary-600">
                {course.sections?.reduce((acc, s) => acc + (s.lessons?.length || 0), 0) || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Course Slug</p>
              <p className="text-sm font-bold text-primary-600 break-all">{course.slug}</p>
            </div>
          </div>
        </div>

        {/* What You'll Learn */}
        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              What You'll Learn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {course.whatYouWillLearn.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Requirements
            </h3>
            <ul className="space-y-2">
              {course.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Target Audience */}
        {course.targetAudience && course.targetAudience.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Audience
            </h3>
            <ul className="space-y-2">
              {course.targetAudience.map((audience, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary-600 font-bold">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{audience}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags & Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <span key={index} className="badge badge-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-3">
              {course.category && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                  <p className="font-medium">
                    {typeof course.category === 'object' 
                      ? course.category.name 
                      : course.category}
                  </p>
                </div>
              )}
              {course.subCategory && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sub Category</p>
                  <p className="font-medium">
                    {typeof course.subCategory === 'object' 
                      ? course.subCategory.name 
                      : course.subCategory}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Curriculum */}
        {course.sections && course.sections.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Curriculum ({course.sections.length} Sections)
            </h3>
            <div className="space-y-4">
              {course.sections.map((section, sIndex) => (
                <div key={section._id} className="border dark:border-dark-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        Section {sIndex + 1}: {section.title}
                      </h4>
                      {section.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <span className="badge badge-info">
                      {section.lessons?.length || 0} lessons
                    </span>
                  </div>
                  
                  {section.lessons && section.lessons.length > 0 && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary-200 dark:border-primary-800">
                      {section.lessons.map((lesson, lIndex) => (
                        <div key={lesson._id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2 flex-1">
                            {lesson.isPreview ? (
                              <PlayCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={`${lesson.isPreview ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {lIndex + 1}. {lesson.title}
                            </span>
                            {lesson.type === 'quiz' && (
                              <span className="badge badge-info text-xs">Quiz</span>
                            )}
                            {lesson.isPreview && (
                              <span className="badge badge-success text-xs">Preview</span>
                            )}
                          </div>
                          {lesson.duration && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{Math.floor(lesson.duration / 60)}min</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Timestamps</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                <Calendar className="h-4 w-4" />
                Created At
              </p>
              <p className="font-medium">{formatDate(course.createdAt)}</p>
            </div>
            {course.lastUpdatedAt && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                  <Calendar className="h-4 w-4" />
                  Last Updated
                </p>
                <p className="font-medium">{formatDate(course.lastUpdatedAt)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                <Calendar className="h-4 w-4" />
                Modified At
              </p>
              <p className="font-medium">{formatDate(course.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons at Bottom */}
        {!course.isApproved && (
          <div className="card">
            <div className="flex gap-4">
              <button
                onClick={handleApproveCourse}
                className="flex-1 btn bg-green-600 hover:bg-green-700 text-white py-3"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve Course
              </button>
              <button
                onClick={handleRejectCourse}
                className="flex-1 btn btn-danger py-3"
              >
                <XCircle className="h-5 w-5 mr-2" />
                Reject Course
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailCourse;