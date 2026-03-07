import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
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
  
  // Mock Data - Actual API se ayega
  const resultData = {
    user: {
      name: 'Adit Irawan',
      role: 'Jr UI/UX Designer',
      department: 'Design',
      avatar: '👨‍🎨'
    },
    test: {
      name: 'Figma skill - How to make great design',
      completedDate: 'Aug 03, 2023 · 10:00 AM',
      totalQuestions: 20,
      duration: '45 min',
      category: 'Design'
    },
    score: {
      correct: 24,
      total: 33, // Total marks (20 questions * 4 = 80, but yahan 33 hai?)
      percentage: 72,
      halfCorrect: 1,
      needReview: 1,
      incorrect: 4,
      skipped: 1,
      timeTaken: '32s avg'
    },
    questions: [
      { id: 1, status: 'correct', time: '28s', points: 4 },
      { id: 2, status: 'correct', time: '32s', points: 4 },
      { id: 3, status: 'correct', time: '25s', points: 4 },
      { id: 4, status: 'correct', time: '35s', points: 4 },
      { id: 5, status: 'correct', time: '42s', points: 4 },
      { id: 6, status: 'correct', time: '30s', points: 4 },
      { id: 7, status: 'correct', time: '28s', points: 4 },
      { id: 8, status: 'correct', time: '33s', points: 4 },
      { id: 9, status: 'correct', time: '31s', points: 4 },
      { id: 10, status: 'correct', time: '29s', points: 4 },
      { id: 11, status: 'correct', time: '34s', points: 4 },
      { id: 12, status: 'correct', time: '27s', points: 4 },
      { id: 13, status: 'correct', time: '36s', points: 4 },
      { id: 14, status: 'correct', time: '41s', points: 4 },
      { id: 15, status: 'half-correct', time: '45s', points: 2 },
      { id: 16, status: 'need-review', time: '52s', points: 0 },
      { id: 17, status: 'incorrect', time: '38s', points: 0 },
      { id: 18, status: 'incorrect', time: '44s', points: 0 },
      { id: 19, status: 'incorrect', time: '39s', points: 0 },
      { id: 20, status: 'skipped', time: '0s', points: 0 }
    ],
    projects: [
      { name: 'Figma basic', progress: 80 },
      { name: 'Fikri studio', progress: 45 }
    ],
    recommendations: [
      'Practice more UI components',
      'Review color theory basics',
      'Take typography workshop'
    ]
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
              >
                <FiDownload className="text-gray-400" />
                <span className="text-sm">Download</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
              >
                <FiShare2 className="text-gray-400" />
                <span className="text-sm">Share</span>
              </motion.button>
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
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center text-3xl">
                    {resultData.user.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{resultData.user.name}</h2>
                    <p className="text-gray-400 text-sm">{resultData.user.department}</p>
                    <p className="text-gray-500 text-xs">{resultData.user.role}</p>
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
                </div>
              </div>

              {/* Stats Card - Exactly like image */}
              <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaBrain className="text-green-400" />
                  Performance Stats
                </h3>
                
                <div className="space-y-4">
                  {/* Correct */}
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
                  
                  {/* Half Correct */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-gray-400">Half Correct</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-yellow-500">{resultData.score.halfCorrect}</span>
                      <span className="text-sm text-gray-500">· 3%</span>
                    </div>
                  </div>
                  
                  {/* Need Review */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-gray-400">Need Review</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-orange-500">{resultData.score.needReview}</span>
                      <span className="text-sm text-gray-500">· 3%</span>
                    </div>
                  </div>
                  
                  {/* Incorrect */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="text-gray-400">Incorrect</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-red-500">{resultData.score.incorrect}</span>
                      <span className="text-sm text-gray-500">· 12%</span>
                    </div>
                  </div>
                  
                  {/* Skipped */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                      <span className="text-gray-400">Skipped</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-500">{resultData.score.skipped}</span>
                      <span className="text-sm text-gray-500">· 3%</span>
                    </div>
                  </div>
                </div>

                {/* Progress Circle */}
                <div className="mt-6 pt-6 border-t border-glass-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">Overall Score</span>
                    <span className="text-2xl font-bold text-green-400">{resultData.score.percentage}%</span>
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

              {/* Projects Card */}
              <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FaRocket className="text-blue-400" />
                  Projects
                </h3>
                
                <div className="space-y-4">
                  {resultData.projects.map((project, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{project.name}</span>
                        <span className="text-gray-400">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-1.5">
                        <div 
                          className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Training Card */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 border border-green-500/30 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                    <FaBrain />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">Get Training AI</h3>
                    <p className="text-sm text-gray-300 mb-3">
                      Use AI in every action on your Training webapp
                    </p>
                    <button className="text-green-400 text-sm font-semibold hover:text-green-300 transition-colors">
                      Try it now →
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
                <p className="text-gray-400 text-sm mb-4">Finished {resultData.test.completedDate} · 20 Questions</p>
                
                {/* Question Numbers Grid - Exactly like image */}
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
                      {/* Question List - Exactly like image */}
                      <div className="space-y-3">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <FaCheckDouble className="text-green-400" />
                          Quiz
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
                                 q.status === 'incorrect' ? 'Incorrect' : 'Skipped'} {q.id}
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

                      {/* Sample Question - Like in image */}
                      <div className="mt-6 p-4 bg-black/40 rounded-xl border border-glass-border">
                        <p className="text-sm text-gray-300 mb-2">
                          What does UI stand for in the context of design?
                        </p>
                        <div className="flex gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiClock size={12} />
                            Time 32s
                          </span>
                          <span className="flex items-center gap-1">
                            <FaStar size={12} className="text-yellow-500" />
                            30 points
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'questions' && (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 bg-black/30 rounded-xl border border-glass-border">
                          <p className="font-medium mb-2">Question {i}: Which aspect of UI design involves choosing colors, typography, and creating icons?</p>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="flex items-center gap-2 text-sm">
                              <input type="radio" className="text-green-500" /> A. Layout
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <input type="radio" className="text-green-500" /> B. Visual Design ✓
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <input type="radio" className="text-green-500" /> C. Interaction
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <input type="radio" className="text-green-500" /> D. Information
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'analysis' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                          <h4 className="text-sm text-gray-400 mb-2">Time Spent</h4>
                          <p className="text-2xl font-bold">32s</p>
                          <p className="text-xs text-gray-500">avg per question</p>
                        </div>
                        <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                          <h4 className="text-sm text-gray-400 mb-2">Accuracy</h4>
                          <p className="text-2xl font-bold">{resultData.score.percentage}%</p>
                          <p className="text-xs text-gray-500">correct answers</p>
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