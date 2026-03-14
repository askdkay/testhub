
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api';
import ContentEditor from './ContentEditor';
import ContentPreview from './ContentPreview';
import {
  FiFileText, FiPlus, FiEdit2, FiTrash2, FiEye,
  FiSearch, FiFilter, FiUpload, FiDownload,
  FiCalendar, FiUser, FiTag, FiEyeOff,
  FiCheckCircle, FiXCircle, FiClock, FiStar
} from 'react-icons/fi';
import { FaRegFileCode, FaRegSave, FaRegEye } from 'react-icons/fa';

// Background Image
const BG_IMAGE = "";
function ContentManagement() {
  const navigate = useNavigate();
  const [contents, setContents] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonPreview, setJsonPreview] = useState(null);
  const [multipleFiles, setMultipleFiles] = useState([]);
  const [multiplePreviews, setMultiplePreviews] = useState([]);
// const [fileProgress, setFileProgress] = useState({});


  useEffect(() => {
    fetchContents();
    fetchExams();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/content/admin/all');
      setContents(res.data);
    } catch (error) {
      console.error('Error fetching contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await API.get('/content/admin/exams');
      setExams(res.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        await API.delete(`/content/admin/content/${id}`);
        setContents(contents.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const content = contents.find(c => c.id === id);
      await API.put(`/content/admin/content/${id}`, {
        ...content,
        status: newStatus
      });
      setContents(contents.map(c =>
        c.id === id ? { ...c, status: newStatus } : c
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setJsonFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        setJsonPreview(json);
      } catch (error) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!jsonFile) return;

    const formData = new FormData();
    formData.append('file', jsonFile);

    try {
      setImportProgress(30);
      const res = await API.post('/content/admin/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setImportProgress(100);
      setTimeout(() => {
        setShowImportModal(false);
        setJsonFile(null);
        setJsonPreview(null);
        setImportProgress(0);
        fetchContents();
      }, 1000);

    } catch (error) {
      console.error('Error importing content:', error);
      alert('Import failed: ' + error.message);
      setImportProgress(0);
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === 'all' || content.exam_id === parseInt(selectedExam);
    const matchesStatus = selectedStatus === 'all' || content.status === selectedStatus;
    return matchesSearch && matchesExam && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs flex items-center gap-1"><FiCheckCircle size={12} /> Published</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1"><FiEyeOff size={12} /> Draft</span>;
      case 'archived':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs flex items-center gap-1"><FiClock size={12} /> Archived</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">{status}</span>;
    }
  };
  // Multiple files upload handler
  const handleMultipleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setMultipleFiles(files);

    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const json = JSON.parse(evt.target.result);
          previews.push({
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            data: json
          });
          if (previews.length === files.length) {
            setMultiplePreviews(previews);
          }
        } catch (error) {
          console.error('Invalid JSON:', file.name);
        }
      };
      reader.readAsText(file);
    });
  };

  // Multiple files import handler
 // Better progress tracking
const [fileProgress, setFileProgress] = useState({});

const handleMultipleImport = async () => {
    if (multipleFiles.length === 0) return;

    const formData = new FormData();
    multipleFiles.forEach(file => {
        formData.append('files', file);
        setFileProgress(prev => ({ ...prev, [file.name]: 'pending' }));
    });

    try {
        const res = await API.post('/content/admin/import-multiple', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setImportProgress(percent);
            }
        });

        // Update individual file status
        const newProgress = {};
        res.data.results.forEach(r => {
            newProgress[r.file] = 'success';
        });
        res.data.errors.forEach(e => {
            newProgress[e.file] = 'error';
        });
        setFileProgress(newProgress);

        // Show detailed results
        setTimeout(() => {
            alert(
                `✅ Success: ${res.data.results.length}\n` +
                `❌ Failed: ${res.data.errors.length}\n\n` +
                res.data.errors.map(e => `${e.file}: ${e.error}`).join('\n')
            );
        }, 1000);

    } catch (error) {
        console.error('Error:', error);
    }
};

  // Clear selection
  const clearSelection = () => {
    setMultipleFiles([]);
    setMultiplePreviews([]);
  };
  return (
    <div className="min-h-screen bg-deep-black text-white font-['Inter'] relative overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-deep-black/95 via-deep-black/90 to-deep-black/95 backdrop-blur-sm" />

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-10" />

      {/* Main Content */}
      <div className="relative ml-0 lg:ml-64 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                  Content Management
                </span>
              </h1>
              <p className="text-gray-400">Create and manage exam study content</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all"
              >
                <FiUpload />
                Import JSON
              </button>
              <button
                onClick={() => {
                  setEditingContent(null);
                  setShowEditor(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                <FiPlus />
                New Content
              </button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-glass-bg border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="bg-glass-bg border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50"
            >
              <option value="all">All Exams</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-glass-bg border border-glass-border rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-glass-bg border border-glass-border rounded-xl hover:border-orange-500/50 transition-all">
              <FiFilter />
              More Filters
            </button>
          </motion.div>

          {/* Content Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4">
              <div className="text-2xl font-bold">{contents.length}</div>
              <div className="text-sm text-gray-400">Total Contents</div>
            </div>
            <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">
                {contents.filter(c => c.status === 'published').length}
              </div>
              <div className="text-sm text-gray-400">Published</div>
            </div>
            <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-400">
                {contents.filter(c => c.status === 'draft').length}
              </div>
              <div className="text-sm text-gray-400">Drafts</div>
            </div>
            <div className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-xl p-4">
              <div className="text-2xl font-bold">
                {contents.reduce((sum, c) => sum + (c.views || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Views</div>
            </div>
          </motion.div>

          {/* Content List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/30">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Title</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Exam</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Views</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Author</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Created</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContents.map((content) => (
                    <tr key={content.id} className="border-t border-glass-border hover:bg-white/5 transition-all">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium">{content.title}</p>
                          <p className="text-xs text-gray-400">{content.category || 'Uncategorized'}</p>
                        </div>
                      </td>
                      {/* In the table, after Title column */}
<td className="py-4 px-6">
  <div>
    <p className="font-medium flex items-center gap-2">
      {content.level === 2 && (
        <span className="text-gray-400">└─</span>
      )}
      {content.title}
    </p>
    {content.parent_title && (
      <p className="text-xs text-gray-400">
        Parent: {content.parent_title}
      </p>
    )}
  </div>
</td>
                      <td className="py-4 px-6">
                        <span className="text-sm">{content.exam_name || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(content.status)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm">{content.views || 0}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm">{content.author_name || 'Admin'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm">
                          {new Date(content.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPreviewContent(content);
                              setShowPreview(true);
                            }}
                            className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all"
                            title="Preview"
                          >
                            <FiEye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingContent(content);
                              setShowEditor(true);
                            }}
                            className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-all"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(content.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                          {content.status === 'draft' && (
                            <button
                              onClick={() => handleStatusChange(content.id, 'published')}
                              className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-all"
                              title="Publish"
                            >
                              <FiCheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-deep-black border border-glass-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Import JSON Content</h2>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="p-2 hover:bg-white/5 rounded-lg"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* File Upload */}
                  {/* <div className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center hover:border-orange-500/50 transition-all">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="jsonFile"
                    />
                    <label htmlFor="jsonFile" className="cursor-pointer">
                      <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                      <p className="text-gray-400">Click to upload JSON file</p>
                      <p className="text-xs text-gray-500 mt-1">.json files only</p>
                    </label>
                  </div> */}
                  {/* Multiple files upload - NEW */}
                  <div className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleMultipleFileUpload}
                      className="hidden"
                      id="jsonFiles"
                      multiple  // ← YEH LINE ADD KARO
                    />
                    <label htmlFor="jsonFiles" className="cursor-pointer">
                      <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                      <p className="text-gray-400">Click to select multiple JSON files</p>
                      <p className="text-xs text-gray-500 mt-1">You can select multiple files (Ctrl+Click)</p>
                    </label>
                  </div>
                  {/* JSON Preview */}
{/* Multiple Files Preview */}
{multiplePreviews.length > 0 && (
  <div className="mt-4">
    <h3 className="font-semibold mb-2">Selected Files ({multiplePreviews.length})</h3>
    <div className="max-h-60 overflow-y-auto space-y-2">
      {multiplePreviews.map((preview, index) => (
        <div key={index} className="p-3 bg-black/30 rounded-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-sm">{preview.name}</p>
              <p className="text-xs text-gray-400">{preview.size}</p>
            </div>
            <span className="text-xs text-green-400">
              {preview.data.title || 'Untitled'}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
                  {/* Progress Bar */}
                  {importProgress > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Importing...</span>
                        <span>{importProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${importProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
<div className="flex justify-end gap-3 mt-6">
  <button
    onClick={() => {
      setShowImportModal(false);
      clearSelection();
    }}
    className="px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-red-500/50 transition-all"
  >
    Cancel
  </button>
  
  {multipleFiles.length > 0 && (
    <button
      onClick={clearSelection}
      className="px-4 py-2 bg-glass-bg border border-glass-border rounded-xl hover:border-yellow-500/50 transition-all"
    >
      Clear All
    </button>
  )}
  
  <button
    onClick={handleMultipleImport}
    disabled={multipleFiles.length === 0 || importProgress > 0}
    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50"
  >
    Import {multipleFiles.length} File{multipleFiles.length !== 1 ? 's' : ''}
  </button>
</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <ContentEditor
          contents={contents}
            content={editingContent}
            exams={exams}
            onClose={() => {
              setShowEditor(false);
              setEditingContent(null);
            }}
            onSave={() => {
              setShowEditor(false);
              setEditingContent(null);
              fetchContents();
            }}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && previewContent && (
          <ContentPreview
            content={previewContent}
            onClose={() => {
              setShowPreview(false);
              setPreviewContent(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ContentManagement;