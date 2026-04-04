const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { cloudinary } = require('../config/cloudinary');
const db = require('../config/database');
const auth = require('../middleware/auth');
const { Readable } = require('stream');

// Configure multer (temporary memory storage for compression)
const multerStorage = multer.memoryStorage();
const upload = multer({ 
    storage: multerStorage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// ============================================
// COMPRESS IMAGE WITH SHARP
// ============================================
async function compressImage(buffer, originalName) {
    try {
        const originalSizeMB = buffer.length / 1024 / 1024;
        console.log(`📸 Original size: ${originalSizeMB.toFixed(2)}MB`);
        
        let compressedBuffer = buffer;
        let quality = 80;
        
        while (compressedBuffer.length > 100 * 1024 && quality > 30) {
            compressedBuffer = await sharp(buffer)
                .resize(500, 500, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: quality, progressive: true })
                .toBuffer();
            
            const currentSizeKB = compressedBuffer.length / 1024;
            console.log(`   Quality ${quality}% → ${currentSizeKB.toFixed(0)}KB`);
            quality -= 10;
        }
        
        const finalSizeKB = compressedBuffer.length / 1024;
        console.log(`✅ Final: ${finalSizeKB.toFixed(0)}KB`);
        
        return compressedBuffer;
    } catch (error) {
        console.error('Compression error:', error);
        return buffer;
    }
}

// ============================================
// GET USER PROFILE
// ============================================
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
// ============================================
// UPDATE USER PROFILE
// ============================================
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

// ============================================
// UPLOAD PROFILE IMAGE (WITH COMPRESSION)
// ============================================
router.post('/profile/upload-image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        console.log('📸 Received:', req.file.originalname, `${(req.file.size/1024/1024).toFixed(2)}MB`);
        
        // Compress image
        const compressedBuffer = await compressImage(req.file.buffer, req.file.originalname);
        
        // Upload to Cloudinary
        const uploadPromise = new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'testhub/profiles',
                    public_id: `profile-${req.userId}-${Date.now()}`,
                    transformation: [
                        { width: 500, height: 500, crop: 'limit', quality: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            
            const readableStream = new Readable();
            readableStream.push(compressedBuffer);
            readableStream.push(null);
            readableStream.pipe(stream);
        });
        
        const uploadResult = await uploadPromise;
        
        // Delete old image
        const [users] = await db.query('SELECT profile_image_public_id FROM users WHERE id = ?', [req.userId]);
        if (users[0]?.profile_image_public_id) {
            try {
                await cloudinary.uploader.destroy(users[0].profile_image_public_id);
            } catch (err) {
                console.error('Error deleting old image:', err);
            }
        }
        
        await db.query(
            'UPDATE users SET profile_image = ?, profile_image_public_id = ? WHERE id = ?',
            [uploadResult.secure_url, uploadResult.public_id, req.userId]
        );
        
        const finalSizeKB = compressedBuffer.length / 1024;
        
        res.json({ 
            message: `Uploaded! ${(req.file.size/1024/1024).toFixed(2)}MB → ${finalSizeKB.toFixed(0)}KB`,
            imageUrl: uploadResult.secure_url
        });
        
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// ============================================
// DELETE PROFILE IMAGE
// ============================================
router.delete('/profile/delete-image', auth, async (req, res) => {
    try {
        const [users] = await db.query('SELECT profile_image_public_id FROM users WHERE id = ?', [req.userId]);
        if (users[0]?.profile_image_public_id) {
            await cloudinary.uploader.destroy(users[0].profile_image_public_id);
        }
        
        await db.query(
            'UPDATE users SET profile_image = NULL, profile_image_public_id = NULL WHERE id = ?',
            [req.userId]
        );
        
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// CHANGE PASSWORD
// ============================================
router.post('/profile/change-password', auth, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.userId]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const user = users[0];
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

// ============================================
// FORGOT PASSWORD
// ============================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.json({ message: 'If email exists, reset link sent' });
        }
        
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 3600000);
        
        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
            [resetToken, resetExpiry, email]
        );
        
        res.json({ 
            message: 'Password reset link sent',
            resetToken: resetToken
        });
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// RESET PASSWORD
// ============================================
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