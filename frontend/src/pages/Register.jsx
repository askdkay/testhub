import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
// import Navbar from '../components/Navbar';
import {
  FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff,
  FiCheckCircle, FiX
} from 'react-icons/fi';
import { FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    exam_preparation: 'SSC'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept terms and conditions');
      return;
    }

    setLoading(true);
    setError('');

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      exam_preparation: formData.exam_preparation
    });

    if (result.success) {
      navigate('/tests');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const pass = formData.password;
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthText = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0C10] text-gray-900 dark:text-white font-['Inter'] relative flex items-center justify-center p-4 transition-colors duration-300">

      {/* Background Bottom Glow (Matching Image) */}
      <div className="fixed bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-blue-600/20 dark:from-blue-600/30 to-transparent pointer-events-none"></div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md bg-white dark:bg-[#1C1C24]/90 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-[24px] p-6 md:p-8 shadow-2xl"
      >
        {/* Top Header / Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-gray-100 dark:bg-[#0B0C10] rounded-full p-1">
            <div className="bg-white dark:bg-[#25252D] shadow-sm text-gray-900 dark:text-white px-5 py-1.5 rounded-full text-sm font-medium transition-all">
              Sign up
            </div>
            <Link
              to="/login"
              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-5 py-1.5 rounded-full text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>

          <button className="p-2 bg-gray-100 dark:bg-[#25252D] rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors">
            <FiX size={16} />
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Create an account
        </h1>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* First Row: Name */}
          <div className="relative">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-[#25252D] border border-gray-200 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Full Name"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-[#25252D] border border-gray-200 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Phone
          <div className="relative">
            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-[#25252D] border border-gray-200 dark:border-white/5 rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="Mobile Number"
              maxLength="10"
              required
            />
          </div> */}

          {/* Exam Prep */}
          {/* <div>
            <select
              name="exam_preparation"
              value={formData.exam_preparation}
              onChange={handleChange}
              className="w-full bg-gray-50 dark:bg-[#25252D] border border-gray-200 dark:border-white/5 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
              required
            >
              <option value="SSC">SSC CGL/CHSL</option>
              <option value="UPSC">UPSC Civil Services</option>
              <option value="Banking">Banking (IBPS/RRB)</option>
              <option value="Railway">Railway (RRB NTPC)</option>
              <option value="Defence">Defence (NDA/CDS)</option>
              <option value="State PSC">State PSC</option>
              <option value="Teaching">Teaching (CTET/UPTET)</option>
            </select>
          </div> */}

          {/* Password Group (Pass + Confirm side by side for compactness, or stacked) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-[#25252D] border border-gray-200 dark:border-white/5 rounded-xl py-3 pl-10 pr-10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-gray-50 dark:bg-[#25252D] border border-gray-200 dark:border-white/5 rounded-xl py-3 pl-10 pr-10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="Confirm Pass"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-1">
              <div className="flex space-x-1 mb-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-[1px] flex-1 rounded-full transition-all ${i < strength ? strengthColor[strength - 1] : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2 py-2">
            <button
              type="button"
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${acceptedTerms
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
            >
              {acceptedTerms && <FiCheckCircle className="text-white text-xs" />}
            </button>
            <label className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a>
            </label>
          </div>
          <div className="flex flex-row">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#407BFF] hover:bg-[#3066E5] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center "
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Create an account"
              )}
            </button>
            {/* Social Buttons (Restyled) */}
            <div className="flex  ml-1">
              {[
                { icon: FaGoogle, label: 'Google' },
                // { icon: FaFacebook, label: 'Facebook' },
                // { icon: FaGithub, label: 'Github' }
              ].map((provider, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center w-full px-4 ml-3 py- bg-gray-50 dark:bg-[#25252D] hover:bg-gray-100 dark:hover:bg-[#2A2A35] border border-gray-200 dark:border-white/5 rounded-xl transition-colors group"
                >
                  <provider.icon className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" size={18} />
                </motion.button>
              ))}
            </div></div>
        </form>

        {/* Divider */}



      </motion.div>
    </div>
  );
}

export default Register;