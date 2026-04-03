import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';
import { 
  FiBell, FiBellOff, FiX, FiCheck, FiInfo, 
  FiAlertCircle, FiCheckCircle, FiAward, FiCalendar,
  FiTrash2
} from 'react-icons/fi';
import { FaGraduationCap } from 'react-icons/fa';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications/my-notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: 1 } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: 1 }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await API.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (!notifications.find(n => n.id === notificationId)?.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="text-green-400" />;
      case 'warning':
        return <FiAlertCircle className="text-yellow-400" />;
      case 'exam':
        return <FaGraduationCap className="text-blue-400" />;
      case 'result':
        return <FiAward className="text-purple-400" />;
      case 'payment':
        return <FiCheck className="text-green-400" />;
      default:
        return <FiInfo className="text-blue-400" />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-gray-800  border-gray-500 border-2 border-glass-border rounded-xl hover:border-gray-500/50 transition-all"
      >
        {unreadCount > 0 ? (
          <FiBell className="text-gray-400" size={20} />
        ) : (
          <FiBellOff className="text-gray-400" size={20} />
        )}
        
<span class="absolute -top-1 -right-1 flex size-3">
  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-95"></span>
  <span class="relative inline-flex size-3 rounded-full bg-sky-500"></span>
</span>
        
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-gray-400 hover:text-green-400 transition-colors flex items-center gap-1"
                  >
                    <FaGraduationCap size={14} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FiX size={16} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent mx-auto"></div>
                  <p className="text-gray-400 text-sm mt-2">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <FiBellOff className="text-4xl text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">No notifications</p>
                  <p className="text-xs text-gray-600 mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition-all ${
                      !notif.is_read ? 'bg-green-500/5' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                            {getNotificationIcon(notif.type)}
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-white text-sm">
                              {notif.title}
                            </h4>
                            <div className="flex gap-1 ml-2">
                              {!notif.is_read && (
                                <button
                                  onClick={() => markAsRead(notif.id)}
                                  className="p-1 hover:bg-green-500/20 rounded-lg text-green-400 transition-colors"
                                  title="Mark as read"
                                >
                                  <FiCheck size={12} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notif.id)}
                                className="p-1 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                title="Remove"
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <FiCalendar size={10} />
                            {getTimeAgo(notif.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-800 text-center">
                <a
                  href="/notifications"
                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications →
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;