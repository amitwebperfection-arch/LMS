import { useEffect, useState } from 'react';
import { getContactMessages, updateMessageStatus, deleteMessage as deleteMessageAPI, archiveMessage } from '../../api/contact.api';
import { Loader } from '../../components/common/Loader';
import { Mail, User, Clock, MessageSquare, Filter, Search, Eye, Archive, Reply, Trash2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, message: null });

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await getContactMessages();
      if (res.success) {
        setMessages(res.data);
      }
      setLoading(false);
    };

    fetchMessages();
  }, []);

  const filteredMessages = messages.filter(msg => {
    const matchesStatus = filterStatus === 'all' || msg.status === filterStatus;
    const matchesSearch = 
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'read':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'replied':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'new':
        return <AlertCircle className="w-4 h-4" />;
      case 'read':
        return <Eye className="w-4 h-4" />;
      case 'replied':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
  };

  const handleReply = (msg) => {
    setSelectedMessage(msg);
    setReplyMessage('');
    setShowReplyModal(true);
  };

  const handleMarkAsReplied = async (msgId) => {
    try {
      const response = await updateMessageStatus(msgId, 'replied');
      
      if (response.success) {
        setMessages(messages.map(msg => 
          msg._id === msgId ? { ...msg, status: 'replied' } : msg
        ));
        toast.success('Message marked as replied');
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const handleArchive = async (msgId) => {
    try {
      const response = await archiveMessage(msgId);
      
      if (response.success) {
        setMessages(messages.filter(msg => msg._id !== msgId));
        toast.success('Message archived successfully');
      } else {
        toast.error('Failed to archive message');
      }
    } catch (error) {
      console.error('Error archiving message:', error);
      toast.error('Error archiving message');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteMessageAPI(deleteDialog.message._id);
      
      if (response.success) {
        setMessages(messages.filter(msg => msg._id !== deleteDialog.message._id));
        toast.success('Message deleted successfully');
        setDeleteDialog({ isOpen: false, message: null });
      } else {
        toast.error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Error deleting message');
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSendingReply(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          replyMessage,
          userEmail: selectedMessage.email,
          userName: selectedMessage.name,
          subject: selectedMessage.subject || 'Re: Contact Message'
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(messages.map(msg => 
          msg._id === selectedMessage._id ? { ...msg, status: 'replied' } : msg
        ));
        setShowReplyModal(false);
        setReplyMessage('');
        toast.success('Reply sent successfully!');
      } else {
        toast.error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Error sending reply');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary-600 p-3 rounded-xl">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Contact Messages
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and respond to customer inquiries
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-primary-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">New</p>
                <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Read</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.read}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Replied</p>
                <p className="text-3xl font-bold text-green-600">{stats.replied}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, subject or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[150px]"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredMessages.length}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{messages.length}</span> messages
            </p>
          </div>
        </div>

        {/* Messages List */}
        {filteredMessages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col items-center">
              <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-full mb-4">
                <MessageSquare className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No messages found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your filters or search query'
                  : 'No contact messages yet'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Message Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-primary-100 dark:bg-primary-900 p-2.5 rounded-lg flex-shrink-0">
                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {msg.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <a 
                            href={`mailto:${msg.email}`}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:underline truncate"
                          >
                            {msg.email}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(msg.status)}`}>
                        {getStatusIcon(msg.status)}
                        {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="px-6 py-5">
                  {/* Subject */}
                  {msg.subject && (
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Subject</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{msg.subject}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Message</p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message Footer - Action Buttons */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => handleReply(msg)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                    
                    <button 
                      onClick={() => handleMarkAsReplied(msg._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Replied
                    </button>
                    
                    <button 
                      onClick={() => handleArchive(msg._id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <Archive className="w-4 h-4" />
                      Archive
                    </button>
                    
                    <button 
                      onClick={() => setDeleteDialog({ isOpen: true, message: msg })}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Reply to {selectedMessage?.name}</h3>
              <button 
                onClick={() => setShowReplyModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To:</label>
                <input
                  type="email"
                  value={selectedMessage?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message:</label>
                <textarea
                  rows={6}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendReply}
                  disabled={sendingReply}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingReply ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, message: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Message"
        message={`Are you sure you want to delete the message from "${deleteDialog.message?.name}"? This action cannot be undone.`}
        type="danger"
      />

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Message;