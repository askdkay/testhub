import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { FiSave, FiX } from 'react-icons/fi';

function CreateExam() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    name: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/exams/admin/categories-list');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Generate slug from name
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const examData = {
        category_id: formData.category_id,
        name: formData.name,
        slug: slug,
        short_name: '',
        full_form: '',
        description: '',
        total_questions: 0,
        total_marks: 0,
        duration: 0,
        color: 'from-blue-500 to-cyan-500',
        is_active: 1
      };

      const res = await API.post('/exams/admin/exams', examData);
      
      alert(`✅ Exam Created Successfully!\n\nExam ID: ${res.data.id}\nExam Name: ${formData.name}\nURL: /exam/${slug}`);
      
      // Reset form
      setFormData({
        category_id: '',
        name: ''
      });
      
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('❌ Failed to create exam: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create New Exam
            </h1>
            <p className="text-gray-400">
              Fill only 3 details - Category, Name, and ID will be auto-generated
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Category <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                required
              >
                <option value="">-- Choose a category --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (ID: {cat.id})
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-xs text-yellow-500 mt-2">
                  ⚠️ No categories found. Please create a category first.
                </p>
              )}
            </div>

            {/* 2. Exam Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Exam Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                placeholder="e.g., RAS Prelims, 2nd Grade Teacher, etc."
                required
              />
            </div>

            {/* 3. Auto-generated Exam ID (Display Only) */}
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Auto-generated Exam ID
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-950 px-4 py-2 rounded-lg text-blue-400 font-mono">
                  {formData.name ? 
                    `ID will be: ${Math.floor(Math.random() * 1000) + 1}` : 
                    'Enter exam name to generate ID'}
                </code>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ℹ️ Unique ID will be automatically assigned when you create the exam
              </p>
            </div>

            {/* Preview Section */}
            {formData.name && formData.category_id && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">Preview:</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-400">Category ID:</span> {formData.category_id}</p>
                  <p><span className="text-gray-400">Exam Name:</span> {formData.name}</p>
                  <p><span className="text-gray-400">URL:</span> <span className="text-green-400">/exam/{formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}</span></p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => navigate('/admin/categories-exams')}
                className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.category_id || !formData.name}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiSave />
                {loading ? 'Creating...' : 'Create Exam'}
              </button>
            </div>
          </form>

          {/* Quick Tips */}
          <div className="mt-6 text-xs text-gray-500 border-t border-gray-800 pt-4">
            <p>📌 Exam ID will be auto-generated by the system</p>
            <p>📌 URL will be created from exam name (e.g., "RAS Prelims" → /exam/ras-prelims)</p>
            <p>📌 You can add more details later in Exam Pages section</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateExam;