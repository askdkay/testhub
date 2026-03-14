import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { FiMenu, FiX, FiChevronRight, FiChevronLeft, FiBookOpen, FiEye } from 'react-icons/fi';

function ExamContent() {
  const { examSlug } = useParams();
  const [contents, setContents] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchContents();
  }, [examSlug]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/content/exam/${examSlug}`);
      setContents(res.data);
      
      // Auto-expand first topic
      if (res.data.length > 0) {
        setExpandedTopics([res.data[0].id]);
        if (res.data[0].subtopics?.length > 0) {
          setSelectedContent(res.data[0].subtopics[0]);
        } else {
          setSelectedContent(res.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Flatten the array so Next/Prev buttons work flawlessly with Subtopics
  const flatContents = contents.reduce((acc, curr) => {
    acc.push(curr);
    if (curr.subtopics && curr.subtopics.length > 0) {
      acc.push(...curr.subtopics);
    }
    return acc;
  }, []);

  const currentIndex = flatContents.findIndex(c => c.id === selectedContent?.id);
  const prevContent = currentIndex > 0 ? flatContents[currentIndex - 1] : null;
  const nextContent = currentIndex < flatContents.length - 1 ? flatContents[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <p className="text-slate-400 text-sm font-medium animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-400 font-sans selection:bg-sky-500/30 overflow-x-hidden">
      <Navbar />

      {/* Mobile Header/Toggle */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-[#0B1120]/90 backdrop-blur border-b border-slate-800/50 px-4 py-3 flex items-center">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-2 text-sm font-medium"
        >
          {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          Menu
        </button>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Sidebar */}
        <div
          className={`fixed left-0 top-[3.8125rem] lg:top-24 bottom-0 w-80 bg-[#0B1120]/95 lg:bg-transparent border-r border-slate-800/50 backdrop-blur-xl overflow-y-auto z-30 transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 pt-8 lg:pt-4">
            <h3 className="font-semibold mb-6 flex items-center gap-2 text-slate-200">
              <FiBookOpen className="text-sky-400" />
              Study Material
            </h3>

            <div className="space-y-3">
              {contents.map((topic) => (
                <div key={topic.id} className="mb-2">
                  {/* Main Topic */}
                  <button
                    onClick={() => {
                      setExpandedTopics(prev =>
                        prev.includes(topic.id)
                          ? prev.filter(id => id !== topic.id)
                          : [...prev, topic.id]
                      );
                      // Select content only if it has no subtopics
                      if (!topic.subtopics || topic.subtopics.length === 0) {
                        setSelectedContent(topic);
                        if (window.innerWidth < 1024) setSidebarOpen(false); // Mobile UX fix
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                      selectedContent?.id === topic.id 
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{topic.title}</h4>
                      <div className="flex items-center gap-3 text-xs opacity-70">
                        <span className="flex items-center gap-1">
                          <FiEye size={12} />
                          {topic.views || 0}
                        </span>
                        {topic.subtopic_count > 0 && (
                          <span className="flex items-center gap-1">
                            📚 {topic.subtopic_count} topics
                          </span>
                        )}
                      </div>
                    </div>
                    {topic.subtopic_count > 0 && (
                      <span className="ml-2 text-slate-500 text-xs">
                        {expandedTopics.includes(topic.id) ? '▼' : '▶'}
                      </span>
                    )}
                  </button>

                  {/* Subtopics */}
                  {expandedTopics.includes(topic.id) && topic.subtopics?.length > 0 && (
                    <div className="ml-4 mt-2 space-y-1 border-l border-slate-800/50 pl-2">
                      {topic.subtopics.map((subtopic) => (
                        <button
                          key={subtopic.id}
                          onClick={() => {
                            setSelectedContent(subtopic);
                            if (window.innerWidth < 1024) setSidebarOpen(false); // Mobile UX fix
                          }}
                          className={`w-full text-left p-2 rounded-md transition-all text-sm flex items-center gap-2 ${
                            selectedContent?.id === subtopic.id
                              ? 'text-sky-400 bg-sky-500/5'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                          }`}
                        >
                          <span className="text-xs opacity-50">📄</span>
                          <span className="flex-1 leading-relaxed">{subtopic.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:pl-80 pt-20 lg:pt-10">
          <main className="max-w-3xl mx-auto xl:max-w-none xl:ml-0 xl:pr-16 pb-24 px-2 sm:px-0">
            {selectedContent ? (
              <>
                <header className="mb-10">
                  {selectedContent.category && (
                    <p className="mb-2 text-sm leading-6 font-semibold text-sky-400 uppercase tracking-wider">
                      {selectedContent.category}
                    </p>
                  )}
                  <h1 className="inline-block text-3xl sm:text-4xl font-extrabold text-slate-200 tracking-tight mb-4">
                    {selectedContent.title}
                  </h1>
                  
                  {/* Breadcrumb for subtopics */}
                  {selectedContent?.parent_title && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 bg-slate-800/20 py-2 px-4 rounded-lg border border-slate-800/50 w-fit">
                      <Link to={`/exam/${examSlug}/study`} className="hover:text-sky-400 transition-colors">
                        {examSlug.replace(/-/g, ' ').toUpperCase()}
                      </Link>
                      <FiChevronRight size={14} />
                      <span className="text-slate-400">{selectedContent.parent_title}</span>
                      <FiChevronRight size={14} />
                      <span className="text-sky-400 font-medium">{selectedContent.title}</span>
                    </div>
                  )}
                </header>

                {/* Content Area styled exactly like Tailwind prose */}
                <div className="prose prose-invert prose-slate max-w-none">
                  <style dangerouslySetInnerHTML={{ __html: `
                    .prose { color: #94a3b8; font-size: 1rem; line-height: 1.75; }
                    .prose h2 { color: #e2e8f0; font-weight: 700; font-size: 1.5em; margin-top: 2em; margin-bottom: 1em; letter-spacing: -0.025em; border-bottom: 1px solid #1e293b; padding-bottom: 0.5em; }
                    .prose h3 { color: #f8fafc; font-weight: 600; font-size: 1.25em; margin-top: 1.6em; margin-bottom: 0.6em; }
                    .prose a { color: #38bdf8; text-decoration: none; font-weight: 500; }
                    .prose a:hover { text-decoration: underline; }
                    .prose strong { color: #e2e8f0; font-weight: 600; }
                    .prose code { color: #e2e8f0; background-color: #1e293b; padding: 0.2em 0.4em; border-radius: 0.375rem; font-size: 0.875em; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
                    .prose pre { background-color: #0f172a; padding: 1.25em; border-radius: 0.5rem; overflow-x: auto; border: 1px solid #1e293b; }
                    .prose pre code { background-color: transparent; padding: 0; border-radius: 0; color: #e2e8f0; }
                    .prose blockquote { border-left-color: #38bdf8; color: #cbd5e1; font-style: italic; background: rgba(56, 189, 248, 0.05); padding: 1em; border-radius: 0 0.5rem 0.5rem 0; }
                  `}} />
                  
                  {selectedContent.featured_image && (
                    <img 
                      src={selectedContent.featured_image} 
                      alt={selectedContent.title}
                      className="rounded-xl border border-slate-800 mb-8 w-full max-h-[400px] object-cover"
                    />
                  )}
                  
                  <div dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
                </div>

                {/* Next/Prev Navigation */}
                <hr className="mt-12 mb-8 border-slate-800/50" />
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  {prevContent ? (
                    <button 
                      onClick={() => {
                        setSelectedContent(prevContent);
                        // Auto expand parent folder if we are moving back to a subtopic
                        if (prevContent.parent_id && !expandedTopics.includes(prevContent.parent_id)) {
                          setExpandedTopics(prev => [...prev, prevContent.parent_id]);
                        }
                      }}
                      className="group flex flex-col items-start w-full sm:w-1/2 hover:bg-slate-800/30 p-4 rounded-xl transition-colors border border-slate-800/30 hover:border-slate-700"
                    >
                      <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                        <FiChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Previous
                      </span>
                      <span className="text-slate-300 font-medium group-hover:text-sky-400 transition-colors">
                        {prevContent.title}
                      </span>
                    </button>
                  ) : <div className="w-full sm:w-1/2" />}

                  {nextContent && (
                    <button 
                      onClick={() => {
                        setSelectedContent(nextContent);
                        // Auto expand parent folder if we are moving forward to a subtopic
                        if (nextContent.parent_id && !expandedTopics.includes(nextContent.parent_id)) {
                          setExpandedTopics(prev => [...prev, nextContent.parent_id]);
                        }
                      }}
                      className="group flex flex-col items-end w-full sm:w-1/2 hover:bg-slate-800/30 p-4 rounded-xl transition-colors text-right border border-slate-800/30 hover:border-slate-700"
                    >
                      <span className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                        Next <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="text-slate-300 font-medium group-hover:text-sky-400 transition-colors">
                        {nextContent.title}
                      </span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-20 text-center">
                <p className="text-slate-400">Select a topic from the sidebar.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ExamContent;