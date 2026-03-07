import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBookOpen, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Exams', path: '/exams', dropdown: ['SSC', 'UPSC', 'Banking', 'Railway'] },
    { name: 'Test Series', path: '/tests' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Results', path: '/results' },
  ];

  return (
    <>
      {/* Floating Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300 ${
          scrolled ? 'top-4' : 'top-6'
        }`}
      >
        <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-full px-4 md:px-6 py-2 md:py-3 shadow-2xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FiBookOpen className="text-white text-sm md:text-xl" />
              </div>
              <span className="text-base md:text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                TestSeries
              </span>
              <span className="hidden md:inline-block text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                New
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  {item.dropdown ? (
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    >
                      {item.name}
                      <FiChevronDown className="ml-1 group-hover:rotate-180 transition-transform" />
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  {item.dropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="backdrop-blur-xl bg-black/80 border border-white/10 rounded-2xl p-2 shadow-xl">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem}
                            to={`/exams/${subItem.toLowerCase()}`}
                            className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            {subItem}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-300">Hi, {user.name}</span>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                  >
                    Logout
                  </button>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 hover:scale-105"
                  >
                    Log In
                  </Link>
                  
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white p-2"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm md:hidden"
          >
            <div className="backdrop-blur-xl bg-black/90 border border-white/10 rounded-3xl p-4 shadow-2xl">
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <>
                        <div className="text-gray-300 font-medium px-4 py-2">
                          {item.name}
                        </div>
                        <div className="pl-6 space-y-2 mt-1">
                          {item.dropdown.map((subItem) => (
                            <Link
                              key={subItem}
                              to={`/exams/${subItem.toLowerCase()}`}
                              className="block text-sm text-gray-400 hover:text-white py-1"
                              onClick={() => setIsOpen(false)}
                            >
                              {subItem}
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        className="block text-gray-300 hover:text-white font-medium px-4 py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}

                <hr className="border-white/10 my-2" />

                {user ? (
                  <>
                    <span className="text-gray-300 px-4 py-2">Hi, {user.name}</span>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                        setIsOpen(false);
                      }}
                      className="text-left text-gray-300 hover:text-white px-4 py-2"
                    >
                      Logout
                    </button>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full text-center"
                        onClick={() => setIsOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block text-gray-300 hover:text-white px-4 py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="block bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-full text-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;