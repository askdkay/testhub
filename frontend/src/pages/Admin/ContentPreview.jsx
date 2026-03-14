import { motion } from 'framer-motion';
import { FiX, FiEye, FiCalendar, FiUser, FiTag } from 'react-icons/fi';

function ContentPreview({ content, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-deep-black border border-glass-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-glass-bg border-b border-glass-border p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Metadata */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-black/30 rounded-xl">
            {content.exam_name && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FiEye className="text-blue-400" />
                <span>Exam: {content.exam_name}</span>
              </div>
            )}
            {content.category && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FiTag className="text-green-400" />
                <span>Category: {content.category}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FiCalendar className="text-orange-400" />
              <span>Created: {new Date(content.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FiUser className="text-purple-400" />
              <span>Author: {content.author_name || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <FiEye className="text-yellow-400" />
              <span>Views: {content.views || 0}</span>
            </div>
          </div>

          {/* Featured Image */}
          {content.featured_image && (
            <div className="mb-6">
              <img 
                src={content.featured_image} 
                alt={content.title}
                className="w-full max-h-96 object-cover rounded-xl"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <style jsx>{`
              .prose h1 { color: white; font-size: 2em; margin-bottom: 0.5em; }
              .prose h2 { color: #f97316; font-size: 1.5em; margin: 1em 0 0.5em; }
              .prose h3 { color: #ec4899; font-size: 1.25em; margin: 1em 0 0.5em; }
              .prose p { color: #d1d5db; line-height: 1.8; margin-bottom: 1em; }
              .prose ul { color: #d1d5db; margin-left: 1.5em; margin-bottom: 1em; }
              .prose li { margin-bottom: 0.5em; }
              .prose table { width: 100%; border-collapse: collapse; margin: 1em 0; }
              .prose th { background: rgba(249, 115, 22, 0.2); color: white; padding: 0.75em; text-align: left; }
              .prose td { border: 1px solid rgba(255,255,255,0.1); padding: 0.75em; }
            `}</style>
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          </div>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-glass-border">
              <h3 className="text-sm font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {content.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ContentPreview;