import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { 
  FiEdit2, FiTrash2, FiPlus, FiSearch,
  FiChevronDown, FiChevronRight, FiSave, FiX,
  FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { 
  FaUniversity, FaLandmark, FaTrain, FaShieldAlt,
  FaChalkboardTeacher, FaFlask, FaGavel, FaLeaf,
  FaMapMarkedAlt, FaCity, FaTree
} from 'react-icons/fa';

// Icon mapping
const iconMap = {
  FaUniversity: <FaUniversity />,
  FaLandmark: <FaLandmark />,
  FaTrain: <FaTrain />,
  FaShieldAlt: <FaShieldAlt />,
  FaChalkboardTeacher: <FaChalkboardTeacher />,
  FaFlask: <FaFlask />,
  FaGavel: <FaGavel />,
  FaLeaf: <FaLeaf />,
  FaMapMarkedAlt: <FaMapMarkedAlt />,
  FaCity: <FaCity />,
  FaTree: <FaTree />
};

function ManageCategoriesExams() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingExam, setEditingExam] = useState(null); // NEW: Exam edit state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get('/exams/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // ================= Category Operations =================
  const handleEditCategory = (category) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      icon: category.icon || 'FaUniversity',
      color: category.color || 'from-blue-500 to-cyan-500'
    });
  };

  const handleUpdateCategory = async () => {
    try {
      await API.put(`/exams/admin/categories/${editingCategory.id}`, editingCategory);
      
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...editingCategory } : cat
        )
      );
      
      setEditingCategory(null);
      alert('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await API.delete(`/exams/admin/categories/${itemToDelete}`);
      setShowDeleteModal(false);
      setItemToDelete(null);
      fetchCategories();
      alert('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  };

  // ================= Exam Operations =================
  
  // NEW: Handle Exam Edit Click
  const handleEditExam = (exam) => {
    setEditingExam({
      id: exam.id,
      name: exam.name,
      short_name: exam.short_name || ''
    });
  };

  // NEW: Update Exam Logic
  const handleUpdateExam = async () => {
    try {
      await API.put(`/exams/admin/exams/${editingExam.id}`, editingExam);
      
      // Update local state without fetching all data again
      setCategories(prevCategories => 
        prevCategories.map(cat => ({
          ...cat,
          exams: (cat.exams || []).map(ex => 
            ex.id === editingExam.id ? { ...ex, ...editingExam } : ex
          )
        }))
      );
      
      setEditingExam(null);
      alert('Exam updated successfully!');
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Failed to update exam');
    }
  };

  const handleDeleteExam = async () => {
    try {
      await API.delete(`/exams/admin/exams/${itemToDelete}`);
      setShowDeleteModal(false);
      setItemToDelete(null);
      fetchCategories();
      alert('Exam deleted successfully!');
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Failed to delete exam');
    }
  };

  const filteredCategories = categories.filter(cat => {
    if (!searchTerm) return true;
    
    const matchesCategory = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = (cat.exams || []).some(exam => 
      exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.id.toString().includes(searchTerm)
    );
    
    return matchesCategory || matchesExam;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Categories <span className="text-gray-400">&</span> Exams
            </h1>
            <p className="text-gray-400">
              Total: {categories.length} categories, {categories.reduce((sum, cat) => sum + (cat.exams?.length || 0), 0)} exams
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin/create-category')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              <FiPlus />
              Add Category
            </button>
            <button
              onClick={() => navigate('/admin/create-exam')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <FiPlus />
              Add Exam
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search by category name, exam name or exam ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between p-4 bg-gray-800/50">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {expandedCategories.includes(category.id) ? (
                      <FiChevronDown size={20} />
                    ) : (
                      <FiChevronRight size={20} />
                    )}
                  </button>

                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white`}>
                    {iconMap[category.icon] || <FaUniversity />}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="text-sm text-gray-400">
                      ID: {category.id} • {category.exams?.length || 0} exams
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                  title="Edit Category"
                >
                  <FiEdit2 size={18} />
                </button>
              </div>

              {/* Exams List */}
              <AnimatePresence>
                {expandedCategories.includes(category.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-4 mb-3 px-4 text-xs font-medium text-gray-500 uppercase">
                        <div className="col-span-6">Exam Name</div>
                        <div className="col-span-3">Exam ID</div>
                        <div className="col-span-3 text-right">Actions</div>
                      </div>

                      {/* Exams */}
                      {(category.exams || []).length === 0 ? (
                        <div className="text-center py-8 text-gray-500 bg-gray-800/20 rounded-xl">
                          No exams in this category
                        </div>
                      ) : (
                        (category.exams || []).map((exam) => (
                          <div
                            key={exam.id}
                            className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-800/30 rounded-xl mb-2 hover:bg-gray-800/50 transition-colors group"
                          >
                            <div className="col-span-6 flex items-center gap-3">
                                <FiCheckCircle className="text-green-500/50" size={16} />
                                <div>
                                  <p className="font-medium text-white">{exam.name}</p>
                                  {exam.short_name && (
                                    <p className="text-xs text-gray-500">{exam.short_name}</p>
                                  )}
                                </div>
                            </div>

                            <div className="col-span-3">
                              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-mono">
                                ID: {exam.id}
                              </span>
                            </div>

                            <div className="col-span-3 flex justify-end gap-2">
                              {/* NEW: Exam Edit Button */}
                              <button
                                onClick={() => handleEditExam(exam)}
                                className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                                title="Edit Exam"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              
                              <button
                                onClick={() => {
                                  setItemToDelete(exam.id);
                                  setDeleteType('exam');
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                title="Delete Exam"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingCategory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Category Edit Modal Content Kept Unchanged */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Edit Category</h2>
                  <button onClick={() => setEditingCategory(null)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors"><FiX size={20} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Category Name</label>
                    <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Icon</label>
                    <select value={editingCategory.icon} onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                      {/* ...Options omitted for brevity but remain same... */}
                      <option value="FaUniversity">University</option>
                      <option value="FaLandmark">Landmark</option>
                      <option value="FaTrain">Train</option>
                      <option value="FaShieldAlt">Shield</option>
                      <option value="FaChalkboardTeacher">Teacher</option>
                      <option value="FaFlask">Flask</option>
                      <option value="FaGavel">Gavel</option>
                      <option value="FaLeaf">Leaf</option>
                      <option value="FaMapMarkedAlt">Map</option>
                      <option value="FaCity">City</option>
                      <option value="FaTree">Tree</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Color</label>
                    <select value={editingCategory.color} onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                      <option value="from-blue-500 to-cyan-500">Blue</option>
                      <option value="from-orange-500 to-red-500">Orange-Red</option>
                      <option value="from-green-500 to-emerald-500">Green</option>
                      <option value="from-yellow-500 to-orange-500">Yellow</option>
                      <option value="from-purple-500 to-pink-500">Purple</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setEditingCategory(null)} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
                    <button onClick={handleUpdateCategory} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"><FiSave />Save Changes</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW: Edit Exam Modal */}
      <AnimatePresence>
        {editingExam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingExam(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Edit Exam</h2>
                  <button
                    onClick={() => setEditingExam(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Exam Name</label>
                    <input
                      type="text"
                      value={editingExam.name}
                      onChange={(e) => setEditingExam({...editingExam, name: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Short Name (Optional)</label>
                    <input
                      type="text"
                      value={editingExam.short_name}
                      onChange={(e) => setEditingExam({...editingExam, short_name: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setEditingExam(null)}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateExam}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all flex items-center gap-2"
                    >
                      <FiSave />
                      Save Exam
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="text-red-500 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Delete {deleteType === 'category' ? 'Category' : 'Exam'}
                </h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete this {deleteType}? 
                  {deleteType === 'category' && ' All exams under this category will also be deleted.'}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteType === 'category' ? handleDeleteCategory : handleDeleteExam}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageCategoriesExams;