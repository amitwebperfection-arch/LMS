import React, { useState, useEffect } from 'react';
import { FileText, Eye, Download, Users, TrendingUp, Award, Search, Filter, ExternalLink } from 'lucide-react';
import { getAllResumesAdmin, getResumeStats } from '../../api/resume.api';
import { Loader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const AdminResumeBuilder = () => {
  const [resumes, setResumes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
 
  useEffect(() => {
    loadStats();
    loadResumes();
  }, [pagination.page, categoryFilter]);

  const loadStats = async () => {
    try {
      const response = await getResumeStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
      toast.error('Failed to load statistics');
    }
  };

  const loadResumes = async () => {
    setLoading(true);
    try {
      const response = await getAllResumesAdmin({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
      });
      
      if (response.success) {
        setResumes(response.data.resumes);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Load resumes error:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    loadResumes();
  };

  const viewResume = (resumeId) => {
    window.open(`/resumes/${resumeId}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resume Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all student resumes and templates</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Resumes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalResumes}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Templates</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalTemplates}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Award className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Public Resumes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.publicResumes}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Users className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Usage Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {stats.totalTemplates > 0 
                    ? Math.round(stats.topTemplates.reduce((sum, t) => sum + t.usedCount, 0) / stats.totalTemplates)
                    : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Templates */}
      {stats && stats.topTemplates.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Top Templates</h2>
          <div className="space-y-3">
            {stats.topTemplates.map((template, index) => (
              <div key={template._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{template.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">by {template.user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Download size={16} />
                    {template.usedCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={16} />
                    {template.views}
                  </span>
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-xs">
                    {template.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Distribution */}
      {stats && stats.categoryStats.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Category Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.categoryStats.map((cat) => (
              <div key={cat._id} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{cat.count}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mt-1">{cat._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="input pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
            className="input w-full sm:w-48"
          >
            <option value="all">All Categories</option>
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="creative">Creative</option>
            <option value="minimal">Minimal</option>
            <option value="professional">Professional</option>
            <option value="custom">Custom</option>
          </select>
          <button
            onClick={handleSearch}
            className="btn btn-primary flex items-center gap-2"
          >
            <Filter size={20} />
            Apply
          </button>
        </div>
      </div>

      {/* Resumes Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-600 dark:text-gray-400 mt-4">No resumes found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                {resumes.map((resume) => (
                  <tr key={resume._id} className="hover:bg-gray-50 dark:hover:bg-dark-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="text-gray-400" size={20} />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{resume.title}</p>
                          {resume.tags && resume.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {resume.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="text-xs bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {resume.user.avatar?.url ? (
                          <img src={resume.user.avatar.url} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm">
                            {resume.user.name[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{resume.user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{resume.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 capitalize">
                        {resume.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {resume.isTemplate && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            Template
                          </span>
                        )}
                        {resume.isPublic && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                            Public
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye size={14} />
                          {resume.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download size={14} />
                          {resume.usedCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => viewResume(resume._id)}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="border-t border-gray-200 dark:border-dark-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminResumeBuilder;