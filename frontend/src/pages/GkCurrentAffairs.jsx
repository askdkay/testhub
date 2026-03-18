import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiClock, FiCalendar, FiGlobe, 
  FiBookOpen, FiAward, FiChevronRight, FiPlayCircle,
  FiFilter, FiGrid, FiList, FiTrendingUp
} from 'react-icons/fi';
import { FaLandmark, FaFlask, FaRupeeSign } from 'react-icons/fa';

// --- MOCK DATA ---
const categories = [
  { id: 'daily', name: 'Daily Current Affairs', icon: <FiCalendar />, color: 'from-blue-500 to-cyan-500' },
];

const mockTests = [
  { id: 1, title: 'Daily Current Affairs - 9 March 2026', category: 'Daily Current Affairs', questions: 15, duration: 15, marks: 30, difficulty: 'Medium', date: 'Today', usersAttempted: '12.5k' },
];

function GkCurrentAffairs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  // Filter Logic
  const filteredTests = mockTests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-blue-500/30 pb-20">
      
      {/* Hero Section */}
      <div className="relative pt-16 pb-12 overflow-hidden border-b border-gray-800/50 bg-gray-900/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <FiTrendingUp /> Updated Daily for 2026 Exams
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">GK & Current Affairs</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl">
              Boost your score with our daily quizzes, monthly mega-compilations, and comprehensive static GK test series.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search tests, topics, or months (e.g., Budget, March)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
            />
          </div>

          <div className="hidden md:flex p-1 bg-gray-900 border border-gray-800 rounded-2xl">
            <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-white'}`}>
              <FiGrid size={20} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gray-800 text-blue-400' : 'text-gray-500 hover:text-white'}`}>
              <FiList size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Categories Sidebar / Top Bar */}
          <div className="lg:w-72 flex-shrink-0">
            {/* Mobile Horizontal Scroll */}
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-4 hide-scrollbar">
              <div className="flex gap-2 w-max">
                <CategoryButton 
                  name="All" 
                  isActive={selectedCategory === 'All'} 
                  onClick={() => setSelectedCategory('All')} 
                />
                {categories.map(cat => (
                  <CategoryButton 
                    key={cat.id} 
                    name={cat.name} 
                    icon={cat.icon} 
                    colorClass={cat.color}
                    isActive={selectedCategory === cat.name} 
                    onClick={() => setSelectedCategory(cat.name)} 
                  />
                ))}
              </div>
            </div>

            {/* Desktop Vertical Sidebar */}
            <div className="hidden lg:block sticky top-6 bg-gray-900/50 border border-gray-800 rounded-3xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2 px-2">
                <FiFilter className="text-blue-400" /> Filter by Subject
              </h3>
              <div className="space-y-1">
                <CategorySidebarItem 
                  name="All Tests" 
                  isActive={selectedCategory === 'All'} 
                  onClick={() => setSelectedCategory('All')} 
                />
                {categories.map(cat => (
                  <CategorySidebarItem 
                    key={cat.id} 
                    name={cat.name} 
                    icon={cat.icon} 
                    colorClass={cat.color}
                    isActive={selectedCategory === cat.name} 
                    onClick={() => setSelectedCategory(cat.name)} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Test Cards Area */}
          <div className="flex-1 min-w-0">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {selectedCategory === 'All' ? 'Latest Tests' : selectedCategory}
              </h2>
              <span className="text-sm text-gray-400">{filteredTests.length} tests available</span>
            </div>

            {filteredTests.length === 0 ? (
              <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800">
                <p className="text-gray-400">No tests found for your search.</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2' : 'grid-cols-1'}`}>
                <AnimatePresence>
                  {filteredTests.map((test, index) => (
                    <TestCard key={test.id} test={test} viewMode={viewMode} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function CategoryButton({ name, icon, colorClass, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
        isActive
          ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
          : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
      }`}
    >
      {icon && <span className={`text-transparent bg-clip-text bg-gradient-to-r ${colorClass}`}>{icon}</span>}
      {name}
    </button>
  );
}

function CategorySidebarItem({ name, icon, colorClass, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group ${
        isActive
          ? 'bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20'
          : 'border border-transparent text-gray-400 hover:bg-gray-800/50 hover:text-white'
      }`}
    >
      {icon ? (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${colorClass} bg-opacity-10 text-white shadow-sm`}>
          {icon}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-800 text-gray-400">
          <FiBookOpen />
        </div>
      )}
      <span className="truncate">{name}</span>
    </button>
  );
}

function TestCard({ test, viewMode, index }) {
  // Utility for difficulty colors
  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={`bg-gray-900 border border-gray-800 rounded-2xl hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-blue-500/5 transition-all group overflow-hidden ${
        viewMode === 'list' ? 'p-5 sm:flex sm:items-center justify-between gap-6' : 'p-6 flex flex-col'
      }`}
    >
      <div className={`${viewMode === 'list' ? 'flex-1 mb-4 sm:mb-0' : 'mb-5'}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-gray-800 text-gray-300">
            {test.category}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <FiCalendar /> {test.date}
          </span>
        </div>
        
        <h3 className="font-bold text-white text-lg mb-2 group-hover:text-blue-400 transition-colors leading-tight">
          {test.title}
        </h3>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><FiBookOpen className="text-blue-400"/> {test.questions} Qs</span>
          <span className="flex items-center gap-1.5"><FiClock className="text-orange-400"/> {test.duration} Mins</span>
          <span className="flex items-center gap-1.5"><FiAward className="text-green-400"/> {test.marks} Marks</span>
        </div>
      </div>

      <div className={`flex items-center justify-between mt-auto ${viewMode === 'list' ? 'sm:flex-col sm:items-end sm:justify-center sm:gap-3' : 'pt-5 border-t border-gray-800/60'}`}>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded border ${getDifficultyColor(test.difficulty)}`}>
            {test.difficulty}
          </span>
          {viewMode === 'grid' && <span className="text-xs text-gray-500">{test.usersAttempted} attempts</span>}
        </div>
        
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <FiPlayCircle size={18} />
          <span className="hidden sm:inline">Attempt Now</span>
          <span className="sm:hidden">Start</span>
        </button>
      </div>
    </motion.div>
  );
}

export default GkCurrentAffairs;