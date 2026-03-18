import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';
import { 
  FiSearch, FiBookOpen, FiChevronRight,
  FiStar, FiChevronLeft, FiX, FiGrid, FiList,
  FiExternalLink
} from 'react-icons/fi';
import { 
  FaGraduationCap, FaUniversity, FaLandmark, FaTrain,
  FaShieldAlt, FaChalkboardTeacher, FaFlask, FaGavel,
  FaLeaf, FaMapMarkedAlt, FaCity, FaTree
} from 'react-icons/fa';

// Icon mapping
const iconMap = {
  FaGraduationCap: <FaGraduationCap />,
  FaUniversity: <FaUniversity />,
  FaLandmark: <FaLandmark />,
  FaTrain: <FaTrain />,
  FaShieldAlt: <FaShieldAlt />,
  FaChalkboardTeacher: <FaChalkboardTeacher />,
  FaFlask: <FaFlask />,
  FaGavel: <FaGavel />,
  FaLeaf: <FaLeaf />,
  FaMapMarkedAlt: <FaMapMarkedAlt />,
  FaCity: <FaCity />,
  FaTree: <FaTree />
};

function Exams() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarkedExams, setBookmarkedExams] = useState([]);

  // Fetch categories with exams
  useEffect(() => {
    fetchCategories();
    
    // Load bookmarks from localStorage
    const saved = localStorage.getItem('bookmarkedExams');
    if (saved) {
      setBookmarkedExams(JSON.parse(saved));
    }
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await API.get('/exams/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarkedExams', JSON.stringify(bookmarkedExams));
  }, [bookmarkedExams]);

  // Flatten all exams for global search
  const allExams = categories.flatMap(cat => 
    (cat.exams || []).map(exam => ({
      id: exam.id,
      name: exam.name,
      slug: exam.slug,
      short_name: exam.short_name,
      category: cat.name,
      categorySlug: cat.slug,
      categoryIcon: iconMap[cat.icon] || <FaUniversity />,
      categoryColor: cat.color || 'from-blue-500 to-cyan-500'
    }))
  );

  // Filter logic for search
  const filteredExams = searchTerm 
    ? allExams.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exam.short_name && exam.short_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  // Get exams for selected category
  const selectedCategoryData = selectedCategory 
    ? categories.find(c => c.name === selectedCategory)
    : null;
  
  const categoryExams = selectedCategoryData?.exams || [];

  const toggleBookmark = (examId) => {
    setBookmarkedExams(prev =>
      prev.includes(examId)
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans">
      {/* Navbar - Add your Navbar component here */}
      {/* <Navbar /> */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Competitive Exams</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Find your target exam from {allExams.length}+ options across multiple categories
          </p>
        </motion.div>

        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search exams by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if(e.target.value) setSelectedCategory(null);
              }}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white bg-gray-800 p-1 rounded-full transition-colors"
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          <div className="hidden md:flex p-1 bg-gray-900 border border-gray-800 rounded-2xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-gray-800 text-blue-400 shadow-sm' : 'text-gray-500 hover:text-white'
              }`}
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${
                viewMode === 'list' ? 'bg-gray-800 text-blue-400 shadow-sm' : 'text-gray-500 hover:text-white'
              }`}
            >
              <FiList size={20} />
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Category Scroll */}
          <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-4">
            <div className="flex gap-2 w-max">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTerm('');
                }}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  selectedCategory === null && !searchTerm
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory === cat.name
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${cat.color}`}>
                    {iconMap[cat.icon] || <FaUniversity />}
                  </span>
                  {cat.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-6 bg-gray-900/50 border border-gray-800 rounded-3xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2 px-2">
                <FiBookOpen className="text-blue-400" /> Categories
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchTerm('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === null && !searchTerm
                      ? 'bg-blue-500/10 text-blue-400'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  All Exams
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group ${
                      selectedCategory === cat.name
                        ? 'bg-blue-500/10 text-blue-400 font-medium'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${cat.color} bg-opacity-10 text-white shadow-sm`}>
                      {iconMap[cat.icon] || <FaUniversity />}
                    </div>
                    <span className="truncate">{cat.name}</span>
                    <span className="ml-auto text-xs text-gray-500">{cat.exams?.length || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* Search Results */}
            {searchTerm ? (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Search Results <span className="text-gray-500 text-base font-normal">({filteredExams.length} found)</span>
                </h2>
                {filteredExams.length === 0 ? (
                  <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800">
                    <p className="text-gray-400">No exams found for "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                    {filteredExams.map((exam) => (
                      <ExamCard 
                        key={exam.id} 
                        exam={exam} 
                        viewMode={viewMode} 
                        toggleBookmark={toggleBookmark} 
                        isBookmarked={bookmarkedExams.includes(exam.id)} 
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : selectedCategory ? (
              
              /* Single Category View */
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="lg:hidden p-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedCategory}</h2>
                    <p className="text-gray-400 mt-1">{categoryExams.length} exams available</p>
                  </div>
                </div>

                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {categoryExams.map((exam) => {
                    const examObj = {
                      id: exam.id,
                      name: exam.name,
                      slug: exam.slug,
                      short_name: exam.short_name,
                      category: selectedCategoryData.name,
                      categorySlug: selectedCategoryData.slug,
                      categoryIcon: iconMap[selectedCategoryData.icon] || <FaUniversity />,
                      categoryColor: selectedCategoryData.color || 'from-blue-500 to-cyan-500'
                    };
                    return (
                      <ExamCard 
                        key={exam.id} 
                        exam={examObj} 
                        viewMode={viewMode} 
                        toggleBookmark={toggleBookmark} 
                        isBookmarked={bookmarkedExams.includes(exam.id)} 
                      />
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              
              /* Default View: All Categories with their exams */
              <div className="space-y-8">
                {categories.map((category, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={category.id}
                    className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                          {iconMap[category.icon] || <FaUniversity />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{category.name}</h3>
                          <p className="text-sm text-gray-400">{category.exams?.length || 0} Exams</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedCategory(category.name)}
                        className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                      >
                        View All <FiChevronRight />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(category.exams || []).slice(0, 6).map((exam) => (
                        <Link
                          key={exam.id}
                          to={`/exam/${exam.slug}`}
                          className="flex items-center gap-3 p-3 bg-gray-950/50 rounded-xl border border-gray-800 hover:border-blue-500/50 hover:bg-gray-900/50 transition-all group"
                        >
                          <FiBookOpen className="text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0" size={16} />
                          <span className="text-sm text-gray-300 group-hover:text-white truncate flex-1">{exam.name}</span>
                          {exam.short_name && (
                            <span className="text-xs text-gray-500 group-hover:text-blue-400">{exam.short_name}</span>
                          )}
                        </Link>
                      ))}
                    </div>

                    {(category.exams || []).length > 6 && (
                      <button
                        onClick={() => setSelectedCategory(category.name)}
                        className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        +{(category.exams || []).length - 6} more exams
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Exam Card Component
function ExamCard({ exam, viewMode, toggleBookmark, isBookmarked }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gray-900 border border-gray-800 rounded-2xl hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all group ${
        viewMode === 'list' ? 'p-4 sm:p-5 flex items-center justify-between gap-4' : 'p-6 flex flex-col'
      }`}
    >
      <div className={`flex gap-4 ${viewMode === 'list' ? 'items-center flex-1 min-w-0' : 'items-start mb-4'}`}>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exam.categoryColor} bg-opacity-20 flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
          {exam.categoryIcon}
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/exam/${exam.slug}`}>
            <h3 className="font-semibold text-white text-base mb-1 hover:text-blue-400 transition-colors truncate" title={exam.name}>
              {exam.name}
            </h3>
          </Link>
          <Link to={`/exams?category=${exam.categorySlug}`} className="text-xs text-gray-500 hover:text-gray-400 truncate block">
            {exam.category}
          </Link>
        </div>
      </div>

      <div className={`flex items-center justify-between ${viewMode === 'list' ? 'flex-shrink-0' : 'mt-auto pt-4 border-t border-gray-800'}`}>
        <button
          onClick={() => toggleBookmark(exam.id)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            isBookmarked ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <FiStar className={isBookmarked ? 'fill-yellow-500' : ''} />
          <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
        <Link
          to={`/exam/${exam.slug}`}
          className="flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors p-2 lg:opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          View Details <FiExternalLink />
        </Link>
      </div>
    </motion.div>
  );
}

export default Exams;