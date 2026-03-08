import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
// import Navbar from '../components/Navbar';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiX } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/tests');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-['Inter',sans-serif] relative flex items-center justify-center overflow-hidden transition-colors duration-300">
      
      {/* Background Gradient Effect (Matching Image) */}
      <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-600/30 dark:from-indigo-600/40 to-transparent pointer-events-none blur-3xl"></div>
      
      {/* <Navbar /> */}

      {/* Main Content Modal */}
      <div className="relative w-full max-w-[420px] px-4 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-2xl relative"
        >
          
          {/* Close Button (Top Right) */}
          <button className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-[#2C2C2E] rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <FiX size={16} />
          </button>

          {/* Top Toggle (Sign up / Sign in) */}
          <div className="flex bg-gray-100 dark:bg-[#0A0A0A] rounded-full p-1 w-fit mb-8 border border-gray-200 dark:border-white/5">
            <Link 
              to="/register" 
              className="px-5 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all"
            >
              Sign up
            </Link>
            <button className="px-5 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-[#1A1A1D] shadow-sm dark:shadow-none text-gray-900 dark:text-white transition-all">
              Sign in
            </button>
          </div>

          {/* Header */}
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Welcome back
          </h1>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-transparent rounded-xl py-3 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm dark:shadow-inner"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-transparent rounded-xl py-3 pl-11 pr-12 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm dark:shadow-inner"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end pt-1">
              <Link 
                to="/forgot-password" 
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="flex flex-row">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B4EE6] hover:bg-[#5A3DD5] text-white py-3  rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Log in"
              )}
            </button>
          <div className="grid grid-cols-2 gap-4 ">
            <button className="flex items-center justify-center w-18 ml-4 bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-transparent rounded-xl hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition-colors">
              <FaGoogle className="text-gray-600 dark:text-white" size={18} />
            </button>
            {/* <button className="flex items-center justify-center py-3 bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-transparent rounded-xl hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition-colors">
              <FaGithub className="text-gray-600 dark:te            {/* <button className="flex items-center justify-center py-3 bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-transparent rounded-xl hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition-colors">
              <FaGithub className="text-gray-600 dark:text-white" size={18} />
            </button>xt-white" size={18} />
            </button> */}
          </div></div>
          </form>

          {/* Divider */}
          {/* <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-gray-200 dark:border-white/5"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Or sign in with
            </span>
            <div className="flex-grow border-t border-gray-200 dark:border-white/5"></div>
          </div> */}

          {/* Social Login Buttons (Matching the 2-grid layout in image) */}

          {/* Footer Terms */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            By logging in, you agree to our <br className="hidden sm:block" /> Terms & Service
          </p>

        </motion.div>
      </div>
    </div>
  );
}

export default Login;