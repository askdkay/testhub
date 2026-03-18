import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  RadialLinearScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  FiHome, FiUsers, FiFileText, FiDollarSign, FiTrendingUp,
  FiUserPlus, FiClock, FiBookOpen, FiAward, FiBell,
  FiCalendar, FiDownload, FiFilter, FiEye, FiEdit2,
  FiTrash2, FiMoreVertical, FiSettings, FiLogOut,
  FiPieChart, FiBarChart2, FiActivity, FiStar,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw,
  FiMail, FiPhone, FiMapPin, FiGlobe, FiLock,
  FiShoppingBag, FiCreditCard, FiUsers as FiUserGroup,
  FiCpu, FiTarget, FiThumbsUp, FiThumbsDown
} from 'react-icons/fi';
import {
  FaRupeeSign, FaGraduationCap, FaChartLine, FaShieldAlt,
  FaRocket, FaMedal, FaCrown, FaRegClock, FaRegStar,
  FaRegCheckCircle, FaRegUser, FaRegFileAlt, FaRegCalendarAlt
} from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [selectedSection, setSelectedSection] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  // State for all data
  const [stats, setStats] = useState({
    totalUsers: 15432,
    activeUsers: 8754,
    newToday: 234,
    totalTests: 187,
    activeTests: 145,
    testsToday: 1234,
    totalRevenue: 4567890,
    monthlyRevenue: 987654,
    avgScore: 68.5,
    passRate: 72.3,
    conversionRate: 23.4,
    bounceRate: 12.5
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'user', action: 'New registration', user: 'Rahul Sharma', time: '2 min ago', icon: '👤' },
  ]);

  // const [topStudents, setTopStudents] = useState([
  //   { id: 1, name: 'Priya Sharma', score: 98.5, tests: 45, rank: 1, avatar: '👩‍🎓' },

  // ]);

  // const [popularTests, setPopularTests] = useState([
  //   { id: 1, name: 'SSC CGL Mock Test 2024', attempts: 15432, avgScore: 68, revenue: 876543, status: 'trending' },

  // ]);

  // const [recentUsers, setRecentUsers] = useState([
  //   { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', exam: 'SSC CGL', joined: '2 min ago', status: 'active', avatar: '👤' },

  // ]);

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New user registration: 234 today', type: 'info', time: '5 min ago' },

  ]);

  // Chart Data
  const userGrowthData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Users',
        data: [145, 178, 192, 210, 234, 267, 289],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverRadius: 6
      },
      {
        label: 'Active Users',
        data: [876, 923, 1012, 1087, 1156, 1234, 1345],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverRadius: 6
      }
    ]
  };

  const testActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tests Taken',
        data: [654, 723, 812, 897, 945, 1023, 1156],
        backgroundColor: '#10b981',
        borderRadius: 6,
        barPercentage: 0.6
      }
    ]
  };

  const examCategoryData = {
    labels: ['SSC', 'UPSC', 'Banking', 'Railway', 'Defence', 'State PSC'],
    datasets: [
      {
        data: [35, 25, 20, 12, 5, 3],
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899'
        ],
        borderWidth: 0,
        hoverOffset: 10
      }
    ]
  };

  const performanceRadarData = {
    labels: ['Math', 'Reasoning', 'English', 'GK', 'Science', 'Computer'],
    datasets: [
      {
        label: 'Average Score',
        data: [68, 72, 65, 58, 70, 75],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10b981',
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#10b981'
      }
    ]
  };

  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [450000, 520000, 610000, 780000, 890000, 987654],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: true,
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#9ca3af'
        }
      }
    }
  };

  // Simulate data loading
  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const updateChartData = async (range) => {
    try {
      const res = await API.get(`/admin/chart-data?range=${range}`);

      setUserGrowthData({
        labels: res.data.labels,
        datasets: [
          {
            label: 'New Users',
            data: res.data.newUsers,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Active Users',
            data: res.data.activeUsers,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      });

      setTestActivityData({
        labels: res.data.labels,
        datasets: [{
          label: 'Tests Taken',
          data: res.data.testsTaken,
          backgroundColor: '#10b981',
          borderRadius: 6
        }]
      });

    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [statsRes,
        activityRes,
        // topStudentsRes, 
        // popularTestsRes, 
        usersRes] = await Promise.all([
          API.get('/admin/stats'),
          API.get('/admin/recent-activity'),
          // API.get('/admin/top-students'),
          // API.get('/admin/popular-tests'),
          // API.get('/admin/recent-users')
        ]);

      setStats(statsRes.data);
      setRecentActivities(activityRes.data);
      // setTopStudents(topStudentsRes.data);
      // setPopularTests(popularTestsRes.data);
      // setRecentUsers(usersRes.data);

      // Update chart data with real data
      updateChartData(timeRange);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-white font-['Inter']">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-deep-black via-gray-900 to-deep-black"></div>
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10"></div>

      {/* Main Layout */}
      <div className="relative flex">

        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed left-0 top-0 h-full w-72 bg-glass-bg border-r border-glass-border backdrop-blur-xl z-40"
        >
          {/* Logo */}
          <div className="p-6 border-b border-glass-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FiHome className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                <p className="text-xs text-gray-400">v2.0.0</p>
              </div>
            </div>
          </div>

          {/* Admin Profile */}
          <div className="p-6 border-b border-glass-border">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-semibold">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">Super Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-4 space-y-1">
            {[
              { icon: FiHome, label: 'Overview', id: 'overview', count: null, path: '/admin' },
              { icon: FiUsers, label: 'Users', id: 'users', count: stats.totalUsers, path: '/admin/users' },
              { icon: FiFileText, label: 'Tests', id: 'tests', count: stats.totalTests, path: '/admin/tests' },
              { icon: FiFileText, label: 'Content', id: 'content', path: '/admin/content' },
              { icon: FiAward, label: 'Exams Page', id: 'categoriesExams', count: null, path: '/admin/exam-pages' },
              { icon: FiFileText, label: 'Blogs', id: 'blogs', count: 234, path: '/admin/blogs' },
              { icon: FiUsers, label: 'Students', id: 'students', count: null, path: '/admin/students' },
              // { icon: FiSettings, label: 'Settings', id: 'settings', count: null, path: '/admin/settings' },
              { icon: FiSettings, label: 'Categories Exams', id: 'categories-exams', count: null, path: '/admin/categories-exams' },

              // { icon: FiFileText, label: 'Test Management', id: 'tests', count: stats.totalTests,path: '/admin/testmanagement' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedSection(item.id);
                  navigate(item.path);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${selectedSection === item.id
                    ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 border border-green-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </div>
                {item.count && (
                  <span className={`text-xs px-2 py-1 rounded-full ${selectedSection === item.id
                      ? 'bg-green-500/30 text-green-400'
                      : 'bg-gray-800 text-gray-400'
                    }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="absolute bottom-6 left-0 right-0 px-4">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 ml-72 p-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Welcome back, {user?.name}!
                </span>
              </h1>
              <p className="text-gray-400 mt-2">Here's what's happening with your platform today</p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-glass-bg border border-glass-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500/50"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all relative"
                >
                  <FiBell size={20} className="text-gray-400" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-glass-border">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-glass-border last:border-0 hover:bg-white/5 transition-all">
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${notif.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                  notif.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                    notif.type === 'error' ? 'bg-red-500/20 text-red-400' :
                                      'bg-blue-500/20 text-blue-400'
                                }`}>
                                {notif.type === 'success' ? <FiCheckCircle /> :
                                  notif.type === 'warning' ? <FiAlertCircle /> :
                                    notif.type === 'error' ? <FiXCircle /> :
                                      <FiBell />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Refresh Button */}
              <button className="p-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all">
                <FiRefreshCw size={20} className="text-gray-400" />
              </button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
          >
            <button
              onClick={() => navigate('/admin/add-test')}
              className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6 hover:border-green-500/30 transition-all group text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiFileText className="text-green-400 text-2xl" />
              </div>
              <h4 className="font-semibold">Add New Test</h4>
              <p className="text-xs text-gray-400 mt-2">Create mock test series</p>
            </button>



          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;