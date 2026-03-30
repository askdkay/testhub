import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock, FiArrowRight, FiInfo, FiFileText } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import api from '../services/api';

const CATEGORY_ICONS = {
  'Current Affairs': '📰',
  'Sarkari Yojana': '🏛️',
  'Vigyan & Tech': '🔬',
  'Arthvyavastha': '📈',
  'Khel': '🏆',
  'Antarrashtriya': '🌍',
  'Paryavaran': '🌿',
};

function formatDateHindi(dateStr) {
  return new Date(dateStr).toLocaleDateString('hi-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('hi-IN', {
    day: 'numeric', month: 'short',
  });
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().split('T')[0];
}

export default function CurrentAffairs() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  const [selectedDate, setSelectedDate] = useState(today);
  const [newsData, setNewsData] = useState(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('sabhi');
  const [search, setSearch] = useState('');

  // Available dates fetch karo
  useEffect(() => {
    api.get('/news/dates').then(res => setDates(res.data.dates || []));
  }, []);

  // Selected date ki news fetch karo
  useEffect(() => {
    setLoading(true);
    setActiveCategory('sabhi');
    api.get(`/news?date=${selectedDate}`)
      .then(res => setNewsData(res.data))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const filteredCategories = (newsData?.categories || [])
    .filter(c => activeCategory === 'sabhi' || c.category === activeCategory)
    .map(c => ({
      ...c,
      items: c.items.filter(item =>
        search ? item.title.toLowerCase().includes(search.toLowerCase()) : true
      ),
    }))
    .filter(c => c.items.length > 0);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-emerald-500/30 relative overflow-hidden">
      <Navbar />

      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 py-8 md:py-12 pt-28 flex flex-col lg:flex-row gap-8 relative z-10">

        {/* ── Left: Date Sidebar ── */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 backdrop-blur-xl lg:sticky lg:top-28">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
              <FiCalendar className="text-emerald-400" /> Tarikh Chuniye
            </h3>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar">
              {dates.map(d => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`text-left px-4 py-3 rounded-2xl text-sm transition-all duration-300 border flex-shrink-0 lg:flex-shrink w-40 lg:w-full ${
                    selectedDate === d.date
                      ? 'bg-gradient-to-r from-emerald-400 to-blue-500 text-white border-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-transparent border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold mb-0.5 flex items-center justify-between">
                    {isToday(d.date) ? (
                      <span className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        Aaj
                      </span>
                    ) : (
                      formatDateShort(d.date)
                    )}
                  </div>
                  <div className={`text-xs font-medium ${selectedDate === d.date ? 'text-emerald-50' : 'text-slate-500'}`}>
                    {d.total} khabarein
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: News Content ── */}
        <div className="flex-1 min-w-0">

          {/* Header */}
          <div className="mb-8 bg-white/[0.01] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full"></div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              {isToday(selectedDate) 
                ? <><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Aaj Ki</span> Current Affairs</> 
                : 'Current Affairs Archive'
              }
            </h1>
            <p className="text-emerald-400 text-sm font-semibold tracking-wide flex items-center gap-2">
              <FiClock /> {formatDateHindi(selectedDate)}
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8 group max-w-xl">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0a0f1a] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <FiSearch className="absolute left-5 text-slate-500 text-lg group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Topic search karo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-transparent pl-14 pr-6 py-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-0 transition-all text-sm md:text-base"
              />
            </div>
          </div>

          {/* Category Tabs */}
          {!loading && (
            <div className="flex gap-3 flex-wrap mb-10">
              <button
                onClick={() => setActiveCategory('sabhi')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
                  activeCategory === 'sabhi'
                    ? 'bg-gradient-to-r from-emerald-400 to-blue-500 text-white border-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-white hover:border-white/10'
                }`}
              >
                📋 Sabhi ({newsData?.totalItems || 0})
              </button>
              {(newsData?.categories || []).map(c => (
                <button
                  key={c.category}
                  onClick={() => setActiveCategory(c.category)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border flex items-center gap-2 ${
                    activeCategory === c.category
                      ? 'bg-gradient-to-r from-emerald-400 to-blue-500 text-white border-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-white hover:border-white/10'
                  }`}
                >
                  <span className="text-base">{CATEGORY_ICONS[c.category] || '📌'}</span> 
                  {c.category} 
                  <span className="opacity-70 ml-1">({c.items.length})</span>
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <div className="w-12 h-12 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
              <span className="font-medium tracking-widest uppercase text-xs text-emerald-400 animate-pulse">News load ho rahi hai...</span>
            </div>
          )}

          {/* No news State */}
          {!loading && newsData?.totalItems === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-24 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                <FiFileText className="text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Koi news nahi mili</h3>
              <p className="text-slate-400">Is tarikh ki koi khabar fetch nahi hui hai.</p>
            </motion.div>
          )}

          {/* Empty Search State */}
          {!loading && newsData?.totalItems > 0 && filteredCategories.length === 0 && (
             <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="text-center py-20 border border-dashed border-white/10 rounded-3xl"
           >
             <p className="text-slate-400">"{search}" ke liye is category mein koi update nahi hai.</p>
           </motion.div>
          )}

          {/* News Cards */}
          <AnimatePresence>
            {!loading && filteredCategories.map(cat => (
              <motion.div 
                key={cat.category} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <h2 className="text-lg font-bold text-white mb-5 pb-3 border-b border-white/5 flex items-center gap-3">
                  <span className="bg-white/5 p-2 rounded-xl border border-white/5 text-xl">
                    {CATEGORY_ICONS[cat.category] || '📌'}
                  </span>
                  {cat.category}
                  <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-white/5 rounded-md">
                    {cat.items.length} items
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {cat.items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => navigate(`/current-affairs/${item.id}`)}
                      className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-6 cursor-pointer hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group relative overflow-hidden flex flex-col h-full"
                    >
                      {/* Hover Glow */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>

                      <p className="text-slate-200 text-[15px] font-semibold leading-relaxed mb-6 group-hover:text-emerald-400 transition-colors z-10 flex-grow">
                        {item.title}
                      </p>
                      
                      <div className="flex justify-between items-center z-10 pt-4 border-t border-white/5 mt-auto">
                        <span className="text-xs font-medium text-slate-400 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-1.5">
                          <FiInfo className="text-slate-500" />
                          {item.source}
                        </span>
                        <span className="text-blue-400 text-sm font-bold flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                          Padhein <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}