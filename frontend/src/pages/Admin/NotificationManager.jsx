import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../services/api';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSend,
  FiBell, FiInfo, FiCheckCircle, FiAlertCircle,
  FiAward, FiX, FiCalendar, FiUsers,
  FiUserCheck, FiBookOpen, FiGlobe
} from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

function NotificationManager() {
  const [notifications, setNotifications] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotif, setEditingNotif] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    target_type: 'all',
    target_exam_id: '',
    expires_at: ''
  });

  useEffect(() => {
    fetchNotifications();
    fetchExams();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications/admin/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await API.get('/exams/exams-list');
      setExams(res.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      alert('Please fill title and message');
      return;
    }

    try {
      if (editingNotif) {
        await API.put(`/notifications/admin/notifications/${editingNotif.id}`, formData);
      } else {
        await API.post('/notifications/admin/notifications', formData);
      }
      setShowModal(false);
      setEditingNotif(null);
      setFormData({ title: '', message: '', type: 'info', target_type: 'all', target_exam_id: '', expires_at: '' });
      fetchNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Failed to save notification');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this notification?')) {
      try {
        await API.delete(`/notifications/admin/notifications/${id}`);
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success': return <FiCheckCircle className="text-green-400" />;
      case 'warning': return <FiAlertCircle className="text-yellow-400" />;
      case 'exam': return <FaGraduationCap className="text-blue-400" />;
      case 'result': return <FiAward className="text-purple-400" />;
      default: return <FiInfo className="text-blue-400" />;
    }
  };

  const getTargetLabel = (target) => {
    switch(target) {
      case 'all': return <span className="flex items-center gap-1"><FiGlobe /> All Users</span>;
      case 'students': return <span className="flex items-center gap-1"><FiUsers /> Students</span>;
      case 'premium': return <span className="flex items-center gap-1"><FiUserCheck /> Premium</span>;
      case 'exam_specific': return <span className="flex items-center gap-1"><FiBookOpen /> Exam Specific</span>;
      default: return target;
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
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <FiBell className="text-blue-400" />
              Notification Manager
            </h1>
            <p className="text-gray-400">
              Send announcements and updates to users
            </p>
          </div>
          <button
            onClick={() => {
              setEditingNotif(null);
              setFormData({ title: '', message: '', type: 'info', target_type: 'all', target_exam_id: '', expires_at: '' });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold flex items-center gap-2"
          >
            <FiPlus />
            New Notification
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{notifications.length}</div>
            <div className="text-sm text-gray-400">Total Notifications</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-400">
              {notifications.filter(n => n.is_active).length}
            </div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {notifications.filter(n => n.target_type === 'all').length}
            </div>
            <div className="text-sm text-gray-400">Global Notifications</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-400">
              {notifications.filter(n => n.target_type === 'exam_specific').length}
            </div>
            <div className="text-sm text-gray-400">Exam Specific</div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Message</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Target</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Created</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map(notif => (
                <tr key={notif.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notif.type)}
                      <span className="font-medium">{notif.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300 max-w-xs truncate">
                    {notif.message}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      notif.type === 'success' ? 'bg-green-500/20 text-green-400' :
                      notif.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      notif.type === 'exam' ? 'bg-blue-500/20 text-blue-400' :
                      notif.type === 'result' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {notif.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getTargetLabel(notif.target_type)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      notif.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {notif.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingNotif(notif);
                          setFormData({
                            title: notif.title,
                            message: notif.message,
                            type: notif.type,
                            target_type: notif.target_type,
                            target_exam_id: notif.target_exam_id || '',
                            expires_at: notif.expires_at || ''
                          });
                          setShowModal(true);
                        }}
                        className="p-1 hover:bg-blue-500/20 rounded text-blue-400"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(notif.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingNotif ? 'Edit Notification' : 'Create Notification'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-800 rounded-lg">
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="Notification title"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  placeholder="Notification message"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="exam">Exam Update</option>
                  <option value="result">Result Announcement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Audience</label>
                <select
                  value={formData.target_type}
                  onChange={(e) => setFormData({...formData, target_type: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="all">All Users</option>
                  <option value="students">Only Students</option>
                  <option value="premium">Premium Users</option>
                  <option value="exam_specific">Specific Exam</option>
                </select>
              </div>

              {formData.target_type === 'exam_specific' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Select Exam</label>
                  <select
                    value={formData.target_exam_id}
                    onChange={(e) => setFormData({...formData, target_exam_id: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Select Exam</option>
                    {exams.map(exam => (
                      <option key={exam.id} value={exam.id}>{exam.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <FiSend />
                  {editingNotif ? 'Update' : 'Send'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default NotificationManager;