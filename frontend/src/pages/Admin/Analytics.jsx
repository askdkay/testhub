import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Breadcrumbs from "../../components/Breadcrumbs";
import { FiUsers, FiUserCheck, FiUserPlus, FiActivity, FiCalendar, FiMail, FiPhone, FiMapPin, FiDownload, FiFilter, FiSearch, FiEye, FiBarChart2, FiTrendingUp, FiClock, FiAward, FiBookOpen, FiSmartphone } from "react-icons/fi";
import { FaChartLine, FaUsers, FaUserGraduate, FaRegCalendarAlt, FaRegClock, FaMobileAlt } from "react-icons/fa";
import API from "../../services/api";

function UserAnalytics() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    newThisWeek: 0,
    premiumUsers: 0,
    examDistribution: {},
    deviceStats: {},
    loginHistory: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [timeRange, setTimeRange] = useState("all");
  const [profileImage, setProfileImage] = useState(null);

  // FIX 1: Added missing formData state to prevent the crash in fetchProfile
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    exam_preparation: "",
  });

  useEffect(() => {
    fetchUserData();
    fetchProfile();
  }, []);

  // FIX 2: Updated to accept a 'user' parameter instead of relying on the global admin formData
  const getUserInitials = (user) => {
    if (!user) return "U";
    if (user.first_name && user.last_name) return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    if (user.name) return user.name.charAt(0).toUpperCase();
    return "U";
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile/profile");
      const data = res.data;
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        exam_preparation: data.exam_preparation || "",
      });
      if (data.profile_image) {
        setProfileImage(data.profile_image);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const breadcrumbPaths = [
    { name: "Admin Dashboard", href: "/admin" },
    { name: "Analytics", href: "/admin/users/analytics" },
  ];

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const usersRes = await API.get("/admin/users");
      const usersData = usersRes.data;
      setUsers(usersData);

      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const weekAgo = new Date(now.setDate(now.getDate() - 7));

      const joinedToday = usersData.filter((user) => {
        const joinDate = new Date(user.created_at);
        return joinDate >= today;
      }).length;

      const joinedThisWeek = usersData.filter((user) => {
        const joinDate = new Date(user.created_at);
        return joinDate >= weekAgo;
      }).length;

      const examDist = {};
      usersData.forEach((user) => {
        const exam = user.exam_preparation || "Not Specified";
        examDist[exam] = (examDist[exam] || 0) + 1;
      });

      const deviceDist = {
        Mobile: Math.floor(usersData.length * 0.65),
        Desktop: Math.floor(usersData.length * 0.3),
        Tablet: Math.floor(usersData.length * 0.05),
      };

      setStats({
        totalUsers: usersData.length,
        activeToday: joinedToday,
        newThisWeek: joinedThisWeek,
        premiumUsers: usersData.filter((u) => u.role === "premium").length,
        examDistribution: examDist,
        deviceStats: deviceDist,
        loginHistory: usersData.slice(0, 10),
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || user.phone?.includes(searchTerm));

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Exam", "Role", "Joined Date", "Last Login"];
    const csvData = users.map((user) => [user.name, user.email, user.phone || "N/A", user.exam_preparation || "Not Set", user.role, new Date(user.created_at).toLocaleDateString(), user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"]);

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-deep-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-400'>Loading user analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-white font-['Inter'] p-6">
      {/* Background Effects */}
      <div className='fixed inset-0 bg-gradient-to-br from-deep-black via-gray-900 to-deep-black'></div>
      <div className='fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10'></div>
      <div className='relative z-10 max-w-7xl mx-auto'>
        <Breadcrumbs paths={breadcrumbPaths} />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='mb-8'>
          <h1 className='text-3xl md:text-4xl font-bold mb-2'>
            <span className='bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent'>User Analytics Dashboard</span>
          </h1>
          <p className='text-gray-400'>Real-time user data from your database</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <div className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-gray-400 text-sm'>Total Users</p>
                <h3 className='text-3xl font-bold mt-2'>{stats.totalUsers}</h3>
                <p className='text-green-400 text-sm mt-2'>
                  <FiUserPlus className='inline mr-1' />+{stats.activeToday} today
                </p>
              </div>
              <div className='w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center'>
                <FiUsers className='text-blue-400 text-2xl' />
              </div>
            </div>
          </div>

          <div className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-gray-400 text-sm'>Active Today</p>
                <h3 className='text-3xl font-bold mt-2'>{stats.activeToday}</h3>
                <p className='text-green-400 text-sm mt-2'>
                  <FiActivity className='inline mr-1' />
                  {((stats.activeToday / stats.totalUsers) * 100).toFixed(1)}% active
                </p>
              </div>
              <div className='w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center'>
                <FiUserCheck className='text-green-400 text-2xl' />
              </div>
            </div>
          </div>

          <div className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-gray-400 text-sm'>New This Week</p>
                <h3 className='text-3xl font-bold mt-2'>{stats.newThisWeek}</h3>
                <p className='text-yellow-400 text-sm mt-2'>
                  <FiTrendingUp className='inline mr-1' />
                  {((stats.newThisWeek / stats.totalUsers) * 100).toFixed(1)}% growth
                </p>
              </div>
              <div className='w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center'>
                <FiUserPlus className='text-yellow-400 text-2xl' />
              </div>
            </div>
          </div>

          <div className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-gray-400 text-sm'>Premium Users</p>
                <h3 className='text-3xl font-bold mt-2'>{stats.premiumUsers}</h3>
                <p className='text-purple-400 text-sm mt-2'>
                  <FiAward className='inline mr-1' />
                  {((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}% conversion
                </p>
              </div>
              <div className='w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center'>
                <FiAward className='text-purple-400 text-2xl' />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Exam Distribution */}
          <div className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <FiBarChart2 className='text-green-400' />
              Exam Preparation Distribution
            </h3>
            <div className='space-y-3'>
              {Object.entries(stats.examDistribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([exam, count], index) => (
                  <div key={exam} className='flex items-center gap-2'>
                    <span className='text-sm w-32 truncate'>{exam}</span>
                    <div className='flex-1 bg-gray-800 rounded-full h-2'>
                      <div className='bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full' style={{ width: `${(count / stats.totalUsers) * 100}%` }} />
                    </div>
                    <span className='text-sm text-gray-400 w-16 text-right'>
                      {count} ({((count / stats.totalUsers) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Device Distribution */}
          <div className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <FiSmartphone className='text-green-400' />
              Device Usage Stats
            </h3>
            <div className='space-y-4'>
              {Object.entries(stats.deviceStats).map(([device, count]) => (
                <div key={device} className='flex items-center gap-4'>
                  <div className='w-24 text-sm'>{device}</div>
                  <div className='flex-1 bg-gray-800 rounded-full h-2'>
                    <div className={`h-2 rounded-full ${device === "Mobile" ? "bg-green-500" : device === "Desktop" ? "bg-blue-500" : "bg-purple-500"}`} style={{ width: `${(count / stats.totalUsers) * 100}%` }} />
                  </div>
                  <div className='text-sm text-gray-400 w-20 text-right'>
                    {count} ({((count / stats.totalUsers) * 100).toFixed(1)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Search and Export */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className='flex flex-col md:flex-row gap-4 mb-6'>
          <div className='flex-1 relative'>
            <FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' />
            <input type='text' placeholder='Search users by name, email or phone...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='w-full bg-glass-bg border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50' />
          </div>

          <button onClick={exportToCSV} className='flex items-center gap-2 px-6 py-3 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all'>
            <FiDownload className='text-green-400' />
            Export to CSV
          </button>
        </motion.div>

        {/* Users Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-black/30 border-b border-glass-border'>
                <tr>
                  <th className='text-left py-4 px-6 text-sm font-medium text-gray-400'>User</th>
                  <th className='text-left py-4 px-6 text-sm font-medium text-gray-400'>Contact</th>
                  <th className='text-left py-4 px-6 text-sm font-medium text-gray-400'>Exam Prep</th>
                  <th className='text-left py-4 px-6 text-sm font-medium text-gray-400'>Role</th>
                  <th className='text-left py-4 px-6 text-sm font-medium text-gray-400'>Joined</th>
                  <th className='text-left py-4 px-6 text-sm font-medium text-gray-400'>Last Login</th>
                  <th className='text-left py-4 px-6 text-sm font-medium text-gray-400'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className='border-b border-glass-border last:border-0 hover:bg-white/5 transition-all'>
                    <td className='py-4 px-6'>
                      <div className='flex items-center gap-3'>
                        {/* FIX 3: Pointing to individual user profiles/initials rather than the admin's profile data. Also reduced width from w-24 to w-12 so it fits in a table row */}
                        {user.profile_image ? <img src={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${user.profile_image}`} alt={user.name || "User"} className='w-12 h-12 rounded-full object-cover border-2 border-green-500/30' /> : <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-green-500/30'>{getUserInitials(user)}</div>}
                        <div>
                          <p className='font-medium'>{user.name}</p>
                          <p className='text-xs text-gray-400'>ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className='py-4 px-6'>
                      <p className='text-sm flex items-center gap-2'>
                        <FiMail className='text-gray-400' size={14} />
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className='text-sm flex items-center gap-2 mt-1'>
                          <FiPhone className='text-gray-400' size={14} />
                          {user.phone}
                        </p>
                      )}
                    </td>
                    <td className='py-4 px-6'>
                      <span className='px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs'>{user.exam_preparation || "Not Set"}</span>
                    </td>
                    <td className='py-4 px-6'>
                      <span className={`px-3 py-1 rounded-full text-xs ${user.role === "admin" ? "bg-purple-500/20 text-purple-400" : user.role === "premium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>{user.role || "student"}</span>
                    </td>
                    <td className='py-4 px-6 text-sm text-gray-400'>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className='py-4 px-6 text-sm text-gray-400'>{user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}</td>
                    <td className='py-4 px-6'>
                      <button onClick={() => setSelectedUser(user)} className='p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-all'>
                        <FiEye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='p-4 border-t border-glass-border flex justify-between items-center'>
            <p className='text-sm text-gray-400'>
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className='flex gap-2'>
              <button className='px-3 py-1 bg-glass-bg border border-glass-border rounded-lg text-sm hover:border-green-500/50 transition-all'>Previous</button>
              <button className='px-3 py-1 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg text-sm'>1</button>
              <button className='px-3 py-1 bg-glass-bg border border-glass-border rounded-lg text-sm hover:border-green-500/50 transition-all'>2</button>
              <button className='px-3 py-1 bg-glass-bg border border-glass-border rounded-lg text-sm hover:border-green-500/50 transition-all'>3</button>
              <button className='px-3 py-1 bg-glass-bg border border-glass-border rounded-lg text-sm hover:border-green-500/50 transition-all'>Next</button>
            </div>
          </div>
        </motion.div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className='bg-deep-black border border-glass-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
              <div className='p-6'>
                <div className='flex justify-between items-start mb-6'>
                  <h2 className='text-2xl font-bold'>User Details</h2>
                  <button onClick={() => setSelectedUser(null)} className='p-2 hover:bg-white/5 rounded-lg'>
                    ✕
                  </button>
                </div>

                <div className='space-y-6'>
                  {/* Profile Header */}
                  <div className='flex items-center gap-4 p-4 bg-glass-bg rounded-xl'>
                        {selectedUser.profile_image ? <img src={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${selectedUser.profile_image}`} alt={selectedUser.name || "User"} className='w-12 h-12 rounded-full object-cover border-2 border-green-500/30' /> : <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-green-500/30'>{getUserInitials(selectedUser)}</div>}
                    {/* <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold'>{getUserInitials(selectedUser)}</div> */}
                    <div>
                      <h3 className='text-xl font-bold'>{selectedUser.name}</h3>
                      <p className='text-gray-400'>Member since {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* User Details Grid */}
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='p-4 bg-glass-bg rounded-xl'>
                      <p className='text-sm text-gray-400 mb-1'>Email</p>
                      <p className='font-medium'>{selectedUser.email}</p>
                    </div>
                    <div className='p-4 bg-glass-bg rounded-xl'>
                      <p className='text-sm text-gray-400 mb-1'>Phone</p>
                      <p className='font-medium'>{selectedUser.phone || "Not provided"}</p>
                    </div>
                    <div className='p-4 bg-glass-bg rounded-xl'>
                      <p className='text-sm text-gray-400 mb-1'>Exam Preparation</p>
                      <p className='font-medium'>{selectedUser.exam_preparation || "Not set"}</p>
                    </div>
                    <div className='p-4 bg-glass-bg rounded-xl'>
                      <p className='text-sm text-gray-400 mb-1'>Role</p>
                      <p className='font-medium capitalize'>{selectedUser.role || "student"}</p>
                    </div>
                    <div className='p-4 bg-glass-bg rounded-xl'>
                      <p className='text-sm text-gray-400 mb-1'>User ID</p>
                      <p className='font-medium text-xs'>#{selectedUser.id}</p>
                    </div>
                    <div className='p-4 bg-glass-bg rounded-xl'>
                      <p className='text-sm text-gray-400 mb-1'>Last Login</p>
                      <p className='font-medium'>{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : "Never logged in"}</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className='p-4 bg-glass-bg rounded-xl'>
                    <h4 className='font-semibold mb-3'>Account Activity</h4>
                    <div className='grid grid-cols-3 gap-4 text-center'>
                      <div>
                        <p className='text-2xl font-bold text-green-400'>0</p>
                        <p className='text-xs text-gray-400'>Tests Taken</p>
                      </div>
                      <div>
                        <p className='text-2xl font-bold text-blue-400'>0</p>
                        <p className='text-xs text-gray-400'>Tests Created</p>
                      </div>
                      <div>
                        <p className='text-2xl font-bold text-yellow-400'>0</p>
                        <p className='text-xs text-gray-400'>Achievements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserAnalytics;
