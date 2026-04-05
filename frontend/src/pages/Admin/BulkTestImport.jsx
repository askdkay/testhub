import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { 
    FiUpload, FiFileText, FiCheck, FiX, FiEye, 
    FiDownload, FiAlertCircle, FiClock, FiRefreshCw, 
    FiChevronDown, FiChevronUp, FiEdit2, FiSave, 
    FiTrash2, FiPlus, FiCopy 
} from 'react-icons/fi';
import { 
    FaRupeeSign, FaRegFileCode, FaRegCheckCircle, 
    FaRegTimesCircle, FaGraduationCap, FaBookOpen 
} from 'react-icons/fa';

function BulkTestImport() {
    const navigate = useNavigate();

    // State for Exam Selection
    const [categories, setCategories] = useState([]);
    const [exams, setExams] = useState([]);
    const [filteredExams, setFilteredExams] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedExam, setSelectedExam] = useState('');
    const [existingTests, setExistingTests] = useState([]);
    const [selectedExistingTest, setSelectedExistingTest] = useState(null);
    const [loadingExistingTests, setLoadingExistingTests] = useState(false);

    // State for JSON Import
    const [jsonInput, setJsonInput] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [importProgress, setImportProgress] = useState(0);
    const [importResults, setImportResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingTestData, setEditingTestData] = useState(null);

    // Fetch Categories & Exams
    useEffect(() => {
        fetchCategories();
        fetchExams();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await API.get('/exams/categories');
            setCategories(res.data);
        } catch (error) {
            // console.error('Error fetching categories:', error);
        }
    };

    const fetchExams = async () => {
        try {
            const res = await API.get('/exams/exams-list');
            setExams(res.data);
        } catch (error) {
            // console.error('Error fetching exams:', error);
        }
    };

    // Filter exams when category changes
    useEffect(() => {
        if (selectedCategory) {
            const filtered = exams.filter(exam => exam.category_id === parseInt(selectedCategory));
            setFilteredExams(filtered);
            setSelectedExam('');
            setExistingTests([]);
            setSelectedExistingTest(null);
        } else {
            setFilteredExams([]);
        }
    }, [selectedCategory, exams]);

    // Fetch existing tests when exam changes
    useEffect(() => {
        if (selectedExam) {
            fetchExistingTests(selectedExam);
        }
    }, [selectedExam]);

    const fetchExistingTests = async (examId) => {
        setLoadingExistingTests(true);
        try {
            const res = await API.get(`/admin/tests?exam_id=${examId}`);
            setExistingTests(res.data);
        } catch (error) {
            // console.error('Error fetching existing tests:', error);
        } finally {
            setLoadingExistingTests(false);
        }
    };

    // ✅ FIXED: Load existing test data into editor
    const loadTestForEdit = async (testId) => {
        setLoadingExistingTests(true);
        try {
            // console.log('📥 Fetching test details for ID:', testId);
            
            const res = await API.get(`/admin/tests/${testId}`);
            const test = res.data;
            
            // console.log('✅ Test fetched:', test);
            
            const questions = test.questions || [];
            
            const testData = {
                id: test.id,
                title: test.title,
                description: test.description || '',
                category: test.category,
                exam_id: test.exam_id,
                duration: test.duration,
                total_questions: test.total_questions,
                total_marks: test.total_marks,
                passing_marks: test.passing_marks,
                negative_marking: test.negative_marking,
                is_free: test.is_free,
                price: test.price,
                status: test.status,
                questions: questions.map(q => ({
                    id: q.id,
                    question_text: q.question_text,
                    question_text_hindi: q.question_text_hindi || '',
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    correct_answer: q.correct_answer,
                    explanation: q.explanation || '',
                    marks: q.marks || 4,
                    difficulty: q.difficulty || 'medium',
                    topic: q.topic || ''
                }))
            };
            
            setEditingTestData(testData);
            setSelectedExistingTest(test);
            setEditMode(true);
            
            // Also populate JSON editor for preview
            const jsonForEditor = {
                tests: [{
                    title: testData.title,
                    description: testData.description,
                    category: testData.category,
                    duration: testData.duration,
                    questions: testData.questions.map(q => ({
                        question_text: q.question_text,
                        question_text_hindi: q.question_text_hindi,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_answer: q.correct_answer,
                        explanation: q.explanation,
                        marks: q.marks,
                        difficulty: q.difficulty,
                        topic: q.topic
                    }))
                }]
            };
            setJsonInput(JSON.stringify(jsonForEditor, null, 2));
            validateJSON(JSON.stringify(jsonForEditor, null, 2));
            
        } catch (error) {
            // console.error('Error loading test for edit:', error);
            alert(`Failed to load test data: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoadingExistingTests(false);
        }
    };

    // Sample JSON Template
    const sampleJSON = {
        tests: [{
            title: "SSC CGL Mock Test 2024",
            description: "Complete mock test for SSC CGL Tier 1 examination",
            category: "SSC",
            duration: 60,
            total_questions: 100,
            price: 0,
            is_free: true,
            status: "draft",
            questions: [
                {
                    question_text: "If x + 1/x = 3, then find x³ + 1/x³ = ?",
                    option_a: "18",
                    option_b: "21",
                    option_c: "24",
                    option_d: "27",
                    correct_answer: "A",
                },
                {
                    question_text: "A train 300m long passes a pole in 15 seconds. Find speed?",
                    option_a: "60 km/h",
                    option_b: "72 km/h",
                    option_c: "80 km/h",
                    option_d: "90 km/h",
                    correct_answer: "B",
                },
            ],
        }],
    };

    // JSON Validation
    const validateJSON = (input) => {
        try {
            const parsed = JSON.parse(input);
            if (!parsed.tests || !Array.isArray(parsed.tests)) {
                throw new Error('JSON must contain a "tests" array');
            }
            parsed.tests.forEach((test, index) => {
                if (!test.title) throw new Error(`Test ${index + 1}: Missing title`);
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
        setEditMode(false);
        setEditingTestData(null);
    };

    // ✅ FIXED: Update Existing Test
    const updateExistingTest = async () => {
        if (!editingTestData || !selectedExistingTest) return;
        
        setLoading(true);
        try {
            // console.log('📝 Updating test:', selectedExistingTest.id);
            
            await API.put(`/admin/tests/${selectedExistingTest.id}`, {
                title: editingTestData.title,
                description: editingTestData.description,
                duration: editingTestData.duration,
                price: editingTestData.price,
                is_free: editingTestData.is_free,
                passing_marks: editingTestData.passing_marks,
                negative_marking: editingTestData.negative_marking,
                status: editingTestData.status
            });
            
            // console.log('✅ Test details updated');
            
            // Delete existing questions
            await API.delete(`/admin/tests/${selectedExistingTest.id}/questions`);
            // console.log('✅ Old questions deleted');
            
            // Add new questions
            if (editingTestData.questions && editingTestData.questions.length > 0) {
                const questionsData = {
                    testId: selectedExistingTest.id,
                    questions: editingTestData.questions.map(q => ({
                        question_text: q.question_text || '',
                        question_text_hindi: q.question_text_hindi || '',
                        option_a: q.option_a || '',
                        option_b: q.option_b || '',
                        option_c: q.option_c || '',
                        option_d: q.option_d || '',
                        correct_answer: q.correct_answer || 'A',
                        explanation: q.explanation || '',
                        marks: q.marks || 4,
                        difficulty: q.difficulty || 'medium',
                        topic: q.topic || ''
                    }))
                };
                
                await API.post('/admin/questions/bulk', questionsData);
                // console.log(`✅ ${editingTestData.questions.length} new questions added`);
            }
            
            alert('Test updated successfully!');
            setEditMode(false);
            setEditingTestData(null);
            setSelectedExistingTest(null);
            
            if (selectedExam) {
                fetchExistingTests(selectedExam);
            }
            
        } catch (error) {
            // console.error('Error updating test:', error);
            alert(`Failed to update test: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Import New Tests
    const handleImport = async () => {
    if (!parsedData) return;

    setLoading(true);
    setImportProgress(0);
    const results = [];

    try {
        for (let i = 0; i < parsedData.tests.length; i++) {
            const test = parsedData.tests[i];
            
            try {
                // console.log(`📝 Processing test ${i + 1}:`, test.title);
                
                // Create JSON structure
                const jsonData = {
                    test: {
                        title: test.title,
                        description: test.description || '',
                        category_id: test.category_id || null,
                        exam_id: test.exam_id || null,
                        duration: test.duration || 60,
                        passing_marks: test.passing_marks || 40,
                        negative_marking: test.negative_marking || 0.25,
                        is_free: test.is_free || false,
                        price: test.price || 0,
                        language: test.language || 'english',
                        difficulty: test.difficulty || 'medium',
                        instructions: test.instructions || ''
                    },
                    questions: test.questions || []
                };
                
                // Create FormData
                const formData = new FormData();
                const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
                formData.append('jsonFile', jsonBlob, `test-${Date.now()}.json`);
                
                // Upload to backend
                const res = await API.post('/admin/tests/bulk', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                // console.log('✅ Test created:', res.data);
                
                results.push({
                    success: true,
                    title: test.title,
                    testId: res.data.testId,
                    questionsCount: test.questions?.length || 0,
                    jsonUrl: res.data.jsonUrl
                });
                
            } catch (err) {
                // console.error(`❌ Error in test ${i + 1}:`, err);
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
        // console.error('Import error:', error);
        setError('Import failed: ' + error.message);
    } finally {
        setLoading(false);
    }
};

    const downloadSample = () => {
        const blob = new Blob([JSON.stringify(sampleJSON, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sample_test_data.json";
        a.click();
    };

    return (
        <div className='min-h-screen bg-slate-950 text-slate-300 font-sans'>
            <div className='ml-0  min-h-screen p-6'>
                <div className='max-w-7xl mx-auto space-y-6'>
                    
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className='text-2xl md:text-3xl font-semibold text-slate-50 mb-1'>Bulk Test Import</h1>
                        <p className='text-slate-400 text-sm'>Upload multiple tests and questions instantly using JSON format.</p>
                    </motion.div>

                    {/* Exam Selection Section */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm'>
                        <h3 className='text-sm font-medium text-slate-200 mb-4 flex items-center gap-2'>
                            <FaGraduationCap className='text-indigo-400 text-lg' />
                            1. Select Exam (Optional - for linking tests)
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-xs text-slate-400 mb-1'>Exam Category</label>
                                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500'>
                                    <option value=''>Select Category</option>
                                    {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className='block text-xs text-slate-400 mb-1'>Select Exam</label>
                                <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} disabled={!selectedCategory} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50'>
                                    <option value=''>Select Exam</option>
                                    {filteredExams.map((exam) => (<option key={exam.id} value={exam.id}>{exam.name} {exam.short_name ? `(${exam.short_name})` : ""}</option>))}
                                </select>
                            </div>
                        </div>
                    </motion.div>

                    {/* Existing Tests List Section */}
                    {selectedExam && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm'>
                            <h3 className='text-sm font-medium text-slate-200 mb-4 flex items-center gap-2'>
                                <FaBookOpen className='text-emerald-400 text-lg' />
                                2. Existing Tests for this Exam
                            </h3>
                            {loadingExistingTests ? (
                                <div className='text-center py-8'><FiRefreshCw className='animate-spin mx-auto text-slate-500 text-2xl' /><p className='text-xs text-slate-500 mt-2'>Loading tests...</p></div>
                            ) : existingTests.length === 0 ? (
                                <div className='text-center py-8 border border-dashed border-slate-700 rounded-lg'><p className='text-sm text-slate-500'>No tests found for this exam</p></div>
                            ) : (
                                <div className='space-y-2 max-h-64 overflow-y-auto'>
                                    {existingTests.map((test) => (
                                        <div key={test.id} className='flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-indigo-500/50 transition-all'>
                                            <div className='flex-1'>
                                                <p className='text-sm font-medium text-slate-200'>{test.title}</p>
                                                <div className='flex gap-3 mt-1 text-xs text-slate-500'>
                                                    <span className='flex items-center gap-1'><FiClock size={12} /> {test.duration} min</span>
                                                    <span>{test.total_questions} questions</span>
                                                    {test.is_free ? <span className='text-emerald-500'>Free</span> : <span className='text-amber-500'>₹{test.price}</span>}
                                                </div>
                                            </div>
                                            <div className='flex gap-2'>
                                                <button onClick={() => loadTestForEdit(test.id)} className='p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-all' title='Edit Test'><FiEdit2 size={16} /></button>
                                                <button onClick={() => { const testData = { tests: [{ title: test.title, description: test.description, duration: test.duration, questions: [] }] }; setJsonInput(JSON.stringify(testData, null, 2)); validateJSON(JSON.stringify(testData, null, 2)); setPreviewMode(true); }} className='p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all' title='Clone to JSON'><FiCopy size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Edit Mode Panel */}
                    {editMode && editingTestData && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='bg-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-sm'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-sm font-medium text-slate-200 flex items-center gap-2'><FiEdit2 className='text-amber-400 text-lg' /> Edit Test: {editingTestData.title}</h3>
                                <button onClick={() => setEditMode(false)} className='text-slate-400 hover:text-slate-200'><FiX size={18} /></button>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                                <div><label className='block text-xs text-slate-400 mb-1'>Test Title</label><input type='text' value={editingTestData.title} onChange={(e) => setEditingTestData({ ...editingTestData, title: e.target.value })} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500' /></div>
                                <div><label className='block text-xs text-slate-400 mb-1'>Duration (minutes)</label><input type='number' value={editingTestData.duration} onChange={(e) => setEditingTestData({ ...editingTestData, duration: parseInt(e.target.value) })} className='w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500' /></div>
                            </div>
                            <div className='flex justify-end gap-3'>
                                <button onClick={() => setEditMode(false)} className='px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm'>Cancel</button>
                                <button onClick={updateExistingTest} disabled={loading} className='px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center gap-2'><FiSave /> Update Test</button>
                            </div>
                        </motion.div>
                    )}

                    {/* JSON Import Section */}
                    <div className='flex flex-col gap-6 mt-6'>
                        {/* Left Panel - JSON Input */}
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className='space-y-4'>
                            <div className='bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm'>
                                <div className='flex justify-between items-center mb-4'>
                                    <h3 className='text-sm font-medium text-slate-200 flex items-center gap-2'><FaRegFileCode className='text-indigo-400 text-lg' /> 3. JSON Payload</h3>
                                    <div className='flex gap-2'>
                                        <button onClick={loadSample} className='px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md'>Load Sample</button>
                                        <button onClick={downloadSample} className='flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md'><FiDownload size={12} /> Format</button>
                                        <button onClick={handleClear} className='px-3 py-1.5 text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-md'>Clear</button>
                                    </div>
                                </div>
                                <textarea value={jsonInput} onChange={handleJsonChange} placeholder='Paste your JSON array here...' className='w-full h-96 bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all' spellCheck='false' />
                                {error && (<div className='mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm flex items-start gap-2'><FiAlertCircle className='mt-0.5 shrink-0' /><span>{error}</span></div>)}
                                <div className='mt-4 flex gap-3'>
                                    <button onClick={handleParse} disabled={!jsonInput.trim()} className='flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2'><FiCheck /> Validate JSON</button>
                                    <button onClick={() => setPreviewMode(!previewMode)} disabled={!parsedData} className='flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2'><FiEye /> {previewMode ? "Hide Preview" : "Show Preview"}</button>
                                </div>
                            </div>
                            {loading && (<div className='bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm'><div className='flex justify-between text-sm mb-2'><span className='text-slate-400'>Importing to Database...</span><span className='text-indigo-400 font-medium'>{importProgress}%</span></div><div className='w-full bg-slate-950 rounded-full h-2 overflow-hidden'><div className='bg-indigo-500 h-2 rounded-full transition-all duration-300' style={{ width: `${importProgress}%` }} /></div></div>)}
                        </motion.div>

                        {/* Right Panel - Preview List */}
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                            {previewMode && parsedData ? (
                                <div className='bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col h-full'>
                                    <h3 className='text-sm font-medium text-slate-200 mb-4 flex items-center gap-2'><FiEye className='text-indigo-400 text-lg' /> Data Preview ({parsedData.tests.length} Tests)</h3>
                                    <div className='space-y-3 flex-1 max-h-[500px] overflow-y-auto pr-2'>
                                        {parsedData.tests.map((test, index) => (
                                            <div key={index} className='bg-slate-950 border border-slate-800 rounded-lg overflow-hidden'>
                                                <div className='p-4 cursor-pointer hover:bg-slate-800/50 transition-colors flex items-start gap-4' onClick={() => setSelectedTest(selectedTest === index ? null : index)}>
                                                    <div className='w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0'><FiFileText className='text-xl text-indigo-400' /></div>
                                                    <div className='flex-1'>
                                                        <h4 className='font-medium text-slate-200'>{test.title}</h4>
                                                        <div className='flex flex-wrap gap-2 mt-2'>
                                                            <span className='text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded'>{test.category || (selectedCategory ? categories.find(c => c.id == selectedCategory)?.name : "General")}</span>
                                                            <span className='text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded flex items-center gap-1'><FiClock size={10} /> {test.duration} mins</span>
                                                            <span className='text-xs px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded'>{test.questions.length} Qs</span>
                                                        </div>
                                                    </div>
                                                    <div className='text-slate-500 mt-1'>{selectedTest === index ? <FiChevronUp /> : <FiChevronDown />}</div>
                                                </div>
                                                <AnimatePresence>{selectedTest === index && (<motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className='border-t border-slate-800 overflow-hidden'><div className='p-4 bg-slate-900/50 space-y-3'><p className='text-xs font-medium text-slate-400'>Sample Questions:</p>{test.questions.slice(0, 3).map((q, qIndex) => (<div key={qIndex} className='p-3 bg-slate-950 rounded border border-slate-800/50'><p className='text-sm text-slate-300 mb-2'>Q: {q.question_text}</p><div className='grid grid-cols-2 gap-2 text-xs'><span className='text-slate-500'>A. {q.option_a}</span><span className='text-slate-500'>B. {q.option_b}</span><span className='text-slate-500'>C. {q.option_c}</span><span className='text-slate-500'>D. {q.option_d}</span></div><p className='mt-2 text-xs font-medium text-emerald-400'>Ans: {q.correct_answer}</p></div>))}{test.questions.length > 3 && <p className='text-xs text-center text-slate-500 pt-2'>+ {test.questions.length - 3} more questions</p>}</div></motion.div>)}</AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                    <div className='mt-5 pt-4 border-t border-slate-800'>
                                        <button onClick={handleImport} disabled={loading} className='w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2'>
                                            {loading ? <><FiRefreshCw className='animate-spin' /> Uploading Data...</> : <><FiUpload /> Import to Database ({parsedData.tests.length} Tests)</>}
                                        </button>
                                        {selectedExam && <p className='text-xs text-slate-500 text-center mt-2'>Tests will be linked to: {filteredExams.find(e => e.id == selectedExam)?.name}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className='bg-slate-900 border border-slate-800 rounded-xl p-12 text-center h-full flex flex-col justify-center items-center shadow-sm'>
                                    <div className='w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4'><FiFileText className='text-2xl text-slate-500' /></div>
                                    <h3 className='text-base font-medium text-slate-200 mb-1'>Waiting for Data</h3>
                                    <p className='text-sm text-slate-500 max-w-xs'>Paste your JSON in the editor and click "Validate JSON" to see the preview here.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Results Modal */}
                    <AnimatePresence>
                        {showResults && (
                            <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm'>
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className='bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl'>
                                    <div className='p-5 border-b border-slate-800 flex justify-between items-center shrink-0'>
                                        <h2 className='text-lg font-semibold text-slate-100'>Upload Summary</h2>
                                        <button onClick={() => setShowResults(false)} className='text-slate-400 hover:text-slate-200 transition-colors'><FiX size={20} /></button>
                                    </div>
                                    <div className='p-5 overflow-y-auto'>
                                        <div className='mb-6 p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center'>
                                            <div className='flex gap-6'>
                                                <div className='text-center'><p className='text-2xl font-semibold text-emerald-400'>{importResults.filter(r => r.success).length}</p><p className='text-xs text-slate-500'>Successful</p></div>
                                                <div className='w-px bg-slate-800'></div>
                                                <div className='text-center'><p className='text-2xl font-semibold text-rose-400'>{importResults.filter(r => !r.success).length}</p><p className='text-xs text-slate-500'>Failed</p></div>
                                            </div>
                                            <button onClick={() => navigate("/admin/tests")} className='px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg'>Go to Tests</button>
                                        </div>
                                        <div className='space-y-3'>
                                            {importResults.map((result, index) => (
                                                <div key={index} className={`p-4 rounded-lg border ${result.success ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
                                                    <div className='flex items-start gap-3'>
                                                        {result.success ? <FaRegCheckCircle className='text-emerald-500 mt-0.5' /> : <FaRegTimesCircle className='text-rose-500 mt-0.5' />}
                                                        <div><p className='text-sm font-medium text-slate-200'>{result.title}</p>{result.success ? <p className='text-xs text-emerald-400/80 mt-1'>Saved with {result.questionsCount} questions.</p> : <p className='text-xs text-rose-400 mt-1'>Error: {result.error}</p>}</div>
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