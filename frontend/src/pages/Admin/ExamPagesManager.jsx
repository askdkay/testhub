import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { 
  FiFileText, FiEdit2, FiTrash2, FiEye,
  FiSearch, FiPlus, FiCalendar, FiCheckCircle,
  FiXCircle, FiAlertCircle, FiRefreshCw,
  FiExternalLink, FiCopy, FiX
} from 'react-icons/fi';
import { FaRegFileAlt } from 'react-icons/fa';

function ExamPagesManager() {
  const navigate = useNavigate();
  const [allExams, setAllExams] = useState([]);
  const [pages, setPages] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // NEW: deleteConfig object to track whether we are deleting a 'page' or an 'exam'
  const [deleteConfig, setDeleteConfig] = useState(null); 
  
  const [selectedExam, setSelectedExam] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const examsRes = await API.get('/exams/admin/exams-list');
      setAllExams(examsRes.data);
      
      const pagesRes = await API.get('/examDetails/admin/pages').catch(() => ({ data: [] }));
      setPages(pagesRes.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Handle both Exam and Page deletion
  const handleDelete = async () => {
    if (!deleteConfig) return;

    try {
      if (deleteConfig.type === 'page') {
        // Delete Page Data
        await API.delete(`/examDetails/admin/pages/${deleteConfig.id}`);
      } else if (deleteConfig.type === 'exam') {
        // Delete Main Exam Data permanently
        await API.delete(`/exams/admin/exams/${deleteConfig.id}`);
      }
      
      setShowDeleteModal(false);
      setDeleteConfig(null);
      fetchAllData();
    } catch (error) {
      console.error(`Error deleting ${deleteConfig.type}:`, error);
      alert(`Failed to delete ${deleteConfig.type}.`);
    }
  };

  const handlePublishToggle = async (page) => {
    try {
      await API.put(`/examDetails/admin/pages/${page.id}/publish`, {
        is_published: !page.is_published
      });
      fetchAllData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const fetchPreviewData = async (examId) => {
    try {
      const res = await API.get(`/examDetails/admin/pages/${examId}`);
      setPreviewData(res.data);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error fetching preview:', error);
    }
  };

  const combinedData = allExams.map(exam => {
    const page = pages.find(p => p.exam_id === exam.id);
    return {
      ...exam,
      page_id: page?.id,
      page_status: page?.is_published ? 'published' : (page ? 'draft' : 'not_created'),
      page_views: page?.views || 0,
      page_updated: page?.updated_at
    };
  });

  const filteredExams = combinedData.filter(exam =>
    exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs"><FiCheckCircle size={12} /> Published</span>;
      case 'draft':
        return <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs"><FiFileText size={12} /> Draft</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs"><FiXCircle size={12} /> Not Created</span>;
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Exam <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Pages Manager</span>
            </h1>
            <p className="text-gray-400">
              Total Exams: {allExams.length} | With Pages: {pages.length} | Without Pages: {allExams.length - pages.length}
            </p>
          </div>

          <button
            onClick={fetchAllData}
            className="p-2 bg-gray-900 border border-gray-800 rounded-xl hover:border-blue-500/50 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw size={20} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{allExams.length}</div>
            <div className="text-sm text-gray-400">Total Exams</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {pages.filter(p => p.is_published).length}
            </div>
            <div className="text-sm text-gray-400">Published Pages</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {pages.filter(p => !p.is_published).length}
            </div>
            <div className="text-sm text-gray-400">Draft Pages</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">
              {allExams.length - pages.length}
            </div>
            <div className="text-sm text-gray-400">Need Pages</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search by exam name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        {/* Exams Table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Exam</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Category</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Page URL</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Views</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Last Updated</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-white">{exam.name}</p>
                      {exam.short_name && (
                        <p className="text-xs text-gray-500">{exam.short_name}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-300">{exam.category_name}</td>
                  <td className="py-4 px-6">{getStatusBadge(exam.page_status)}</td>
                  <td className="py-4 px-6">
                    {exam.page_status !== 'not_created' ? (
                      <a
                        href={`/exam/${exam.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                      >
                        /exam/{exam.slug}
                        <FiExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-gray-600 text-sm">Not available</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-300">{exam.page_views || 0}</td>
                  <td className="py-4 px-6 text-gray-400 text-sm">
                    {exam.page_updated ? new Date(exam.page_updated).toLocaleDateString() : '-'}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 items-center">
                      {exam.page_status !== 'not_created' ? (
                        <>
                          <button
                            onClick={() => fetchPreviewData(exam.id)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                            title="Preview"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/edit-exam-page/${exam.id}`)}
                            className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfig({ type: 'page', id: exam.page_id });
                              setShowDeleteModal(true);
                            }}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                            title="Delete Page Only"
                          >
                            <FiTrash2 size={16} />
                          </button>
                          <button
                            onClick={() => handlePublishToggle({ id: exam.page_id, is_published: exam.page_status === 'published' })}
                            className={`p-2 rounded-lg transition-colors ${
                              exam.page_status === 'published'
                                ? 'hover:bg-yellow-500/20 text-yellow-400'
                                : 'hover:bg-green-500/20 text-green-400'
                            }`}
                            title={exam.page_status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {exam.page_status === 'published' ? <FiXCircle size={16} /> : <FiCheckCircle size={16} />}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/admin/create-exam-page/${exam.id}`)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                          >
                            Create Page
                          </button>
                          {/* NEW: Button to delete the Main Exam if page doesn't exist */}
                          <button
                            onClick={() => {
                              setDeleteConfig({ type: 'exam', id: exam.id });
                              setShowDeleteModal(true);
                            }}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors ml-2"
                            title="Delete Exam Completely"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && previewData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">{previewData.exam_title}</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="p-6">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPDATED: Dynamic Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && deleteConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="text-red-500 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Delete {deleteConfig.type === 'exam' ? 'Exam Completely' : 'Exam Page'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {deleteConfig.type === 'exam' 
                    ? "Are you sure you want to delete this EXAM entirely? This will remove the exam from the database permanently." 
                    : "Are you sure you want to delete this exam page? This action cannot be undone."}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfig(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExamPagesManager;