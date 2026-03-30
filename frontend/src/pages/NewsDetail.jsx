import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiCalendar, FiExternalLink, 
  FiCheckCircle, FiInfo, FiTag 
} from 'react-icons/fi';
import api from '../services/api';

const CATEGORY_ICONS = {
  'Current Affairs': '📰', 'Sarkari Yojana': '🏛️',
  'Vigyan & Tech': '🔬', 'Arthvyavastha': '📈',
  'Khel': '🏆', 'Antarrashtriya': '🌍', 'Paryavaran': '🌿',
};

const CATEGORY_TIPS = {
  'Current Affairs': 'Ye khabar SSC, UPSC, Railway exams ke liye important hai.',
  'Sarkari Yojana': 'Government schemes aur policies se related questions aate hain.',
  'Vigyan & Tech': 'Science & Technology ke questions aajkal bahut pooche jaate hain.',
  'Arthvyavastha': 'Economy se related topics UPSC Prelims mein important hain.',
  'Khel': 'Sports GK har competitive exam mein poochi jaati hai.',
  'Antarrashtriya': 'International affairs se bilateral relations ke questions aate hain.',
  'Paryavaran': 'Environment ke sawaal UPSC mein important hain.',
};

function PracticeMCQ({ mcq }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-md">
      <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 pb-3 border-b border-white/5">
        🎯 Practice MCQ
      </p>
      <p className="text-white font-semibold text-[15px] mb-4 leading-relaxed">
        {mcq.question}
      </p>
      <div className="space-y-2 mb-4">
        {mcq.options.map((opt, i) => {
          const isCorrect = revealed && opt.startsWith(mcq.answer);
          const isWrong = revealed && selected === i && !opt.startsWith(mcq.answer);
          return (
            <button
              key={i}
              onClick={() => { if (!revealed) setSelected(i); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border ${
                isCorrect
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : isWrong
                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                  : selected === i
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          disabled={selected === null}
          className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Answer Check Karo
        </button>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-emerald-400 text-xs font-bold mb-1">✅ Sahi Jawab: {mcq.answer}</p>
          <p className="text-slate-400 text-xs">{mcq.explanation}</p>
        </div>
      )}
    </div>
  );
}

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/news/single/${id}`)
      .then(res => setNews(res.data.news))
      .catch(() => navigate('/current-affairs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none"></div>
      <div className="text-center relative z-10">
        <div className="w-14 h-14 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin mx-auto mb-5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
        <p className="text-emerald-400 font-medium tracking-widest animate-pulse uppercase text-sm">Loading details...</p>
      </div>
    </div>
  );

  if (!news) return null;

  const pubDate = new Date(news.pub_date).toLocaleDateString('hi-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  // Safe JSON Parsing Logic
  let sm = null;
  if (news.study_material) {
    try {
      sm = typeof news.study_material === 'string' 
        ? JSON.parse(news.study_material) 
        : news.study_material;
    } catch (e) {
      console.error("Study material parse error:", e);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-sm mb-10 transition-all group backdrop-blur-md"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Wapas Current Affairs
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Category badge */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xl bg-white/5 p-2 rounded-xl border border-white/10">
              {CATEGORY_ICONS[news.category] || '📌'}
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              {news.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold leading-snug text-white mb-6">
            {news.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500 mb-8 pb-8 border-b border-white/5">
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <FiTag className="text-blue-400" />
              {news.source}
            </span>
            <span className="flex items-center gap-2">
              <FiCalendar className="text-emerald-400" />
              {pubDate}
            </span>
          </div>

          {/* Exam tip box */}
          {CATEGORY_TIPS[news.category] && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5 mb-8 backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[30px] rounded-full"></div>
              <div className="relative z-10">
                <p className="text-amber-400 text-sm font-bold mb-2 flex items-center gap-2 uppercase tracking-wide">
                  <FiInfo className="text-lg" />
                  Exam Ke Liye Zaroori
                </p>
                <p className="text-amber-200/80 text-[15px] leading-relaxed">
                  {CATEGORY_TIPS[news.category]}
                </p>
              </div>
            </motion.div>
          )}

          {/* Study Material Section */}
          {sm ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-4 mb-8"
            >
              {/* Subject Tag */}
              {sm.subject_tag && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    📚 {sm.subject_tag}
                  </span>
                </div>
              )}

              {/* Quick Summary */}
              {sm.quick_summary?.length > 0 && (
                <div className="bg-white/[0.02] border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] rounded-full pointer-events-none"></div>
                  <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 pb-3 border-b border-white/5">
                    🤖 AI Analysis — Quick Points
                  </p>
                  <ul className="space-y-2">
                    {sm.quick_summary.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 text-[15px] text-slate-300">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">›</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Static GK Fact */}
              {sm.static_gk_fact && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/5 border border-purple-500/20 rounded-2xl p-5 backdrop-blur-md">
                  <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    🏛️ Static GK Fact
                  </p>
                  <p className="text-slate-300 text-[15px] leading-relaxed">
                    {sm.static_gk_fact}
                  </p>
                </div>
              )}

              {/* Important Terms */}
              {sm.important_terms?.length > 0 && (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 pb-3 border-b border-white/5">
                    📖 Important Terms
                  </p>
                  <div className="space-y-3">
                    {sm.important_terms.map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="text-blue-400 font-bold text-sm shrink-0 mt-0.5 min-w-[120px]">
                          {item.term}
                        </span>
                        <span className="text-slate-400 text-sm">— {item.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice MCQ */}
              {sm.practice_mcq && (
                <PracticeMCQ mcq={sm.practice_mcq} />
              )}

            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-8 text-center"
            >
              <p className="text-slate-500 text-sm">
                🤖 Is news ka study material abhi available nahi hai
              </p>
            </motion.div>
          )}

          {/* What to remember */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 mb-10 backdrop-blur-xl"
          >
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-5 border-b border-white/5 pb-3">
              📝 Kya yaad rakhein
            </p>
            <ul className="space-y-4 text-[15px] text-slate-300">
              <li className="flex items-start gap-3">
                <FiCheckCircle className="text-emerald-400 text-lg mt-0.5 shrink-0" />
                <span>Is news ki category: <strong className="text-white ml-1">{news.category}</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheckCircle className="text-emerald-400 text-lg mt-0.5 shrink-0" />
                <span>Source: <strong className="text-white ml-1">{news.source}</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <FiCheckCircle className="text-emerald-400 text-lg mt-0.5 shrink-0" />
                <span>Tarikh: <strong className="text-white ml-1">{pubDate}</strong></span>
              </li>
            </ul>
          </motion.div>

          {/* Read full article (Fixed <a> tag) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <a
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-400 to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] text-[15px] group"
            >
              <FiExternalLink className="text-xl group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              Poori Khabar Padhein (Original Source)
            </a>
            <p className="text-center text-slate-500 text-xs mt-4 flex items-center justify-center gap-1.5">
              <FiInfo /> Opens securely in a new tab — {news.source}
            </p>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}