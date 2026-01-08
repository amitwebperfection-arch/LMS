import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourse } from '../../api/course.api';
import { getCourseReviews, addReview, getMyReview, updateReview, deleteReview } from '../../api/review.api';
import { createOrder } from '../../api/payment.api';
import { checkEnrollment } from '../../api/student.api';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { 
  Clock, Users, Star, PlayCircle, CheckCircle, Award, 
  Globe, Calendar, AlertCircle, Video, Lock, Edit, Trash2, X
} from 'lucide-react';
import { formatCurrency, formatDate, getDifficultyColor } from '../../utils/helpers';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../../components/payment/CheckoutForm';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CourseDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  
  // Review form state
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [slug]);

  useEffect(() => {
    if (course?._id && isAuthenticated) {
      fetchReviews();
      checkUserEnrollment();
      fetchMyReview();
    }
  }, [course, isAuthenticated]);

  const fetchCourse = async () => {
    try {
      const response = await getCourse(slug);
      if (response.success) {
        setCourse(response.data.course);
      }
    } catch (error) {
      console.error('Failed to fetch course', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await getCourseReviews(course._id);
      if (res.success) {
        setReviews(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    }
  };

  const fetchMyReview = async () => {
    try {
      const res = await getMyReview(course._id);
      if (res.success && res.data.review) {
        setMyReview(res.data.review);
      }
    } catch (error) {
      console.error('Failed to fetch my review', error);
    }
  };

  const checkUserEnrollment = async () => {
    try {
      const res = await checkEnrollment(course._id);
      setIsEnrolled(res.data?.isEnrolled || false);
    } catch (error) {
      console.error('Failed to check enrollment', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll');
      navigate('/login', { state: { from: `/courses/${slug}` } });
      return;
    }

    if (course.maxEnrollments && course.enrollmentCount >= course.maxEnrollments) {
      toast.error('Sorry, this course has reached its enrollment limit');
      return;
    }

    setEnrolling(true);

    try {
      const response = await createOrder({
        courseId: course._id,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to create order');
      }

      setOrderId(response.data.order._id);

      if (course.isFree) {
        toast.success('Successfully enrolled in free course!');
        setTimeout(() => {
          navigate(`/student/courses`);
        }, 1000);
      } else {
        if (response.data.clientSecret) {
          setClientSecret(response.data.clientSecret);
          setShowPaymentModal(true);
        } else {
          throw new Error('Payment setup failed');
        }
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    toast.success('Payment successful! Enrolling you in the course...');

    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 2000;

    const checkEnrollmentStatus = async () => {
      try {
        const res = await checkEnrollment(course._id);
        
        if (res.data?.isEnrolled) {
          toast.success('Successfully enrolled! Redirecting...');
          setTimeout(() => {
            navigate(`/student/courses`);
          }, 1000);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkEnrollmentStatus, pollInterval);
        } else {
          toast.error('Enrollment taking longer than expected. Please check "My Courses" page.');
          navigate('/student/courses');
        }
      } catch (error) {
        console.error('Error checking enrollment:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkEnrollmentStatus, pollInterval);
        }
      }
    };

    checkEnrollmentStatus();
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setClientSecret('');
    toast.info('Payment cancelled');
  };

  // Review handlers
  const handleOpenReviewModal = () => {
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      navigate('/login', { state: { from: `/courses/${slug}` } });
      return;
    }

    if (!isEnrolled) {
      toast.error('You must be enrolled to review this course');
      return;
    }

    if (myReview) {
      // Edit existing review
      setReviewData({
        rating: myReview.rating,
        comment: myReview.comment
      });
      setIsEditingReview(true);
    } else {
      // New review
      setReviewData({ rating: 5, comment: '' });
      setIsEditingReview(false);
    }

    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!reviewData.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmittingReview(true);

    try {
      let response;
      
      if (isEditingReview && myReview) {
        response = await updateReview(myReview._id, reviewData);
        toast.success('Review updated successfully! It will be reviewed by admin.');
      } else {
        response = await addReview({
          courseId: course._id,
          ...reviewData
        });
        toast.success('Review submitted successfully! It will be reviewed by admin.');
      }

      if (response.success) {
        setShowReviewModal(false);
        fetchMyReview();
        fetchReviews();
        setReviewData({ rating: 5, comment: '' });
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const response = await deleteReview(myReview._id);
      
      if (response.success) {
        toast.success('Review deleted successfully');
        setMyReview(null);
        fetchReviews();
      }
    } catch (error) {
      console.error('Delete review error:', error);
      toast.error('Failed to delete review');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <Header />

      {/* Course Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {course.isFeatured && (
                  <span className="badge bg-yellow-400 text-gray-900">
                    ⭐ Featured
                  </span>
                )}
                {course.isFree && (
                  <span className="badge bg-green-500 text-white">
                    Free Course
                  </span>
                )}
                {course.visibility === 'private' && (
                  <span className="badge bg-purple-500 text-white">
                    Private
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-primary-100 mb-6">{course.shortDescription}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating?.toFixed(1) || 0}</span>
                  <span className="text-primary-200">({course.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.enrollmentCount} students</span>
                </div>
                <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
                  {course.difficulty}
                </span>
                {course.language && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <span>{course.language}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <p className="text-primary-100">
                  Created by <span className="font-semibold">{course.instructor?.name}</span>
                </p>
                {course.instructor?.instructorProfile?.isVerified && (
                  <span className="badge badge-success flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              {course.lastUpdatedAt && (
                <p className="text-sm text-primary-200 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Last updated: {formatDate(course.lastUpdatedAt)}
                </p>
              )}

              {course.maxEnrollments && (
                <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Limited seats: {course.enrollmentCount}/{course.maxEnrollments} enrolled
                    {course.enrollmentCount >= course.maxEnrollments && ' - FULL'}
                  </span>
                </div>
              )}
            </div>

            {/* Price Card */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="card text-black dark:text-white">
                {course.promoVideo?.url ? (
                  <video
                    controls
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    poster={course.thumbnail?.url}
                  >
                    <source src={course.promoVideo.url} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={course.thumbnail?.url}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                
                <div className="mb-4">
                  {course.isFree ? (
                    <span className="text-3xl font-bold text-green-600">Free</span>
                  ) : course.discountPrice ? (
                    <>
                      <span className="text-3xl font-bold text-primary-600">
                        {formatCurrency(course.discountPrice)}
                      </span>
                      <span className="text-xl text-gray-500 line-through ml-2">
                        {formatCurrency(course.price)}
                      </span>
                      <div className="mt-1">
                        <span className="text-sm text-green-600 font-semibold">
                          {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-primary-600">
                      {formatCurrency(course.price)}
                    </span>
                  )}
                </div>

                {isEnrolled ? (
                  <button
                    onClick={() => navigate('/student/courses')}
                    className="w-full mb-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-white font-semibold shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Go to My Courses
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleEnroll}
                      disabled={
                        enrolling || 
                        (course.maxEnrollments && course.enrollmentCount >= course.maxEnrollments)
                      }
                      className="btn btn-primary w-full mb-3"
                    >
                      {enrolling ? (
                        <>
                          <Loader size="sm" />
                          <span className="ml-2">Processing...</span>
                        </>
                      ) : course.isFree ? (
                        'Enroll for Free'
                      ) : (
                        `Enroll Now - ${formatCurrency(course.discountPrice || course.price)}`
                      )}
                    </button>
                    {course.maxEnrollments && course.enrollmentCount >= course.maxEnrollments && (
                      <p className="text-sm text-red-600 text-center font-semibold">
                        ⚠️ Course is full
                      </p>
                    )}
                  </>
                )}

                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-dark-700">
                  {course.accessDuration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Access:
                      </span>
                      <span className="font-semibold">
                        {course.accessDuration === 'lifetime' ? 'Lifetime' : `${course.accessDuration} days`}
                      </span>
                    </div>
                  )}
                  
                  {course.certificateEnabled && (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-primary-600" />
                      <span>Certificate of completion</span>
                    </div>
                  )}

                  {course.totalDuration > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4 text-primary-600" />
                      <span>{formatDuration(course.totalDuration)} video content</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">About this course</h2>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {course.description}
              </p>
            </div>

            {/* Target Audience */}
            {course.targetAudience && course.targetAudience.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Who this course is for</h2>
                <ul className="space-y-2">
                  {course.targetAudience.map((audience, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <span>{audience}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum */}
            {course.sections && course.sections.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                <div className="space-y-3">
                  {course.sections.map((section) => (
                    <div key={section._id} className="border border-gray-200 dark:border-dark-700 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {section.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        {section.lessons?.map((lesson) => (
                          <div key={lesson._id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {lesson.isPreview ? (
                                <PlayCircle className="h-4 w-4 text-primary-600" />
                              ) : (
                                <Lock className="h-4 w-4 text-gray-400" />
                              )}
                              <span className={lesson.isPreview ? 'text-primary-600' : ''}>
                                {lesson.title}
                              </span>
                              {lesson.type === 'quiz' && (
                                <span className="badge badge-info text-xs">Quiz</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              {lesson.duration && (
                                <>
                                  <Clock className="h-4 w-4" />
                                  <span>{Math.floor(lesson.duration / 60)}min</span>
                                </>
                              )}
                              {lesson.isPreview && (
                                <span className="badge badge-success text-xs">Preview</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Student Reviews</h2>
                {isEnrolled && (
                  <button
                    onClick={handleOpenReviewModal}
                    className="btn btn-primary"
                  >
                    {myReview ? 'Edit My Review' : 'Write a Review'}
                  </button>
                )}
              </div>

              {/* My Review */}
              {myReview && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Your Review</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < myReview.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      {myReview.status === 'pending' && (
                        <span className="badge badge-warning text-xs">Pending Approval</span>
                      )}
                      {myReview.status === 'rejected' && (
                        <span className="badge badge-danger text-xs">Rejected</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleOpenReviewModal}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        title="Edit review"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleDeleteReview}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                        title="Delete review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">{myReview.comment}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDate(myReview.createdAt)}
                    {myReview.isEdited && ' (edited)'}
                  </p>
                </div>
              )}

              {/* All Reviews */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-200 dark:border-dark-700 pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                            {review.user?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{review.user?.name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{review.comment}</p>
                      
                      {review.instructorReply && (
                        <div className="ml-8 mt-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                          <p className="text-sm font-semibold mb-1">Instructor Response:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {review.instructorReply.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(review.instructorReply.repliedAt)}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDate(review.createdAt)}
                        {review.isEdited && ' (edited)'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No reviews yet. {isEnrolled ? 'Be the first to review!' : ''}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Instructor</h3>
              <div className="flex items-center gap-3 mb-3">
                {course.instructor?.avatar?.url ? (
                  <img
                    src={course.instructor.avatar.url}
                    alt={course.instructor.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      {course.instructor?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{course.instructor?.name}</p>
                  {course.instructor?.instructorProfile?.headline && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {course.instructor.instructorProfile.headline}
                    </p>
                  )}
                </div>
              </div>
              
              {course.instructor?.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {course.instructor.bio}
                </p>
              )}
              
              {course.instructor?.instructorProfile && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rating:</span>
                    <span className="font-semibold">
                      {course.instructor.instructorProfile.rating?.toFixed(1) || 0} ⭐
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Students:</span>
                    <span className="font-semibold">
                      {course.instructor.instructorProfile.totalStudents || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Courses:</span>
                    <span className="font-semibold">
                      {course.instructor.instructorProfile.totalCourses || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <span key={index} className="badge badge-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && clientSecret && (
        <Modal
          isOpen={showPaymentModal}
          onClose={handlePaymentCancel}
          title="Complete Payment"
          size="md"
        >
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              amount={course.discountPrice || course.price}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </Elements>
        </Modal>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          title={isEditingReview ? "Edit Your Review" : "Write a Review"}
          size="md"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="label">Rating *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= reviewData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-lg font-semibold">
                  {reviewData.rating} / 5
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="label">Your Review *</label>
              <textarea
                className="input min-h-[150px]"
                placeholder="Share your experience with this course..."
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {reviewData.comment.length} / 1000 characters
              </p>
            </div>

            {/* Notice */}
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Your review will be reviewed by our admin team before being published.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="btn btn-secondary flex-1"
                disabled={submittingReview}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <>
                    <Loader size="sm" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : isEditingReview ? (
                  'Update Review'
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <Footer />
    </div>
  );
};

export default CourseDetails;