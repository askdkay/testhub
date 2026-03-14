import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { 
  FiSave, FiX, FiEye, FiImage, FiTag,
  FiCalendar, FiUser, FiGlobe, FiClock
} from 'react-icons/fi';

function ContentEditor({ contents, content, exams, onClose, onSave }) {
const [formData, setFormData] = useState({
    exam_id: content?.exam_id || '',
    parent_id: content?.parent_id || '',
    level: content?.level || 1,
    title: content?.title || '',
    content: content?.content || '',
    summary: content?.summary || '',
    featured_image: content?.featured_image || '',
    category: content?.category || '',
    tags: content?.tags || [],
    status: content?.status || 'draft',
    topic_order: content?.topic_order || 0
});
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput]
      });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (content?.id) {
        await API.put(`/content/admin/content/${content.id}`, formData);
      } else {
        await API.post('/content/admin/create', formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-deep-black border border-glass-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {content ? 'Edit Content' : 'Create New Content'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg"
            >
              <FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Exam Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Exam *
              </label>
              <select
                name="exam_id"
                value={formData.exam_id}
                onChange={handleChange}
                required
                className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="">Choose an exam...</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.name}</option>
                ))}
              </select>
            </div>
{/* After Exam Selection, add this */}
{formData.exam_id && (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Parent Topic (Leave empty for Main Topic)
    </label>
    <select
      name="parent_id"
      value={formData.parent_id}
      onChange={handleChange}
      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50"
    >
      <option value="">-- Main Topic --</option>
      {contents?.filter(c => !c.parent_id).map(topic => (
        <option key={topic.id} value={topic.id}>{topic.title}</option>
      ))}
    </select>
    <p className="text-xs text-gray-400 mt-1">Select a parent topic to make this a subtopic</p>
  </div>
)}

{/* Topic Order */}
<div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Topic Order
  </label>
  <input
    type="number"
    name="topic_order"
    value={formData.topic_order}
    onChange={handleChange}
    min="0"
    className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50"
    placeholder="Display order (lower numbers first)"
  />
</div>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50"
                placeholder="Enter content title..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50"
                placeholder="e.g., History, Polity, Geography"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                name="featured_image"
                value={formData.featured_image}
                onChange={handleChange}
                className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Summary
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows="3"
                className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50"
                placeholder="Brief summary of the content..."
              />
            </div>

            {/* Main Content - Rich Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content * (HTML supported)
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="15"
                className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-orange-500/50"
                placeholder="<h2>Title</h2><p>Content here...</p>"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="flex-1 bg-black/50 border border-glass-border rounded-xl py-2 px-4 text-white focus:outline-none focus:border-orange-500/50"
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-glass-border">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-glass-bg border border-glass-border rounded-xl hover:border-red-500/50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-6 py-3 bg-glass-bg border border-glass-border rounded-xl hover:border-blue-500/50 transition-all flex items-center gap-2"
              >
                <FiEye />
                Preview
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <FiSave />
                {loading ? 'Saving...' : 'Save Content'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-deep-black border border-glass-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white/5 rounded-lg"
                >
                  <FiX />
                </button>
              </div>
              <div className="prose prose-invert max-w-none">
                <h1 className="text-2xl font-bold mb-2">{formData.title}</h1>
                {formData.featured_image && (
                  <img 
                    src={formData.featured_image} 
                    alt={formData.title}
                    className="w-full max-h-96 object-cover rounded-xl mb-4"
                  />
                )}
                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ContentEditor;