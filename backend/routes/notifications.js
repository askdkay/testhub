const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// ============================================
// USER ROUTES (Get notifications for logged-in user)
// ============================================

// ✅ Get all notifications for current user
router.get('/my-notifications', auth, async (req, res) => {
    try {
        const userId = req.userId;
        
        const [notifications] = await db.query(`
            SELECT 
                n.id,
                n.title,
                n.message,
                n.type,
                n.created_at,
                COALESCE(un.is_read, 0) as is_read,
                un.read_at
            FROM notifications n
            LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
            WHERE n.is_active = 1 
                AND (n.expires_at IS NULL OR n.expires_at > NOW())
                AND (
                    n.target_type = 'all' 
                    OR (n.target_type = 'students' AND EXISTS(SELECT 1 FROM users WHERE id = ? AND role = 'student'))
                    OR (n.target_type = 'premium' AND EXISTS(SELECT 1 FROM users WHERE id = ? AND role = 'premium'))
                )
            ORDER BY n.created_at DESC
            LIMIT 50
        `, [userId, userId, userId]);
        
        const [unreadCount] = await db.query(`
            SELECT COUNT(*) as count
            FROM notifications n
            LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
            WHERE n.is_active = 1 
                AND (un.is_read IS NULL OR un.is_read = 0)
                AND (n.expires_at IS NULL OR n.expires_at > NOW())
        `, [userId]);
        
        res.json({
            notifications: notifications,
            unread_count: unreadCount[0]?.count || 0
        });
        
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Mark notification as read
router.put('/notifications/:id/read', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const notificationId = req.params.id;
        
        const [existing] = await db.query(
            'SELECT id FROM user_notifications WHERE user_id = ? AND notification_id = ?',
            [userId, notificationId]
        );
        
        if (existing.length > 0) {
            await db.query(
                'UPDATE user_notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND notification_id = ?',
                [userId, notificationId]
            );
        } else {
            await db.query(
                'INSERT INTO user_notifications (user_id, notification_id, is_read, read_at) VALUES (?, ?, 1, NOW())',
                [userId, notificationId]
            );
        }
        
        res.json({ message: 'Notification marked as read' });
        
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Mark all notifications as read
router.put('/notifications/read-all', auth, async (req, res) => {
    try {
        const userId = req.userId;
        
        const [notifications] = await db.query(`
            SELECT n.id FROM notifications n
            LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
            WHERE n.is_active = 1 AND (un.is_read IS NULL OR un.is_read = 0)
        `, [userId]);
        
        for (const notif of notifications) {
            const [existing] = await db.query(
                'SELECT id FROM user_notifications WHERE user_id = ? AND notification_id = ?',
                [userId, notif.id]
            );
            
            if (existing.length > 0) {
                await db.query(
                    'UPDATE user_notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND notification_id = ?',
                    [userId, notif.id]
                );
            } else {
                await db.query(
                    'INSERT INTO user_notifications (user_id, notification_id, is_read, read_at) VALUES (?, ?, 1, NOW())',
                    [userId, notif.id]
                );
            }
        }
        
        res.json({ message: 'All notifications marked as read' });
        
    } catch (error) {
        console.error('Error marking all as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Delete notification for user
router.delete('/notifications/:id', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const notificationId = req.params.id;
        
        await db.query(
            'INSERT INTO user_notifications (user_id, notification_id, is_read, read_at) VALUES (?, ?, 1, NOW()) ON DUPLICATE KEY UPDATE is_read = 1, read_at = NOW()',
            [userId, notificationId]
        );
        
        res.json({ message: 'Notification removed' });
        
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// ADMIN ROUTES
// ============================================

// ✅ Create new notification (admin only)
router.post('/admin/notifications', auth, adminController.isAdmin, async (req, res) => {
    try {
        const { title, message, type, target_type, target_exam_id, expires_at } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }
        
        const [result] = await db.query(
            `INSERT INTO notifications (title, message, type, target_type, target_exam_id, expires_at, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, message, type || 'info', target_type || 'all', target_exam_id || null, expires_at || null, req.userId]
        );
        
        res.status(201).json({
            message: 'Notification created successfully',
            notificationId: result.insertId
        });
        
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Get all notifications (admin)
router.get('/admin/notifications', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [notifications] = await db.query(`
            SELECT n.*, u.name as created_by_name
            FROM notifications n
            JOIN users u ON n.created_by = u.id
            ORDER BY n.created_at DESC
        `);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Update notification (admin)
router.put('/admin/notifications/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        const { title, message, type, target_type, target_exam_id, expires_at, is_active } = req.body;
        
        await db.query(
            `UPDATE notifications 
             SET title = ?, message = ?, type = ?, target_type = ?, target_exam_id = ?, expires_at = ?, is_active = ?
             WHERE id = ?`,
            [title, message, type, target_type, target_exam_id, expires_at, is_active, req.params.id]
        );
        
        res.json({ message: 'Notification updated successfully' });
        
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Delete notification (admin)
router.delete('/admin/notifications/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM user_notifications WHERE notification_id = ?', [req.params.id]);
        await db.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
        
        res.json({ message: 'Notification deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;