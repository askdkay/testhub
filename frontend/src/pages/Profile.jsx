import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiEdit2, FiCamera, FiAward, FiClock, FiCheckCircle, FiTrendingUp, FiStar, FiBookOpen, FiBarChart2, FiAlertCircle } from "react-icons/fi";

function Profile() {
  // FIX 1: useNavigate ko component ke andar move kiya gaya hai
  const navigate = useNavigate(); 
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfileData();
    fetchTestHistory();
  }, []);

  // Fetch user profile from database
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // Get user profile from backend
      const profileRes = await API.get("/profile/profile");
      const profile = profileRes.data;

      // Get user stats (tests taken, avg score, etc.)
      const statsRes = await API.get("/profile/stats");

      setProfileData(profile);
      setStatsData(statsRes.data);
      setError("");
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's test history
  const fetchTestHistory = async () => {
    try {
      const res = await API.get("/profile/test-history");
      setTestHistory(res.data);
    } catch (error) {
      console.error("Error fetching test history:", error);
      setTestHistory([]);
    }
  };

  // Helper function to display "Not provided" for missing data
  const displayValue = (value, placeholder = "Not provided") => {
    if (!value || value === "" || value === null) {
      return <span className='text-gray-500 italic'>{placeholder}</span>;
    }
    return value;
  };

  const getUserInitials = () => {
    const firstName = profileData?.first_name || "";
    const lastName = profileData?.last_name || "";
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (user?.name) return user.name.charAt(0).toUpperCase();
    return "U";
  };

  const getFullName = () => {
    const firstName = profileData?.first_name || "";
    const lastName = profileData?.last_name || "";
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (lastName) return lastName;
    return user?.name || "User";
  };

  // FIX 2: Ek smart function jo image URL ko har case me theek karega
  const getProfileImageUrl = () => {
    const imagePath = profileData?.profile_image || user?.profile_image;
    if (!imagePath) return null;

    // Agar pehle se hi proper link hai
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // Windows paths (\) ko forward slash (/) me convert karna
    const cleanPath = imagePath.replace(/\\/g, "/");
    const baseUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

    return `${baseUrl}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-deep-black flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-green-500'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-deep-black flex items-center justify-center'>
        <div className='text-center'>
          <FiAlertCircle className='text-5xl text-red-500 mx-auto mb-4' />
          <p className='text-red-400 mb-4'>{error}</p>
          <button onClick={fetchProfileData} className='px-4 py-2 bg-green-500 text-white rounded-lg'>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-white font-['Inter'] relative overflow-hidden">
      {/* Simple Dark Background */}
      <div className='fixed inset-0 bg-gradient-to-br from-deep-black via-gray-900 to-deep-black'></div>
      <div className='fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10'></div>

      {/* <Navbar /> */}

      {/* Main Content */}
      <div className='relative pt-32 pb-20 px-4 md:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='mb-8'>
            <h1 className='text-3xl md:text-4xl font-bold'>
              <span className='bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent'>My Profile</span>
            </h1>
            <p className='text-gray-400 mt-2'>View your profile information and performance</p>
          </motion.div>

          {/* Profile Header Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6 mb-6'>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
              
              {/* FIX 3: Naya Image Component Setup */}
              <div className='relative'>
                {getProfileImageUrl() ? (
                  <img 
                    src={getProfileImageUrl()} 
                    alt={getFullName()} 
                    className='w-24 h-24 rounded-full object-cover border-4 border-green-500/30 shadow-lg' 
                    onError={(e) => {
                      // Agar image load hone me fail ho jaye (jaise folder se delete ho gayi ho) toh wapas initials show honge
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback Initials (Dikhne me tabhi aayega jab image na ho ya fail ho jaye) */}
                <div 
                  className='w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-green-500/30'
                  style={{ display: getProfileImageUrl() ? 'none' : 'flex' }}
                >
                  {getUserInitials()}
                </div>
              </div>

              {/* User Info */}
              <div className='flex-1'>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                  <div>
                    <h2 className='text-2xl md:text-3xl font-bold'>{getFullName()}</h2>
                    <p className='text-green-400 mt-1'>{displayValue(profileData?.exam_preparation, "No exam selected")}</p>
                    <p className='text-gray-400 text-sm mt-2'>{displayValue(profileData?.bio, "No bio added yet")}</p>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/settings"); 
                    }}
                    className='flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all self-start'
                  >
                    <FiEdit2 className='text-green-400' />
                    <span>Edit Profile</span>
                  </button>
                </div>

                {/* Contact Info */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                  <div className='flex items-center gap-2 text-sm text-gray-400'>
                    <FiMail className='text-green-400' />
                    <span>{displayValue(profileData?.email)}</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-400'>
                    <FiPhone className='text-green-400' />
                    <span>{displayValue(profileData?.phone)}</span>
                  </div>
                  <div className='flex items-center gap-2 text-sm text-gray-400'>
                    <FiMapPin className='text-green-400' />
                    <span>{displayValue(profileData?.address)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid - Real data from database */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            <div className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-400 text-sm'>Tests Taken</p>
                  <p className='text-2xl font-bold mt-1'>{statsData?.tests_taken !== undefined ? statsData.tests_taken : "0"}</p>
                </div>
                <div className='w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center'>
                  <FiBookOpen className='text-blue-400 text-xl' />
                </div>
              </div>
            </div>

            <div className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-400 text-sm'>Avg. Score</p>
                  <p className='text-2xl font-bold mt-1'>{statsData?.avg_score !== undefined ? `${statsData.avg_score}%` : "0%"}</p>
                </div>
                <div className='w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center'>
                  <FiTrendingUp className='text-green-400 text-xl' />
                </div>
              </div>
            </div>

            <div className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-400 text-sm'>Total Time</p>
                  <p className='text-2xl font-bold mt-1'>{statsData?.total_time ? statsData.total_time : "0h"}</p>
                </div>
                <div className='w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center'>
                  <FiClock className='text-yellow-400 text-xl' />
                </div>
              </div>
            </div>

            <div className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-400 text-sm'>Rank</p>
                  <p className='text-2xl font-bold mt-1'>{statsData?.rank ? `#${statsData.rank}` : "N/A"}</p>
                </div>
                <div className='w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center'>
                  <FiAward className='text-purple-400 text-xl' />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className='flex gap-2 mb-6 overflow-x-auto pb-2'>
            {[
              { id: "overview", label: "Overview", icon: FiUser },
              { id: "performance", label: "Performance", icon: FiBarChart2 },
              { id: "achievements", label: "Achievements", icon: FiAward },
              { id: "history", label: "Test History", icon: FiClock },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? "bg-gradient-to-r from-green-500 to-blue-600 text-white" : "bg-glass-bg border border-glass-border text-gray-400 hover:text-white"}`}>
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className='backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6'>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Personal Info */}
                <div>
                  <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                    <FiUser className='text-green-400' />
                    Personal Information
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex justify-between p-3 bg-black/30 rounded-xl'>
                      <span className='text-gray-400'>Full Name</span>
                      <span className='font-medium'>{getFullName()}</span>
                    </div>
                    <div className='flex justify-between p-3 bg-black/30 rounded-xl'>
                      <span className='text-gray-400'>Email</span>
                      <span className='font-medium'>{displayValue(profileData?.email)}</span>
                    </div>
                    <div className='flex justify-between p-3 bg-black/30 rounded-xl'>
                      <span className='text-gray-400'>Phone</span>
                      <span className='font-medium'>{displayValue(profileData?.phone)}</span>
                    </div>
                    <div className='flex justify-between p-3 bg-black/30 rounded-xl'>
                      <span className='text-gray-400'>Date of Birth</span>
                      <span className='font-medium'>{displayValue(profileData?.dob)}</span>
                    </div>
                    <div className='flex justify-between p-3 bg-black/30 rounded-xl'>
                      <span className='text-gray-400'>Address</span>
                      <span className='font-medium'>{displayValue(profileData?.address)}</span>
                    </div>
                    <div className='flex justify-between p-3 bg-black/30 rounded-xl'>
                      <span className='text-gray-400'>Exam Preparation</span>
                      <span className='font-medium'>{displayValue(profileData?.exam_preparation, "Not selected")}</span>
                    </div>
                    <div className='flex justify-between p-3 bg-black/30 rounded-xl'>
                      <span className='text-gray-400'>Member Since</span>
                      <span className='font-medium'>{profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) : "Not available"}</span>
                    </div>
                  </div>
                </div>

                {/* Current Stats */}
                <div>
                  <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                    <FiBarChart2 className='text-green-400' />
                    Performance Stats
                  </h3>
                  <div className='grid grid-cols-2 gap-3 mb-4'>
                    <div className='p-4 bg-black/30 rounded-xl text-center'>
                      <p className='text-2xl font-bold text-green-400'>{statsData?.accuracy !== undefined ? `${statsData.accuracy}%` : "0%"}</p>
                      <p className='text-xs text-gray-400 mt-1'>Accuracy</p>
                    </div>
                    <div className='p-4 bg-black/30 rounded-xl text-center'>
                      <p className='text-2xl font-bold text-yellow-400'>{statsData?.streak || "0"}</p>
                      <p className='text-xs text-gray-400 mt-1'>Day Streak</p>
                    </div>
                  </div>

                  {/* Weak Topics */}
                  <h4 className='font-medium mb-3 text-sm text-gray-400'>Topics to Improve</h4>
                  {statsData?.weak_topics && statsData.weak_topics.length > 0 ? (
                    <div className='space-y-2 mb-4'>
                      {statsData.weak_topics.map((topic, idx) => (
                        <div key={idx} className='flex items-center gap-2'>
                          <span className='text-sm w-24'>{topic.topic}</span>
                          <div className='flex-1 bg-gray-800 rounded-full h-2'>
                            <div className='bg-red-500 h-2 rounded-full' style={{ width: `${topic.score}%` }} />
                          </div>
                          <span className='text-xs text-red-400'>{topic.score}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-gray-500 italic mb-4'>No weak topics data available yet.</p>
                  )}

                  {/* Strong Topics */}
                  <h4 className='font-medium mb-3 text-sm text-gray-400'>Strong Areas</h4>
                  {statsData?.strong_topics && statsData.strong_topics.length > 0 ? (
                    <div className='space-y-2'>
                      {statsData.strong_topics.map((topic, idx) => (
                        <div key={idx} className='flex items-center gap-2'>
                          <span className='text-sm w-24'>{topic.topic}</span>
                          <div className='flex-1 bg-gray-800 rounded-full h-2'>
                            <div className='bg-green-500 h-2 rounded-full' style={{ width: `${topic.score}%` }} />
                          </div>
                          <span className='text-xs text-green-400'>{topic.score}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-gray-500 italic'>No strong areas data available yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <div>
                <h3 className='text-lg font-semibold mb-4'>Performance Analytics</h3>
                {statsData?.performance_chart ? (
                  <div className='h-64 flex items-center justify-center bg-black/30 rounded-xl border border-glass-border'>
                    <p className='text-gray-400'>Performance chart will appear here</p>
                  </div>
                ) : (
                  <div className='text-center py-12 bg-black/30 rounded-xl border border-glass-border'>
                    <FiBarChart2 className='text-5xl text-gray-600 mx-auto mb-3' />
                    <p className='text-gray-500'>No performance data available yet.</p>
                    <p className='text-sm text-gray-600 mt-1'>Take more tests to generate performance analytics.</p>
                  </div>
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div>
                <h3 className='text-lg font-semibold mb-4'>Your Achievements</h3>
                {statsData?.achievements && statsData.achievements.length > 0 ? (
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {statsData.achievements.map((achievement, idx) => (
                      <div key={idx} className='flex items-start gap-3 p-4 bg-black/30 rounded-xl border border-glass-border'>
                        <div className='text-2xl'>{achievement.icon}</div>
                        <div>
                          <h4 className='font-semibold'>{achievement.name}</h4>
                          <p className='text-sm text-gray-400'>{achievement.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12 bg-black/30 rounded-xl border border-glass-border'>
                    <FiAward className='text-5xl text-gray-600 mx-auto mb-3' />
                    <p className='text-gray-500'>No achievements unlocked yet.</p>
                    <p className='text-sm text-gray-600 mt-1'>Complete tests and maintain streaks to earn achievements.</p>
                  </div>
                )}
              </div>
            )}

            {/* Test History Tab */}
            {activeTab === "history" && (
              <div>
                <h3 className='text-lg font-semibold mb-4'>Recent Tests</h3>
                {testHistory.length > 0 ? (
                  <div className='space-y-3'>
                    {testHistory.map((test, idx) => (
                      <div key={idx} className='flex items-center justify-between p-4 bg-black/30 rounded-xl border border-glass-border'>
                        <div>
                          <p className='font-medium'>{test.test_name}</p>
                          <p className='text-sm text-gray-400 mt-1'>{test.completed_date ? new Date(test.completed_date).toLocaleDateString() : "Date not available"}</p>
                        </div>
                        <div className='text-right'>
                          <p className='text-lg font-bold text-green-400'>
                            {test.score_obtained}/{test.total_marks}
                          </p>
                          <p className='text-sm text-gray-400'>{test.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-12 bg-black/30 rounded-xl border border-glass-border'>
                    <FiClock className='text-5xl text-gray-600 mx-auto mb-3' />
                    <p className='text-gray-500'>No test history available.</p>
                    <p className='text-sm text-gray-600 mt-1'>Take your first test to see your history here.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Profile;