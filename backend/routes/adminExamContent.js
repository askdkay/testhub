const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const slugify = require('slugify');
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/exam-content');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const originalName = file.originalname.replace(/\.json$/, '');
        const filename = `${timestamp}-${originalName}.json`;
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json') {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }
});

router.get('/admin/topics/:examId', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [topics] = await db.query(`
            SELECT t.*, COUNT(s.id) as subtopic_count
            FROM exam_topics t
            LEFT JOIN exam_subtopics s ON t.id = s.topic_id
            WHERE t.exam_id = ?
            GROUP BY t.id
            ORDER BY t.display_order
        `, [req.params.examId]);
        
        res.json(topics);
    } catch (error) {
        console.error('Error fetching topics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/topics', auth, adminController.isAdmin, async (req, res) => {
    try {
        const { exam_id, name, display_order } = req.body;
        
        if (!exam_id || !name) {
            return res.status(400).json({ message: 'Exam ID and name are required' });
        }
        
        const [result] = await db.query(
            'INSERT INTO exam_topics (exam_id, name, display_order) VALUES (?, ?, ?)',
            [exam_id, name, display_order || 0]
        );
        
        res.status(201).json({
            message: 'Topic created successfully',
            id: result.insertId
        });
        
    } catch (error) {
        console.error('Error creating topic:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/admin/topics/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        const { name, display_order } = req.body;
        
        await db.query(
            'UPDATE exam_topics SET name = ?, display_order = ? WHERE id = ?',
            [name, display_order, req.params.id]
        );
        
        res.json({ message: 'Topic updated successfully' });
    } catch (error) {
        console.error('Error updating topic:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/topics/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM exam_topics WHERE id = ?', [req.params.id]);
        res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
        console.error('Error deleting topic:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/subtopics/:examId', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [subtopics] = await db.query(`
            SELECT s.*, t.name as topic_name
            FROM exam_subtopics s
            JOIN exam_topics t ON s.topic_id = t.id
            WHERE s.exam_id = ?
            ORDER BY s.created_at DESC
        `, [req.params.examId]);
        
        res.json(subtopics);
    } catch (error) {
        console.error('Error fetching subtopics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/subtopics/upload', auth, adminController.isAdmin, upload.single('jsonFile'), async (req, res) => {
    try {
        const { exam_id, topic_id, status } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'JSON file is required' });
        }
        
        if (!topic_id) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Topic ID is required' });
        }
        
        const filePath = req.file.path;
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let jsonData;
        
        try {
            jsonData = JSON.parse(fileContent);
        } catch (err) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: 'Invalid JSON format: ' + err.message });
        }
        
        if (!jsonData.title) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: 'JSON must contain "title" field' });
        }
        
        const [exam] = await db.query('SELECT slug, name FROM exams WHERE id = ?', [exam_id]);
        const [topic] = await db.query('SELECT name FROM exam_topics WHERE id = ?', [topic_id]);
        
        if (exam.length === 0 || topic.length === 0) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: 'Invalid exam or topic' });
        }
        
        const examSlug = exam[0].slug;
        const topicSlug = slugify(topic[0].name, { lower: true, strict: true });
        
        const targetDir = path.join(__dirname, '../uploads/exam-content', examSlug, topicSlug);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        const fileName = `${Date.now()}-${slugify(jsonData.title, { lower: true, strict: true })}.json`;
        const newFilePath = path.join(targetDir, fileName);
        fs.renameSync(filePath, newFilePath);
        
        const relativePath = `/uploads/exam-content/${examSlug}/${topicSlug}/${fileName}`;
        
        let slug = slugify(jsonData.title, { lower: true, strict: true });
        const [existing] = await db.query('SELECT id FROM exam_subtopics WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            slug = `${slug}-${Date.now()}`;
        }
        
        const [result] = await db.query(
            `INSERT INTO exam_subtopics (
                topic_id, exam_id, title, subtitle, json_file_path, slug, status, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                topic_id,
                exam_id,
                jsonData.title,
                jsonData.subtitle || null,
                relativePath,
                slug,
                status || 'draft',
                req.body.display_order || 0
            ]
        );
        
        res.status(201).json({
            message: 'Content uploaded successfully',
            id: result.insertId,
            slug,
            title: jsonData.title
        });
        
    } catch (error) {
        console.error('Error uploading content:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Update subtopic status - FIXED VERSION
// Update subtopic status - WITH DEBUG LOGGING
router.put('/admin/subtopics/:id/status', auth, adminController.isAdmin, async (req, res) => {
    try {
        console.log('=== STATUS UPDATE REQUEST ===');
        console.log('Subtopic ID:', req.params.id);
        console.log('Request body:', req.body);
        
        const { status } = req.body;
        const subtopicId = req.params.id;
        
        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }
        
        // Check if subtopic exists
        const [existing] = await db.query(
            'SELECT id, status FROM exam_subtopics WHERE id = ?',
            [subtopicId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Subtopic not found' });
        }
        
        console.log('Current status:', existing[0].status);
        console.log('New status:', status);
        
        // Update query
        if (status === 'published') {
            await db.query(
                'UPDATE exam_subtopics SET status = ?, published_at = NOW() WHERE id = ?',
                [status, subtopicId]
            );
            console.log('Published at set to NOW()');
        } else if (status === 'draft') {
            await db.query(
                'UPDATE exam_subtopics SET status = ?, published_at = NULL WHERE id = ?',
                [status, subtopicId]
            );
            console.log('Published at set to NULL');
        } else {
            return res.status(400).json({ message: 'Invalid status. Must be "draft" or "published"' });
        }
        
        // Verify update
        const [updated] = await db.query(
            'SELECT status, published_at FROM exam_subtopics WHERE id = ?',
            [subtopicId]
        );
        console.log('Updated record:', updated[0]);
        
        res.json({ 
            message: 'Status updated successfully',
            status: status,
            published_at: updated[0].published_at
        });
        
    } catch (error) {
        console.error('❌ Error updating status:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Server error: ' + error.message,
            error: error.sqlMessage || error.message
        });
    }
});
router.delete('/admin/subtopics/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [subtopic] = await db.query('SELECT json_file_path FROM exam_subtopics WHERE id = ?', [req.params.id]);
        
        if (subtopic.length > 0 && subtopic[0].json_file_path) {
            const filePath = path.join(__dirname, '..', subtopic[0].json_file_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        await db.query('DELETE FROM exam_subtopics WHERE id = ?', [req.params.id]);
        
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
