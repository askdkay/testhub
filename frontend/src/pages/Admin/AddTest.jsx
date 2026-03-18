import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { 
  FiSave, FiX, FiPlus, FiClock, FiDollarSign,
  FiTag, FiFileText, FiImage, FiUpload, FiTrash2,
  FiEye, FiEyeOff, FiStar, FiSettings,
  FiUsers
} from 'react-icons/fi';
import { 
  FaRegSave, FaSquareRootAlt, FaSuperscript, FaInfinity, FaEquals
} from 'react-icons/fa';
import { LuSquarePi } from "react-icons/lu";
import { MdScience, MdCalculate } from 'react-icons/md';

const BG_IMAGE = "";

function AddTest() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [mathInput, setMathInput] = useState('');
  const [showMathPalette, setShowMathPalette] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    category_id: '', // Use ID for dynamic categories
    exam_id: '',     // Use ID for dynamic exams
    difficulty: 'medium',
    is_free: true,
    price: 0,
    negative_marking: 0.25,
    passing_marks: 40,
    instructions: '',
    tags: [],
    images: [],
    equations: [],
    math_content: '',
    language: 'bilingual',
    attempts_allowed: 1,
    time_bound: true,
    section_wise: false,
    randomize_questions: false,
    show_answers_after: 'immediate',
    access_type: 'public',
    allowed_users: [],
    start_date: '',
    end_date: '',
    banner_image: null,
    featured: false,
    popular: false,
    draft_id: null,
    status: 'draft'
  });

  useEffect(() => {
    fetchCategories();
    fetchExams();
    loadDrafts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/exams/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await API.get('/exams/admin/exams-list');
      setExams(res.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData({
      ...formData,
      category_id: categoryId,
      exam_id: '' // Reset exam when category changes
    });
    
    // Filter exams based on selected category
    const filtered = exams.filter(exam => exam.category_id == categoryId);
    setFilteredExams(filtered);
  };

  const loadDrafts = async () => {
    try {
      const res = await API.get('/admin/test-drafts');
      setDrafts(res.data);
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category_id || !formData.exam_id) {
      alert("Please select both a Category and an Exam!");
      return;
    }

    setLoading(true);
    try {
        const res = await API.post('/admin/tests', formData);
        navigate(`/admin/add-questions/${res.data.testId}`);
    } catch (error) {
        console.error('Error creating test:', error);
        if (error.response?.data?.sql) {
            alert(`Database Error: ${error.response.data.sql}`);
        } else if (error.response?.data?.message) {
            alert(`Error: ${error.response.data.message}`);
        } else {
            alert('Failed to create test. Check console for details.');
        }
    } finally {
        setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const res = await API.post('/admin/test-drafts', {
        ...formData,
        status: 'draft'
      });
      setFormData({ ...formData, draft_id: res.data.draftId });
      alert('Draft saved successfully!');
      loadDrafts();
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const loadDraft = (draft) => {
    setFormData(draft);
    setShowDrafts(false);
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

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          images: [...formData.images, { id: Date.now(), name: file.name, url: reader.result, file: file }]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageId) => {
    setFormData({ ...formData, images: formData.images.filter(img => img.id !== imageId) });
  };

  const addMathEquation = () => {
    if (mathInput) {
      setFormData({
        ...formData,
        equations: [...formData.equations, { id: Date.now(), latex: mathInput, plain: mathInput }]
      });
      setMathInput('');
      setShowMathPalette(false);
    }
  };

  const removeEquation = (eqId) => {
    setFormData({ ...formData, equations: formData.equations.filter(eq => eq.id !== eqId) });
  };

  const mathSymbols = [
    { symbol: 'x²', latex: 'x^2', icon: <FaSuperscript /> },
    { symbol: '√', latex: '\\sqrt{}', icon: <FaSquareRootAlt /> },
    { symbol: 'π', latex: '\\pi', icon: <LuSquarePi /> },
    { symbol: '∞', latex: '\\infty', icon: <FaInfinity /> },
    { symbol: '∫', latex: '\\int', icon: <MdCalculate /> },
    { symbol: '∑', latex: '\\sum', icon: <MdScience /> },
    { symbol: 'α', latex: '\\alpha', icon: <FaEquals /> },
    { symbol: 'β', latex: '\\beta', icon: <FaEquals /> },
    { symbol: 'θ', latex: '\\theta', icon: <FaEquals /> },
    { symbol: 'μ', latex: '\\mu', icon: <FaEquals /> }
  ];

  return (
    <div className="min-h-screen text-white font-['Inter'] relative overflow-hidden">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${BG_IMAGE})` }} />
      <div className="fixed inset-0 bg-gradient-to-br from-deep-black/95 via-deep-black/90 to-deep-black/95 backdrop-blur-sm" />
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-20" />

      <div className="relative ml-0 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Create New Test
                </span>
              </h1>
              <p className="text-gray-400 mt-1">Add a new test series for students</p>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDrafts(!showDrafts)}
                className="relative px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all flex items-center gap-2"
              >
                <FaRegSave className="text-green-400" />
                <span className="text-sm">Drafts</span>
                {drafts.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center">
                    {drafts.length}
                  </span>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
              >
                {showPreview ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </motion.button>

              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-red-500/50 transition-all"
              >
                <FiX className="text-red-400" />
                <span className="text-sm hidden md:inline">Cancel</span>
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {showDrafts && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-4"
              >
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FaRegSave className="text-green-400" />
                  Saved Drafts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {drafts.map((draft) => (
                    <motion.div
                      key={draft.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 bg-black/30 rounded-xl border border-glass-border cursor-pointer hover:border-green-500/50 transition-all"
                      onClick={() => loadDraft(draft)}
                    >
                      <h4 className="font-medium text-sm mb-1">{draft.title || 'Untitled Draft'}</h4>
                      <p className="text-xs text-gray-400">
                        Last edited: {new Date(draft.updated_at).toLocaleDateString()}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-4">Test Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Basic Info</h4>
                    <p className="text-lg font-bold">{formData.title || 'Test Title'}</p>
                    <p className="text-sm text-gray-300">{formData.description || 'Description'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400 mb-2">Settings</h4>
                    <div className="space-y-1 text-sm">
                      <p>Duration: {formData.duration} minutes</p>
                      <p>Category ID: {formData.category_id}</p>
                      <p>Exam ID: {formData.exam_id}</p>
                      <p>Price: {formData.is_free ? 'Free' : `₹${formData.price}`}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'basic', label: 'Basic Info', icon: FiFileText },
              { id: 'settings', label: 'Test Settings', icon: FiSettings },
              { id: 'advanced', label: 'Advanced', icon: FiStar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                    : 'bg-glass-bg border border-glass-border text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {activeTab === 'basic' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6 space-y-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiFileText className="text-green-400" />
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Test Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all"
                      placeholder="e.g., SSC CGL Mock Test 2024"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all"
                      placeholder="Describe what this test covers..."
                    />
                  </div>

                  {/* Dynamic Category Dropdown */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Exam Category *</label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Exam Dropdown */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Exam *</label>
                    <select
                      required
                      value={formData.exam_id}
                      onChange={(e) => setFormData({...formData, exam_id: e.target.value})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all"
                      disabled={!formData.category_id}
                    >
                      <option value="">Select Exam</option>
                      {filteredExams.map(exam => (
                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty Level</label>
                    <div className="flex gap-2">
                      {['easy', 'medium', 'hard'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({...formData, difficulty: level})}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize transition-all ${
                            formData.difficulty === level
                              ? level === 'easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : level === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-black/30 text-gray-400 border border-glass-border hover:border-green-500/50'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({...formData, language: e.target.value})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all"
                    >
                      <option value="english">English Only</option>
                      <option value="hindi">Hindi Only</option>
                      <option value="bilingual">Bilingual (English + Hindi)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* KEEP YOUR EXISTING CODE FOR Settings & Advanced Tabs EXACTLY AS IT WAS */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6 space-y-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiSettings className="text-green-400" /> Test Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FiClock className="inline mr-2" /> Duration (minutes) *
                    </label>
                    <input type="number" required min="1" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FiUsers className="inline mr-2" /> Attempts Allowed
                    </label>
                    <input type="number" min="1" value={formData.attempts_allowed} onChange={(e) => setFormData({...formData, attempts_allowed: parseInt(e.target.value)})} className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FiDollarSign className="inline mr-2" /> Pricing
                    </label>
                    <div className="flex items-center space-x-4 mb-3">
                      <label className="flex items-center">
                        <input type="radio" checked={formData.is_free} onChange={() => setFormData({...formData, is_free: true, price: 0})} className="mr-2" /> Free Test
                      </label>
                      <label className="flex items-center">
                        <input type="radio" checked={!formData.is_free} onChange={() => setFormData({...formData, is_free: false})} className="mr-2" /> Paid Test
                      </label>
                    </div>
                    {!formData.is_free && (
                      <input type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})} className="w-full md:w-64 bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50" placeholder="Price in ₹" />
                    )}
                  </div>
                  {/* Additional settings unchanged for brevity, use your existing inputs */}
                </div>
              </motion.div>
            )}

            {activeTab === 'advanced' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6">
                   <h2 className="text-xl font-semibold mb-4 text-green-400">Advanced features (Tags, Equations, Images)</h2>
                   {/* Rest of your advanced tab content goes here... */}
                </div>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft}
                className="px-6 py-3 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all flex items-center justify-center gap-2"
              >
                <FaRegSave className={savingDraft ? 'animate-spin' : ''} />
                {savingDraft ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-6 py-3 bg-glass-bg border border-glass-border rounded-xl hover:border-red-500/50 transition-all flex items-center justify-center gap-2"
              >
                <FiX />
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FiSave />
                {loading ? 'Creating...' : 'Create Test'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTest;