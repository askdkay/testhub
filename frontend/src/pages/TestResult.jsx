import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import API from '../services/api';
import { 
  FiCheckCircle, FiXCircle, FiAlertCircle, FiClock, 
  FiBarChart2, FiTrendingUp, FiDownload, FiShare2,
  FiAward, FiTarget, FiBookOpen, FiChevronRight,
  FiUser, FiCalendar, FiPieChart, FiRefreshCw
} from 'react-icons/fi';
import { 
  FaBrain, FaChartLine, FaRocket, FaMedal,
  FaStar, FaRegClock, FaCheckDouble 
} from 'react-icons/fa';

function TestResult() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTestResult();
  }, [testId]);

  const fetchTestResult = async () => {
    try {
      setLoading(true);
      
      // Fetch test attempt data
      const attemptRes = await API.get(`/tests/${testId}/result`);
      const attemptData = attemptRes.data;
      
      // Fetch test details
      const testRes = await API.get(`/tests/${testId}`);
      const testData = testRes.data;
      
      // Fetch user details
      const userRes = await API.get('/auth/profile');
      const userData = userRes.data;
      
      // Fetch all questions with user answers
      const questionsRes = await API.get(`/tests/${testId}/questions-with-answers`);
      const questionsData = questionsRes.data;
      
      // Calculate statistics
      const totalQuestions = questionsData.length;
      const totalMarks = questionsData.reduce((sum, q) => sum + (q.marks || 4), 0);
      const obtainedMarks = questionsData.reduce((sum, q) => {
        if (q.user_answer && q.user_answer === q.correct_answer) {
          return sum + (q.marks || 4);
        } else if (q.user_answer && q.status === 'half-correct') {
          return sum + ((q.marks || 4) / 2);
        }
        return sum;
      }, 0);
      const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
      
      // Count by status
      const correctCount = questionsData.filter(q => q.user_answer && q.user_answer === q.correct_answer).length;
      const incorrectCount = questionsData.filter(q => q.user_answer && q.user_answer !== q.correct_answer && q.status !== 'skipped' && q.status !== 'half-correct').length;
      const skippedCount = questionsData.filter(q => !q.user_answer || q.status === 'skipped').length;
      const halfCorrectCount = questionsData.filter(q => q.status === 'half-correct').length;
      const needReviewCount = questionsData.filter(q => q.marked_for_review === 1).length;
      
      // Calculate average time per question
      const avgTime = questionsData.reduce((sum, q) => sum + (q.time_taken || 0), 0) / totalQuestions;
      const avgTimeFormatted = `${Math.floor(avgTime / 60)}m ${Math.floor(avgTime % 60)}s`;
      
      // Prepare questions array for display
      const formattedQuestions = questionsData.map((q, index) => {
        let status = 'unanswered';
        if (q.user_answer) {
          if (q.user_answer === q.correct_answer) {
            status = 'correct';
          } else if (q.status === 'half-correct') {
            status = 'half-correct';
          } else {
            status = 'incorrect';
          }
        } else if (q.marked_for_review) {
          status = 'need-review';
        } else {
          status = 'skipped';
        }
        
        return {
          id: index + 1,
          questionId: q.id,
          status: status,
          time: q.time_taken ? `${Math.floor(q.time_taken / 60)}m ${q.time_taken % 60}s` : '0s',
          points: (q.user_answer && q.user_answer === q.correct_answer) ? (q.marks || 4) : 0,
          question_text: q.question_text,
          user_answer: q.user_answer,
          correct_answer: q.correct_answer,
          explanation: q.explanation
        };
      });
      
      // Prepare weak topics
      const topicPerformance = {};
      questionsData.forEach(q => {
        const topic = q.topic || 'General';
        if (!topicPerformance[topic]) {
          topicPerformance[topic] = { total: 0, correct: 0 };
        }
        topicPerformance[topic].total++;
        if (q.user_answer && q.user_answer === q.correct_answer) {
          topicPerformance[topic].correct++;
        }
      });
      
      const weakTopics = Object.entries(topicPerformance)
        .filter(([, data]) => (data.correct / data.total) < 0.5)
        .map(([topic, data]) => ({
          topic,
          score: Math.round((data.correct / data.total) * 100)
        }));
      
      const strongTopics = Object.entries(topicPerformance)
        .filter(([, data]) => (data.correct / data.total) >= 0.7)
        .map(([topic, data]) => ({
          topic,
          score: Math.round((data.correct / data.total) * 100)
        }));
      
      // Generate recommendations
      const recommendations = [];
      if (weakTopics.length > 0) {
        recommendations.push(`Focus on improving: ${weakTopics.map(t => t.topic).join(', ')}`);
      }
      if (avgTime > 90) {
        recommendations.push('Work on time management - you are spending too much time per question');
      }
      if (skippedCount > 5) {
        recommendations.push('Try not to skip questions. Attempt all questions for better score');
      }
      if (percentage < 60) {
        recommendations.push('Review basic concepts and take more practice tests');
      } else if (percentage < 75) {
        recommendations.push('Good attempt! Practice more to reach excellence');
      } else {
        recommendations.push('Excellent performance! Keep up the momentum');
      }
      
      // Final result object
      setResultData({
        user: {
          name: userData.name,
          email: userData.email,
          avatar: userData.name?.charAt(0).toUpperCase() || '👤'
        },
        test: {
          id: testData.id,
          name: testData.title,
          completedDate: attemptData.completed_at ? new Date(attemptData.completed_at).toLocaleString() : new Date().toLocaleString(),
          totalQuestions: totalQuestions,
          duration: testData.duration,
          category: testData.category
        },
        score: {
          obtained: obtainedMarks,
          total: totalMarks,
          percentage: percentage,
          correct: correctCount,
          halfCorrect: halfCorrectCount,
          needReview: needReviewCount,
          incorrect: incorrectCount,
          skipped: skippedCount,
          timeTaken: avgTimeFormatted,
          rank: attemptData.rank || 'N/A'
        },
        questions: formattedQuestions,
        weakTopics: weakTopics,
        strongTopics: strongTopics,
        recommendations: recommendations,
        topicPerformance: topicPerformance
      });
      
    } catch (error) {
      console.error('Error fetching test result:', error);
      setError(error.response?.data?.message || 'Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'correct': return 'text-green-500 bg-green-500/20';
      case 'half-correct': return 'text-yellow-500 bg-yellow-500/20';
      case 'need-review': return 'text-orange-500 bg-orange-500/20';
      case 'incorrect': return 'text-red-500 bg-red-500/20';
      case 'skipped': return 'text-gray-500 bg-gray-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'correct': return <FiCheckCircle className="text-green-500" />;
      case 'half-correct': return <FiCheckCircle className="text-yellow-500" />;
      case 'need-review': return <FiAlertCircle className="text-orange-500" />;
      case 'incorrect': return <FiXCircle className="text-red-500" />;
      case 'skipped': return <FiAlertCircle className="text-gray-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
          <button 
            onClick={() => navigate('/tests')}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  if (!resultData) return null;

  return (
    <div className="min-h-screen bg-deep-black text-white font-['Inter'] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] pointer-events-none opacity-20"></div>
      <div className="fixed inset-0 bg-radial-glow pointer-events-none"></div>
      
      {/* Animated Background */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-full blur-3xl"
      />

      <Navbar />

      {/* Main Content */}
      <div className="relative pt-28 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8"
          >
            <div>
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-2">
                <Link to="/tests" className="hover:text-green-400 transition-colors">Tests</Link>
                <FiChevronRight size={14} />
                <span className="text-gray-300">Results</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Test Results
                </span>
              </h1>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(resultData, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `test-result-${testId}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
              >
                <FiDownload className="text-gray-400" />
                <span className="text-sm">Download</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
              >
                <FiShare2 className="text-gray-400" />
                <span className="text-sm">Share</span>
              </button>
            </div>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - User Info & Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* User Card */}
              <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center text-3xl font-bold">
                    {resultData.user.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{resultData.user.name}</h2>
                    <p className="text-gray-400 text-sm">{resultData.user.email}</p>
                    <p className="text-gray-500 text-xs">Student</p>
                  </div>
                </div>
                
                <div className="border-t border-glass-border pt-4 mt-2">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Test Completed</span>
                    <span className="text-gray-300">{resultData.test.completedDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Questions</span>
                    <span className="text-gray-300">{resultData.test.totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">Your Rank</span>
                    <span className="text-yellow-400 font-bold">{resultData.score.rank}</span>
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaBrain className="text-green-400" />
                  Performance Stats
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-gray-400">Correct</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-500">{resultData.score.correct}</span>
                      <span className="text-sm text-gray-500">· {resultData.score.percentage}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-gray-400">Half Correct</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-yellow-500">{resultData.score.halfCorrect}</span>
                      <span className="text-sm text-gray-500">· {Math.round((resultData.score.halfCorrect / resultData.test.totalQuestions) * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-gray-400">Need Review</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-orange-500">{resultData.score.needReview}</span>
                      <span className="text-sm text-gray-500">· {Math.round((resultData.score.needReview / resultData.test.totalQuestions) * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="text-gray-400">Incorrect</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-red-500">{resultData.score.incorrect}</span>
                      <span className="text-sm text-gray-500">· {Math.round((resultData.score.incorrect / resultData.test.totalQuestions) * 100)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                      <span className="text-gray-400">Skipped</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-500">{resultData.score.skipped}</span>
                      <span className="text-sm text-gray-500">· {Math.round((resultData.score.skipped / resultData.test.totalQuestions) * 100)}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 pt-6 border-t border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Score</span>
                    <span className="text-2xl font-bold text-green-400">
                      {resultData.score.obtained}/{resultData.score.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Percentage</span>
                    <span className="text-green-400">{resultData.score.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${resultData.score.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Weak Topics */}
              {resultData.weakTopics.length > 0 && (
                <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiTarget className="text-red-400" />
                    Topics to Improve
                  </h3>
                  <div className="space-y-3">
                    {resultData.weakTopics.map((topic, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{topic.topic}</span>
                          <span className="text-red-400">{topic.score}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                            style={{ width: `${topic.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strong Topics */}
              {resultData.strongTopics.length > 0 && (
                <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaRocket className="text-green-400" />
                    Strong Areas
                  </h3>
                  <div className="space-y-3">
                    {resultData.strongTopics.map((topic, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{topic.topic}</span>
                          <span className="text-green-400">{topic.score}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div 
                            className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${topic.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Training Card */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 border border-green-500/30 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                    <FaBrain />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">AI Performance Analysis</h3>
                    <p className="text-sm text-gray-300 mb-3">
                      Get personalized study plan based on your performance
                    </p>
                    <button className="text-green-400 text-sm font-semibold hover:text-green-300 transition-colors">
                      Generate Report →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Questions & Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Test Info Card */}
              <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-6">
                <h2 className="text-xl font-bold mb-2">{resultData.test.name}</h2>
                <p className="text-gray-400 text-sm mb-4">Finished {resultData.test.completedDate} · {resultData.test.totalQuestions} Questions</p>
                
                {/* Question Numbers Grid */}
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mb-6">
                  {resultData.questions.map((q) => (
                    <motion.div
                      key={q.id}
                      whileHover={{ scale: 1.1 }}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium cursor-pointer transition-all ${getStatusColor(q.status)}`}
                    >
                      {q.id}
                    </motion.div>
                  ))}
                </div>

                {/* Question Status Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-gray-400">Correct</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="text-gray-400">Half Correct</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                    <span className="text-gray-400">Need Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-gray-400">Incorrect</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                    <span className="text-gray-400">Skipped</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl overflow-hidden">
                <div className="flex border-b border-glass-border">
                  {['summary', 'questions', 'analysis'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-all ${
                        activeTab === tab
                          ? 'text-green-400 border-b-2 border-green-400 bg-gradient-to-b from-green-500/10 to-transparent'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {activeTab === 'summary' && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <FaCheckDouble className="text-green-400" />
                          Question Summary
                        </h3>
                        {resultData.questions.map((q) => (
                          <motion.div
                            key={q.id}
                            whileHover={{ x: 5 }}
                            className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-glass-border"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(q.status)}
                              <span className="text-sm">
                                {q.status === 'correct' ? 'Correct' : 
                                 q.status === 'half-correct' ? 'Half Correct' :
                                 q.status === 'need-review' ? 'Need Review' :
                                 q.status === 'incorrect' ? 'Incorrect' : 'Skipped'} Question {q.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <FiClock size={12} />
                                {q.time}
                              </span>
                              <span className="text-green-400">+{q.points}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'questions' && (
                    <div className="space-y-4">
                      {resultData.questions.map((q) => (
                        <div key={q.id} className="p-4 bg-black/30 rounded-xl border border-glass-border">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">Question {q.id}: {q.question_text}</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(q.status)}`}>
                              {q.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className={`flex items-center gap-2 text-sm p-2 rounded ${q.correct_answer === 'A' ? 'bg-green-500/20 border border-green-500' : ''}`}>
                              <input type="radio" checked={q.user_answer === 'A'} readOnly className="text-green-500" /> A. Option A
                            </div>
                            <div className={`flex items-center gap-2 text-sm p-2 rounded ${q.correct_answer === 'B' ? 'bg-green-500/20 border border-green-500' : ''}`}>
                              <input type="radio" checked={q.user_answer === 'B'} readOnly className="text-green-500" /> B. Option B
                            </div>
                            <div className={`flex items-center gap-2 text-sm p-2 rounded ${q.correct_answer === 'C' ? 'bg-green-500/20 border border-green-500' : ''}`}>
                              <input type="radio" checked={q.user_answer === 'C'} readOnly className="text-green-500" /> C. Option C
                            </div>
                            <div className={`flex items-center gap-2 text-sm p-2 rounded ${q.correct_answer === 'D' ? 'bg-green-500/20 border border-green-500' : ''}`}>
                              <input type="radio" checked={q.user_answer === 'D'} readOnly className="text-green-500" /> D. Option D
                            </div>
                          </div>
                          {q.explanation && (
                            <div className="mt-3 p-2 bg-blue-500/10 rounded-lg text-sm text-blue-300">
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'analysis' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                          <h4 className="text-sm text-gray-400 mb-2">Time Spent</h4>
                          <p className="text-2xl font-bold">{resultData.score.timeTaken}</p>
                          <p className="text-xs text-gray-500">avg per question</p>
                        </div>
                        <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                          <h4 className="text-sm text-gray-400 mb-2">Accuracy</h4>
                          <p className="text-2xl font-bold">{resultData.score.percentage}%</p>
                          <p className="text-xs text-gray-500">correct answers</p>
                        </div>
                        <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                          <h4 className="text-sm text-gray-400 mb-2">Your Score</h4>
                          <p className="text-2xl font-bold">{resultData.score.obtained}/{resultData.score.total}</p>
                          <p className="text-xs text-gray-500">out of total marks</p>
                        </div>
                        <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                          <h4 className="text-sm text-gray-400 mb-2">All India Rank</h4>
                          <p className="text-2xl font-bold text-yellow-400">{resultData.score.rank}</p>
                          <p className="text-xs text-gray-500">among all students</p>
                        </div>
                      </div>

                      <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                        <h4 className="font-semibold mb-3">Recommendations</h4>
                        <ul className="space-y-2">
                          {resultData.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                              <FiTarget className="text-green-400" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/test/${testId}/review`)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                >
                  Review Answers
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/tests')}
                  className="flex-1 bg-glass-bg border border-glass-border text-white py-3 rounded-xl font-semibold hover:bg-white/5 transition-all"
                >
                  Try Another Test
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestResult;