import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { 
  FiSearch, FiCalendar, FiUser, FiEye, FiClock
} from 'react-icons/fi';

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [pagination.page, selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await API.get('/blogs/blogs', {
        params: {
          page: pagination.page,
          category: selectedCategory,
          search: searchTerm
        }
      });
      
      // ✅ Backend ka data format theek se handle karna
      if (Array.isArray(res.data)) {
        setBlogs(res.data);
      } else if (res.data && res.data.blogs) {
        setBlogs(res.data.blogs);
        if (res.data.pagination) setPagination(res.data.pagination);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/blogs/blog-categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchBlogs();
  };

  const readingTime = (content) => {
    if(!content) return 1;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-white/10">
      <Navbar />

      {/* Minimalist Header */}
      <div className="relative pt-32 pb-16 px-6 text-center">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white">
            Library & <span className="text-orange-500/90">Insights</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Explore our curated collection of expert tips, study strategies, and the latest exam updates.
          </p>

          {/* Clean Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/5 to-white/5 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0a0f1a] border border-white/10 rounded-full overflow-hidden">
              <FiSearch className="absolute left-5 text-slate-500 text-lg" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-transparent pl-14 pr-6 py-4 text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <button type="submit" className="hidden"></button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar - Perfect Box Radius & Border */}
          <div className="lg:w-[320px] shrink-0">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sticky top-28 backdrop-blur-md">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6 px-2">Categories</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    !selectedCategory 
                      ? 'bg-white/10 text-white shadow-sm' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  All Articles
                </button>
                {categories.map((cat, index) => (
                  <button
                    key={cat._id || cat.id || index}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium flex justify-between items-center ${
                      selectedCategory === cat.name 
                        ? 'bg-white/10 text-white shadow-sm' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md ${
                      selectedCategory === cat.name ? 'bg-white/10' : 'bg-black/20 text-slate-500'
                    }`}>
                      {cat.post_count || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                 <div className="w-10 h-10 border-2 border-white/10 border-t-orange-500/80 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {blogs && blogs.length > 0 ? blogs.map((blog, index) => (
                  <motion.article
                    key={blog._id || blog.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 group flex flex-col h-full"
                  >
                    {/* Image Section */}
                    <div className="relative h-56 overflow-hidden bg-[#0a0f1a]">
                      {blog.featured_image ? (
                        <Link to={`/blogs/${blog.slug}`}>
                          <img 
                            src={blog.featured_image} 
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                          />
                        </Link>
                      ) : (
                        <Link to={`/blogs/${blog.slug}`} className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 flex items-center justify-center">
                          <FiEye className="text-slate-600 text-4xl" />
                        </Link>
                      )}
                      
                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {blog.category && (
                          <span className="text-[11px] font-semibold px-3 py-1 bg-black/60 backdrop-blur-md text-slate-200 rounded-full border border-white/10 tracking-wide">
                            {blog.category}
                          </span>
                        )}
                        {blog.is_featured && (
                          <span className="text-[11px] font-semibold px-3 py-1 bg-orange-500/20 backdrop-blur-md text-orange-400 rounded-full border border-orange-500/20 tracking-wide">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex flex-col flex-grow">
                      <Link to={`/blogs/${blog.slug}`} className="block mb-3">
                        <h2 className="text-xl font-bold text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                          {blog.title}
                        </h2>
                      </Link>
                      
                      <div 
                        className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-grow mb-6"
                        dangerouslySetInnerHTML={{ __html: blog.excerpt || (blog.content ? blog.content.substring(0, 120) + '...' : 'No description available.') }}
                      />

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-5 border-t border-white/5">
                        <div className="flex items-center gap-4">
                          {blog.published_at && (
                             <span className="flex items-center gap-1.5 font-medium">
                               <FiCalendar size={14} />
                               {new Date(blog.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                             </span>
                          )}
                          <span className="flex items-center gap-1.5 font-medium">
                            <FiClock size={14} />
                            {readingTime(blog.content)} min read
                          </span>
                        </div>
                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                          <FiEye size={13} />
                          {blog.views || 0}
                        </span>
                      </div>
                    </div>
                  </motion.article>
                )) : (
                   <div className="col-span-full text-center bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-16">
                     <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                       <FiSearch size={24} />
                     </div>
                     <h3 className="text-xl font-medium text-slate-300 mb-2">No articles found</h3>
                     <p className="text-slate-500">Try adjusting your search or selecting a different category.</p>
                   </div>
                )}
              </div>
            )}

            {/* Clean Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16">
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                  disabled={pagination.page === 1}
                  className="px-5 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl disabled:opacity-30 hover:bg-white/[0.06] transition-all text-sm font-medium flex items-center text-slate-300"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1 px-4">
                  <span className="text-sm font-medium text-slate-400">Page</span>
                  <span className="w-8 h-8 flex items-center justify-center bg-white/10 text-white rounded-lg text-sm font-bold border border-white/10">
                    {pagination.page}
                  </span>
                  <span className="text-sm font-medium text-slate-500">of {pagination.pages}</span>
                </div>
                <button
                  onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                  disabled={pagination.page === pagination.pages}
                  className="px-5 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl disabled:opacity-30 hover:bg-white/[0.06] transition-all text-sm font-medium flex items-center text-slate-300"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogList;