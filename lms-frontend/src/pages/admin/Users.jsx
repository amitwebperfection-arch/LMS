import { useState, useEffect } from 'react';
import { Search, Shield, Ban, CheckCircle, Filter } from 'lucide-react';
import { getUsers, blockUser, unblockUser, updateUserRole } from '../../api/admin.api';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import DefaultAvatar from '../../assets/default-avatar.png';


const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, user: null, action: null });

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers({
        page: currentPage,
        limit: 10,
        search,
        role: roleFilter,
      });
    if (response?.success) {
      setUsers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } else {
      setUsers([]);
      setTotalPages(1);
    }
    } catch (error) {
        console.error('FETCH USERS ERROR 👉', error.response?.data || error);
        toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await blockUser(userId);
      toast.success('User blocked successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to block user');
    }
    setConfirmDialog({ isOpen: false, user: null, action: null });
  };

  const handleUnblockUser = async (userId) => {
    try {
      await unblockUser(userId);
      toast.success('User unblocked successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to unblock user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all platform users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input sm:w-48"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-dark-700 flex items-center justify-center">
                      <img
                        src={user.avatar?.url || DefaultAvatar}
                        alt={user.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = DefaultAvatar;
                        }}
                      />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    className="input py-1 text-sm"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  {user.isBlocked ? (
                    <Badge variant="danger">Blocked</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {user.isBlocked ? (
                      <button
                        onClick={() => handleUnblockUser(user._id)}
                        className="btn btn-secondary py-1 px-3 text-sm"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmDialog({ isOpen: true, user, action: 'block' })}
                        className="btn btn-danger py-1 px-3 text-sm"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, user: null, action: null })}
        onConfirm={() => handleBlockUser(confirmDialog.user?._id)}
        title="Block User"
        message={`Are you sure you want to block ${confirmDialog.user?.name}? They won't be able to access the platform.`}
        type="danger"
      />
    </div>
  );
};

export default Users;