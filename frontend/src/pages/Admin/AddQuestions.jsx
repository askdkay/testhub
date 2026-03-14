import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { 
  FiUpload, FiPlus, FiTrash2, FiCopy, FiCheck, 
  FiEye, FiEyeOff, FiSave, FiX, FiEdit2, FiList,
  FiGrid, FiAlertCircle, FiCheckCircle, FiClock,
  FiFileText, FiBookOpen, FiAward, FiStar,
  FiChevronLeft, FiChevronRight, FiDownload
} from 'react-icons/fi';
import { 
  FaBrain, FaRocket, FaRegSave, FaRegFileAlt,
  FaRegImage, FaRegStar, FaRegCheckCircle,
  FaRegEdit, FaRegCopy, FaRegTrashAlt
} from 'react-icons/fa';
import * as XLSX from 'xlsx';

// Background Image URL
const BG_IMAGE = "";
function AddQuestions() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(0);
  const [testDetails, setTestDetails] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('draft'); // draft, saved, published

  useEffect(() => {
    // Add first empty question if no questions
    if (questions.length === 0) {
      addQuestion();
    }
    // Load test details
    loadTestDetails();
  }, []);

  const loadTestDetails = async () => {
    try {
      const res = await API.get(`/tests/${testId}`);
      setTestDetails(res.data);
    } catch (error) {
      console.error('Error loading test details:', error);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now() + Math.random(),
        question_text: '',
        question_text_hindi: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: '',
        explanation_hindi: '',
        marks: 4,
        difficulty: 'medium',
        topic: '',
        image: null,
        equation: ''
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const duplicateQuestion = (index) => {
    const questionToCopy = { ...questions[index], id: Date.now() + Math.random() };
    setQuestions([...questions.slice(0, index + 1), questionToCopy, ...questions.slice(index + 1)]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
    setSaveStatus('draft');
    
    // Validate field
    validateField(index, field, value);
  };

  const validateField = (index, field, value) => {
    const errors = { ...validationErrors };
    const questionIndex = `q${index}`;
    
    if (!errors[questionIndex]) {
      errors[questionIndex] = {};
    }

    if (field === 'question_text' && !value.trim()) {
      errors[questionIndex].question_text = 'Question text is required';
    } else if (field === 'question_text') {
      delete errors[questionIndex].question_text;
    }

    ['option_a', 'option_b', 'option_c', 'option_d'].forEach(opt => {
      if (field === opt && !value.trim()) {
        errors[questionIndex][opt] = 'Option is required';
      } else if (field === opt) {
        delete errors[questionIndex][opt];
      }
    });

    setValidationErrors(errors);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      
      const newQuestions = json.map(row => ({
        id: Date.now() + Math.random(),
        question_text: row.Question || row.question || '',
        question_text_hindi: row['Question Hindi'] || '',
        option_a: row['Option A'] || row.option_a || '',
        option_b: row['Option B'] || row.option_b || '',
        option_c: row['Option C'] || row.option_c || '',
        option_d: row['Option D'] || row.option_d || '',
        correct_answer: row['Correct Answer'] || row.correct_answer || 'A',
        explanation: row.Explanation || row.explanation || '',
        explanation_hindi: row['Explanation Hindi'] || '',
        marks: row.Marks || 4,
        difficulty: row.Difficulty || 'medium',
        topic: row.Topic || ''
      }));
      
      setQuestions([...questions, ...newQuestions]);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 2000);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const validateAllQuestions = () => {
    const errors = {};
    let isValid = true;

    questions.forEach((q, index) => {
      const qErrors = {};
      
      if (!q.question_text?.trim()) {
        qErrors.question_text = 'Question text is required';
        isValid = false;
      }
      
      if (!q.option_a?.trim()) {
        qErrors.option_a = 'Option A is required';
        isValid = false;
      }
      
      if (!q.option_b?.trim()) {
        qErrors.option_b = 'Option B is required';
        isValid = false;
      }
      
      if (Object.keys(qErrors).length > 0) {
        errors[`q${index}`] = qErrors;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
await API.post('/admin/questions', {
  testId: testId,  // Make sure it's sending the ID
  questions: questions  // Make sure it's sending array
});
      setSaveStatus('saved');
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    if (!validateAllQuestions()) {
      alert('Please fill all required fields before preview');
      return;
    }
    setShowPreview(true);
  };

const handlePublish = async () => {
  if (!validateAllQuestions()) {
    alert('Please fill all required fields before publishing');
    return;
  }

  setLoading(true);
  try {
    // Step 1: Save questions
    console.log('Saving questions for test:', testId);
    const questionsRes = await API.post('/admin/questions', {
      testId: testId,  // Make sure testId is sent correctly
      questions: questions.map(q => ({
        question_text: q.question_text,
        question_text_hindi: q.question_text_hindi || '',
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation || '',
        explanation_hindi: q.explanation_hindi || '',
        marks: q.marks || 4,
        difficulty: q.difficulty || 'medium',
        topic: q.topic || '',
        image_url: q.image_url || null
      }))
    });
    
    console.log('Questions saved:', questionsRes.data);

    // Step 2: Publish test
    const publishRes = await API.post(`/admin/tests/${testId}/publish`);
    console.log('Test published:', publishRes.data);
    
    setSaveStatus('published');
    alert('Test published successfully!');
    navigate('/admin/tests');
    
  } catch (error) {
    console.error('Error publishing test:', error);
    console.error('Error response:', error.response?.data);
    alert('Failed to publish test: ' + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
};

  const getStatusColor = (index) => {
    const q = questions[index];
    if (!q.question_text || !q.option_a || !q.option_b) return 'bg-gray-600';
    if (validationErrors[`q${index}`]) return 'bg-red-500';
    return 'bg-green-500';
  };

  const getProgressPercentage = () => {
    const completed = questions.filter(q => 
      q.question_text?.trim() && q.option_a?.trim() && q.option_b?.trim()
    ).length;
    return Math.round((completed / questions.length) * 100);
  };

  return (
    <div className="min-h-screen text-white font-['Inter'] relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className=" bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      <div className=" bg-gradient-to-br from-deep-black/95 via-gray-900/95 to-deep-black/95 backdrop-blur-sm" />
      
      {/* Grid Pattern */}
      <div className=" bg-grid-pattern bg-[length:40px_40px] opacity-10" />

      {/* Main Content */}
      <div className="relative ml-0  min-h-screen">
        
        {/* Header */}
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-glass-bg border-b border-glass-border p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Add Questions
                </span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Test: {testDetails?.title || `ID: ${testId}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Progress Indicator */}
              <div className="hidden md:block w-48">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-green-400">{getProgressPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
              </div>

              {/* Toggle Sidebar */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
              >
                <FiList size={20} />
              </button>

              {/* Bulk Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <button className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all">
                  <FiUpload className="text-green-400" />
                  <span className="hidden md:inline">Bulk Upload</span>
                </button>
              </div>

              {/* Preview Button */}
              <button
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-blue-500/50 transition-all"
              >
                <FiEye className="text-blue-400" />
                <span className="hidden md:inline">Preview</span>
              </button>

              {/* Save Draft */}
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-yellow-500/50 transition-all"
              >
                <FaRegSave className="text-yellow-400" />
                <span className="hidden md:inline">Save Draft</span>
              </button>

              {/* Publish Button */}
              <button
                onClick={handlePublish}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
              >
                <FaRocket className="text-white" />
                <span>{loading ? 'Publishing...' : 'Publish Test'}</span>
              </button>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Uploading...</span>
                <span className="text-green-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="flex">
          
          {/* Question List Sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className=" bottom-0 w-72 bg-glass-bg border-r border-glass-border backdrop-blur-xl overflow-y-auto p-4 z-20"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FiList className="text-green-400" />
                    Questions ({questions.length})
                  </h3>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden text-gray-400 hover:text-white"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {/* Progress Stats */}
                <div className="mb-6 p-4 bg-black/30 rounded-xl border border-glass-border">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-2xl font-bold text-green-400">
                        {questions.filter(q => q.question_text?.trim()).length}
                      </p>
                      <p className="text-xs text-gray-400">Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-400">
                        {questions.filter(q => !q.question_text?.trim()).length}
                      </p>
                      <p className="text-xs text-gray-400">Pending</p>
                    </div>
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-2">
                  {questions.map((q, index) => (
                    <motion.button
                      key={q.id}
                      whileHover={{ x: 5 }}
                      onClick={() => {
                        document.getElementById(`question-${index}`)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full flex items-center justify-between p-3 bg-black/30 rounded-xl border border-glass-border hover:border-green-500/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(index)}`} />
                        <span className="text-sm">Question {index + 1}</span>
                      </div>
                      {validationErrors[`q${index}`] && (
                        <FiAlertCircle className="text-red-400" size={14} />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Add Question Button */}
                <button
                  onClick={addQuestion}
                  className="w-full mt-4 p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-dashed border-green-500/30 rounded-xl text-green-400 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <FiPlus />
                  Add New Question
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Questions Form Area */}
          <div className={`flex-1 p-6 transition-all ${showSidebar ? 'lg:ml-0' : ''}`}>
            <div className="space-y-6 max-w-4xl mx-auto">
              {questions.map((q, index) => (
                <motion.div
                  key={q.id}
                  id={`question-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6 hover:border-green-500/30 transition-all"
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        validationErrors[`q${index}`] 
                          ? 'bg-red-500/20 text-red-400'
                          : q.question_text && q.option_a && q.option_b
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">Question {index + 1}</h3>
                        {validationErrors[`q${index}`] && (
                          <p className="text-xs text-red-400 mt-1">
                            {Object.values(validationErrors[`q${index}`]).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => duplicateQuestion(index)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all"
                        title="Duplicate"
                      >
                        <FiCopy size={18} />
                      </button>
                      <button
                        onClick={() => removeQuestion(index)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                        title="Delete"
                        disabled={questions.length === 1}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Question Form */}
                  <div className="space-y-4">
                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Question Text (English) *
                      </label>
                      <textarea
                        rows="2"
                        value={q.question_text}
                        onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                        className={`w-full bg-black/50 border ${
                          validationErrors[`q${index}`]?.question_text
                            ? 'border-red-500/50'
                            : 'border-glass-border'
                        } rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all`}
                        placeholder="Enter your question in English..."
                      />
                    </div>

                    {/* Hindi Translation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Question Text (Hindi) - Optional
                      </label>
                      <textarea
                        rows="2"
                        value={q.question_text_hindi}
                        onChange={(e) => handleQuestionChange(index, 'question_text_hindi', e.target.value)}
                        className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all"
                        placeholder="प्रश्न हिंदी में दर्ज करें..."
                      />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const field = `option_${opt.toLowerCase()}`;
                        return (
                          <div key={opt}>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Option {opt} *
                            </label>
                            <input
                              type="text"
                              value={q[field]}
                              onChange={(e) => handleQuestionChange(index, field, e.target.value)}
                              className={`w-full bg-black/50 border ${
                                validationErrors[`q${index}`]?.[field]
                                  ? 'border-red-500/50'
                                  : 'border-glass-border'
                              } rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all`}
                              placeholder={`Option ${opt}`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Additional Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Correct Answer */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Correct Answer *
                        </label>
                        <select
                          value={q.correct_answer}
                          onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                          className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>

                      {/* Marks */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Marks
                        </label>
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => handleQuestionChange(index, 'marks', parseInt(e.target.value))}
                          className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all"
                          min="1"
                          max="10"
                        />
                      </div>

                      {/* Difficulty */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Difficulty
                        </label>
                        <select
                          value={q.difficulty}
                          onChange={(e) => handleQuestionChange(index, 'difficulty', e.target.value)}
                          className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    {/* Topic */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Topic (e.g., Algebra, Grammar, History)
                      </label>
                      <input
                        type="text"
                        value={q.topic}
                        onChange={(e) => handleQuestionChange(index, 'topic', e.target.value)}
                        className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all"
                        placeholder="Enter topic..."
                      />
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Explanation (English)
                      </label>
                      <textarea
                        rows="2"
                        value={q.explanation}
                        onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                        className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all"
                        placeholder="Explain why this answer is correct..."
                      />
                    </div>

                    {/* Hindi Explanation */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Explanation (Hindi) - Optional
                      </label>
                      <textarea
                        rows="2"
                        value={q.explanation_hindi}
                        onChange={(e) => handleQuestionChange(index, 'explanation_hindi', e.target.value)}
                        className="w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-500/50 transition-all"
                        placeholder="हिंदी में स्पष्टीकरण..."
                      />
                    </div>
                  </div>

                  {/* Status Badge */}
                  {q.question_text && q.option_a && q.option_b && (
                    <div className="absolute top-6 right-16">
                      <FiCheckCircle className="text-green-500" size={20} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Add Question Button (Bottom) */}
            <div className="mt-8 text-center">
              <button
                onClick={addQuestion}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-dashed border-green-500/30 rounded-xl text-green-400 hover:bg-green-500/30 transition-all"
              >
                <FiPlus />
                Add Another Question
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-deep-black border border-glass-border rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Header */}
              <div className="sticky top-0 bg-glass-bg border-b border-glass-border p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Test Preview</h2>
                  <p className="text-sm text-gray-400">{testDetails?.title}</p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-all"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Preview Content */}
              <div className="p-6">
                {/* Test Info */}
                <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-black/30 rounded-xl border border-glass-border">
                  <div>
                    <p className="text-sm text-gray-400">Total Questions</p>
                    <p className="text-2xl font-bold text-green-400">{questions.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Marks</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {questions.reduce((sum, q) => sum + (q.marks || 4), 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="text-2xl font-bold text-yellow-400">{testDetails?.duration || 60} min</p>
                  </div>
                </div>

                {/* Questions Preview */}
                <div className="space-y-6">
                  {questions.map((q, index) => (
                    <div key={q.id} className="p-4 bg-black/30 rounded-xl border border-glass-border">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-semibold text-green-400">
                          Question {index + 1} of {questions.length}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                          {q.marks || 4} marks
                        </span>
                      </div>
                      
                      <p className="text-lg mb-4">{q.question_text || 'Question text not added'}</p>
                      
                      {q.question_text_hindi && (
                        <p className="text-sm text-gray-400 mb-4 border-t border-glass-border pt-2">
                          {q.question_text_hindi}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className={`p-3 rounded-lg border ${
                          q.correct_answer === 'A' ? 'border-green-500 bg-green-500/10' : 'border-glass-border'
                        }`}>
                          <span className="font-bold mr-2">A.</span> {q.option_a || 'Option A'}
                        </div>
                        <div className={`p-3 rounded-lg border ${
                          q.correct_answer === 'B' ? 'border-green-500 bg-green-500/10' : 'border-glass-border'
                        }`}>
                          <span className="font-bold mr-2">B.</span> {q.option_b || 'Option B'}
                        </div>
                        <div className={`p-3 rounded-lg border ${
                          q.correct_answer === 'C' ? 'border-green-500 bg-green-500/10' : 'border-glass-border'
                        }`}>
                          <span className="font-bold mr-2">C.</span> {q.option_c || 'Option C'}
                        </div>
                        <div className={`p-3 rounded-lg border ${
                          q.correct_answer === 'D' ? 'border-green-500 bg-green-500/10' : 'border-glass-border'
                        }`}>
                          <span className="font-bold mr-2">D.</span> {q.option_d || 'Option D'}
                        </div>
                      </div>

                      {q.explanation && (
                        <div className="mt-2 p-3 bg-blue-500/10 rounded-lg text-sm">
                          <span className="font-semibold text-blue-400">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Footer */}
              <div className="sticky bottom-0 bg-glass-bg border-t border-glass-border p-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-red-500/50 transition-all"
                >
                  Close Preview
                </button>
                <button
                  onClick={handlePublish}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                >
                  Publish Test
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AddQuestions;