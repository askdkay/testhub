import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import { 
  FiPlus, FiEdit2, FiTrash2, FiEye, FiUpload,
  FiSearch, FiFilter, FiX, FiCheck, FiAlertCircle,
  FiFileText, FiFolder, FiBookOpen, FiClock,
  FiEyeOff, FiCheckCircle, FiDownload, FiSave
} from 'react-icons/fi';

function ExamContentManagement() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicForm, setTopicForm] = useState({ name: '', display_order: 0 });
  const [uploadForm, setUploadForm] = useState({
    exam_id: '',
    topic_id: '',
    status: 'draft',
    jsonFile: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await API.get('/exams/exams-list');
      setExams(res.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (examId) => {
    try {
      const res = await API.get(`/admin-exam-content/admin/topics/${examId}`);
      setTopics(res.data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const fetchSubtopics = async (examId) => {
    try {
      const res = await API.get(`/admin-exam-content/admin/subtopics/${examId}`);
      setSubtopics(res.data);
    } catch (error) {
      console.error('Error fetching subtopics:', error);
    }
  };

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
    fetchTopics(exam.id);
    fetchSubtopics(exam.id);
  };

  const handleCreateTopic = async () => {
    if (!topicForm.name) return;
    
    try {
      await API.post('/admin-exam-content/admin/topics', {
        exam_id: selectedExam.id,
        name: topicForm.name,
        display_order: topicForm.display_order
      });
      
      setShowTopicModal(false);
      setTopicForm({ name: '', display_order: 0 });
      fetchTopics(selectedExam.id);
      
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const handleUpdateTopic = async () => {
    try {
      await API.put(`/admin-exam-content/admin/topics/${editingTopic.id}`, {
        name: editingTopic.name,
        display_order: editingTopic.display_order
      });
      
      setEditingTopic(null);
      fetchTopics(selectedExam.id);
      
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Delete this topic? All subtopics will also be deleted.')) return;
    
    try {
      await API.delete(`/admin-exam-content/admin/topics/${topicId}`);
      fetchTopics(selectedExam.id);
      fetchSubtopics(selectedExam.id);
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const handleStatusChange = async (subtopicId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    console.log('Updating status:', { subtopicId, newStatus });
    
    try {
        const response = await API.put(`/admin-exam-content/admin/subtopics/${subtopicId}/status`, {
            status: newStatus
        });
        
        console.log('Status update response:', response.data);
        fetchSubtopics(selectedExam.id);
        
    } catch (error) {
        console.error('Error updating status:', error);
        console.error('Error details:', error.response?.data);
        alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    }
};

  const handleDeleteSubtopic = async (subtopicId) => {
    if (!window.confirm('Delete this content? JSON file will also be deleted.')) return;
    
    try {
      await API.delete(`/admin-exam-content/admin/subtopics/${subtopicId}`);
      fetchSubtopics(selectedExam.id);
    } catch (error) {
      console.error('Error deleting subtopic:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadForm.jsonFile || !uploadForm.topic_id) return;
    
    const formData = new FormData();
    formData.append('jsonFile', uploadForm.jsonFile);
    formData.append('exam_id', selectedExam.id);
    formData.append('topic_id', uploadForm.topic_id);
    formData.append('status', uploadForm.status);
    
    try {
      const res = await API.post('/admin-exam-content/admin/subtopics/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setShowUploadModal(false);
      setUploadForm({ exam_id: '', topic_id: '', status: 'draft', jsonFile: null });
      setUploadProgress(0);
      fetchSubtopics(selectedExam.id);
      
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredSubtopics = subtopics.filter(st =>
    st.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    st.topic_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Exam Content Management
          </h1>
          <p className="text-gray-400">
            Manage study materials, upload JSON files, organize topics and subtopics
          </p>
        </div>

        {/* Exam Selector */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
          <label className="block text-sm text-gray-400 mb-2">Select Exam</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {exams.map(exam => (
              <button
                key={exam.id}
                onClick={() => handleExamSelect(exam)}
                className={`p-3 rounded-xl text-left transition-all ${
                  selectedExam?.id === exam.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <p className="font-medium">{exam.name}</p>
                <p className="text-xs opacity-80">{exam.short_name || exam.category_name}</p>
              </button>
            ))}
          </div>
        </div>

        {selectedExam && (
          <>
            {/* Topics Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FiFolder className="text-orange-400" />
                  Topics ({topics.length})
                </h2>
                <button
                  onClick={() => setShowTopicModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg flex items-center gap-2 text-sm"
                >
                  <FiPlus />
                  Add Topic
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {topics.map(topic => (
                  <div
                    key={topic.id}
                    className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-white">{topic.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {topic.subtopic_count || 0} contents
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingTopic(topic);
                          }}
                          className="p-1 hover:bg-blue-500/20 rounded text-blue-400"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Order: {topic.display_order}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtopics Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FiFileText className="text-orange-400" />
                  Content ({subtopics.length})
                </h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg flex items-center gap-2 text-sm"
                  >
                    <FiUpload />
                    Upload JSON
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Topic</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Views</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubtopics.map(st => (
                      <tr key={st.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                        <td className="py-3 px-4">
                          <p className="font-medium text-white">{st.title}</p>
                          <p className="text-xs text-gray-500 mt-1">/{st.slug}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{st.topic_name}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleStatusChange(st.id, st.status === 'published' ? 'draft' : 'published')}
                            className={`px-2 py-1 rounded-full text-xs ${
                              st.status === 'published'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {st.status === 'published' ? (
                              <><FiCheckCircle className="inline mr-1" size={12} /> Published</>
                            ) : (
                              <><FiEyeOff className="inline mr-1" size={12} /> Draft</>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{st.views || 0}</td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {new Date(st.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <a
                              href={`/exam/${selectedExam.slug}/content/${st.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-blue-500/20 rounded text-blue-400"
                            >
                              <FiEye size={16} />
                            </a>
                            <button
                              onClick={() => handleDeleteSubtopic(st.id)}
                              className="p-1 hover:bg-red-500/20 rounded text-red-400"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Topic Modal */}
      <AnimatePresence>
        {(showTopicModal || editingTopic) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {editingTopic ? 'Edit Topic' : 'Create New Topic'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Topic Name</label>
                  <input
                    type="text"
                    value={editingTopic?.name || topicForm.name}
                    onChange={(e) => editingTopic 
                      ? setEditingTopic({...editingTopic, name: e.target.value})
                      : setTopicForm({...topicForm, name: e.target.value})
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                    placeholder="e.g., Rajasthan History"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={editingTopic?.display_order || topicForm.display_order}
                    onChange={(e) => editingTopic
                      ? setEditingTopic({...editingTopic, display_order: parseInt(e.target.value)})
                      : setTopicForm({...topicForm, display_order: parseInt(e.target.value)})
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTopicModal(false);
                    setEditingTopic(null);
                  }}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTopic ? handleUpdateTopic : handleCreateTopic}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {editingTopic ? 'Save Changes' : 'Create Topic'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Upload JSON Content</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Select Topic</label>
                  <select
                    value={uploadForm.topic_id}
                    onChange={(e) => setUploadForm({...uploadForm, topic_id: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="">Select topic</option>
                    {topics.map(topic => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">JSON File</label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setUploadForm({...uploadForm, jsonFile: e.target.files[0]})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JSON must have "title" field. Subtopic title will be taken from JSON.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <select
                    value={uploadForm.status}
                    onChange={(e) => setUploadForm({...uploadForm, status: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                
                {uploadProgress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({ exam_id: '', topic_id: '', status: 'draft', jsonFile: null });
                    setUploadProgress(0);
                  }}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadForm.jsonFile || !uploadForm.topic_id}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                  Upload
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExamContentManagement;