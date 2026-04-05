import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { 
  FiSave, FiX, FiUpload, FiDownload, FiEye,
  FiFileText, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { FaRocket, FaRegSave } from 'react-icons/fa';

function AddTest() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [testMetadata, setTestMetadata] = useState({
    title: '',
    description: '',
    category_id: '',
    exam_id: '',
    duration: 60,
    is_free: true,
    price: 0,
    negative_marking: 0.25,
    passing_marks: 40,
    difficulty: 'medium',
    language: 'english',
    instructions: '',
    status: 'draft'
  });
  
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);

  // Template JSON
  const templateJson = {
    "questions": [
      {
        "id": 1,
        "question_text": "Sample Question?",
        "question_text_hindi": "नमूना प्रश्न?",
        "option_a": "Option A",
        "option_b": "Option B",
        "option_c": "Option C",
        "option_d": "Option D",
        "correct_answer": "A",
        "explanation": "This is the correct answer because...",
        "explanation_hindi": "यह सही उत्तर है क्योंकि...",
        "marks": 4,
        "difficulty": "medium",
        "topic": "General"
      }
    ],
    "metadata": {
      "version": "1.0",
      "total_questions": 1
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExams();
    if (testId) {
      fetchTestData();
    } else {
      setJsonData(JSON.stringify(templateJson, null, 2));
    }
  }, [testId]);

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
      const res = await API.get('/exams/exams-list');
      setExams(res.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const fetchTestData = async () => {
    try {
      const res = await API.get(`/tests/${testId}`);
      const test = res.data;
      setTestMetadata({
        title: test.title,
        description: test.description || '',
        category_id: test.category_id || '',
        exam_id: test.exam_id || '',
        duration: test.duration,
        is_free: test.is_free,
        price: test.price,
        negative_marking: test.negative_marking,
        passing_marks: test.passing_marks,
        difficulty: test.difficulty,
        language: test.language,
        instructions: test.instructions || '',
        status: test.status
      });
      
      // Load JSON from Cloudinary
      if (test.json_file_url) {
        const jsonRes = await fetch(test.json_file_url);
        const json = await jsonRes.json();
        setJsonData(JSON.stringify(json, null, 2));
      }
    } catch (error) {
      console.error('Error fetching test:', error);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setTestMetadata({ ...testMetadata, category_id: categoryId, exam_id: '' });
    const filtered = exams.filter(exam => exam.category_id === parseInt(categoryId));
    setFilteredExams(filtered);
  };

  const validateJSON = () => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        setError('JSON must contain a "questions" array');
        return false;
      }
      setError('');
      return true;
    } catch (e) {
      setError('Invalid JSON: ' + e.message);
      return false;
    }
  };

  const handleSave = async (publish = false) => {
    if (!validateJSON()) return;
    if (!testMetadata.title) {
        setError('Test title is required');
        return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
        // Parse JSON to get question count
        const parsedData = JSON.parse(jsonData);
        const totalQuestions = parsedData.questions.length;
        const totalMarks = parsedData.questions.reduce((sum, q) => sum + (q.marks || 4), 0);
        
        // Create FormData
        const formData = new FormData();
        
        // Add JSON file
        const jsonBlob = new Blob([jsonData], { type: 'application/json' });
        formData.append('jsonFile', jsonBlob, `test-${Date.now()}.json`);
        
        // Add metadata - ✅ SEND AS STRINGS (backend will parse)
        formData.append('title', testMetadata.title);
        formData.append('description', testMetadata.description || '');
        formData.append('category_id', testMetadata.category_id || '');
        formData.append('exam_id', testMetadata.exam_id || '');
        formData.append('duration', String(testMetadata.duration));
        formData.append('total_questions', String(totalQuestions));
        formData.append('total_marks', String(totalMarks));
        formData.append('passing_marks', String(testMetadata.passing_marks));
        formData.append('negative_marking', String(testMetadata.negative_marking));
        formData.append('is_free', testMetadata.is_free ? 'true' : 'false');
        formData.append('price', String(testMetadata.price));
        formData.append('language', testMetadata.language);
        formData.append('difficulty', testMetadata.difficulty);
        formData.append('instructions', testMetadata.instructions || '');
        formData.append('status', publish ? 'published' : testMetadata.status);
        
        if (testId) {
            formData.append('id', testId);
        }
        
        console.log('Sending form data...');
        
        const res = await API.post('/tests/admin/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setSuccess(publish ? 'Test published successfully to Cloudinary!' : 'Test saved as draft to Cloudinary!');
        
        setTimeout(() => {
            navigate('/admin/tests');
        }, 1500);
        
    } catch (error) {
        console.error('Error saving test:', error);
        setError('Failed to save test: ' + (error.response?.data?.message || error.message));
    } finally {
        setSaving(false);
    }
};

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(templateJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {testId ? 'Edit Test' : 'Create New Test'}
            </h1>
            <p className="text-gray-400">
              Create test using JSON format. Questions will be stored in Cloudinary.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <FiDownload />
              Download Template
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
            <FiAlertCircle />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 flex items-center gap-2">
            <FiCheckCircle />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Test Metadata */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-white mb-4">Test Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Test Title *</label>
                  <input
                    type="text"
                    value={testMetadata.title}
                    onChange={(e) => setTestMetadata({...testMetadata, title: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="e.g., SSC CGL Mock Test 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Description</label>
                  <textarea
                    value={testMetadata.description}
                    onChange={(e) => setTestMetadata({...testMetadata, description: e.target.value})}
                    rows="3"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Category</label>
                  <select
                    value={testMetadata.category_id}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Exam</label>
                  <select
                    value={testMetadata.exam_id}
                    onChange={(e) => setTestMetadata({...testMetadata, exam_id: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    disabled={!testMetadata.category_id}
                  >
                    <option value="">Select Exam</option>
                    {filteredExams.map(exam => (
                      <option key={exam.id} value={exam.id}>{exam.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Duration (min)</label>
                    <input
                      type="number"
                      value={testMetadata.duration}
                      onChange={(e) => setTestMetadata({...testMetadata, duration: parseInt(e.target.value)})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
                    <select
                      value={testMetadata.difficulty}
                      onChange={(e) => setTestMetadata({...testMetadata, difficulty: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Passing Marks (%)</label>
                    <input
                      type="number"
                      value={testMetadata.passing_marks}
                      onChange={(e) => setTestMetadata({...testMetadata, passing_marks: parseInt(e.target.value)})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Negative Marking</label>
                    <input
                      type="number"
                      step="0.25"
                      value={testMetadata.negative_marking}
                      onChange={(e) => setTestMetadata({...testMetadata, negative_marking: parseFloat(e.target.value)})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Pricing</label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={testMetadata.is_free}
                        onChange={() => setTestMetadata({...testMetadata, is_free: true, price: 0})}
                      />
                      Free
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={!testMetadata.is_free}
                        onChange={() => setTestMetadata({...testMetadata, is_free: false})}
                      />
                      Paid
                    </label>
                  </div>
                  {!testMetadata.is_free && (
                    <input
                      type="number"
                      value={testMetadata.price}
                      onChange={(e) => setTestMetadata({...testMetadata, price: parseInt(e.target.value)})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      placeholder="Price in ₹"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Instructions</label>
                  <textarea
                    value={testMetadata.instructions}
                    onChange={(e) => setTestMetadata({...testMetadata, instructions: e.target.value})}
                    rows="3"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Test instructions for students..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <select
                    value={testMetadata.status}
                    onChange={(e) => setTestMetadata({...testMetadata, status: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - JSON Editor */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FiFileText className="text-green-400" />
                  Questions JSON
                </h2>
                <div className="text-xs text-gray-500">
                  Each question must have id, question_text, options, correct_answer
                </div>
              </div>
              
              <textarea
                value={jsonData}
                onChange={(e) => {
                  setJsonData(e.target.value);
                  validateJSON();
                }}
                className="w-full h-[calc(100vh-350px)] bg-gray-950 border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-300 focus:outline-none focus:border-green-500/50"
                spellCheck="false"
              />
              
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => navigate('/admin/tests')}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FaRegSave />
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <FaRocket />
                  {saving ? 'Publishing...' : 'Publish to Cloudinary'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTest;