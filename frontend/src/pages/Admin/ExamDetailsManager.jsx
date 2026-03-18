import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import { 
  FiSave, FiX, FiEdit2, FiTrash2, FiPlus,
  FiFileText, FiVideo, FiLink, FiDownload,
  FiEye, FiCalendar, FiHelpCircle, FiBookOpen,
  FiAward, FiClock, FiUsers, FiCheckCircle
} from 'react-icons/fi';

function ExamDetailsManager() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [sections, setSections] = useState({});
  const [testSeries, setTestSeries] = useState([]);
  const [studyMaterial, setStudyMaterial] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSection, setEditingSection] = useState(null);
  const [availableTests, setAvailableTests] = useState([]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiFileText },
    { id: 'syllabus', label: 'Syllabus', icon: FiBookOpen },
    { id: 'pattern', label: 'Exam Pattern', icon: FiAward },
    { id: 'eligibility', label: 'Eligibility', icon: FiUsers },
    { id: 'dates', label: 'Important Dates', icon: FiCalendar },
    { id: 'test-series', label: 'Test Series', icon: FiCheckCircle },
    { id: 'study-material', label: 'Study Material', icon: FiDownload },
    { id: 'faq', label: 'FAQ', icon: FiHelpCircle }
  ];

  useEffect(() => {
    fetchExamDetails();
    fetchAvailableTests();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/exam-details/exam/${examId}`);
      setExam(res.data.exam);
      setSections(res.data.sections);
      setTestSeries(res.data.testSeries || []);
      setStudyMaterial(res.data.studyMaterial || []);
      setFaqs(res.data.faqs || []);
      setImportantDates(res.data.importantDates || []);
    } catch (error) {
      console.error('Error fetching exam details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const res = await API.get('/tests');
      setAvailableTests(res.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleSectionSave = async () => {
    try {
      await API.post('/exam-details/admin/exam-details', {
        exam_id: examId,
        section_type: editingSection.type,
        title: editingSection.title,
        content: editingSection.content
      });
      setEditingSection(null);
      fetchExamDetails();
    } catch (error) {
      console.error('Error saving section:', error);
    }
  };

  const handleLinkTest = async (testId, isFeatured) => {
    try {
      await API.post('/exam-details/admin/link-test', {
        exam_id: examId,
        test_id: testId,
        is_featured: isFeatured
      });
      fetchExamDetails();
    } catch (error) {
      console.error('Error linking test:', error);
    }
  };

  const handleUnlinkTest = async (testId) => {
    try {
      await API.delete(`/exam-details/admin/unlink-test/${examId}/${testId}`);
      fetchExamDetails();
    } catch (error) {
      console.error('Error unlinking test:', error);
    }
  };

  const handleAddStudyMaterial = async (material) => {
    try {
      await API.post('/exam-details/admin/study-material', {
        exam_id: examId,
        ...material
      });
      fetchExamDetails();
    } catch (error) {
      console.error('Error adding study material:', error);
    }
  };

  const handleDeleteStudyMaterial = async (id) => {
    try {
      await API.delete(`/exam-details/admin/study-material/${id}`);
      fetchExamDetails();
    } catch (error) {
      console.error('Error deleting study material:', error);
    }
  };

  const handleAddFaq = async (faq) => {
    try {
      await API.post('/exam-details/admin/faq', {
        exam_id: examId,
        ...faq
      });
      fetchExamDetails();
    } catch (error) {
      console.error('Error adding FAQ:', error);
    }
  };

  const handleDeleteFaq = async (id) => {
    try {
      await API.delete(`/exam-details/admin/faq/${id}`);
      fetchExamDetails();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const handleAddImportantDate = async (date) => {
    try {
      await API.post('/exam-details/admin/important-date', {
        exam_id: examId,
        ...date
      });
      fetchExamDetails();
    } catch (error) {
      console.error('Error adding important date:', error);
    }
  };

  const handleDeleteImportantDate = async (id) => {
    try {
      await API.delete(`/exam-details/admin/important-date/${id}`);
      fetchExamDetails();
    } catch (error) {
      console.error('Error deleting important date:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage: <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {exam?.name}
            </span>
          </h1>
          <p className="text-gray-400">
            Category: {exam?.category_name} | Total Views: {exam?.views || 0}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Exam Overview</h2>
                <button
                  onClick={() => setEditingSection({
                    type: 'overview',
                    title: sections.overview?.title || 'Overview',
                    content: sections.overview?.content || ''
                  })}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 size={16} />
                  Edit
                </button>
              </div>
              <div className="prose prose-invert max-w-none">
                {sections.overview ? (
                  <div dangerouslySetInnerHTML={{ __html: sections.overview.content }} />
                ) : (
                  <p className="text-gray-500 italic">No overview added yet. Click edit to add.</p>
                )}
              </div>
            </div>
          )}

          {/* Syllabus Tab */}
          {activeTab === 'syllabus' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Syllabus</h2>
                <button
                  onClick={() => setEditingSection({
                    type: 'syllabus',
                    title: sections.syllabus?.title || 'Syllabus',
                    content: sections.syllabus?.content || ''
                  })}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 size={16} />
                  Edit
                </button>
              </div>
              <div className="prose prose-invert max-w-none">
                {sections.syllabus ? (
                  <div dangerouslySetInnerHTML={{ __html: sections.syllabus.content }} />
                ) : (
                  <p className="text-gray-500 italic">No syllabus added yet. Click edit to add.</p>
                )}
              </div>
            </div>
          )}

          {/* Exam Pattern Tab */}
          {activeTab === 'pattern' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Exam Pattern</h2>
                <button
                  onClick={() => setEditingSection({
                    type: 'pattern',
                    title: sections.pattern?.title || 'Exam Pattern',
                    content: sections.pattern?.content || ''
                  })}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 size={16} />
                  Edit
                </button>
              </div>
              <div className="prose prose-invert max-w-none">
                {sections.pattern ? (
                  <div dangerouslySetInnerHTML={{ __html: sections.pattern.content }} />
                ) : (
                  <p className="text-gray-500 italic">No exam pattern added yet. Click edit to add.</p>
                )}
              </div>
            </div>
          )}

          {/* Eligibility Tab */}
          {activeTab === 'eligibility' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Eligibility Criteria</h2>
                <button
                  onClick={() => setEditingSection({
                    type: 'eligibility',
                    title: sections.eligibility?.title || 'Eligibility Criteria',
                    content: sections.eligibility?.content || ''
                  })}
                  className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 size={16} />
                  Edit
                </button>
              </div>
              <div className="prose prose-invert max-w-none">
                {sections.eligibility ? (
                  <div dangerouslySetInnerHTML={{ __html: sections.eligibility.content }} />
                ) : (
                  <p className="text-gray-500 italic">No eligibility criteria added yet. Click edit to add.</p>
                )}
              </div>
            </div>
          )}

          {/* Important Dates Tab */}
          {activeTab === 'dates' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Important Dates</h2>
                <button
                  onClick={() => {
                    const date = prompt('Enter date in format: YYYY-MM-DD');
                    if (date) {
                      handleAddImportantDate({
                        event_name: prompt('Event Name:'),
                        event_date: date,
                        description: prompt('Description (optional):'),
                        is_tentative: confirm('Is this date tentative?')
                      });
                    }
                  }}
                  className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <FiPlus size={16} />
                  Add Date
                </button>
              </div>
              <div className="space-y-3">
                {importantDates.map(date => (
                  <div key={date.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div>
                      <h3 className="font-medium text-white">{date.event_name}</h3>
                      <p className="text-sm text-gray-400">
                        Date: {new Date(date.event_date).toLocaleDateString()}
                        {date.is_tentative && ' (Tentative)'}
                      </p>
                      {date.description && (
                        <p className="text-sm text-gray-500 mt-1">{date.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteImportantDate(date.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
                {importantDates.length === 0 && (
                  <p className="text-gray-500 italic">No important dates added yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Test Series Tab */}
          {activeTab === 'test-series' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Test Series</h2>
                <div className="relative">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleLinkTest(e.target.value, false);
                        e.target.value = '';
                      }
                    }}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Link a Test Series</option>
                    {availableTests
                      .filter(t => !testSeries.some(ts => ts.id === t.id))
                      .map(test => (
                        <option key={test.id} value={test.id}>{test.title}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {testSeries.map(test => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl">
                    <div>
                      <h3 className="font-medium text-white">{test.title}</h3>
                      <p className="text-sm text-gray-400">
                        Questions: {test.total_questions} | Marks: {test.total_marks} | Duration: {test.duration} min
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUnlinkTest(test.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {testSeries.length === 0 && (
                  <p className="text-gray-500 italic">No test series linked yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Study Material Tab */}
          {activeTab === 'study-material' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Study Material</h2>
                <button
                  onClick={() => {
                    const material = {
                      title: prompt('Title:'),
                      description: prompt('Description:'),
                      file_type: prompt('Type (pdf/video/note/link):', 'pdf'),
                      file_url: prompt('File URL:'),
                      is_free: confirm('Is this free?')
                    };
                    if (material.title && material.file_url) {
                      handleAddStudyMaterial(material);
                    }
                  }}
                  className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <FiPlus size={16} />
                  Add Material
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studyMaterial.map(material => (
                  <div key={material.id} className="p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {material.file_type === 'pdf' && <FiFileText className="text-red-400 text-xl" />}
                        {material.file_type === 'video' && <FiVideo className="text-blue-400 text-xl" />}
                        {material.file_type === 'link' && <FiLink className="text-green-400 text-xl" />}
                        <div>
                          <h3 className="font-medium text-white">{material.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{material.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            {material.size && <span>Size: {material.size}</span>}
                            {material.duration && <span>Duration: {material.duration} min</span>}
                            {material.is_free ? (
                              <span className="text-green-500">Free</span>
                            ) : (
                              <span className="text-yellow-500">Paid</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteStudyMaterial(material.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {studyMaterial.length === 0 && (
                  <p className="text-gray-500 italic col-span-2">No study material added yet.</p>
                )}
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === 'faq' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
                <button
                  onClick={() => {
                    const faq = {
                      question: prompt('Question:'),
                      answer: prompt('Answer:')
                    };
                    if (faq.question && faq.answer) {
                      handleAddFaq(faq);
                    }
                  }}
                  className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2"
                >
                  <FiPlus size={16} />
                  Add FAQ
                </button>
              </div>
              <div className="space-y-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="p-4 bg-gray-800/30 rounded-xl">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-white">{faq.question}</h3>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <p className="text-gray-400 mt-2">{faq.answer}</p>
                  </div>
                ))}
                {faqs.length === 0 && (
                  <p className="text-gray-500 italic">No FAQs added yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Section Modal */}
      <AnimatePresence>
        {editingSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingSection(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Edit {editingSection.type}</h2>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Title</label>
                    <input
                      type="text"
                      value={editingSection.title}
                      onChange={(e) => setEditingSection({...editingSection, title: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Content</label>
                    <ReactQuill
                      theme="snow"
                      value={editingSection.content}
                      onChange={(content) => setEditingSection({...editingSection, content})}
                      modules={{
                        toolbar: [
                          [{ 'header': [1, 2, 3, false] }],
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link', 'image'],
                          ['clean']
                        ]
                      }}
                      className="bg-gray-800 text-white rounded-lg [&_.ql-toolbar]:bg-gray-700 [&_.ql-container]:bg-gray-800"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => setEditingSection(null)}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSectionSave}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
                    >
                      <FiSave />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExamDetailsManager;