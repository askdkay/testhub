import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../services/api';
import BlogEditor from './BlogEditor';
import { 
  FiFileText, FiEdit2, FiTrash2, FiEye,
  FiSearch, FiFilter, FiPlus, FiCalendar,
  FiUser, FiTag, FiStar, FiClock, FiCheckCircle // Added FiCheckCircle here
} from 'react-icons/fi';
import { FaRegFileAlt, FaRegEye, FaRegStar } from 'react-icons/fa';

function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(() => {
    fetchBlogs();
    fetchStats();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await API.get('/blogs/admin/blogs');
      setBlogs(res.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/blogs/admin/blog-stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await API.delete(`/blogs/admin/blogs/${id}`);
        fetchBlogs();
        fetchStats();
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  // Publish blog function
  const handlePublish = async (id) => {
    try {
        const blog = blogs.find(b => b.id === id);
        await API.put(`/blogs/admin/blogs/${id}`, {
            ...blog,
            status: 'published'
        });
        fetchBlogs(); // Refresh list
        fetchStats();
    } catch (error) {
        console.error('Error publishing blog:', error);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || blog.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Published</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Draft</span>;
      case 'scheduled':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Scheduled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-deep-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Blog Manager</h1>
            <p className="text-gray-400 mt-1">Manage your exam blogs and articles</p>
          </div>
          <button
            onClick={() => {
              setEditingBlog(null);
              setShowEditor(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold flex items-center gap-2"
          >
            <FiPlus />
            New Blog
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-glass-bg border border-glass-border rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.total || 0}</div>
            <div className="text-sm text-gray-400">Total Blogs</div>
          </div>
          <div className="bg-glass-bg border border-glass-border rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">{stats.published || 0}</div>
            <div className="text-sm text-gray-400">Published</div>
          </div>
          <div className="bg-glass-bg border border-glass-border rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">{stats.drafts || 0}</div>
            <div className="text-sm text-gray-400">Drafts</div>
          </div>
          <div className="bg-glass-bg border border-glass-border rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.totalViews || 0}</div>
            <div className="text-sm text-gray-400">Total Views</div>
          </div>
          <div className="bg-glass-bg border border-glass-border rounded-lg p-4">
            <div className="text-2xl font-bold">{stats.totalLikes || 0}</div>
            <div className="text-sm text-gray-400">Total Likes</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-glass-bg border border-glass-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-orange-500/50"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-glass-bg border border-glass-border rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500/50"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>

        {/* Blogs Table */}
        <div className="bg-glass-bg border border-glass-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/30">
              <tr>
                <th className="text-left py-3 px-4 text-sm">Title</th>
                <th className="text-left py-3 px-4 text-sm">Category</th>
                <th className="text-left py-3 px-4 text-sm">Status</th>
                <th className="text-left py-3 px-4 text-sm">Views</th>
                <th className="text-left py-3 px-4 text-sm">Likes</th>
                <th className="text-left py-3 px-4 text-sm">Author</th>
                <th className="text-left py-3 px-4 text-sm">Date</th>
                <th className="text-left py-3 px-4 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map(blog => (
                <tr key={blog.id} className="border-t border-glass-border hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{blog.title}</p>
                      {blog.is_featured && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                          <FaRegStar /> Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">{blog.category}</td>
                  <td className="py-3 px-4">{getStatusBadge(blog.status)}</td>
                  <td className="py-3 px-4">{blog.views || 0}</td>
                  <td className="py-3 px-4">{blog.likes || 0}</td>
                  <td className="py-3 px-4">{blog.author_name}</td>
                  <td className="py-3 px-4">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      {/* Publish Button properly placed here inside map */}
                      {blog.status === 'draft' && (
                          <button
                              onClick={() => handlePublish(blog.id)}
                              className="p-1 hover:bg-green-500/20 rounded text-green-400"
                              title="Publish Draft"
                          >
                              <FiCheckCircle size={16} />
                          </button>
                      )}
                      <button
                        onClick={() => window.open(`/blogs/${blog.slug}`, '_blank')}
                        className="p-1 hover:bg-blue-500/20 rounded text-blue-400"
                        title="View Blog"
                      >
                        <FiEye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingBlog(blog);
                          setShowEditor(true);
                        }}
                        className="p-1 hover:bg-orange-500/20 rounded text-orange-400"
                        title="Edit Blog"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400"
                        title="Delete Blog"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blog Editor Modal */}
      {showEditor && (
        <BlogEditor
          blog={editingBlog}
          onClose={() => {
            setShowEditor(false);
            setEditingBlog(null);
          }}
          onSave={() => {
            setShowEditor(false);
            setEditingBlog(null);
            fetchBlogs();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}

export default BlogManager;