import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { 
  FiClock, FiChevronLeft, FiChevronRight, FiFlag,
  FiHelpCircle, FiFileText, FiInfo, FiGrid,
  FiList, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiBookOpen, FiMonitor, FiSmartphone, FiTablet,
  FiMenu, FiX
} from 'react-icons/fi';
import { 
  FaBrain, FaLanguage, FaNetworkWired, 
  FaQuestionCircle, FaRegClock, FaCheckDouble,
  FaStar, FaRegStar, FaBookmark, FaRegBookmark
} from 'react-icons/fa';

// Background Image URL
const BG_IMAGE = "";

function TakeTest() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [markedForReview, setMarkedForReview] = useState([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSidebar, setShowSidebar] = useState(false);
    const [language, setLanguage] = useState('english'); // english or hindi
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        loadTest();
    }, [id]);

    useEffect(() => {
        if (test && test.duration) {
            setTimeLeft(test.duration * 60); // Convert to seconds
        }
    }, [test]);

    // Timer
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && test) {
            handleSubmit();
        }
    }, [timeLeft]);

    const loadTest = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log('Current token:', token);
            
            const res = await API.get(`/tests/${id}`);
            console.log('Test data loaded:', res.data);
            
            if (!res.data.questions) {
                res.data.questions = [];
            }
            
            setTest(res.data);
            setError('');
        } catch (error) {
            console.error('Error loading test:', error);
            console.error('Error response:', error.response?.data);
            setError('Failed to load test. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId, answer) => {
        setAnswers({
            ...answers,
            [questionId]: answer
        });
    };

    const toggleMarkForReview = (questionId) => {
        setMarkedForReview(prev =>
            prev.includes(questionId) 
                ? prev.filter(id => id !== questionId) 
                : [...prev, questionId]
        );
    };

    const handleSubmit = async () => {
        // Calculate score
        let score = 0;
        test.questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                score += 4;
            }
        });

        // Show result alert
        alert(`Test completed! Your score: ${score}/${test.questions.length * 4}`);
        
        // Redirect to result page
        navigate(`/test-result/${id}`);
    };

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getTimeStatus = () => {
        if (timeLeft < 300) return 'text-red-500 animate-pulse'; // Last 5 minutes
        if (timeLeft < 600) return 'text-yellow-500'; // Last 10 minutes
        return 'text-green-500';
    };

    const getQuestionStatus = (qId) => {
        if (answers[qId]) return 'answered';
        if (markedForReview.includes(qId)) return 'review';
        return 'unanswered';
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'answered': return 'bg-green-500';
            case 'review': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-deep-black flex items-center justify-center ">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 mt-4">Loading test...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-deep-black flex items-center justify-center px-4">
                <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiXCircle className="text-red-500 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button 
                        onClick={() => navigate('/tests')}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                    >
                        Back to Tests
                    </button>
                </div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="min-h-screen bg-deep-black flex items-center justify-center px-4">
                <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="text-yellow-500 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Test Not Found</h2>
                    <p className="text-gray-400 mb-6">The test you're looking for doesn't exist.</p>
                    <button 
                        onClick={() => navigate('/tests')}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                    >
                        Browse Tests
                    </button>
                </div>
            </div>
        );
    }

    if (!test.questions || test.questions.length === 0) {
        return (
            <div className="min-h-screen bg-deep-black flex items-center justify-center px-4">
                <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiFileText className="text-orange-500 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No Questions Added</h2>
                    <p className="text-gray-400 mb-6">This test doesn't have any questions yet.</p>
                    <button 
                        onClick={() => navigate('/tests')}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                    >
                        Browse Other Tests
                    </button>
                </div>
            </div>
        );
    }

    const question = test.questions[currentQuestion];
    
    if (!question) {
        return (
            <div className="min-h-screen bg-deep-black flex items-center justify-center">
                <p className="text-gray-400">Question not found</p>
            </div>
        );
    }

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
            <div className="relative pt-26 pb-8 px-4 md:px-6 lg:px-8 min-h-screen flex flex-col">
                
                {/* Header with Timer */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                            <FaRegClock className="text-2xl text-green-400" />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Time Left</p>
                            <h2 className={`text-3xl md:text-4xl font-bold font-mono ${getTimeStatus()}`}>
                                {formatTime(timeLeft)}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="lg:hidden p-2 bg-glass-bg border border-glass-border rounded-xl"
                        >
                            {showSidebar ? <FiX size={20} /> : <FiMenu size={20} />}
                        </button>

                        {/* Language Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setLanguage(lang => lang === 'english' ? 'hindi' : 'english')}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
                        >
                            <FaLanguage className="text-green-400" />
                            <span className="text-sm">
                                {language === 'english' ? 'हिंदी' : 'English'}
                            </span>
                        </motion.button>

                        {/* Help Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowInstructions(!showInstructions)}
                            className="p-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
                        >
                            <FiHelpCircle className="text-gray-400" size={20} />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Instructions Panel */}
                <AnimatePresence>
                    {showInstructions && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FiInfo className="text-blue-400 text-xl" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold mb-2">Instructions</h4>
                                    <ul className="space-y-1 text-sm text-gray-300">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                                            Total duration: {test.duration} minutes
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                                            Total questions: {test.questions.length}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                                            Each question carries 4 marks
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                                            No negative marking
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    onClick={() => setShowInstructions(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* Sidebar - Topics (Hidden on mobile, togglable) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`${
                            showSidebar ? 'block' : 'hidden'
                        } lg:block lg:col-span-1 space-y-4`}
                    >
                        <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-4 sticky top-24">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <FiBookOpen className="text-green-400" />
                                Questions Overview
                            </h3>
                            
                            {/* Question Palette */}
                            <div className="grid grid-cols-5 gap-2 mb-4">
                                {test.questions.map((q, index) => (
                                    <motion.button
                                        key={q.id}
                                        whileHover={{ scale: 1.1 }}
                                        onClick={() => {
                                            setCurrentQuestion(index);
                                            setShowSidebar(false);
                                        }}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                                            currentQuestion === index
                                                ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                                                : getQuestionStatus(q.id) === 'answered'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : getQuestionStatus(q.id) === 'review'
                                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                : 'bg-black/30 text-gray-400 border border-glass-border hover:border-green-500/50'
                                        }`}
                                    >
                                        {index + 1}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Status Legend */}
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                    <span className="text-gray-400">Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                    <span className="text-gray-400">Marked for Review</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                                    <span className="text-gray-400">Not Visited</span>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-4 pt-4 border-t border-glass-border">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Answered:</span>
                                    <span className="text-green-400 font-bold">
                                        {Object.keys(answers).length}/{test.questions.length}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Review:</span>
                                    <span className="text-yellow-400 font-bold">
                                        {markedForReview.length}/{test.questions.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Content - Current Question */}
                    <motion.div
                        key={currentQuestion}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:col-span-3"
                    >
                        <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6">
                            
                            {/* Question Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs px-2 py-1 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full text-green-400">
                                            Question {currentQuestion + 1} of {test.questions.length}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            getQuestionStatus(question.id) === 'answered' 
                                                ? 'bg-green-500/20 text-green-400'
                                                : getQuestionStatus(question.id) === 'review'
                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {getQuestionStatus(question.id) === 'answered' ? 'Answered' :
                                             getQuestionStatus(question.id) === 'review' ? 'Marked for Review' :
                                             'Not Answered'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold">Question {currentQuestion + 1}</h3>
                                </div>
                                
                                {/* Mark for Review Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleMarkForReview(question.id)}
                                    className={`p-3 rounded-xl transition-all ${
                                        markedForReview.includes(question.id)
                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            : 'bg-black/30 text-gray-400 hover:text-yellow-400 border border-glass-border'
                                    }`}
                                >
                                    {markedForReview.includes(question.id) ? (
                                        <FaBookmark size={20} />
                                    ) : (
                                        <FaRegBookmark size={20} />
                                    )}
                                </motion.button>
                            </div>

                            {/* Question Text - Bilingual */}
                            <div className="mb-6 p-4 bg-black/30 rounded-xl border border-glass-border">
                                <p className="text-lg text-gray-200 mb-2">{question.question_text}</p>
                                {language === 'hindi' && (
                                    <p className="text-gray-400 text-sm border-t border-glass-border pt-2 mt-2">
                                        {/* Add Hindi translation if available */}
                                        {question.question_text_hindi || question.question_text}
                                    </p>
                                )}
                            </div>

                            {/* Options */}
                            <div className="space-y-3 mb-8">
                                {['A', 'B', 'C', 'D'].map(option => {
                                    const optionText = question[`option_${option.toLowerCase()}`];
                                    return (
                                        <motion.div
                                            key={option}
                                            whileHover={{ scale: 1.02 }}
                                            className={`relative p-4 bg-black/30 border rounded-xl cursor-pointer transition-all ${
                                                answers[question.id] === option
                                                    ? 'border-green-500 bg-green-500/10'
                                                    : 'border-glass-border hover:border-green-500/50'
                                            }`}
                                            onClick={() => handleAnswer(question.id, option)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                    answers[question.id] === option
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-800 text-gray-400'
                                                }`}>
                                                    {option}
                                                </span>
                                                <span className="text-gray-200">{optionText}</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex flex-col sm:flex-row justify-between gap-3">
                                <button
                                    onClick={() => setCurrentQuestion(curr => Math.max(0, curr - 1))}
                                    disabled={currentQuestion === 0}
                                    className={`px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                                        currentQuestion === 0
                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            : 'bg-glass-bg border border-glass-border hover:border-green-500/50 text-white'
                                    }`}
                                >
                                    <FiChevronLeft size={20} />
                                    Previous
                                </button>

                                {currentQuestion === test.questions.length - 1 ? (
                                    <button
                                        onClick={handleSubmit}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
                                    >
                                        Submit Test
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQuestion(curr => curr + 1)}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center justify-center gap-2"
                                    >
                                        Next
                                        <FiChevronRight size={20} />
                                    </button>
                                )}

                                <button
                                    onClick={() => setCurrentQuestion(test.questions.length - 1)}
                                    className="px-6 py-3 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
                                >
                                    Last Question
                                </button>
                            </div>

                            {/* Quick Navigation */}
                            <div className="mt-6 pt-4 border-t border-glass-border">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-400">Quick Jump:</span>
                                    <div className="flex gap-1">
                                        {[0, 1, 2, 3, 4].map(num => {
                                            const qIndex = Math.floor(currentQuestion / 5) * 5 + num;
                                            if (qIndex >= test.questions.length) return null;
                                            return (
                                                <button
                                                    key={qIndex}
                                                    onClick={() => setCurrentQuestion(qIndex)}
                                                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                                                        currentQuestion === qIndex
                                                            ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                                                            : getQuestionStatus(test.questions[qIndex]?.id) === 'answered'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : getQuestionStatus(test.questions[qIndex]?.id) === 'review'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-black/30 text-gray-400 hover:border-green-500/50 border border-glass-border'
                                                    }`}
                                                >
                                                    {qIndex + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setShowSidebar(true)}
                                        className="lg:hidden text-sm text-green-400 hover:text-green-300"
                                    >
                                        View All
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default TakeTest;