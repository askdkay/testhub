import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import Breadcrumbs from '../../components/Breadcrumbs';
import { 
  FiFileText, FiEdit2, FiTrash2, FiEye, FiPlus,
  FiSearch, FiChevronDown, FiX, FiClock,
  FiAlertCircle, FiBarChart2, FiCopy, FiSave, FiCheck
} from 'react-icons/fi';
import { 
  FaRupeeSign, FaGraduationCap, FaRegFileAlt, FaCheckCircle
} from 'react-icons/fa';

function TestManagement() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Filtering & Dropdown
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals State
  const [editingTest, setEditingTest] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedTestQuestions, setSelectedTestQuestions] = useState([]);
  
  // Stats
  const [stats, setStats] = useState({
    totalTests: 0,
    totalQuestions: 0,
    categoryWise: {},
    publishedTests: 0,
    draftTests: 0
  });
  const breadcrumbPaths = [
    { name: 'Admin Dashboard', href: '/admin' },
    // { name: 'Users', href: '/admin/users' },
    { name: 'Tests', href: '/admin/users/tests' } // Ye current page hai, automatically blue aur unclickable ho jayega
  ];
  useEffect(() => {
    fetchTests();
    fetchCategories();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/tests');
      const testsData = res.data;
      setTests(testsData);

      const categoryWise = {};
      let totalQuestions = 0;
      let published = 0;
      let drafts = 0;

      testsData.forEach(test => {
        categoryWise[test.category] = (categoryWise[test.category] || 0) + 1;
        totalQuestions += test.total_questions || 0;
        if (test.status === 'published') published++;
        else if (test.status === 'draft') drafts++;
      });

      setStats({
        totalTests: testsData.length,
        totalQuestions,
        categoryWise,
        publishedTests: published,
        draftTests: drafts
      });

    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get('/admin/test-categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTestQuestions = async (testId) => {
    try {
      const res = await API.get(`/admin/tests/${testId}/questions`);
      setSelectedTestQuestions(res.data);
      setShowQuestionModal(true);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleDeleteTest = async () => {
    try {
      await API.delete(`/admin/tests/${testToDelete.id}`);
      setTests(tests.filter(t => t.id !== testToDelete.id));
      setShowDeleteModal(false);
      setTestToDelete(null);
      fetchTests(); 
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const handleUpdateTest = async () => {
    try {
      await API.put(`/admin/tests/${editingTest.id}`, editingTest);
      setTests(tests.map(t => t.id === editingTest.id ? editingTest : t));
      setEditingTest(null);
      fetchTests(); 
    } catch (error) {
      console.error('Error updating test:', error);
    }
  };

  const handleDuplicateTest = async (test) => {
    try {
      const { id, ...testData } = test;
      testData.title = `${testData.title} (Copy)`;
      testData.status = 'draft';
      await API.post('/admin/tests', testData);
      fetchTests();
    } catch (error) {
      console.error('Error duplicating test:', error);
    }
  };

  // Filter tests for the single table view
  const filteredTests = tests.filter(test => {
    const matchesCategory = selectedCategory === 'all' || test.category === selectedCategory;
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      
      {/* Main Content */}
      <div className="ml-0  min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <Breadcrumbs paths={breadcrumbPaths} />
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 mb-1">
              Test Management
            </h1>
            <p className="text-slate-400 text-sm">Manage and organize your test series easily.</p>
          </motion.div>

          {/* Simple Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {[
              { label: 'Total Tests', val: stats.totalTests, icon: FiFileText, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'Questions', val: stats.totalQuestions, icon: FaGraduationCap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
              { label: 'Published', val: stats.publishedTests, icon: FaCheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Drafts', val: stats.draftTests, icon: FaRegFileAlt, color: 'text-amber-400', bg: 'bg-amber-400/10' },
              { label: 'Categories', val: Object.keys(stats.categoryWise).length, icon: FiBarChart2, color: 'text-purple-400', bg: 'bg-purple-400/10' }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-medium">{stat.label}</p>
                  <h3 className="text-xl font-semibold text-slate-50 mt-1">{stat.val}</h3>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={18} />
                </div>
              </div>
            ))}
          </motion.div>

          {/* Search, Filter & Actions Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
            
            <div className="flex flex-1 gap-4 w-full">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              {/* Custom Dropdown for Categories */}
              <div className="relative min-w-[200px]">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg py-2 px-4 text-sm text-slate-200 hover:border-slate-700 transition-all"
                >
                  <span className="truncate">
                    {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                  </span>
                  <FiChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-800 rounded-lg shadow-xl z-20 overflow-hidden"
                    >
                      <div className="max-h-60 overflow-y-auto py-1">
                        <button
                          onClick={() => { setSelectedCategory('all'); setIsDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-800 transition-colors ${selectedCategory === 'all' ? 'text-indigo-400 bg-slate-800/50' : 'text-slate-300'}`}
                        >
                          All Categories
                        </button>
                        {Object.keys(stats.categoryWise).map(cat => (
                          <button
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); setIsDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-800 transition-colors flex justify-between items-center ${selectedCategory === cat ? 'text-indigo-400 bg-slate-800/50' : 'text-slate-300'}`}
                          >
                            <span>{cat}</span>
                            <span className="text-xs text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full">
                              {stats.categoryWise[cat]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={() => navigate('/admin/add-test')}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <FiPlus />
              New Test
            </button>
          </div>

          {/* Single Unified Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-medium text-slate-400">Test Title</th>
                    <th className="py-3 px-4 font-medium text-slate-400">Category</th>
                    <th className="py-3 px-4 font-medium text-slate-400">Duration</th>
                    <th className="py-3 px-4 font-medium text-slate-400">Questions</th>
                    <th className="py-3 px-4 font-medium text-slate-400">Status</th>
                    <th className="py-3 px-4 font-medium text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        No tests found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map((test) => (
                      <tr key={test.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-200">{test.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">{test.description}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-xs">
                            {test.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <FiClock size={14} /> {test.duration} min
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {test.total_questions || 0} Qs
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            test.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' :
                            test.status === 'draft' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-slate-500/10 text-slate-400'
                          }`}>
                            {test.status || 'draft'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => fetchTestQuestions(test.id)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-md transition-colors" title="View">
                              <FiEye size={16} />
                            </button>
                            <button onClick={() => setEditingTest(test)} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-md transition-colors" title="Edit">
                              <FiEdit2 size={16} />
                            </button>
                            <button onClick={() => handleDuplicateTest(test)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors" title="Duplicate">
                              <FiCopy size={16} />
                            </button>
                            <button onClick={() => { setTestToDelete(test); setShowDeleteModal(true); }} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors" title="Delete">
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Test Modal (Tailwind UI Style) */}
          <AnimatePresence>
            {editingTest && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl"
                >
                  <div className="flex justify-between items-center p-5 border-b border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-100">Edit Test Details</h2>
                    <button onClick={() => setEditingTest(null)} className="text-slate-400 hover:text-slate-200">
                      <FiX size={20} />
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateTest(); }} className="p-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Test Title</label>
                      <input
                        type="text" value={editingTest.title}
                        onChange={(e) => setEditingTest({...editingTest, title: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                      <textarea
                        rows="3" value={editingTest.description}
                        onChange={(e) => setEditingTest({...editingTest, description: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                        <select
                          value={editingTest.category}
                          onChange={(e) => setEditingTest({...editingTest, category: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          {Object.keys(stats.categoryWise).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
                        <select
                          value={editingTest.status}
                          onChange={(e) => setEditingTest({...editingTest, status: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                      <button type="button" onClick={() => setEditingTest(null)} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
                        <FiSave /> Save Changes
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Delete Modal */}
          <AnimatePresence>
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-6 text-center shadow-2xl"
                >
                  <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiAlertCircle className="text-rose-500 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">Delete Test</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Are you sure you want to delete <span className="text-slate-200">"{testToDelete?.title}"</span>? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleDeleteTest} className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition-colors">
                      Delete
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

export default TestManagement;