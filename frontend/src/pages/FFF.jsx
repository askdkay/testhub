import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiClock, FiCheckCircle, FiAward, 
  FiPlayCircle, FiUsers, FiFilter, FiTarget
} from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

// --- MOCK DATA ---
const categories = ['All', 'SSC', 'Banking', 'UPSC', 'Railways', 'Teaching', 'Defence', 'State Exams'];

const freeTests = [
  { id: 1, title: 'SSC CGL Tier-1 Full Mock Test', category: 'SSC', questions: 100, duration: 60, marks: 200, users: '45.2k', difficulty: 'Medium' },
];

export default function FreeTests() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter Logic
  const filteredTests = freeTests.filter(test => {
    const matchesCategory = activeCategory === 'All' || test.category === activeCategory;
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) || test.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-emerald-500/30 pb-20">
      
      {/* Hero Section */}
      <div className="relative pt-36 pb-16 overflow-hidden border-b border-gray-800/80 bg-gradient-to-b from-emerald-900/20 to-gray-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold tracking-wide mb-6 uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              100% Free Forever
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Unlock Your Potential with <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Free Mega Mock Tests
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl mb-8">
              Experience real exam environment, get detailed solutions, and check your All India Rank among thousands of aspirants without paying a single rupee.
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-medium text-gray-300">
              <span className="flex items-center gap-2"><FiCheckCircle className="text-emerald-400" /> Latest Exam Pattern</span>
              <span className="flex items-center gap-2"><FiTarget className="text-emerald-400" /> All India Ranking</span>
              <span className="flex items-center gap-2"><FiAward className="text-emerald-400" /> Detailed Analytics</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10 items-center justify-between">
          
          {/* Categories (Horizontal Scroll on Mobile) */}
          <div className="w-full lg:w-auto overflow-x-auto hide-scrollbar pb-2 -mb-2">
            <div className="flex gap-2 w-max">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-emerald-500/15 border border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full lg:w-80 relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-full py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800/50">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
              <FiSearch size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No tests found</h3>
            <p className="text-gray-400">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filteredTests.map((test, index) => (
                <FreeTestCard key={test.id} test={test} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}

// --- CARD COMPONENT ---
function FreeTestCard({ test, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] transition-all group flex flex-col h-full relative"
    >
      {/* "FREE" Sash/Badge */}
      <div className="absolute top-0 right-0">
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-bold tracking-widest uppercase py-1 px-8 rotate-45 translate-x-7 translate-y-3 shadow-lg">
          Free
        </div>
      </div>

      <div className="p-5 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <FaGraduationCap size={16} />
          </div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{test.category}</span>
        </div>

        <h3 className="font-bold text-white text-lg mb-4 group-hover:text-emerald-400 transition-colors leading-snug pr-6">
          {test.title}
        </h3>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="flex items-center gap-2"><FiTarget /> {test.questions} Questions</span>
            <span className="text-white font-medium">{test.marks} Marks</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="flex items-center gap-2"><FiClock /> {test.duration} Mins</span>
            <span className={`text-xs px-2 py-0.5 rounded border ${
              test.difficulty === 'Easy' ? 'text-green-400 border-green-400/20 bg-green-400/10' :
              test.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' :
              'text-red-400 border-red-400/20 bg-red-400/10'
            }`}>
              {test.difficulty}
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 pt-0 mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <FiUsers /> {test.users} Attempted
          </div>
        </div>
        
        <button className="w-full py-3 bg-gray-800 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
          <FiPlayCircle size={18} />
          Start Free Test
        </button>
      </div>
    </motion.div>
  );
}