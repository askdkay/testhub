import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, FiMapPin,
  FiEdit2, FiCamera, FiAward, FiClock, FiCheckCircle,
  FiTrendingUp, FiStar, FiBookOpen, FiBarChart2
} from 'react-icons/fi';
import { 
  FaGraduationCap, FaRegClock, FaRegStar, FaRegCheckCircle,
  FaMedal, FaChartLine, FaUserGraduate
} from 'react-icons/fa';

function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data - actual API se ayega
  const userData = {
    name: user?.name || 'Rahul Sharma',
    email: user?.email || 'rahul.sharma@email.com',
    phone: user?.phone || '+91 98765 43210',
    dob: '15 May 1995',
    address: 'Mumbai, Maharashtra',
    exam_prep: user?.exam_preparation || 'SSC CGL 2024',
    memberSince: 'Jan 2024',
    bio: 'Aspiring civil servant | SSC CGL 2024 | Love to learn and grow',
    
    stats: {
      testsTaken: 47,
      avgScore: 72,
      totalTime: '156h',
      rank: 1234,
      accuracy: 78,
      streak: 15
    },

    recentTests: [
      { name: 'SSC CGL Mock Test 5', score: '142/200', percentage: 71, date: '2 days ago' },
      { name: 'SSC CGL Mock Test 4', score: '156/200', percentage: 78, date: '5 days ago' },
      { name: 'SSC CGL Mock Test 3', score: '134/200', percentage: 67, date: '1 week ago' },
    ],

    achievements: [
      { name: 'Fast Solver', desc: 'Completed 10 tests under time', icon: '⚡' },
      { name: 'Consistency King', desc: '7 day streak', icon: '🔥' },
      { name: 'Accuracy Pro', desc: '85%+ accuracy in 5 tests', icon: '🎯' },
      { name: 'Rank Booster', desc: 'Top 1000 rank', icon: '🏆' },
    ],

    weakTopics: [
      { topic: 'Algebra', score: 45 },
      { topic: 'Reading Comprehension', score: 60 },
      { topic: 'Current Affairs', score: 55 },
    ],

    strongTopics: [
      { topic: 'Reasoning', score: 85 },
      { topic: 'English Grammar', score: 82 },
      { topic: 'Geography', score: 78 },
    ]
  };

  const getUserInitials = () => {
    if (!userData.name) return 'U';
    return userData.name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-deep-black text-white font-['Inter'] relative overflow-hidden">
      {/* Simple Dark Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-deep-black via-gray-900 to-deep-black"></div>
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10"></div>

      <Navbar />

      {/* Main Content */}
      <div className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                My Profile
              </span>
            </h1>
            <p className="text-gray-400 mt-2">View and manage your profile information</p>
          </motion.div>

          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl border-4 border-green-500/30">
                  {getUserInitials()}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors border-2 border-white">
                  <FiCamera size={14} />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">{userData.name}</h2>
                    <p className="text-green-400 mt-1">{userData.exam_prep}</p>
                    <p className="text-gray-400 text-sm mt-2">{userData.bio}</p>
                  </div>
                  
                  <button className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all self-start">
                    <FiEdit2 className="text-green-400" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FiMail className="text-green-400" />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FiPhone className="text-green-400" />
                    <span>{userData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <FiMapPin className="text-green-400" />
                    <span>{userData.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tests Taken</p>
                  <p className="text-2xl font-bold mt-1">{userData.stats.testsTaken}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FiBookOpen className="text-blue-400 text-xl" />
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Avg. Score</p>
                  <p className="text-2xl font-bold mt-1">{userData.stats.avgScore}%</p>
                </div>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-green-400 text-xl" />
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Time</p>
                  <p className="text-2xl font-bold mt-1">{userData.stats.totalTime}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <FiClock className="text-yellow-400 text-xl" />
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rank</p>
                  <p className="text-2xl font-bold mt-1">#{userData.stats.rank}</p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FiAward className="text-purple-400 text-xl" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: FiUser },
              { id: 'performance', label: 'Performance', icon: FiBarChart2 },
              { id: 'achievements', label: 'Achievements', icon: FiAward },
              { id: 'history', label: 'Test History', icon: FiClock }
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

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6"
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiUser className="text-green-400" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-black/30 rounded-xl">
                      <span className="text-gray-400">Full Name</span>
                      <span className="font-medium">{userData.name}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-black/30 rounded-xl">
                      <span className="text-gray-400">Email</span>
                      <span className="font-medium">{userData.email}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-black/30 rounded-xl">
                      <span className="text-gray-400">Phone</span>
                      <span className="font-medium">{userData.phone}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-black/30 rounded-xl">
                      <span className="text-gray-400">Date of Birth</span>
                      <span className="font-medium">{userData.dob}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-black/30 rounded-xl">
                      <span className="text-gray-400">Address</span>
                      <span className="font-medium">{userData.address}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-black/30 rounded-xl">
                      <span className="text-gray-400">Member Since</span>
                      <span className="font-medium">{userData.memberSince}</span>
                    </div>
                  </div>
                </div>

                {/* Current Stats */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FiBarChart2 className="text-green-400" />
                    Current Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-4 bg-black/30 rounded-xl text-center">
                      <p className="text-2xl font-bold text-green-400">{userData.stats.accuracy}%</p>
                      <p className="text-xs text-gray-400 mt-1">Accuracy</p>
                    </div>
                    <div className="p-4 bg-black/30 rounded-xl text-center">
                      <p className="text-2xl font-bold text-yellow-400">{userData.stats.streak}</p>
                      <p className="text-xs text-gray-400 mt-1">Day Streak</p>
                    </div>
                  </div>

                  {/* Weak Topics */}
                  <h4 className="font-medium mb-3 text-sm text-gray-400">Topics to Improve</h4>
                  <div className="space-y-2 mb-4">
                    {userData.weakTopics.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-sm w-24">{topic.topic}</span>
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${topic.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-red-400">{topic.score}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Strong Topics */}
                  <h4 className="font-medium mb-3 text-sm text-gray-400">Strong Areas</h4>
                  <div className="space-y-2">
                    {userData.strongTopics.map((topic, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-sm w-24">{topic.topic}</span>
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${topic.score}%` }}
                          />
                        </div>
                        <span className="text-xs text-green-400">{topic.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Performance Analytics</h3>
                <div className="h-64 flex items-center justify-center bg-black/30 rounded-xl border border-glass-border">
                  <p className="text-gray-400">Performance charts will appear here</p>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userData.achievements.map((achievement, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-black/30 rounded-xl border border-glass-border">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h4 className="font-semibold">{achievement.name}</h4>
                        <p className="text-sm text-gray-400">{achievement.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Tests</h3>
                <div className="space-y-3">
                  {userData.recentTests.map((test, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-glass-border">
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-sm text-gray-400 mt-1">{test.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">{test.score}</p>
                        <p className="text-sm text-gray-400">{test.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Profile;