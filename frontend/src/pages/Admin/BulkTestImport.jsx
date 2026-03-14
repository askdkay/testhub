import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { 
  FiUpload, FiFileText, FiCheck, FiX, FiEye,
  FiDownload, FiAlertCircle, FiClock,
  FiRefreshCw, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { 
  FaRupeeSign, FaRegFileCode, FaRegCheckCircle, FaRegTimesCircle
} from 'react-icons/fa';

function BulkTestImport() {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Sample JSON template
  const sampleJSON = {
    "tests": [
      {
        "title": "SSC CGL Mock Test 2024",
        "description": "Complete mock test for SSC CGL Tier 1 examination",
        "category": "SSC",
        "duration": 60,
        "total_questions": 100,
        "price": 0,
        "is_free": true,
        "status": "draft",
        "questions": [
          {
            "question_text": "If x + 1/x = 3, then find x³ + 1/x³ = ?",
            "option_a": "18",
            "option_b": "21",
            "option_c": "24",
            "option_d": "27",
            "correct_answer": "A"
          },
          {
            "question_text": "A train 300m long passes a pole in 15 seconds. Find speed?",
            "option_a": "60 km/h",
            "option_b": "72 km/h",
            "option_c": "80 km/h",
            "option_d": "90 km/h",
            "correct_answer": "B"
          }
        ]
      }
    ]
  };

  // Validate JSON format
  const validateJSON = (input) => {
    try {
      const parsed = JSON.parse(input);
      
      if (!parsed.tests || !Array.isArray(parsed.tests)) {
        throw new Error('JSON must contain a "tests" array');
      }

      parsed.tests.forEach((test, index) => {
        if (!test.title) throw new Error(`Test ${index + 1}: Missing title`);
        if (!test.category) throw new Error(`Test ${index + 1}: Missing category`);
        if (!test.duration) throw new Error(`Test ${index + 1}: Missing duration`);
        if (!test.questions || !Array.isArray(test.questions)) {
          throw new Error(`Test ${index + 1}: Missing questions array`);
        }

        test.questions.forEach((q, qIndex) => {
          if (!q.question_text) throw new Error(`Test ${index + 1}, Q${qIndex + 1}: Missing question text`);
          if (!q.option_a || !q.option_b || !q.option_c || !q.option_d) {
            throw new Error(`Test ${index + 1}, Q${qIndex + 1}: All options are required`);
          }
          if (!q.correct_answer) throw new Error(`Test ${index + 1}, Q${qIndex + 1}: Missing correct answer`);
        });
      });

      setParsedData(parsed);
      setError('');
      return true;
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return false;
    }
  };

  const handleJsonChange = (e) => {
    setJsonInput(e.target.value);
    setError('');
    setParsedData(null);
  };

  const handleParse = () => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON data');
      return;
    }
    validateJSON(jsonInput);
  };

  const loadSample = () => {
    const formattedSample = JSON.stringify(sampleJSON, null, 2);
    setJsonInput(formattedSample);
    validateJSON(formattedSample);
  };

  const handleClear = () => {
    setJsonInput('');
    setParsedData(null);
    setError('');
    setPreviewMode(false);
    setSelectedTest(null);
  };

  // Fixed Import Logic (Standard Routes use kiya hai)
const handleImport = async () => {
  if (!parsedData) return;

  setLoading(true);
  setImportProgress(0);
  const results = [];

  try {
    for (let i = 0; i < parsedData.tests.length; i++) {
      const test = parsedData.tests[i];
      
      try {
        console.log(`📝 Creating test ${i + 1}:`, test.title);
        
        // STEP 1: Create test first
        const testData = {
          title: test.title,
          description: test.description || '',
          category: test.category || 'General',
          duration: test.duration || 60,
          total_questions: test.questions?.length || 0,
          total_marks: test.total_marks || (test.questions?.length * 4) || 0,
          passing_marks: test.passing_marks || 40,
          negative_marking: test.negative_marking || 0.25,
          is_free: test.is_free || false,
          price: test.price || 0,
          language: test.language || 'english',
          status: test.status || 'draft',
          banner_image: test.banner_image || null,
          tags: test.tags || [],
          instructions: test.instructions || ''
        };

        console.log('📤 Sending test data:', testData);
        
        const testRes = await API.post('/admin/tests/bulk', testData);
        console.log('✅ Test created:', testRes.data);

        // STEP 2: Add questions if they exist
        if (test.questions && test.questions.length > 0) {
          console.log(`📝 Adding ${test.questions.length} questions...`);
          
          const questionsData = {
            testId: testRes.data.testId,
            questions: test.questions.map(q => ({
              question_text: q.question_text || '',
              question_text_hindi: q.question_text_hindi || '',
              option_a: q.option_a || '',
              option_b: q.option_b || '',
              option_c: q.option_c || '',
              option_d: q.option_d || '',
              correct_answer: q.correct_answer || 'A',
              explanation: q.explanation || '',
              explanation_hindi: q.explanation_hindi || '',
              marks: q.marks || 4,
              difficulty: q.difficulty || 'medium',
              topic: q.topic || '',
              image_url: q.image_url || null
            }))
          };

          console.log('📤 Sending questions data:', questionsData);
          
          const questionsRes = await API.post('/admin/questions/bulk', questionsData);
          console.log('✅ Questions added:', questionsRes.data);
          
          results.push({
            success: true,
            title: test.title,
            testId: testRes.data.testId,
            questionsCount: test.questions.length
          });
        } else {
          results.push({
            success: true,
            title: test.title,
            testId: testRes.data.testId,
            questionsCount: 0
          });
        }

      } catch (err) {
        console.error(`❌ Error in test ${i + 1}:`, err);
        console.error('Error response:', err.response?.data);
        
        results.push({
          success: false,
          title: test.title,
          error: err.response?.data?.message || err.message
        });
      }

      setImportProgress(((i + 1) / parsedData.tests.length) * 100);
    }

    setImportResults(results);
    setShowResults(true);
    
  } catch (error) {
    console.error('Import error:', error);
    setError('Import failed: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const downloadSample = () => {
    const blob = new Blob([JSON.stringify(sampleJSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_test_data.json';
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      
      {/* Main Content */}
      <div className="ml-0 lg:ml-64 min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 mb-1">
              Bulk Test Import
            </h1>
            <p className="text-slate-400 text-sm">Upload multiple tests and questions instantly using JSON format.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Panel - JSON Input */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    <FaRegFileCode className="text-indigo-400 text-lg" />
                    JSON Payload
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={loadSample} className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors">
                      Load Sample
                    </button>
                    <button onClick={downloadSample} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors">
                      <FiDownload size={12} />
                      Download Format
                    </button>
                    <button onClick={handleClear} className="px-3 py-1.5 text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-md transition-colors">
                      Clear
                    </button>
                  </div>
                </div>

                <textarea
                  value={jsonInput}
                  onChange={handleJsonChange}
                  placeholder='Paste your JSON array here...'
                  className="w-full h-96 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all scrollbar-thin scrollbar-thumb-slate-700"
                  spellCheck="false"
                />

                {error && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm flex items-start gap-2">
                    <FiAlertCircle className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleParse}
                    disabled={!jsonInput.trim()}
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiCheck /> Validate JSON
                  </button>
                  
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    disabled={!parsedData}
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiEye /> {previewMode ? 'Hide Preview' : 'Show Preview'}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {loading && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Importing to Database...</span>
                    <span className="text-indigo-400 font-medium">{importProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Right Panel - Preview List */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              {previewMode && parsedData ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full">
                  <h3 className="text-sm font-medium text-slate-200 mb-4 flex items-center gap-2">
                    <FiEye className="text-indigo-400 text-lg" />
                    Data Preview ({parsedData.tests.length} Tests)
                  </h3>

                  <div className="space-y-3 flex-1 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {parsedData.tests.map((test, index) => (
                      <div key={index} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                        
                        {/* Test Header Row */}
                        <div 
                          className="p-4 cursor-pointer hover:bg-slate-800/50 transition-colors flex items-start gap-4"
                          onClick={() => setSelectedTest(selectedTest === index ? null : index)}
                        >
                          <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                            <FiFileText className="text-xl text-indigo-400" />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-200">{test.title}</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                                {test.category}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded flex items-center gap-1">
                                <FiClock size={10} /> {test.duration} mins
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded">
                                {test.questions.length} Qs
                              </span>
                            </div>
                          </div>
                          <div className="text-slate-500 mt-1">
                            {selectedTest === index ? <FiChevronUp /> : <FiChevronDown />}
                          </div>
                        </div>

                        {/* Questions Expanded View */}
                        <AnimatePresence>
                          {selectedTest === index && (
                            <motion.div
                              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                              className="border-t border-slate-800 overflow-hidden"
                            >
                              <div className="p-4 bg-slate-900/50 space-y-3">
                                <p className="text-xs font-medium text-slate-400">Sample Questions:</p>
                                {test.questions.slice(0, 3).map((q, qIndex) => (
                                  <div key={qIndex} className="p-3 bg-slate-950 rounded border border-slate-800/50">
                                    <p className="text-sm text-slate-300 mb-2">Q: {q.question_text}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <span className="text-slate-500">A. {q.option_a}</span>
                                      <span className="text-slate-500">B. {q.option_b}</span>
                                      <span className="text-slate-500">C. {q.option_c}</span>
                                      <span className="text-slate-500">D. {q.option_d}</span>
                                    </div>
                                    <p className="mt-2 text-xs font-medium text-emerald-400">
                                      Ans: {q.correct_answer}
                                    </p>
                                  </div>
                                ))}
                                {test.questions.length > 3 && (
                                  <p className="text-xs text-center text-slate-500 pt-2">
                                    + {test.questions.length - 3} more questions
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* Start Import Button */}
                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <button
                      onClick={handleImport}
                      disabled={loading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <><FiRefreshCw className="animate-spin" /> Uploading Data...</>
                      ) : (
                        <><FiUpload /> Start Upload ({parsedData.tests.length} Tests)</>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center h-full flex flex-col justify-center items-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <FiFileText className="text-2xl text-slate-500" />
                  </div>
                  <h3 className="text-base font-medium text-slate-200 mb-1">Waiting for Data</h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Paste your JSON in the editor and click "Validate JSON" to see the preview here.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Results Modal */}
          <AnimatePresence>
            {showResults && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl"
                >
                  <div className="p-5 border-b border-slate-800 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-semibold text-slate-100">Upload Summary</h2>
                    <button onClick={() => setShowResults(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                    <div className="mb-6 p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                      <div className="flex gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-emerald-400">{importResults.filter(r => r.success).length}</p>
                          <p className="text-xs text-slate-500">Successful</p>
                        </div>
                        <div className="w-px bg-slate-800"></div>
                        <div className="text-center">
                          <p className="text-2xl font-semibold text-rose-400">{importResults.filter(r => !r.success).length}</p>
                          <p className="text-xs text-slate-500">Failed</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/admin/tests')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors"
                      >
                        Go to Tests
                      </button>
                    </div>

                    <div className="space-y-3">
                      {importResults.map((result, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${result.success ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                          <div className="flex items-start gap-3">
                            {result.success ? (
                              <FaRegCheckCircle className="text-emerald-500 mt-0.5" />
                            ) : (
                              <FaRegTimesCircle className="text-rose-500 mt-0.5" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-slate-200">{result.title}</p>
                              {result.success ? (
                                <p className="text-xs text-emerald-400/80 mt-1">
                                  Saved with {result.questionsCount} questions.
                                </p>
                              ) : (
                                <p className="text-xs text-rose-400 mt-1">
                                  Error: {result.error}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

export default BulkTestImport;