import { useEffect, useState } from 'react';
import {
  Star,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  User,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { getAllReviews, approveReview, rejectReview } from '../../api/review.api';
import { Loader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [status]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = status === 'all' ? {} : { status };
      const res = await getAllReviews(params);
      if (res.success) setReviews(res.data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      const res = await approveReview(id);
      if (res.success) {
        toast.success('Review approved');
        fetchReviews();
      }
    } catch {
      toast.error('Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this review?')) return;
    try {
      setActionLoading(id);
      const res = await rejectReview(id);
      if (res.success) {
        toast.success('Review rejected');
        fetchReviews();
      }
    } catch {
      toast.error('Failed to reject review');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(
    (r) =>
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.course?.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews Management</h1>
        <p className="text-gray-600">Approve, reject & monitor instructor replies</p>
      </div>

      {/* Filters */}
      <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Search reviews"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            className="input pl-10"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews */}
      {filteredReviews.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review._id} className="card">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{review.user?.name}</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <span
                  className={`badge ${
                    review.status === 'approved'
                      ? 'badge-success'
                      : review.status === 'rejected'
                      ? 'badge-danger'
                      : 'badge-warning'
                  }`}
                >
                  {review.status}
                </span>
              </div>

              {/* Course */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <BookOpen className="h-4 w-4" />
                {review.course?.title}
              </div>

              {/* Review */}
              <p className="text-gray-700">{review.comment}</p>

              {/* 🔹 Instructor Reply */}
              {review.instructorReply && (
                <div className="mt-4 ml-4 border-l-4 border-blue-500 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <p className="font-semibold text-blue-700">
                      Instructor Reply — {review.instructorReply.instructor?.name}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">
                    {review.instructorReply.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(review.instructorReply.repliedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Actions */}
              {review.status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleApprove(review._id)}
                    disabled={actionLoading === review._id}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold
                      bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md
                      hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(review._id)}
                    disabled={actionLoading === review._id}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold
                      bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md
                      hover:from-red-600 hover:to-rose-700 transition-all"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
