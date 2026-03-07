import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  FiUsers, FiFileText, FiDollarSign, FiUserPlus, 
  FiTrendingUp, FiClock, FiBookOpen, FiAward,
  FiBell, FiCalendar, FiDownload, FiFilter,
  FiEye, FiEdit2, FiTrash2, FiMoreVertical,
  FiHome, FiGrid, FiSettings, FiLogOut
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTests: 0,
    totalRevenue: 0,
    newToday: 0,
    testsTakenToday: 0,
    avgScore: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersRes, testsRes, activityRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/recent-activity'),
        API.get('/admin/analytics')
      ]);
      
      setStats(usersRes.data);
      setRecentActivity(activityRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart Data
  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tests Taken',
        data: [65, 78, 82, 91, 85, 110, 95],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'New Registrations',
        data: [45, 52, 48, 61, 55, 70, 63],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const examCategoryData = {
    labels: ['SSC', 'UPSC', 'Banking', 'Railway', 'State PSC'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const performanceData = {
    labels: ['Math', 'Reasoning', 'English', 'GK', 'Science'],
    datasets: [
      {
        label: 'Average Score %',
        data: [68, 72, 65, 58, 70],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-blue-600">AdminPanel</h2>
          <p className="text-sm text-gray-500 mt-1">Test Series Management</p>
        </div>
        
        <nav className="mt-6">
          {[
            { icon: FiHome, label: 'Dashboard', path: '/admin', active: true },
            { icon: FiUsers, label: 'Students', path: '/admin/students' },
            { icon: FiFileText, label: 'Tests', path: '/admin/tests' },
            { icon: FiBookOpen, label: 'Questions', path: '/admin/questions' },
            { icon: FiAward, label: 'Results', path: '/admin/results' },
            { icon: FiDollarSign, label: 'Payments', path: '/admin/payments' },
            { icon: FiBell, label: 'Notices', path: '/admin/notices' },
            { icon: FiSettings, label: 'Settings', path: '/admin/settings' }
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                item.active ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              <item.icon className="mr-3" size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-6 border-t">
          <button className="flex items-center text-gray-600 hover:text-red-600 transition-colors">
            <FiLogOut className="mr-3" size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <FiBell size={20} className="text-gray-600" />
            </button>
            <button className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <FiCalendar size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.name}&background=2563eb&color=fff`}
                alt="Admin"
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium">{user?.name}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm">Total Students</p>
                <h3 className="text-3xl font-bold mt-2">{stats.totalStudents}</h3>
                <p className="text-blue-200 text-sm mt-2">
                  <FiUserPlus className="inline mr-1" size={14} />
                  +{stats.newToday} today
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiUsers size={30} className="text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-r from-green-600 to-green-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100 text-sm">Active Tests</p>
                <h3 className="text-3xl font-bold mt-2">{stats.activeTests}</h3>
                <p className="text-green-200 text-sm mt-2">
                  <FiFileText className="inline mr-1" size={14} />
                  {stats.testsTakenToday} taken today
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiFileText size={30} className="text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-r from-purple-600 to-purple-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100 text-sm">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2 flex items-center">
                  <FaRupeeSign size={20} />
                  {stats.totalRevenue}
                </h3>
                <p className="text-purple-200 text-sm mt-2">
                  <FiTrendingUp className="inline mr-1" size={14} />
                  +12.5% this month
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiDollarSign size={30} className="text-white" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-r from-yellow-600 to-yellow-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-yellow-100 text-sm">Avg. Score</p>
                <h3 className="text-3xl font-bold mt-2">{stats.avgScore}%</h3>
                <p className="text-yellow-200 text-sm mt-2">
                  <FiAward className="inline mr-1" size={14} />
                  +5% improvement
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <FiAward size={30} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity Chart */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Weekly Activity</h3>
              <select className="input-field w-auto py-1">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <div style={{ height: '300px' }}>
              <Line data={weeklyActivityData} options={chartOptions} />
            </div>
          </div>

          {/* Exam Distribution */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Exam Category Distribution</h3>
              <button className="text-blue-600 text-sm hover:underline">View Details →</button>
            </div>
            <div style={{ height: '300px' }} className="flex items-center justify-center">
              <Doughnut data={examCategoryData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance by Subject */}
          <div className="card lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Performance by Subject</h3>
              <button className="text-blue-600 text-sm hover:underline">Export Report</button>
            </div>
            <div style={{ height: '300px' }}>
              <Bar data={performanceData} options={chartOptions} />
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'test' ? 'bg-green-100 text-green-600' :
                    activity.type === 'payment' ? 'bg-purple-100 text-purple-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'test' ? <FiFileText size={16} /> :
                     activity.type === 'payment' ? <FiDollarSign size={16} /> :
                     <FiUserPlus size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <FiClock className="inline mr-1" size={12} />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button 
            onClick={() => navigate('/admin/add-test')}
            className="card hover:border-blue-600 border-2 border-transparent text-center group"
          >
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <FiFileText size={24} className="text-blue-600 group-hover:text-white" />
            </div>
            <h4 className="font-semibold">Add New Test</h4>
            <p className="text-sm text-gray-500 mt-1">Create mock test series</p>
          </button>

          <button className="card hover:border-green-600 border-2 border-transparent text-center group">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-green-600 transition-colors">
              <FiBookOpen size={24} className="text-green-600 group-hover:text-white" />
            </div>
            <h4 className="font-semibold">Add Questions</h4>
            <p className="text-sm text-gray-500 mt-1">Bulk upload from Excel</p>
          </button>

          <button className="card hover:border-purple-600 border-2 border-transparent text-center group">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
              <FiUsers size={24} className="text-purple-600 group-hover:text-white" />
            </div>
            <h4 className="font-semibold">Manage Students</h4>
            <p className="text-sm text-gray-500 mt-1">View & edit profiles</p>
          </button>

          <button className="card hover:border-yellow-600 border-2 border-transparent text-center group">
            <div className="p-4 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
              <FiBell size={24} className="text-yellow-600 group-hover:text-white" />
            </div>
            <h4 className="font-semibold">Send Notice</h4>
            <p className="text-sm text-gray-500 mt-1">Notify all students</p>
          </button>
        </div>

        {/* Recent Students Table */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Students</h3>
            <div className="flex space-x-3">
              <button className="flex items-center text-gray-600 hover:text-blue-600">
                <FiDownload className="mr-2" size={16} />
                Export
              </button>
              <button className="flex items-center text-gray-600 hover:text-blue-600">
                <FiFilter className="mr-2" size={16} />
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Student</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Exam</th>
                  <th className="table-header">Tests Taken</th>
                  <th className="table-header">Avg. Score</th>
                  <th className="table-header">Joined</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <img 
                          src={`https://ui-avatars.com/api/?name=Rahul+Sharma&background=random`}
                          alt="Student"
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <p className="font-medium">Rahul Sharma</p>
                          <p className="text-xs text-gray-500">ID: STU00{item}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">rahul@email.com</td>
                    <td className="table-cell">SSC CGL</td>
                    <td className="table-cell">24</td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <span className="font-medium">68%</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">2 days ago</td>
                    <td className="table-cell">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button className="p-1 hover:bg-blue-100 rounded text-blue-600">
                          <FiEye size={16} />
                        </button>
                        <button className="p-1 hover:bg-green-100 rounded text-green-600">
                          <FiEdit2 size={16} />
                        </button>
                        <button className="p-1 hover:bg-red-100 rounded text-red-600">
                          <FiTrash2 size={16} />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
                          <FiMoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">Showing 1-5 of 150 students</p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded hover:bg-gray-50">Previous</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">3</button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;