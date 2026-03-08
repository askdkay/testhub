import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { 
  FiSave, FiX, FiPlus, FiMinus, FiClock, FiDollarSign,
  FiTag, FiFileText, FiImage, FiUpload, FiTrash2,
  FiEdit2, FiCopy, FiEye, FiEyeOff, FiStar, FiAlertCircle,
  FiCheckCircle, FiDownload, FiShare2, FiSettings,
  FiCalendar, FiUsers, FiBarChart2, FiAward
} from 'react-icons/fi';
import { 
  FaBrain, FaRocket, FaRegSave, FaRegClock, 
  FaRegFileAlt, FaRegImage, FaRegStar, FaRegTrashAlt,
  FaRegEdit, FaRegCopy, FaEquals, FaSquareRootAlt,
  FaSuperscript, FaSubscript, FaInfinity
} from 'react-icons/fa';
import { LuSquarePi } from "react-icons/lu";

import { MdScience, MdCalculate } from 'react-icons/md';

// Background Image URL
const BG_IMAGE = "";

function AddTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // basic, settings, advanced
  const [mathInput, setMathInput] = useState('');
  const [showMathPalette, setShowMathPalette] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    category: 'SSC',
    // subject: 'General',
    difficulty: 'medium', // easy, medium, hard
    is_free: true,
    price: 0,
    negative_marking: 0.25,
    passing_marks: 40,
    instructions: '',
    tags: [],
    images: [],
    equations: [],
    math_content: '',
    language: 'bilingual', // english, hindi, bilingual
    attempts_allowed: 1,
    time_bound: true,
    section_wise: false,
    randomize_questions: false,
    show_answers_after: 'immediate', // immediate, end, never
    access_type: 'public', // public, private, restricted
    allowed_users: [],
    start_date: '',
    end_date: '',
    banner_image: null,
    featured: false,
    popular: false,
    draft_id: null,
    status: 'draft' // draft, published, archived
  });

  // Load drafts on component mount
  useEffect(() => {
    loadDrafts();
  }, []);

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
    setLoading(true);
    try {
      const res = await API.post('/admin/tests', {
        ...formData,
        status: 'published'
      });
      navigate(`/admin/add-questions/${res.data.testId}`);
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Failed to create test');
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
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          images: [...formData.images, {
            id: Date.now(),
            name: file.name,
            url: reader.result,
            file: file
          }]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageId) => {
    setFormData({
      ...formData,
      images: formData.images.filter(img => img.id !== imageId)
    });
  };

  const addMathEquation = () => {
    if (mathInput) {
      setFormData({
        ...formData,
        equations: [...formData.equations, {
          id: Date.now(),
          latex: mathInput,
          plain: mathInput
        }]
      });
      setMathInput('');
      setShowMathPalette(false);
    }
  };

  const removeEquation = (eqId) => {
    setFormData({
      ...formData,
      equations: formData.equations.filter(eq => eq.id !== eqId)
    });
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
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-deep-black/95 via-deep-black/90 to-deep-black/95 backdrop-blur-sm" />
      
      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-20" />

      {/* Main Content */}
      <div className="relative ml-0 lg:ml-64 min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
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
              {/* Drafts Button */}
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

              {/* Preview Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
              >
                {showPreview ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </motion.button>

              {/* Cancel Button */}
              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-red-500/50 transition-all"
              >
                <FiX className="text-red-400" />
                <span className="text-sm hidden md:inline">Cancel</span>
              </button>
            </div>
          </motion.div>

          {/* Drafts Panel */}
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

          {/* Preview Panel */}
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
                      <p>Category: {formData.category}</p>
                      <p>Price: {formData.is_free ? 'Free' : `₹${formData.price}`}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'basic', label: 'Basic Info', icon: FiFileText },
              { id: 'settings', label: 'Test Settings', icon: FiSettings },
              { id: 'advanced', label: 'Advanced', icon: FiAward }
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info Tab */}
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
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Test Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                      placeholder="e.g., SSC CGL Mock Test 2024"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                      placeholder="Describe what this test covers..."
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                    >
                      <option value="SSC">SSC CGL/CHSL</option>
                      <option value="UPSC">UPSC Civil Services</option>
                      <option value="Banking">Banking (IBPS/RRB)</option>
                      <option value="Railway">Railway (RRB NTPC)</option>
                      <option value="Defence">Defence (NDA/CDS)</option>
                      <option value="State PSC">State PSC</option>
                      <option value="Teaching">Teaching (CTET/UPTET)</option>
                    </select>
                  </div>

                  {/* Subject */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                    >
                      <option value="General">General</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="English">English</option>
                      <option value="Reasoning">Reasoning</option>
                      <option value="GK">General Knowledge</option>
                    </select>
                  </div> */}

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Difficulty Level
                    </label>
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

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({...formData, language: e.target.value})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                    >
                      <option value="english">English Only</option>
                      <option value="hindi">Hindi Only</option>
                      <option value="bilingual">Bilingual (English + Hindi)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6 space-y-6"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiSettings className="text-green-400" />
                  Test Settings
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FiClock className="inline mr-2" />
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                    />
                  </div>

                  {/* Attempts Allowed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FiUsers className="inline mr-2" />
                      Attempts Allowed
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.attempts_allowed}
                      onChange={(e) => setFormData({...formData, attempts_allowed: parseInt(e.target.value)})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                    />
                  </div>

                  {/* Pricing */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <FiDollarSign className="inline mr-2" />
                      Pricing
                    </label>
                    <div className="flex items-center space-x-4 mb-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.is_free}
                          onChange={() => setFormData({...formData, is_free: true, price: 0})}
                          className="mr-2"
                        />
                        <span>Free Test</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!formData.is_free}
                          onChange={() => setFormData({...formData, is_free: false})}
                          className="mr-2"
                        />
                        <span>Paid Test</span>
                      </label>
                    </div>

                    {!formData.is_free && (
                      <input
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                        className="w-full md:w-64 bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                        placeholder="Price in ₹"
                      />
                    )}
                  </div>

                  {/* Negative Marking */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Negative Marking (per wrong answer)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={formData.negative_marking}
                      onChange={(e) => setFormData({...formData, negative_marking: parseFloat(e.target.value)})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                    />
                  </div>

                  {/* Passing Marks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Passing Marks (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.passing_marks}
                      onChange={(e) => setFormData({...formData, passing_marks: parseInt(e.target.value)})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                    />
                  </div>

                  {/* Test Instructions */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Test Instructions
                    </label>
                    <textarea
                      rows="3"
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                      placeholder="Instructions for students before starting the test..."
                    />
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-glass-border">
                  <label className="flex items-center justify-between p-3 bg-black/30 rounded-xl">
                    <span className="text-sm">Time Bound Test</span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, time_bound: !formData.time_bound})}
                      className={`w-12 h-6 rounded-full transition-all ${
                        formData.time_bound ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                        formData.time_bound ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-black/30 rounded-xl">
                    <span className="text-sm">Section-wise Display</span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, section_wise: !formData.section_wise})}
                      className={`w-12 h-6 rounded-full transition-all ${
                        formData.section_wise ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                        formData.section_wise ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </label>

                  <label className="flex items-center justify-between p-3 bg-black/30 rounded-xl">
                    <span className="text-sm">Randomize Questions</span>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, randomize_questions: !formData.randomize_questions})}
                      className={`w-12 h-6 rounded-full transition-all ${
                        formData.randomize_questions ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                        formData.randomize_questions ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Math Equations Section */}
                <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MdCalculate className="text-green-400" />
                    Math Equations
                  </h2>

                  {/* Math Input */}
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={mathInput}
                        onChange={(e) => setMathInput(e.target.value)}
                        className="flex-1 bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                        placeholder="Enter LaTeX equation (e.g., x^2 + y^2 = z^2)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMathPalette(!showMathPalette)}
                        className="px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
                      >
                        <FaEquals />
                      </button>
                      <button
                        type="button"
                        onClick={addMathEquation}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {/* Math Symbols Palette */}
                    <AnimatePresence>
                      {showMathPalette && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 p-3 bg-black/80 border border-glass-border rounded-xl grid grid-cols-5 gap-2"
                        >
                          {mathSymbols.map((item, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setMathInput(prev => prev + ' ' + item.latex)}
                              className="p-2 bg-glass-bg rounded-lg hover:bg-green-500/20 transition-all text-center"
                              title={item.symbol}
                            >
                              <span className="text-lg">{item.symbol}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Equations List */}
                  <div className="space-y-2">
                    {formData.equations.map((eq) => (
                      <div
                        key={eq.id}
                        className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-glass-border"
                      >
                        <span className="text-green-400">{eq.latex}</span>
                        <button
                          type="button"
                          onClick={() => removeEquation(eq.id)}
                          className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiImage className="text-green-400" />
                    Images & Media
                  </h2>

                  {/* Upload Area */}
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center hover:border-green-500/50 transition-all">
                        <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                        <p className="text-gray-400">Click to upload banner image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-24 object-cover rounded-lg border border-glass-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags Section */}
                <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiTag className="text-green-400" />
                    Tags & Keywords
                  </h2>

                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="flex-1 bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/50 transition-all"
                      placeholder="Add tag (e.g., Mathematics, Reasoning)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2"
                    >
                      <FiPlus size={16} />
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center border border-green-500/30"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-green-400 hover:text-red-400 transition-colors"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured Options */}
                <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiStar className="text-green-400" />
                    Featured Options
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-3 bg-black/30 rounded-xl">
                      <span className="text-sm">Featured Test</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, featured: !formData.featured})}
                        className={`w-12 h-6 rounded-full transition-all ${
                          formData.featured ? 'bg-yellow-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          formData.featured ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </label>

                    <label className="flex items-center justify-between p-3 bg-black/30 rounded-xl">
                      <span className="text-sm">Popular Test</span>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, popular: !formData.popular})}
                        className={`w-12 h-6 rounded-full transition-all ${
                          formData.popular ? 'bg-orange-500' : 'bg-gray-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          formData.popular ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Buttons */}
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