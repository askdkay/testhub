import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { 
  FiBookOpen, FiChevronRight, FiChevronDown,
  FiEye, FiClock, FiDownload, FiShare2,
  FiMenu, FiX, FiArrowLeft, FiArrowRight
} from 'react-icons/fi';

function ExamContentPage() {
  const { examSlug } = useParams();
  const [contentData, setContentData] = useState([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState([]);

  useEffect(() => {
    fetchContent();
  }, [examSlug]);

  const fetchContent = async () => {
    try {
      const res = await API.get(`/exam-content/exam/${examSlug}/content`);
      setContentData(res.data);
      
      // Auto-expand first topic
      if (res.data.length > 0) {
        setExpandedTopics([res.data[0].id]);
        
        // Auto-select first subtopic if exists
        if (res.data[0].subtopics?.length > 0) {
          loadSubtopicContent(res.data[0].subtopics[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubtopicContent = async (subtopic) => {
    try {
      setSelectedSubtopic(subtopic);
      const res = await API.get(`/exam-content/content/${subtopic.slug}`);
      setSelectedContent(res.data);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Render content from JSON
  const renderContent = (content) => {
    if (!content) return null;
    
    const { content: contentJson } = content;
    
    const renderSection = (section, idx) => {
      switch (section.type) {
        case 'heading':
          const HeadingTag = `h${section.level || 2}`;
          return React.createElement(HeadingTag, {
            key: idx,
            className: `text-${section.level === 1 ? '3xl' : section.level === 2 ? '2xl' : 'xl'} font-bold mt-6 mb-3 text-gray-900`
          }, section.text);
          
        case 'paragraph':
          return <p key={idx} className="text-gray-700 leading-relaxed mb-4">{section.text}</p>;
          
        case 'list':
          const ListTag = section.style === 'numbered' ? 'ol' : 'ul';
          return React.createElement(ListTag, {
            key: idx,
            className: `space-y-2 mb-4 ${section.style === 'numbered' ? 'list-decimal' : 'list-disc'} pl-5`
          },
            section.items.map((item, i) => <li key={i} className="text-gray-700">{item}</li>)
          );
          
        case 'table':
          return (
            <div key={idx} className="overflow-x-auto mb-6">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100">
                  <tr>
                    {section.headers.map((header, i) => (
                      <th key={i} className="px-4 py-2 text-left font-semibold text-gray-900 border-b">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      {row.map((cell, j) => (
                        <td key={j} className="px-4 py-2 text-gray-700">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          
        case 'important-box':
          return (
            <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
              <p className="text-yellow-800">{section.text}</p>
            </div>
          );
          
        default:
          return null;
      }
    };
    
    return (
      <div className="prose prose-lg max-w-none">
        {contentJson?.sections?.map(renderSection)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="relative pt-20 min-h-screen">
        <div className="flex">
          {/* Sidebar Toggle Button (Mobile) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed left-4 top-24 z-40 lg:hidden p-2 bg-white rounded-lg shadow-lg"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: sidebarOpen ? 0 : -300 }}
            transition={{ duration: 0.3 }}
            className={`fixed left-0 top-20 bottom-0 w-80 bg-white border-r border-gray-200 overflow-y-auto z-30 lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiBookOpen className="text-orange-500" />
                Study Material
              </h2>
              
              <div className="space-y-2">
                {contentData.map((topic) => (
                  <div key={topic.id} className="border-b border-gray-100 pb-2">
                    <button
                      onClick={() => toggleTopic(topic.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-800">{topic.name}</span>
                      {expandedTopics.includes(topic.id) ? (
                        <FiChevronDown className="text-gray-500" />
                      ) : (
                        <FiChevronRight className="text-gray-500" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedTopics.includes(topic.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-4 mt-1 space-y-1 overflow-hidden"
                        >
                          {topic.subtopics?.map((subtopic) => (
                            <button
                              key={subtopic.id}
                              onClick={() => loadSubtopicContent(subtopic)}
                              className={`w-full text-left p-2 pl-4 rounded-lg text-sm transition-all ${
                                selectedSubtopic?.id === subtopic.id
                                  ? 'bg-orange-50 text-orange-600 border-l-2 border-orange-500'
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>📄</span>
                                <span className="flex-1">{subtopic.title}</span>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
            <div className="max-w-4xl mx-auto px-4 py-8">
              {selectedContent ? (
                <>
                  {/* Breadcrumb */}
                  <div className="mb-6 text-sm text-gray-500">
                    <Link to={`/exam/${examSlug}`} className="hover:text-orange-500">
                      {examSlug?.replace(/-/g, ' ')}
                    </Link>
                    <FiChevronRight className="inline mx-2" size={14} />
                    <span className="text-gray-700">{selectedContent.topic_name}</span>
                    <FiChevronRight className="inline mx-2" size={14} />
                    <span className="text-orange-600">{selectedContent.title}</span>
                  </div>
                  
                  {/* Title Section */}
                  <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                      {selectedContent.title}
                    </h1>
                    {selectedContent.subtitle && (
                      <p className="text-lg text-gray-600">{selectedContent.subtitle}</p>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiEye size={14} />
                        {selectedContent.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock size={14} />
                        Updated: {new Date(selectedContent.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                    {renderContent(selectedContent)}
                  </div>
                  
                  {/* Navigation */}
                  <div className="mt-8 flex justify-between">
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                      <FiArrowLeft />
                      Previous
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                      Next
                      <FiArrowRight />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <FiBookOpen className="text-5xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Content Selected</h3>
                  <p className="text-gray-500">Select a topic from the sidebar to start learning</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamContentPage;