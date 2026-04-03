const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/database');
const auth = require('../middleware/auth');

// Configure multer for profile images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/profiles';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${req.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit (allow upload)
    fileFilter: fileFilter
});

// Get user stats (tests taken, avg score, etc.)
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.userId;
        
        // Get total tests taken
        const [testsResult] = await db.query(
            'SELECT COUNT(*) as tests_taken, AVG(percentage) as avg_score FROM test_attempts WHERE user_id = ? AND status = "completed"',
            [userId]
        );
        
        // Get total time spent (in hours)
        const [timeResult] = await db.query(
            'SELECT SUM(time_taken) as total_seconds FROM test_attempts WHERE user_id = ? AND status = "completed"',
            [userId]
        );
        
        const totalHours = timeResult[0].total_seconds ? Math.round(timeResult[0].total_seconds / 3600) : 0;
        
        // Get rank (based on percentage)
        const [rankResult] = await db.query(`
            SELECT COUNT(*) + 1 as rank 
            FROM test_attempts 
            WHERE percentage > (SELECT percentage FROM test_attempts WHERE user_id = ? AND status = "completed" ORDER BY percentage DESC LIMIT 1)
            AND status = "completed"
        `, [userId]);
        
        // Get accuracy (from user_answers)
        const [accuracyResult] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM user_answers ua
            JOIN test_attempts ta ON ua.attempt_id = ta.id
            WHERE ta.user_id = ?
        `, [userId]);
        
        const accuracy = accuracyResult[0].total > 0 
            ? Math.round((accuracyResult[0].correct / accuracyResult[0].total) * 100) 
            : 0;
        
        // Get streak (consecutive days with test attempts)
        const [streakResult] = await db.query(`
            SELECT COUNT(DISTINCT DATE(created_at)) as streak
            FROM test_attempts
            WHERE user_id = ? AND status = "completed"
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, [userId]);
        
        // Get weak and strong topics (based on performance)
        const [topicsResult] = await db.query(`
            SELECT 
                q.topic,
                COUNT(*) as total,
                SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct
            FROM user_answers ua
            JOIN questions q ON ua.question_id = q.id
            JOIN test_attempts ta ON ua.attempt_id = ta.id
            WHERE ta.user_id = ? AND q.topic IS NOT NULL AND q.topic != ''
            GROUP BY q.topic
        `, [userId]);
        
        const weakTopics = [];
        const strongTopics = [];
        
        for (const topic of topicsResult) {
            const score = Math.round((topic.correct / topic.total) * 100);
            if (score < 50) {
                weakTopics.push({ topic: topic.topic, score: score });
            } else if (score > 70) {
                strongTopics.push({ topic: topic.topic, score: score });
            }
        }
        
        res.json({
            tests_taken: testsResult[0].tests_taken || 0,
            avg_score: Math.round(testsResult[0].avg_score || 0),
            total_time: `${totalHours}h`,
            rank: rankResult[0]?.rank || 'N/A',
            accuracy: accuracy,
            streak: streakResult[0]?.streak || 0,
            weak_topics: weakTopics,
            strong_topics: strongTopics
        });
        
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.json({
            tests_taken: 0,
            avg_score: 0,
            total_time: '0h',
            rank: 'N/A',
            accuracy: 0,
            streak: 0,
            weak_topics: [],
            strong_topics: []
        });
    }
});

// Get user test history
router.get('/test-history', auth, async (req, res) => {
    try {
        const userId = req.userId;
        
        const [history] = await db.query(`
            SELECT 
                ta.id,
                t.title as test_name,
                ta.percentage,
                ta.marks_obtained as score_obtained,
                (t.total_marks) as total_marks,
                ta.created_at as completed_date
            FROM test_attempts ta
            JOIN tests t ON ta.test_id = t.id
            WHERE ta.user_id = ? AND ta.status = 'completed'
            ORDER BY ta.created_at DESC
            LIMIT 20
        `, [userId]);
        
        res.json(history);
    } catch (error) {
        console.error('Error fetching test history:', error);
        res.json([]);
    }
});

// GET USER PROFILE
router.get('/profile', auth, async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, first_name, last_name, email, phone, address, 
                    exam_preparation, profile_image, created_at, last_login 
             FROM users WHERE id = ?`,
            [req.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// UPDATE USER PROFILE

// UPDATE USER PROFILE
router.put('/profile', auth, async (req, res) => {
    try {
        const { first_name, last_name, phone, address, exam_preparation } = req.body;
        
        await db.query(
            `UPDATE users SET 
                first_name = ?, last_name = ?, phone = ?, 
                address = ?, exam_preparation = ?
             WHERE id = ?`,
            [first_name, last_name, phone, address, exam_preparation, req.userId]
        );
        
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// UPLOAD PROFILE IMAGE

const sharp = require('sharp');

router.post('/profile/upload-image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Compress image using sharp
        const compressedFilename = `profile-${req.userId}-${Date.now()}.jpg`;
        const compressedPath = path.join(__dirname, '../uploads/profiles', compressedFilename);
        
        await sharp(req.file.path)
            .resize(500, 500, { fit: 'cover' })  // Resize to 500x500
            .jpeg({ quality: 70 })                // Compress to ~70% quality
            .toFile(compressedPath);
        
        // Delete original uploaded file
        fs.unlinkSync(req.file.path);
        
        // Delete old image if exists
        const [users] = await db.query('SELECT profile_image FROM users WHERE id = ?', [req.userId]);
        if (users[0]?.profile_image) {
            const oldPath = path.join(__dirname, '..', users[0].profile_image);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        
        const imageUrl = `/uploads/profiles/${compressedFilename}`;
        
        await db.query('UPDATE users SET profile_image = ? WHERE id = ?', [imageUrl, req.userId]);
        
        // Check compressed file size
        const stats = fs.statSync(compressedPath);
        console.log(`Compressed image size: ${(stats.size / 1024).toFixed(2)} KB`);
        
        res.json({ 
            message: 'Image uploaded and compressed successfully', 
            imageUrl: imageUrl,
            size: `${(stats.size / 1024).toFixed(2)} KB`
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// DELETE PROFILE IMAGE

router.delete('/profile/delete-image', auth, async (req, res) => {
    try {
        const [users] = await db.query('SELECT profile_image FROM users WHERE id = ?', [req.userId]);
        if (users[0]?.profile_image) {
            const imagePath = path.join(__dirname, '..', users[0].profile_image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        await db.query('UPDATE users SET profile_image = NULL WHERE id = ?', [req.userId]);
        
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// CHANGE PASSWORD

router.post('/profile/change-password', auth, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.userId]);
        const user = users[0];
        
        // Check current password
        let isValid = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isValid = await bcrypt.compare(current_password, user.password);
        } else {
            isValid = (current_password === user.password);
        }
        
        if (!isValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.userId]);
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// FORGOT PASSWORD - SEND OTP/RESET LINK

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // For security, don't reveal that email doesn't exist
            return res.json({ message: 'If email exists, reset link sent' });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 3600000); // 1 hour
        
        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
            [resetToken, resetExpiry, email]
        );
        
        // TODO: Send email with reset link
        // For now, return token in response (in production, send email)
        res.json({ 
            message: 'Password reset link sent to your email',
            resetToken: resetToken // Remove in production
        });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// RESET PASSWORD

router.post('/reset-password', async (req, res) => {
    try {
        const { token, new_password } = req.body;
        
        const [users] = await db.query(
            'SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
            [token]
        );
        
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        
        const hashedPassword = await bcrypt.hash(new_password, 10);
        
        await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
            [hashedPassword, users[0].id]
        );
        
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;