import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, FiEdit2,
  FiSave, FiCamera, FiBookOpen, FiAward, FiSettings,
  FiLock, FiBell, FiMoon, FiGlobe, FiHelpCircle,
  FiLogOut, FiChevronRight, FiCheck, FiX
} from 'react-icons/fi';
import { 
  FaUserCircle, FaGraduationCap, FaRegCalendarAlt,
  FaRegEdit, FaRegSave, FaRegUser, FaRegEnvelope,
  FaPhone, FaRegClock, FaRegStar, FaRegBell
} from 'react-icons/fa';

function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john@example.com',
    phone: user?.phone || '+91 98765 43210',
    dob: '1995-05-15',
    address: 'Mumbai, Maharashtra',
    exam_preparation: user?.exam_preparation || 'SSC CGL',
    language: 'English',
    notifications: true,
    darkMode: true,
    twoFactor: false
  });

  const [selectedExams, setSelectedExams] = useState([
    'SSC CGL', 'UPSC', 'Banking'
  ]);

  const popularExams = [
    'SSC CGL', 'SSC CHSL', 'UPSC Civil Services', 'IBPS PO', 
    'IBPS Clerk', 'RRB NTPC', 'Railway Group D', 'State PSC',
    'CTET', 'NDA', 'CDS', 'Defence Exams'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addExam = (exam) => {
    if (!selectedExams.includes(exam)) {
      setSelectedExams([...selectedExams, exam]);
    }
  };

  const removeExam = (exam) => {
    setSelectedExams(selectedExams.filter(e => e !== exam));
  };

  const handleSave = () => {
    setEditMode(false);
    // API call to save data
    alert('Profile updated successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaRegUser },
    { id: 'exams', label: 'Your Exams', icon: FaGraduationCap },
    { id: 'account', label: 'Account', icon: FiSettings },
    { id: 'notifications', label: 'Notifications', icon: FaRegBell },
    { id: 'security', label: 'Security', icon: FiLock }
  ];

  const getUserInitials = () => {
    if (!formData.name) return 'U';
    return formData.name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-deep-black text-white font-['Inter'] relative overflow-hidden">
      {/* Simple Dark Background - No Image */}
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
                Settings
              </span>
            </h1>
            <p className="text-gray-400 mt-2">Manage your account preferences</p>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-4 sticky top-24">
                {/* Profile Summary */}
                <div className="text-center mb-6 p-4 bg-gradient-to-b from-green-500/10 to-transparent rounded-xl">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    {profilePic ? (
                      <img 
                        src={profilePic} 
                        alt={formData.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-green-500/30"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-green-500/30">
                        {getUserInitials()}
                      </div>
                    )}
                    {editMode && (
                      <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors border-2 border-white">
                        <FiCamera size={14} />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleProfilePicChange}
                        />
                      </label>
                    )}
                  </div>
                  <h3 className="font-semibold">{formData.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{formData.email}</p>
                </div>

                {/* Navigation Tabs */}
                <div className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 border border-green-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <tab.icon className="text-lg" />
                      <span className="flex-1 text-left">{tab.label}</span>
                      {activeTab === tab.id && (
                        <FiChevronRight className="text-green-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 mt-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6">
                
                {/* Header with Edit/Save */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold capitalize">
                    {activeTab} Settings
                  </h2>
                  {activeTab === 'profile' && (
                    <button
                      onClick={() => editMode ? handleSave() : setEditMode(true)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                        editMode
                          ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                          : 'bg-glass-bg border border-glass-border hover:border-green-500/50'
                      }`}
                    >
                      {editMode ? (
                        <>
                          <FiSave />
                          <span>Save Changes</span>
                        </>
                      ) : (
                        <>
                          <FiEdit2 />
                          <span>Edit Profile</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                        <div className="relative">
                          <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className={`w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white ${
                              editMode ? 'focus:border-green-500/50' : 'opacity-75'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                        <div className="relative">
                          <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className={`w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white ${
                              editMode ? 'focus:border-green-500/50' : 'opacity-75'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                        <div className="relative">
                          <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className={`w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white ${
                              editMode ? 'focus:border-green-500/50' : 'opacity-75'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
                        <div className="relative">
                          <FaRegCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className={`w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white ${
                              editMode ? 'focus:border-green-500/50' : 'opacity-75'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-2">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className={`w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white ${
                            editMode ? 'focus:border-green-500/50' : 'opacity-75'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Your Exams Tab */}
                {activeTab === 'exams' && (
                  <div className="space-y-6">
                    <p className="text-gray-400">Select the exams you're preparing for</p>
                    
                    {/* Selected Exams */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedExams.map((exam) => (
                        <span
                          key={exam}
                          className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 px-4 py-2 rounded-full text-sm flex items-center border border-green-500/30"
                        >
                          {exam}
                          <button
                            onClick={() => removeExam(exam)}
                            className="ml-2 hover:text-red-400 transition-colors"
                          >
                            <FiX size={14} />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Popular Exams Grid */}
                    <h3 className="font-semibold mb-3">Popular Exams</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {popularExams.map((exam) => (
                        <button
                          key={exam}
                          onClick={() => addExam(exam)}
                          disabled={selectedExams.includes(exam)}
                          className={`p-3 rounded-xl text-sm transition-all ${
                            selectedExams.includes(exam)
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                              : 'bg-black/30 border border-glass-border hover:border-green-500/50 text-gray-300 hover:text-white'
                          }`}
                        >
                          {exam}
                          {selectedExams.includes(exam) && (
                            <FiCheck className="inline ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                        <label className="text-sm text-gray-400 block mb-1">Username</label>
                        <p className="text-lg font-semibold">{formData.name}</p>
                      </div>

                      <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                        <label className="text-sm text-gray-400 block mb-1">Email</label>
                        <p className="text-lg font-semibold">{formData.email}</p>
                      </div>

                      <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                        <label className="text-sm text-gray-400 block mb-1">Phone</label>
                        <p className="text-lg font-semibold">{formData.phone}</p>
                      </div>

                      <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                        <label className="text-sm text-gray-400 block mb-1">Member Since</label>
                        <p className="text-lg font-semibold">Jan 2024</p>
                      </div>
                    </div>

                    <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                      <label className="text-sm text-gray-400 block mb-3">Language Preference</label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                        className="w-full md:w-64 bg-black/50 border border-glass-border rounded-xl py-2 px-4 text-white"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Bilingual">Bilingual</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-4">
                    {[
                      { label: 'Email Notifications', desc: 'Receive updates via email', key: 'email_notifications' },
                      { label: 'Test Reminders', desc: 'Get reminders before tests', key: 'test_reminders' },
                      { label: 'Result Updates', desc: 'Get notified when results are out', key: 'result_updates' },
                      { label: 'Promotional Emails', desc: 'Receive offers and discounts', key: 'promotional_emails' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-glass-border">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                        <button
                          className={`w-12 h-6 rounded-full transition-all ${
                            true ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                            true ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <button className="w-full p-4 bg-black/30 rounded-xl border border-glass-border flex items-center justify-between hover:border-green-500/50 transition-all">
                      <div className="flex items-center space-x-3">
                        <FiLock className="text-green-400" />
                        <div className="text-left">
                          <p className="font-medium">Change Password</p>
                          <p className="text-sm text-gray-400">Update your password regularly</p>
                        </div>
                      </div>
                      <FiChevronRight className="text-gray-400" />
                    </button>

                    <div className="p-4 bg-black/30 rounded-xl border border-glass-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-400">Add extra security to your account</p>
                        </div>
                        <button
                          onClick={() => setFormData({...formData, twoFactor: !formData.twoFactor})}
                          className={`w-12 h-6 rounded-full transition-all ${
                            formData.twoFactor ? 'bg-green-500' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                            formData.twoFactor ? 'translate-x-7' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;