import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiX, FiPhone } from 'react-icons/fi';
import { FcGoogle } from "react-icons/fc";


function Login() {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' ya 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, loginWithGoogle, sendOTP, verifyOTP } = useAuth();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await login(email, password);
    if (result.success) navigate('/tests');
    else setError(result.message);
    setLoading(false);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if(phone.length < 10) return setError("Enter valid phone number with country code (e.g., 919876543210)");
    setLoading(true); setError('');
    const result = await sendOTP(phone);
    if (result.success) setOtpSent(true);
    else setError(result.message);
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await verifyOTP(otp);
    if (result.success) navigate('/tests');
    else setError(result.message);
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    const result = await loginWithGoogle();
    if (result.success) navigate('/tests');
    else setError(result.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-['Inter',sans-serif] relative flex items-center justify-center overflow-hidden transition-colors duration-300">
      <div className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-600/30 dark:from-indigo-600/40 to-transparent pointer-events-none blur-3xl"></div>
      
      <div className="relative w-full max-w-[420px] px-4 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/5 rounded-3xl p-8 shadow-2xl relative"
        >
          <button className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-[#2C2C2E] rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <FiX size={16} />
          </button>

          {/* Top Toggle (Sign up / Sign in) */}
          <div className="flex bg-gray-100 dark:bg-[#0A0A0A] rounded-full p-1 w-fit mb-6 border border-gray-200 dark:border-white/5">
            <Link to="/register" className="px-5 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all">Sign up</Link>
            <button className="px-5 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-[#1A1A1D] shadow-sm dark:shadow-none text-gray-900 dark:text-white transition-all">Sign in</button>
          </div>

          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Welcome back</h1>

          {/* Login Method Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
             <button onClick={() => setLoginMethod('email')} className={`pb-2 text-sm font-medium transition-colors ${loginMethod === 'email' ? 'border-b-2 border-[#6B4EE6] text-[#6B4EE6]' : 'text-gray-500 hover:text-gray-300'}`}>Email</button>
             <button onClick={() => setLoginMethod('phone')} className={`pb-2 text-sm font-medium transition-colors ${loginMethod === 'phone' ? 'border-b-2 border-[#6B4EE6] text-[#6B4EE6]' : 'text-gray-500 hover:text-gray-300'}`}>Phone</button>
          </div>

          {error && <div className="mb-6 p-3 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">{error}</div>}

          {/* --- EMAIL LOGIN FORM --- */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-transparent rounded-xl py-3 pl-11 pr-4 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all" placeholder="Enter your email" required />
              </div>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-transparent rounded-xl py-3 pl-11 pr-12 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">{showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}</button>
              </div>
              <div className="flex justify-end pt-1"><Link to="/forgot-password" className="text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-400">Forgot Password?</Link></div>
              
              <div className="flex flex-row gap-4 mt-4">
                <button type="submit" disabled={loading} className="flex-1 bg-[#6B4EE6] hover:bg-[#5A3DD5] text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Log in"}
                </button>
                <button type="button" onClick={handleGoogleLogin} className="flex items-center justify-center px-4 bg-gray-50 dark:bg-[#2C2C2E] border border-gray-200 dark:border-transparent rounded-xl hover:bg-[#3A3A3C] transition-colors">
                  <FcGoogle className="" size={18} />
                </button>
              </div>
            </form>
          )}

          {/* --- PHONE OTP LOGIN FORM --- */}
          {loginMethod === 'phone' && (
            <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="relative group">
                    {/* <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 z-10" /> */}
                    <p>features under testing - stay tuned! </p>
                    {/* <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-50 dark:bg-[#2C2C2E] rounded-xl py-3 pl-11 pr-4 text-white focus:border-indigo-500" placeholder="919876543210 (Country Code must)" required /> */}
                  </div>
                  {/* Recaptcha Container - Required by Firebase */}
                  <div id="recaptcha-container"></div>
                  {/* <button type="submit" disabled={loading} className="w-full bg-[#6B4EE6] text-white py-3 rounded-xl font-medium transition-all flex justify-center">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Send OTP"}
                  </button> */}
                </>
              ) : (
                <>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 z-10" />
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-gray-50 dark:bg-[#2C2C2E] rounded-xl py-3 pl-11 pr-4 text-white focus:border-indigo-500" placeholder="Enter OTP" required />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-[#10B981] text-white py-3 rounded-xl font-medium transition-all flex justify-center">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Verify & Login"}
                  </button>
                </>
              )}
            </form>
          )}

        </motion.div>
      </div>
    </div>
  );
}

export default Login;