import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { 
  FiCpu, FiZap, FiCheck, FiX, FiEdit2,
  FiSave, FiRefreshCw, FiEye, FiTrash2,
  FiPlus, FiChevronLeft, FiChevronRight,
  FiAlertCircle, FiCheckCircle, FiClock,
  FiDollarSign, FiFileText, FiSend
} from 'react-icons/fi';
import { 
  FaRobot, FaBrain, FaMagic, FaRocket,
  FaRegClock, FaRegStar, FaRegFileAlt
} from 'react-icons/fa';

function AITestGenerator() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [promptId, setPromptId] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category_id: '',
    exam_id: '',
    prompt: '',
    question_type: 'mcq',
    difficulty: 'medium',
    num_questions: 10
  });

  // Test creation form
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    duration: 60,
    is_free: true,
    price: 0,
    negative_marking: 0.25,
    passing_marks: 40,
    instructions: 'Read each question carefully. All questions are mandatory.'
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchHistory();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/ai-generator/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExams = async (categoryId) => {
    try {
      const res = await API.get(`/ai-generator/exams?category_id=${categoryId}`);
      setExams(res.data);
      setFilteredExams(res.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await API.get('/ai-generator/history');
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData({ ...formData, category_id: categoryId, exam_id: '' });
    if (categoryId) {
      fetchExams(categoryId);
    } else {
      setFilteredExams([]);
    }
  };

  const handleGenerate = async () => {
    if (!formData.prompt) {
      alert('Please enter a prompt');
      return;
    }

    setGenerating(true);
    setGeneratedQuestions([]);

    try {
      const res = await API.post('/ai-generator/generate', formData);
      
      setPromptId(res.data.promptId);
      setGeneratedQuestions(res.data.questions);
      setSuggestedTitle(res.data.suggestedTitle);
      
      // Auto-fill test form with suggested title
      setTestForm(prev => ({
        ...prev,
        title: res.data.suggestedTitle
      }));
      
      setActiveTab('review');
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions: ' + (error.response?.data?.message || error.message));
    } finally {
      setGenerating(false);
    }
  };

// ✅ FIXED: handleApproveQuestion with better ID handling
const handleApproveQuestion = async (question, approve) => {
    // Check if question has a real database ID
    if (question.id && typeof question.id === 'number') {
        try {
            await API.put(`/ai-generator/generated/${question.id}`, {
                ...question,
                is_approved: approve,
                is_rejected: !approve
            });

            // Update local state
            setGeneratedQuestions(prev =>
                prev.map(q =>
                    q.id === question.id
                        ? { ...q, is_approved: approve, is_rejected: !approve }
                        : q
                )
            );
        } catch (error) {
            console.error('Error updating question:', error);
            alert('Failed to update question');
        }
    } else {
        // For questions without database ID (temp questions)
        console.log('Updating temp question:', question.tempId);
        
        setGeneratedQuestions(prev =>
            prev.map(q => 
                q.tempId === question.tempId
                    ? { ...q, is_approved: approve, is_rejected: !approve }
                    : q
            )
        );
    }
};

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
  };

// ✅ FIXED: handleSaveEdit with temp ID handling
const handleSaveEdit = async () => {
    if (!editingQuestion) return;

    try {
        if (editingQuestion.id && typeof editingQuestion.id === 'number') {
            // Has database ID - update via API
            await API.put(`/ai-generator/generated/${editingQuestion.id}`, editingQuestion);
        }
        
        // Update local state (whether database ID or temp ID)
        setGeneratedQuestions(prev =>
            prev.map(q => {
                if (q.id === editingQuestion.id) {
                    return editingQuestion;
                }
                if (q.tempId === editingQuestion.tempId) {
                    return editingQuestion;
                }
                return q;
            })
        );
        
        setEditingQuestion(null);
    } catch (error) {
        console.error('Error updating question:', error);
        alert('Failed to update question');
    }
};

  const handlePublishTest = async (publishNow = false) => {
    const approvedQuestions = generatedQuestions.filter(q => q.is_approved);
    
    if (approvedQuestions.length === 0) {
      alert('Please approve at least one question');
      return;
    }

    if (!testForm.title) {
      alert('Please enter a test title');
      return;
    }

    try {
      const res = await API.post('/ai-generator/create-test', {
        prompt_id: promptId,
        ...testForm,
        category_id: formData.category_id,
        exam_id: formData.exam_id,
        questions: approvedQuestions,
        publish_now: publishNow
      });

      alert(`✅ Test ${publishNow ? 'published' : 'saved as draft'} successfully!`);
      
      if (publishNow) {
        navigate('/admin/tests');
      } else {
        navigate(`/admin/add-questions/${res.data.testId}`);
      }
      
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Failed to create test: ' + (error.response?.data?.message || error.message));
    }
  };

  const approvedCount = generatedQuestions.filter(q => q.is_approved).length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FaBrain className="text-purple-400" />
              AI Test Generator
              <span className="text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                v2.0 - Auto Publish
              </span>
            </h1>
            <p className="text-gray-400">
              Generate complete tests with AI - Title, Questions, and One-click Publish
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'generate'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <FaRobot />
            Generate
          </button>
          <button
            onClick={() => setActiveTab('review')}
            disabled={generatedQuestions.length === 0}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'review'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 disabled:opacity-50'
            }`}
          >
            <FiEye />
            Review ({approvedCount}/{generatedQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <FiClock />
            History
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Input Form */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaMagic className="text-purple-400" />
                  Generation Settings
                </h2>

                <div className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Exam Category (Optional)
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Exam Selection */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Specific Exam (Optional)
                    </label>
                    <select
                      value={formData.exam_id}
                      onChange={(e) => setFormData({...formData, exam_id: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      disabled={!formData.category_id}
                    >
                      <option value="">Select Exam</option>
                      {filteredExams.map(exam => (
                        <option key={exam.id} value={exam.id}>{exam.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Question Type */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Question Type
                    </label>
                    <select
                      value={formData.question_type}
                      onChange={(e) => setFormData({...formData, question_type: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="mcq">📝 Multiple Choice Questions</option>
                      <option value="true_false">✓✗ True/False</option>
                      <option value="fill_blanks">___ Fill in Blanks</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="easy">🟢 Easy</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="hard">🔴 Hard</option>
                    </select>
                  </div>

                  {/* Number of Questions */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.num_questions}
                      onChange={(e) => setFormData({...formData, num_questions: parseInt(e.target.value)})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Prompt */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Your Prompt *
                    </label>
                    <textarea
                      value={formData.prompt}
                      onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                      rows="4"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                      placeholder="E.g., Generate questions about Cell Biology for NEET, focus on mitosis and meiosis..."
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !formData.prompt}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FaRocket />
                        Generate Complete Test
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">How it works</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">1</div>
                    <div>
                      <h3 className="font-semibold text-white">AI Generates Test Title</h3>
                      <p className="text-sm text-gray-400">Based on your prompt and selected exam, AI creates a professional test title</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">2</div>
                    <div>
                      <h3 className="font-semibold text-white">Questions are Generated</h3>
                      <p className="text-sm text-gray-400">MCQs with options, correct answers, and explanations in English & Hindi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">3</div>
                    <div>
                      <h3 className="font-semibold text-white">Review & Approve</h3>
                      <p className="text-sm text-gray-400">Approve or reject individual questions, edit if needed</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 font-bold">4</div>
                    <div>
                      <h3 className="font-semibold text-white">One-Click Publish</h3>
                      <p className="text-sm text-gray-400">Test is created and published immediately to the database</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'review' && generatedQuestions.length > 0 && (
          <div className="space-y-6">
            {/* Test Configuration Card */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Test Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Test Title *</label>
                  <input
                    type="text"
                    value={testForm.title}
                    onChange={(e) => setTestForm({...testForm, title: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Enter test title"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={testForm.duration}
                    onChange={(e) => setTestForm({...testForm, duration: parseInt(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-400 mb-2">Description</label>
                  <textarea
                    value={testForm.description}
                    onChange={(e) => setTestForm({...testForm, description: e.target.value})}
                    rows="2"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Brief description of the test"
                  />
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">
                  Generated Questions ({approvedCount}/{generatedQuestions.length} approved)
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePublishTest(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FiSave />
                    Save as Draft
                  </button>
                  <button
                    onClick={() => setShowPublishModal(true)}
                    disabled={approvedCount === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <FiSend />
                    Publish Test ({approvedCount} Q)
                  </button>
                </div>
              </div>

              {generatedQuestions.map((question, index) => (
                <motion.div
                  key={question.id || question.tempId || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-gray-900/50 border rounded-xl p-6 transition-all ${
                    question.is_approved
                      ? 'border-green-500/50 bg-green-500/5'
                      : question.is_rejected
                      ? 'border-red-500/50 bg-red-500/5'
                      : 'border-gray-800 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Q{index + 1}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {question.difficulty}
                      </span>
                      {question.topic && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                          {question.topic}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveQuestion(question, true)}
                        className={`p-2 rounded-lg transition-colors ${
                          question.is_approved
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-800 text-gray-400 hover:bg-green-500/20 hover:text-green-400'
                        }`}
                        title="Approve"
                      >
                        <FiCheck size={16} />
                      </button>
                      <button
                        onClick={() => handleApproveQuestion(question, false)}
                        className={`p-2 rounded-lg transition-colors ${
                          question.is_rejected
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-800 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                        }`}
                        title="Reject"
                      >
                        <FiX size={16} />
                      </button>
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-white font-medium">{question.question_text}</p>
                    {question.question_text_hindi && (
                      <p className="text-sm text-gray-400 border-t border-gray-800 pt-2">
                        {question.question_text_hindi}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <div key={opt} className="flex items-center gap-2 text-sm">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            question.correct_answer === opt 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {opt}
                          </span>
                          <span className="text-gray-300">{question[`option_${opt.toLowerCase()}`]}</span>
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="mt-3 p-3 bg-gray-800/30 rounded-lg">
                        <p className="text-sm text-green-400 font-medium mb-1">✓ Explanation:</p>
                        <p className="text-sm text-gray-400">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Generation History</h2>
            <div className="space-y-3">
              {history.map(item => (
                <div key={item.id} className="p-4 bg-gray-800/30 rounded-lg">
                  <p className="text-white font-medium">{item.prompt_text}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {item.generated_count} questions • {item.approved_count} approved
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Publish Confirmation Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Publish Test</h3>
              <p className="text-gray-400 mb-4">
                You are about to publish "{testForm.title}" with {approvedCount} approved questions.
                This test will be immediately available to students.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handlePublishTest(true);
                    setShowPublishModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Publish Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Question Modal */}
      <AnimatePresence>
        {editingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingQuestion(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Edit Question</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Question (English)</label>
                    <textarea
                      value={editingQuestion.question_text}
                      onChange={(e) => setEditingQuestion({...editingQuestion, question_text: e.target.value})}
                      rows="2"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Question (Hindi)</label>
                    <textarea
                      value={editingQuestion.question_text_hindi || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, question_text_hindi: e.target.value})}
                      rows="2"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Option A</label>
                      <input
                        type="text"
                        value={editingQuestion.option_a}
                        onChange={(e) => setEditingQuestion({...editingQuestion, option_a: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Option B</label>
                      <input
                        type="text"
                        value={editingQuestion.option_b}
                        onChange={(e) => setEditingQuestion({...editingQuestion, option_b: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Option C</label>
                      <input
                        type="text"
                        value={editingQuestion.option_c}
                        onChange={(e) => setEditingQuestion({...editingQuestion, option_c: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Option D</label>
                      <input
                        type="text"
                        value={editingQuestion.option_d}
                        onChange={(e) => setEditingQuestion({...editingQuestion, option_d: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Correct Answer</label>
                      <select
                        value={editingQuestion.correct_answer}
                        onChange={(e) => setEditingQuestion({...editingQuestion, correct_answer: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
                      <select
                        value={editingQuestion.difficulty}
                        onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Topic</label>
                      <input
                        type="text"
                        value={editingQuestion.topic || ''}
                        onChange={(e) => setEditingQuestion({...editingQuestion, topic: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Explanation</label>
                    <textarea
                      value={editingQuestion.explanation || ''}
                      onChange={(e) => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                      rows="3"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AITestGenerator;