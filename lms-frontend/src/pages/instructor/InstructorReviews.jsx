import { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, User, BookOpen, Filter, Search } from 'lucide-react';
import { getInstructorReviews, replyToReview } from '../../api/review.api';
import { getInstructorCourses } from '../../api/instructor.api';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import toast from 'react-hot-toast';

const InstructorReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyModal, setReplyModal] = useState({ isOpen: false, review: null });
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await getInstructorCourses();
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = selectedCourse ? { courseId: selectedCourse } : {};
      const response = await getInstructorReviews(params);
      
      if (response.success) {
        setReviews(response.data);
        calculateStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsList) => {
    const total = reviewsList.length;
    const avgRating = total > 0
      ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsList.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    setStats({ total, avgRating, distribution });
  };

  const handleOpenReply = (review) => {
    setReplyModal({ isOpen: true, review });
    setReplyText(review.instructorReply?.message || '');
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setSubmitting(true);

    try {
      const response = await replyToReview(replyModal.review._id, {
        message: replyText
      });

      if (response.success) {
        toast.success('Reply posted successfully');
        setReplyModal({ isOpen: false, review: null });
        setReplyText('');
        fetchReviews();
      }
    } catch (error) {
      console.error('Reply error:', error);
      toast.error(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.course?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Reviews</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and respond to student reviews</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <MessageSquare className="h-10 w-10 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.avgRating.toFixed(1)}
                </p>
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">5 Star Reviews</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.distribution[5]}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Needs Reply</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {reviews.filter(r => !r.instructorReply).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.distribution[rating] || 0;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              className="input pl-10"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="card text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || selectedCourse
              ? 'No reviews match your filters'
              : 'Your courses haven\'t received any reviews yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.user?.name || 'Anonymous'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
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
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <BookOpen className="h-4 w-4" />
                  <span className="max-w-[200px] truncate">{review.course?.title}</span>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {review.comment}
              </p>

              {review.instructorReply ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      Your Reply
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(review.instructorReply.repliedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {review.instructorReply.message}
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ This review hasn't been replied to yet
                  </p>
                </div>
              )}

              <button
                onClick={() => handleOpenReply(review)}
                className="flex items-center btn btn-secondary w-full md:w-auto"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {review.instructorReply ? 'Edit Reply' : 'Reply to Review'}
              </button>
            </div>
          ))}
        </div>
      )}

      {replyModal.isOpen && (
        <Modal
          isOpen={replyModal.isOpen}
          onClose={() => setReplyModal({ isOpen: false, review: null })}
          title="Reply to Review"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < replyModal.review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">
                  {replyModal.review.user?.name}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {replyModal.review.comment}
              </p>
            </div>

            <div>
              <label className="label">Your Reply *</label>
              <textarea
                className="input min-h-[150px]"
                placeholder="Write your reply to this review..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {replyText.length} / 500 characters
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setReplyModal({ isOpen: false, review: null })}
                className="btn btn-secondary flex-1"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                className="btn btn-primary flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader size="sm" />
                    <span className="ml-2">Posting...</span>
                  </>
                ) : replyModal.review.instructorReply ? (
                  'Update Reply'
                ) : (
                  'Post Reply'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InstructorReviews;