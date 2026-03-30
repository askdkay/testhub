import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronRight, FiArrowLeft, FiBook, FiMenu, FiX } from 'react-icons/fi';
import api from '../services/api';

export default function ExamContentViewer() {
  const { examSlug } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [topics, setTopics] = useState([]);
  const [activeSubtopic, setActiveSubtopic] = useState(null);
  const [content, setContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/exam-content/topics/${examSlug}`)
      .then(res => {
        setExam(res.data.exam);
        setTopics(res.data.topics);
        // Pehla topic auto-expand karo
        if (res.data.topics.length) {
          setExpandedTopics({ [res.data.topics[0].id]: true });
          // Pehla subtopic auto-load karo
          if (res.data.topics[0].subtopics.length) {
            loadSubtopic(res.data.topics[0].subtopics[0]);
          }
        }
      })
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [examSlug]);

  const loadSubtopic = async (subtopic) => {
    setActiveSubtopic(subtopic.id);
    setContentLoading(true);
    try {
      const res = await api.get(`/exam-content/subtopic/${subtopic.id}`);
      setContent(res.data);
    } catch {
      setContent(null);
    } finally {
      setContentLoading(false);
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">

      {/* Top Bar */}
      <div className="h-14 bg-black/40 border-b border-white/5 flex items-center px-4 gap-4 sticky top-0 z-40 backdrop-blur-md">
        <button
          onClick={() => navigate(`/exam/${examSlug}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <FiArrowLeft />
          Back
        </button>
        <div className="w-px h-5 bg-white/10"></div>
        <FiBook className="text-emerald-400" />
        <span className="font-semibold text-sm">{exam?.name} — Study Material</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="ml-auto p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400"
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-black/30 border-r border-white/5 overflow-y-auto shrink-0"
            >
              <div className="p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 px-2">
                  Topics
                </p>

                {topics.length === 0 && (
                  <p className="text-gray-500 text-sm px-2">No content yet</p>
                )}

                {topics.map(topic => (
                  <div key={topic.id} className="mb-1">
                    {/* Topic Header */}
                    <button
                      onClick={() => toggleTopic(topic.id)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <span>{topic.name}</span>
                      {expandedTopics[topic.id]
                        ? <FiChevronDown className="text-emerald-400 shrink-0" />
                        : <FiChevronRight className="text-gray-500 shrink-0" />
                      }
                    </button>

                    {/* Subtopics */}
                    <AnimatePresence>
                      {expandedTopics[topic.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-3 pl-3 border-l border-white/5 mt-1 space-y-0.5">
                            {topic.subtopics.map(sub => (
                              <button
                                key={sub.id}
                                onClick={() => loadSubtopic(sub)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                  activeSubtopic === sub.id
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                {sub.title}
                              </button>
                            ))}
                            {topic.subtopics.length === 0 && (
                              <p className="text-gray-600 text-xs px-3 py-1">No subtopics</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {contentLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin"></div>
            </div>
          ) : content ? (
            <motion.div
              key={activeSubtopic}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto px-6 py-8"
            >
              <h1 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-white/10">
                {content.title}
              </h1>
              {/* HTML Content Render */}
              <div
                className="prose-content"
                dangerouslySetInnerHTML={{ __html: content.content }}
                style={{
                  color: '#cbd5e1',
                  lineHeight: '1.8',
                  fontSize: '15px',
                }}
              />
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FiBook className="text-4xl mb-3 text-gray-600" />
              <p>Select a topic from the sidebar</p>
            </div>
          )}
        </div>
      </div>

      {/* Prose styles */}
      <style>{`
        .prose-content h2 { color: #f1f5f9; font-size: 1.3rem; font-weight: 700; margin: 1.5rem 0 0.75rem; }
        .prose-content h3 { color: #e2e8f0; font-size: 1.1rem; font-weight: 600; margin: 1.2rem 0 0.5rem; }
        .prose-content p { margin: 0.6rem 0; }
        .prose-content ul { padding-left: 1.5rem; margin: 0.75rem 0; }
        .prose-content li { margin: 0.4rem 0; list-style-type: disc; }
        .prose-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .prose-content td, .prose-content th { border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; font-size: 14px; }
        .prose-content tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
        .prose-content strong { color: #f8fafc; }
      `}</style>
    </div>
  );
}