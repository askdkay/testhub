import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { 
  FiSave, FiX, FiImage, FiHash,
  FiAlignLeft, FiType, FiArrowUp
} from 'react-icons/fi';
import { 
  FaLandmark, FaUniversity, FaTrain, FaShieldAlt,
  FaChalkboardTeacher, FaFlask, FaGavel, FaLeaf,
  FaMapMarkedAlt, FaCity, FaTree
} from 'react-icons/fa';

const iconOptions = [
  { name: 'Landmark', icon: <FaLandmark />, value: 'FaLandmark' },
  { name: 'University', icon: <FaUniversity />, value: 'FaUniversity' },
  { name: 'Train', icon: <FaTrain />, value: 'FaTrain' },
  { name: 'Shield', icon: <FaShieldAlt />, value: 'FaShieldAlt' },
  { name: 'Teacher', icon: <FaChalkboardTeacher />, value: 'FaChalkboardTeacher' },
  { name: 'Flask', icon: <FaFlask />, value: 'FaFlask' },
  { name: 'Gavel', icon: <FaGavel />, value: 'FaGavel' },
  { name: 'Leaf', icon: <FaLeaf />, value: 'FaLeaf' },
  { name: 'Map', icon: <FaMapMarkedAlt />, value: 'FaMapMarkedAlt' },
  { name: 'City', icon: <FaCity />, value: 'FaCity' },
  { name: 'Tree', icon: <FaTree />, value: 'FaTree' }
];

const colorOptions = [
  { name: 'Orange-Red', value: 'from-orange-500 to-red-500' },
  { name: 'Blue-Cyan', value: 'from-blue-500 to-cyan-500' },
  { name: 'Green-Emerald', value: 'from-green-500 to-emerald-500' },
  { name: 'Yellow-Orange', value: 'from-yellow-500 to-orange-500' },
  { name: 'Red-Pink', value: 'from-red-500 to-pink-500' },
  { name: 'Purple-Violet', value: 'from-purple-500 to-violet-500' },
  { name: 'Cyan-Teal', value: 'from-cyan-500 to-teal-500' },
  { name: 'Indigo-Purple', value: 'from-indigo-500 to-purple-500' }
];

function CreateCategory() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FaLandmark',
    color: 'from-orange-500 to-red-500',
    display_order: 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/exams/admin/categories', formData);
      alert('Category created successfully!');
      navigate('/admin/categories-exams');
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Exam Category</h1>
          <p className="text-gray-400 mb-8">Add a new category for exams (e.g., UPSC, SSC, Banking)</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category Name *
              </label>
              <div className="relative">
                <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="e.g., UPSC (Union Public Service Commission)"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <div className="relative">
                <FiAlignLeft className="absolute left-4 top-4 text-gray-500" />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="Brief description of this category..."
                />
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {iconOptions.map((icon) => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setFormData({...formData, icon: icon.value})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.icon === icon.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-700'
                    }`}
                    title={icon.name}
                  >
                    <div className="text-2xl">{icon.icon}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color Theme
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({...formData, color: color.value})}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.color === color.value
                        ? 'border-blue-500'
                        : 'border-gray-800'
                    }`}
                  >
                    <div className={`h-8 rounded-lg bg-gradient-to-r ${color.value}`} />
                    <p className="text-xs mt-2 text-gray-400">{color.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Order
              </label>
              <div className="relative">
                <FiArrowUp className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                  placeholder="0"
                  min="0"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/categories-exams')}
                className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <FiSave />
                {loading ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateCategory;