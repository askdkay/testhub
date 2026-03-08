import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Aapka Navbar import
// import Navbar from '../components/Navbar'; 
import { 
  FiSearch, FiFilter, FiBookOpen, FiChevronRight,
  FiStar, FiTrendingUp, FiClock, FiAward,
  FiChevronLeft, FiX, FiMenu,
  FiGrid, FiList, FiBookmark, FiExternalLink
} from 'react-icons/fi';
import { 
  FaGraduationCap, FaUniversity, FaLandmark, FaTrain,
  FaShieldAlt, FaChalkboardTeacher, FaFlask, FaGavel,
  FaLeaf, FaMapMarkedAlt, FaCity, FaTree
} from 'react-icons/fa';

// Categories Data (Same as your original)
const categoriesData = [
  {
    "category_name": "UPSC (Union Public Service Commission)",
    "icon": <FaLandmark />,
    "color": "from-orange-500 to-red-500",
    "exams": [
      "Civil Services Examination (CSE - IAS/IPS)", "Indian Forest Service (IFS)", "Engineering Services Examination (IES)", "Combined Defence Services (CDS)", "National Defence Academy & Naval Academy (NDA & NA)", "Central Armed Police Forces (CAPF - AC)", "Indian Economic Service (IES)", "Indian Statistical Service (ISS)", "Combined Medical Services (CMS)", "EPFO Enforcement Officer", "EPFO APFC", "Combined Geo-Scientist", "CISF Assistant Commandant", "CBI DSP LDCE"
    ]
  },
  {
    "category_name": "SSC (Staff Selection Commission)",
    "icon": <FaUniversity />,
    "color": "from-blue-500 to-cyan-500",
    "exams": [
      "SSC CGL", "SSC CHSL", "SSC MTS", "SSC CPO", "SSC GD Constable", "SSC JE Civil", "SSC JE Electrical", "SSC JE Mechanical", "SSC Stenographer", "SSC JHT", "SSC Selection Post", "SSC Scientific Assistant", "Delhi Police Constable", "Delhi Police Head Constable", "Delhi Police MTS"
    ]
  },
  {
    "category_name": "Banking & Insurance",
    "icon": <FaUniversity />,
    "color": "from-green-500 to-emerald-500",
    "exams": [
      "SBI PO", "SBI Clerk", "SBI SO", "IBPS PO", "IBPS Clerk", "IBPS SO", "IBPS RRB PO", "IBPS RRB Clerk", "RBI Grade B", "RBI Assistant", "NABARD Grade A", "SEBI Grade A", "LIC AAO", "LIC ADO", "LIC Assistant", "NIACL AO", "ESIC SSO", "ESIC UDC"
    ]
  },
  {
    "category_name": "Railway Recruitment Board (RRB)",
    "icon": <FaTrain />,
    "color": "from-yellow-500 to-orange-500",
    "exams": [
      "RRB NTPC", "RRB Group D", "RRB ALP", "RRB Technician", "RRB JE", "RRB SSE", "RPF SI", "RPF Constable", "RRB Paramedical", "RRB Station Master", "DFCCIL Executive"
    ]
  },
  {
    "category_name": "Defence & Central Police",
    "icon": <FaShieldAlt />,
    "color": "from-red-500 to-pink-500",
    "exams": [
      "AFCAT", "INET", "Indian Army Agniveer", "Indian Navy SSR", "Indian Air Force Agniveer Vayu", "Coast Guard Navik", "BSF Constable", "CISF Head Constable", "CRPF Constable", "ITBP Constable", "SSB Constable", "IB ACIO", "DRDO CEPTAM", "ISRO Assistant"
    ]
  },
  {
    "category_name": "Teaching & Academics",
    "icon": <FaChalkboardTeacher />,
    "color": "from-purple-500 to-violet-500",
    "exams": [
      "CTET", "UGC NET", "CSIR NET", "KVS PRT", "KVS TGT", "KVS PGT", "NVS TGT", "NVS PGT", "DSSSB PRT", "UPTET", "REET", "HTET", "BTET", "MPTET"
    ]
  },
  {
    "category_name": "Engineering & Medical Entrance",
    "icon": <FaFlask />,
    "color": "from-cyan-500 to-teal-500",
    "exams": [
      "JEE Main", "JEE Advanced", "NEET UG", "NEET PG", "BITSAT", "VITEEE", "WBJEE", "MHT CET", "KCET", "CUET UG", "GATE", "IIT JAM", "NIMCET"
    ]
  },
  {
    "category_name": "Management, Law & Design",
    "icon": <FaGavel />,
    "color": "from-indigo-500 to-purple-500",
    "exams": [
      "CAT", "XAT", "MAT", "CMAT", "SNAP", "NMAT", "CLAT", "AILET", "LSAT India", "MH CET Law", "NIFT Entrance", "NID DAT", "UCEED", "CEED"
    ]
  }
];

function Exams() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarkedExams, setBookmarkedExams] = useState([]);

  // Flatten all exams for global search
  const allExams = categoriesData.flatMap(cat => 
    cat.exams.map(exam => ({
      name: exam,
      category: cat.category_name,
      categoryIcon: cat.icon,
      categoryColor: cat.color
    }))
  );

  // Filter logic
  const filteredExams = searchTerm 
    ? allExams.filter(exam =>
        exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const categoryExams = selectedCategory 
    ? categoriesData.find(c => c.category_name === selectedCategory)?.exams || []
    : [];

  const toggleBookmark = (examName) => {
    setBookmarkedExams(prev =>
      prev.includes(examName)
        ? prev.filter(e => e !== examName)
        : [...prev, examName]
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-blue-500/30">
      {/* Agar Navbar component ready hai toh isko uncomment kar lein */}
      {/* <Navbar /> */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        
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
            Find your target exam from 500+ options across multiple categories and kickstart your preparation journey.
          </p>
        </motion.div>

        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search exams by name or category (e.g., UPSC, JEE, Bank)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if(e.target.value) setSelectedCategory(null); // Clear category if searching globally
              }}
              className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-sm"
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
          
          {/* Mobile Category Scroll (Visible only on small screens) */}
          <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-2 w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  selectedCategory === null && !searchTerm
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {categoriesData.map((cat) => (
                <button
                  key={cat.category_name}
                  onClick={() => {
                    setSelectedCategory(cat.category_name);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory === cat.category_name
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
                >
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${cat.color}`}>{cat.icon}</span>
                  {cat.category_name.split(' ')[0]} {/* Shorter name for mobile chips */}
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
                  All Categories Overview
                </button>
                {categoriesData.map((cat) => (
                  <button
                    key={cat.category_name}
                    onClick={() => {
                      setSelectedCategory(cat.category_name);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group ${
                      selectedCategory === cat.category_name
                        ? 'bg-blue-500/10 text-blue-400 font-medium'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${cat.color} bg-opacity-10 text-white shadow-sm`}>
                      {cat.icon}
                    </div>
                    <span className="truncate">{cat.category_name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* Global Search Results */}
            {searchTerm ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Search Results <span className="text-gray-500 text-base font-normal">({filteredExams.length} found)</span>
                </h2>
                {filteredExams.length === 0 ? (
                  <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800">
                    <p className="text-gray-400">No exams found for "{searchTerm}"</p>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                    {filteredExams.map((exam, i) => (
                      <ExamCard key={i} exam={exam} viewMode={viewMode} toggleBookmark={toggleBookmark} isBookmarked={bookmarkedExams.includes(exam.name)} />
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
                  {categoryExams.map((examName, i) => {
                    const cat = categoriesData.find(c => c.category_name === selectedCategory);
                    const examObj = { name: examName, category: cat.category_name, categoryIcon: cat.icon, categoryColor: cat.color };
                    return (
                      <ExamCard key={i} exam={examObj} viewMode={viewMode} toggleBookmark={toggleBookmark} isBookmarked={bookmarkedExams.includes(examName)} />
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              
              /* Default View: All Categories Dashboard */
              <div className="space-y-8">
                {categoriesData.map((category, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={category.category_name}
                    className="bg-gray-900/40 border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                          {category.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{category.category_name}</h3>
                          <p className="text-sm text-gray-400">{category.exams.length} Exams</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedCategory(category.category_name)}
                        className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                      >
                        View All <FiChevronRight />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.exams.slice(0, 6).map((examName) => (
                        <div
                          key={examName}
                          className="flex items-center gap-3 p-3 bg-gray-950/50 rounded-xl border border-gray-800 hover:border-gray-600 transition-all cursor-pointer group"
                        >
                          <FiBookOpen className="text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0" size={16} />
                          <span className="text-sm text-gray-300 group-hover:text-white truncate">{examName}</span>
                        </div>
                      ))}
                    </div>

                    {category.exams.length > 6 && (
                      <button
                        onClick={() => setSelectedCategory(category.category_name)}
                        className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        +{category.exams.length - 6} more exams
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
      className={`bg-gray-900 border border-gray-800 rounded-2xl hover:border-gray-600 hover:shadow-lg transition-all group ${
        viewMode === 'list' ? 'p-4 sm:p-5 flex items-center justify-between gap-4' : 'p-6 flex flex-col'
      }`}
    >
      <div className={`flex gap-4 ${viewMode === 'list' ? 'items-center flex-1 min-w-0' : 'items-start mb-4'}`}>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exam.categoryColor} bg-opacity-20 flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
          {exam.categoryIcon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-base mb-1 truncate" title={exam.name}>
            {exam.name}
          </h3>
          <p className="text-xs text-gray-500 truncate">{exam.category}</p>
        </div>
      </div>

      <div className={`flex items-center justify-between ${viewMode === 'list' ? 'flex-shrink-0' : 'mt-auto pt-4 border-t border-gray-800'}`}>
        <button
          onClick={() => toggleBookmark(exam.name)}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            isBookmarked ? 'bg-yellow-500/10 text-yellow-500' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <FiStar className={isBookmarked ? 'fill-yellow-500' : ''} />
          <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
        <button className="flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors p-2 lg:opacity-0 group-hover:opacity-100 focus:opacity-100">
          View Details <FiExternalLink />
        </button>
      </div>
    </motion.div>
  );
}

export default Exams;