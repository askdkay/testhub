import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import ImageCropModal from '../components/ImageCropModal';
import imageCompression from 'browser-image-compression';

import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiEdit2,
  FiSave, FiCamera, FiBookOpen, FiSettings,
  FiLock, FiBell, FiMoon, FiGlobe, FiHelpCircle,
  FiLogOut, FiChevronRight, FiCheck, FiX,
  FiAlertCircle, FiCheckCircle, FiEye, FiEyeOff
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
  const [loading, setLoading] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState('email');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [examOptions, setExamOptions] = useState([]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    exam_preparation: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [forgotData, setForgotData] = useState({
    email: '',
    otp: '',
    new_password: '',
    confirm_password: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch exams and profile on component mount
  useEffect(() => {
    fetchExams();
    fetchProfile();
  }, []);

  // ✅ Fetch real exams from backend database
  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const res = await API.get('/exams/exams-list');
      // Extract exam names from the response
      const examNames = res.data.map(exam => exam.name);
      setExamOptions(examNames);
      // console.log('📚 Exams fetched:', examNames.length);
    } catch (error) {
      // console.error('Error fetching exams:', error);
      // Fallback options if API fails
      setExamOptions(['SSC CGL', 'UPSC Civil Services', 'IBPS PO', 'RRB NTPC', 'Rajasthan CET', 'REET', 'RPSC']);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get('/profile/profile');
      const data = res.data;
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        exam_preparation: data.exam_preparation || ''
      });
      if (data.profile_image) {
        setProfileImage(data.profile_image);
      }
    } catch (error) {
      // console.error('Error fetching profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show loading
    setLoading(true);
    setMessage({ type: 'info', text: 'Compressing image...' });
    
    try {
        // Compression options
        const options = {
            maxSizeMB: 0.1,        // Target size: 100KB (0.1MB)
            maxWidthOrHeight: 500,  // Max dimension: 500px
            useWebWorker: true,     // Faster compression
            fileType: 'image/jpeg',  // Convert to JPEG for smaller size
            initialQuality: 0.7      // 70% quality
        };
        
        // Compress image
        const compressedFile = await imageCompression(file, options);
        
        // Check final size
        const finalSizeKB = compressedFile.size / 1024;
        // console.log(`Original: ${(file.size / 1024 / 1024).toFixed(2)}MB → Compressed: ${finalSizeKB.toFixed(2)}KB`);
        
        if (finalSizeKB > 200) {
            setMessage({ type: 'warning', text: `Image compressed to ${finalSizeKB.toFixed(0)}KB, still above 200KB limit` });
        }
        
        // Read and crop
        const reader = new FileReader();
        reader.onloadend = () => {
            setTempImage(reader.result);
            setShowCropModal(true);
            setLoading(false);
        };
        reader.readAsDataURL(compressedFile);
        
    } catch (error) {
        // console.error('Error compressing image:', error);
        setMessage({ type: 'error', text: 'Failed to compress image' });
        setLoading(false);
    }
};

  const handleCropComplete = async (croppedFile) => {
    setShowCropModal(false);
    setLoading(true);
    
    const formDataImg = new FormData();
    formDataImg.append('image', croppedFile);

    try {
      const res = await API.post('/profile/profile/upload-image', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileImage(res.data.imageUrl);
      setMessage({ type: 'success', text: 'Profile picture updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    
    setLoading(true);
    try {
      await API.delete('/profile/profile/delete-image');
      setProfileImage(null);
      setMessage({ type: 'success', text: 'Profile picture removed' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove image' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await API.put('/profile/profile', formData);
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await API.post('/profile/profile/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    try {
      const res = await API.post('/profile/forgot-password', { email: forgotData.email });
      setResetToken(res.data.resetToken);
      setResetStep('reset');
      setMessage({ type: 'success', text: 'Password reset token generated. Enter new password below.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process request' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (forgotData.new_password !== forgotData.confirm_password) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (forgotData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await API.post('/profile/reset-password', {
        token: resetToken,
        new_password: forgotData.new_password
      });
      setMessage({ type: 'success', text: 'Password reset successfully! You can now login.' });
      setShowForgotPassword(false);
      setResetStep('email');
      setForgotData({ email: '', otp: '', new_password: '', confirm_password: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaRegUser },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'exams', label: 'Your Exams', icon: FaGraduationCap },
    { id: 'notifications', label: 'Notifications', icon: FaRegBell }
  ];

  const getUserInitials = () => {
    const first = formData.first_name?.charAt(0) || '';
    const last = formData.last_name?.charAt(0) || '';
    if (first && last) return `${first}${last}`.toUpperCase();
    if (first) return first.toUpperCase();
    return 'U';
  };

  return (
    <div className="min-h-screen bg-deep-black text-white font-['Inter'] relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-deep-black via-gray-900 to-deep-black"></div>
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10"></div>

      <div className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Account Settings
              </span>
            </h1>
            <p className="text-gray-400 mt-2">Manage your profile and account preferences</p>
          </motion.div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-4 sticky top-24">
                <div className="text-center mb-6 p-4 bg-gradient-to-b from-green-500/10 to-transparent rounded-xl">
                  <div className="relative w-24 h-24 mx-auto mb-3 group">
{profileImage ? (
    <img 
        src={profileImage}  // Cloudinary URL direct use karo
        alt={formData.first_name}
        className="w-24 h-24 rounded-full object-cover border-4 border-green-500/30"
        onError={(e) => {
            e.target.onerror = null;
            e.target.src = '';
        }}
    />
) : (
    <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-green-500/30">
        {getUserInitials()}
    </div>
)}
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors border-2 border-white">
                      <FiCamera size={14} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                      />
                    </label>

                  </div>
                  <h3 className="font-semibold">{formData.first_name} {formData.last_name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{formData.email}</p>
                </div>

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
                      {activeTab === tab.id && <FiChevronRight className="text-green-400" />}
                    </button>
                  ))}
                </div>

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
                
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-semibold">Profile Information</h2>
                      <button
                        onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
                        disabled={loading}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                          editMode
                            ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white'
                            : 'bg-glass-bg border border-glass-border hover:border-green-500/50'
                        }`}
                      >
                        {editMode ? (
                          <><FiSave /><span>Save Changes</span></>
                        ) : (
                          <><FiEdit2 /><span>Edit Profile</span></>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">First Name</label>
                        <div className="relative">
                          <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className={`w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white ${
                              editMode ? 'focus:border-green-500/50' : 'opacity-75'
                            }`}
                            placeholder="First Name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Last Name</label>
                        <div className="relative">
                          <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className={`w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white ${
                              editMode ? 'focus:border-green-500/50' : 'opacity-75'
                            }`}
                            placeholder="Last Name"
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
                            disabled
                            className="w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white opacity-50 cursor-not-allowed"
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
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-2">Address</label>
                        <div className="relative">
                          <FiMapPin className="absolute left-4 top-4 text-gray-500" />
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            rows="2"
                            className={`w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white ${
                              editMode ? 'focus:border-green-500/50' : 'opacity-75'
                            }`}
                            placeholder="Your full address"
                          />
                        </div>
                      </div>

                      {/* ✅ REAL EXAMS FROM BACKEND DATABASE */}
                    <div className='md:col-span-2'>
    <label className='block text-sm text-gray-400 mb-2'>Exam Preparation</label>
    <select 
        name='exam_preparation' 
        value={formData.exam_preparation} 
        onChange={handleInputChange} 
        disabled={!editMode || loadingExams} 
        className={`w-full bg-black/50 border border-glass-border rounded-xl py-3 px-4 text-white ${editMode ? "focus:border-green-500/50" : "opacity-75"}`}
    >
        <option value=''>Select Exam</option>
        {loadingExams ? (
            <option disabled>Loading exams...</option>
        ) : (
            examOptions.map((exam) => (
                <option key={exam} value={exam}>{exam}</option>
            ))
        )}
    </select>
    {loadingExams && <p className="text-xs text-gray-500 mt-1">Fetching exams from database...</p>}
</div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold mb-6">Change Password</h2>
                    
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                        <div className="relative">
                          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="current_password"
                            value={passwordData.current_password}
                            onChange={handlePasswordChange}
                            className="w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-green-500/50"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">New Password</label>
                        <div className="relative">
                          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            className="w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-green-500/50"
                            placeholder="Enter new password (min 6 characters)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            className="w-full bg-black/50 border border-glass-border rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-green-500/50"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Exams Tab */}
                {activeTab === 'exams' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold mb-6">Your Exam Preferences</h2>
                    <p className="text-gray-400">Select the exam you're preparing for</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
    {formData.exam_preparation && (
        <span className="bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 px-4 py-2 rounded-full text-sm flex items-center border border-green-500/30">
            {formData.exam_preparation}
            {editMode && (
                <button onClick={() => setFormData(prev => ({ ...prev, exam_preparation: '' }))} className="ml-2 hover:text-red-400">×</button>
            )}
        </span>
    )}
</div>

{editMode && (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {loadingExams ? (
            <div className="col-span-full text-center py-8 text-gray-400">Loading exams...</div>
        ) : (
            examOptions.map((exam) => (
                <button
                    key={exam}
                    onClick={() => setFormData(prev => ({ ...prev, exam_preparation: exam }))}
                    className={`p-3 rounded-xl text-sm transition-all ${
                        formData.exam_preparation === exam
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-black/30 border border-glass-border hover:border-green-500/50 text-gray-300 hover:text-white'
                    }`}
                >
                    {exam}
                    {formData.exam_preparation === exam && <FiCheck className="inline ml-2" />}
                </button>
            ))
        )}
    </div>
)}

                    {editMode && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {loadingExams ? (
                          <div className="col-span-full text-center py-8 text-gray-400">Loading exams from database...</div>
                        ) : (
                          examOptions.map((exam) => (
                            <button
                              key={exam}
                              onClick={() => setFormData(prev => ({ ...prev, exam_preparation: exam }))}
                              className={`p-3 rounded-xl text-sm transition-all ${
                                formData.exam_preparation === exam
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-black/30 border border-glass-border hover:border-green-500/50 text-gray-300 hover:text-white'
                              }`}
                            >
                              {exam}
                              {formData.exam_preparation === exam && <FiCheck className="inline ml-2" />}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold mb-6">Notification Preferences</h2>
                    {[
                      { label: 'Email Notifications', desc: 'Receive updates via email', key: 'email' },
                      { label: 'Test Reminders', desc: 'Get reminders before tests', key: 'test' },
                      { label: 'Result Updates', desc: 'Get notified when results are out', key: 'result' },
                      { label: 'Promotional Emails', desc: 'Receive offers and discounts', key: 'promo' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-glass-border">
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-green-500">
                          <div className="w-4 h-4 rounded-full bg-white transform translate-x-7 transition-transform"></div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Reset Password</h3>
              
              {resetStep === 'email' && (
                <>
                  <p className="text-gray-400 text-sm mb-4">Enter your email address to reset your password.</p>
                  <input
                    type="email"
                    value={forgotData.email}
                    onChange={(e) => setForgotData({...forgotData, email: e.target.value})}
                    placeholder="Enter your email"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setShowForgotPassword(false)} className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg">Cancel</button>
                    <button onClick={handleForgotPassword} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Send Reset Link</button>
                  </div>
                </>
              )}

              {resetStep === 'reset' && (
                <>
                  <p className="text-gray-400 text-sm mb-4">Enter your new password.</p>
                  <input
                    type="password"
                    value={forgotData.new_password}
                    onChange={(e) => setForgotData({...forgotData, new_password: e.target.value})}
                    placeholder="New password"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-3"
                  />
                  <input
                    type="password"
                    value={forgotData.confirm_password}
                    onChange={(e) => setForgotData({...forgotData, confirm_password: e.target.value})}
                    placeholder="Confirm new password"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4"
                  />
                  <div className="flex gap-3">
                    <button onClick={() => { setShowForgotPassword(false); setResetStep('email'); }} className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg">Cancel</button>
                    <button onClick={handleResetPassword} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Reset Password</button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Crop Modal */}
      <AnimatePresence>
        {showCropModal && tempImage && (
          <ImageCropModal
            image={tempImage}
            onClose={() => setShowCropModal(false)}
            onCropComplete={handleCropComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;