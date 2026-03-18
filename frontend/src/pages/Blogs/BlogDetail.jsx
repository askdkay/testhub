import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { 
  FiCalendar, FiUser, FiEye, FiHeart,
  FiMessageCircle, FiShare2, FiArrowLeft,
  FiClock, FiTag, FiFacebook, FiTwitter,
  FiLinkedin, FiLink, FiBookmark, FiMoreHorizontal
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa';

function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchBlog();
    // Check if user has already liked/bookmarked (from localStorage)
    const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
    const bookmarkedBlogs = JSON.parse(localStorage.getItem('bookmarkedBlogs') || '[]');
    setLiked(likedBlogs.includes(slug));
    setBookmarked(bookmarkedBlogs.includes(slug));
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const res = await API.get(`/blogs/blogs/${slug}`);
      setBlog(res.data);
      setComments(res.data.comments || []);
    } catch (error) {
      console.error('Error fetching blog:', error);
      setBlog(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if(!blog) return;
    try {
      await API.post(`/blogs/blogs/${blog.id}/like`);
      setBlog({ ...blog, likes: (blog.likes || 0) + 1 });
      setLiked(true);
      // Save to localStorage
      const likedBlogs = JSON.parse(localStorage.getItem('likedBlogs') || '[]');
      localStorage.setItem('likedBlogs', JSON.stringify([...likedBlogs, slug]));
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleBookmark = () => {
    const bookmarkedBlogs = JSON.parse(localStorage.getItem('bookmarkedBlogs') || '[]');
    if (bookmarked) {
      // Remove bookmark
      localStorage.setItem('bookmarkedBlogs', JSON.stringify(bookmarkedBlogs.filter(s => s !== slug)));
      setBookmarked(false);
    } else {
      // Add bookmark
      localStorage.setItem('bookmarkedBlogs', JSON.stringify([...bookmarkedBlogs, slug]));
      setBookmarked(true);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if(!blog || !comment.trim()) return;
    try {
      await API.post(`/blogs/blogs/${blog.id}/comments`, {
        comment: comment.trim(),
        name: 'Guest User'
      });
      setComment('');
      alert('Comment submitted for approval!');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const shareBlog = (platform) => {
    const url = window.location.href;
    const text = `Check out this article: ${blog?.title || ''}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank');
    }
    setShowShareMenu(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const readingTime = () => {
    if (blog?.reading_time) return blog.reading_time;
    const wordsPerMinute = 200;
    const wordCount = blog?.content?.split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Article Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/blogs" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <FiArrowLeft size={18} />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />

      {/* Progress Bar */}
      <div className="fixed top-16 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-40">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
          style={{ width: '0%' }} // Add scroll listener for this
        />
      </div>

      {/* Hero Section - Minimal */}
      <div className="pt-24 pb-8 px-4 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link 
          to="/blogs" 
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-6 transition-colors group"
        >
          <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to all articles
        </Link>

        {/* Category */}
        {blog.category && (
          <Link 
            to={`/blogs?category=${blog.category}`}
            className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium mb-4 hover:bg-orange-200 dark:hover:bg-orange-500/20 transition-colors"
          >
            {blog.category}
          </Link>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          {blog.title}
        </h1>

        {/* Author & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            {/* Author Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {blog.author_name ? blog.author_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <p className="font-semibold">{blog.author_name || 'Admin'}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <FiCalendar size={14} />
                  {formatDate(blog.published_at)}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <FiClock size={14} />
                  {readingTime()} min read
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-full transition-all ${
                liked 
                  ? 'text-pink-500 bg-pink-50 dark:bg-pink-500/10' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-500/10'
              }`}
              title={liked ? 'Liked' : 'Like'}
            >
              <FiHeart className={liked ? 'fill-current' : ''} size={20} />
            </button>
            
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full transition-all ${
                bookmarked 
                  ? 'text-orange-500 bg-orange-50 dark:bg-orange-500/10' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10'
              }`}
              title={bookmarked ? 'Bookmarked' : 'Bookmark'}
            >
              <FiBookmark className={bookmarked ? 'fill-current' : ''} size={20} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-full transition-all"
                title="Share"
              >
                <FiShare2 size={20} />
              </button>

              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">Share this article</p>
                  <button onClick={() => shareBlog('facebook')} className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <FiFacebook className="text-[#1877F2]" size={18} />
                    <span className="text-sm">Facebook</span>
                  </button>
                  <button onClick={() => shareBlog('twitter')} className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <FiTwitter className="text-[#1DA1F2]" size={18} />
                    <span className="text-sm">Twitter</span>
                  </button>
                  <button onClick={() => shareBlog('linkedin')} className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <FiLinkedin className="text-[#0A66C2]" size={18} />
                    <span className="text-sm">LinkedIn</span>
                  </button>
                  <button onClick={() => shareBlog('whatsapp')} className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <FaWhatsapp className="text-[#25D366]" size={18} />
                    <span className="text-sm">WhatsApp</span>
                  </button>
                  <button onClick={() => shareBlog('telegram')} className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <FaTelegram className="text-[#0088cc]" size={18} />
                    <span className="text-sm">Telegram</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <button onClick={() => shareBlog('copy')} className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <FiLink size={18} />
                    <span className="text-sm">Copy link</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.featured_image && (
        <div className="max-w-5xl mx-auto px-4 mb-12">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={blog.featured_image} 
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Content - Like Medium */}
      <div className="max-w-3xl mx-auto px-4">
        <article className="prose prose-lg dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
          prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-gray-900 dark:prose-strong:text-white
          prose-code:text-orange-500 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:text-gray-100
          prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:bg-orange-50 dark:prose-blockquote:bg-orange-500/5 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
          prose-img:rounded-xl prose-img:shadow-lg
          prose-hr:border-gray-200 dark:prose-hr:border-gray-800
        ">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </article>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Topics:</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/blogs?tag=${tag}`}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="mt-8 flex items-center gap-6 py-6 border-y border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FiEye className="text-gray-400" size={20} />
            <span className="font-medium">{blog.views || 0} views</span>
          </div>
          <div className="flex items-center gap-2">
            <FiHeart className="text-gray-400" size={20} />
            <span className="font-medium">{blog.likes || 0} likes</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMessageCircle className="text-gray-400" size={20} />
            <span className="font-medium">{comments.length} comments</span>
          </div>
        </div>

        {/* Author Bio */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {blog.author_name ? blog.author_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Written by {blog.author_name || 'Admin'}</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Expert educator and mentor helping students achieve their dreams through quality test preparation.
              </p>
              <Link 
                to={`/blogs?author=${blog.author_id}`}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                View all articles by this author →
              </Link>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {blog.related && blog.related.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-8">Related Articles</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {blog.related.map(post => (
                <Link
                  key={post.id}
                  to={`/blogs/${post.slug}`}
                  className="group"
                >
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden mb-3">
                    {post.featured_image ? (
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-pink-500/20"></div>
                    )}
                  </div>
                  <h4 className="font-semibold group-hover:text-orange-500 transition-colors line-clamp-2 mb-1">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {post.published_at ? formatDate(post.published_at) : ''}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-16 mb-16">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <FiMessageCircle /> 
            Discussion ({comments.length})
          </h3>
          
          {/* Comment Form */}
          <form onSubmit={handleComment} className="mb-10">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows="3"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
              required
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all"
              >
                Post Comment
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your comment will be visible after approval.
            </p>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={comment.id || index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold">
                      {comment.name ? comment.name.charAt(0).toUpperCase() : 'G'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{comment.name || 'Guest User'}</span>
                      <span className="text-xs text-gray-500">·</span>
                      <span className="text-xs text-gray-500">
                        {comment.created_at ? formatDate(comment.created_at) : 'Just now'}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <FiMessageCircle className="mx-auto text-4xl text-gray-400 mb-3" />
                <p className="text-gray-500">No comments yet. Be the first to start the discussion!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gray-900 dark:bg-black text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-3">Never miss an update</h3>
          <p className="text-gray-400 mb-6">
            Subscribe to get the latest exam news, study tips, and success stories directly in your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-orange-500 text-white placeholder-gray-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;