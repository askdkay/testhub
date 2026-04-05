const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Configure multer for memory storage (for JSON upload to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ============================================
// PUBLIC ROUTES
// ============================================

// Get exam details by exam slug
router.get('/exam/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Get exam id from slug
        const [exam] = await db.query('SELECT id, name, slug FROM exams WHERE slug = ? AND is_active = 1', [slug]);
        if (exam.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        // Get exam details from database (only URL)
        const [details] = await db.query(
            `SELECT ed.*, e.name as exam_name, e.slug as exam_slug, ec.name as category_name
             FROM exam_details ed
             JOIN exams e ON ed.exam_id = e.id
             JOIN exam_categories ec ON e.category_id = ec.id
             WHERE ed.exam_id = ? AND ed.is_published = 1`,
            [exam[0].id]
        );
        
        if (details.length === 0) {
            return res.status(404).json({ message: 'Exam details not found' });
        }
        
        // Fetch JSON from Cloudinary
        let jsonData = {};
        if (details[0].json_file_url) {
            try {
                const response = await fetch(details[0].json_file_url);
                jsonData = await response.json();
            } catch (err) {
                console.error('Error fetching JSON from Cloudinary:', err);
            }
        }
        
        // Get test series for this exam
        const [testSeries] = await db.query(
            `SELECT id, title, total_questions, duration, price, is_free 
             FROM tests WHERE exam_id = ? AND status = 'published'`,
            [exam[0].id]
        );
        
        // Get study material for this exam
        const [studyMaterial] = await db.query(
            `SELECT id, title, category, views 
             FROM blogs WHERE exam_id = ? AND status = 'published'`,
            [exam[0].id]
        );
        
        res.json({
            ...details[0],
            ...jsonData,
            test_series: testSeries,
            study_material: studyMaterial
        });
        
    } catch (error) {
        console.error('Error fetching exam details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all published exams (for listing)
router.get('/exams-list', async (req, res) => {
    try {
        const [exams] = await db.query(
            `SELECT e.id, e.name, e.slug, e.short_name, ec.name as category_name,
                    ed.id as details_id, ed.is_published, ed.json_file_url
             FROM exams e
             JOIN exam_categories ec ON e.category_id = ec.id
             LEFT JOIN exam_details ed ON e.id = ed.exam_id
             WHERE e.is_active = 1`
        );
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams list:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all exam pages (admin dashboard)
router.get('/admin/pages', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [pages] = await db.query(
            `SELECT ed.*, e.name as exam_name, e.slug as exam_slug, ec.name as category_name,
                    (SELECT COUNT(*) FROM tests WHERE exam_id = e.id) as test_count
             FROM exam_details ed
             JOIN exams e ON ed.exam_id = e.id
             JOIN exam_categories ec ON e.category_id = ec.id
             ORDER BY ed.updated_at DESC`
        );
        res.json(pages);
    } catch (error) {
        console.error('Error fetching exam pages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ FIXED: Get single exam page for editing
router.get('/admin/pages/:examId', auth, adminController.isAdmin, async (req, res) => {
    try {
        const examId = req.params.examId;
        console.log('Fetching exam page for exam ID:', examId);
        
        const [page] = await db.query(
            `SELECT ed.*, e.name as exam_name, e.slug
             FROM exam_details ed
             JOIN exams e ON ed.exam_id = e.id
             WHERE ed.exam_id = ?`,
            [examId]
        );
        
        if (page.length === 0) {
            return res.status(404).json({ message: 'Page not found' });
        }
        
        // Fetch JSON from Cloudinary
        let jsonData = {};
        if (page[0].json_file_url) {
            try {
                const response = await fetch(page[0].json_file_url);
                jsonData = await response.json();
            } catch (err) {
                console.error('Error fetching JSON from Cloudinary:', err);
            }
        }
        
        res.json({
            ...page[0],
            ...jsonData
        });
        
    } catch (error) {
        console.error('Error fetching exam page:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// ✅ FIXED: Create/Update exam page
router.post('/admin/pages/:examId', auth, adminController.isAdmin, upload.single('jsonFile'), async (req, res) => {
    try {
        const examId = req.params.examId;
        console.log('Saving exam page for exam ID:', examId);
        console.log('Request body:', req.body);
        console.log('File received:', req.file ? 'Yes' : 'No');
        
        const { exam_title, exam_full_form, conducting_body, official_website, 
                exam_language, exam_level, exam_category, exam_frequency, is_published } = req.body;
        
        // Check if exam exists
        const [examExists] = await db.query('SELECT id, name FROM exams WHERE id = ?', [examId]);
        if (examExists.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        let jsonUrl = null;
        let publicId = null;
        let jsonData = {};
        
        // Handle JSON file upload
        if (req.file) {
            // Upload to Cloudinary
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'testhub/exam-details',
                        public_id: `exam-${examId}-${Date.now()}`,
                        resource_type: 'raw'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            
            jsonUrl = uploadResult.secure_url;
            publicId = uploadResult.public_id;
            
            // Parse JSON to get data
            const jsonString = req.file.buffer.toString('utf8');
            jsonData = JSON.parse(jsonString);
            
        } else if (req.body.json_data) {
            // If JSON data sent as string
            jsonData = JSON.parse(req.body.json_data);
            
            // Upload to Cloudinary
            const jsonString = JSON.stringify(jsonData, null, 2);
            const buffer = Buffer.from(jsonString, 'utf8');
            
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'testhub/exam-details',
                        public_id: `exam-${examId}-${Date.now()}`,
                        resource_type: 'raw'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(buffer);
            });
            
            jsonUrl = uploadResult.secure_url;
            publicId = uploadResult.public_id;
        }
        
        // Check if record exists
        const [existing] = await db.query('SELECT id, json_public_id FROM exam_details WHERE exam_id = ?', [examId]);
        
        // Delete old JSON from Cloudinary if exists
        if (existing.length > 0 && existing[0].json_public_id) {
            try {
                await cloudinary.uploader.destroy(existing[0].json_public_id, { resource_type: 'raw' });
                console.log('Old JSON deleted from Cloudinary');
            } catch (err) {
                console.error('Error deleting old JSON:', err);
            }
        }
        
        const examTitle = exam_title || examExists[0].name;
        const publishedStatus = is_published === 'true' || is_published === true;
        
        if (existing.length > 0) {
            // Update existing record
            await db.query(
                `UPDATE exam_details SET 
                    exam_title = ?, exam_full_form = ?, conducting_body = ?, 
                    official_website = ?, exam_language = ?, exam_level = ?, 
                    exam_category = ?, exam_frequency = ?,
                    json_file_url = ?, json_public_id = ?, 
                    is_published = ?, published_at = IF(? = 1, NOW(), published_at),
                    updated_at = NOW()
                 WHERE exam_id = ?`,
                [
                    examTitle, exam_full_form || null, conducting_body || null,
                    official_website || null, exam_language || '[]', exam_level || null,
                    exam_category || null, exam_frequency || null,
                    jsonUrl, publicId, publishedStatus, publishedStatus, examId
                ]
            );
        } else {
            // Insert new record
            await db.query(
                `INSERT INTO exam_details 
                    (exam_id, exam_title, exam_full_form, conducting_body, official_website,
                     exam_language, exam_level, exam_category, exam_frequency,
                     json_file_url, json_public_id, is_published, published_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    examId, examTitle, exam_full_form || null, conducting_body || null,
                    official_website || null, exam_language || '[]', exam_level || null,
                    exam_category || null, exam_frequency || null,
                    jsonUrl, publicId, publishedStatus, publishedStatus ? new Date() : null
                ]
            );
        }
        
        console.log('Exam page saved successfully');
        res.json({ 
            message: 'Exam page saved to Cloudinary successfully', 
            examId: examId,
            jsonUrl: jsonUrl
        });
        
    } catch (error) {
        console.error('Error saving exam page:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Toggle publish status
router.put('/admin/pages/:id/publish', auth, adminController.isAdmin, async (req, res) => {
    try {
        const { is_published } = req.body;
        
        await db.query(
            `UPDATE exam_details 
             SET is_published = ?, published_at = IF(? = 1, NOW(), NULL)
             WHERE id = ?`,
            [is_published, is_published, req.params.id]
        );
        
        res.json({ message: 'Page status updated' });
    } catch (error) {
        console.error('Error updating page status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete exam page
router.delete('/admin/pages/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [page] = await db.query('SELECT json_public_id FROM exam_details WHERE id = ?', [req.params.id]);
        
        if (page[0]?.json_public_id) {
            await cloudinary.uploader.destroy(page[0].json_public_id, { resource_type: 'raw' });
        }
        
        await db.query('DELETE FROM exam_details WHERE id = ?', [req.params.id]);
        res.json({ message: 'Exam page deleted from Cloudinary and database' });
    } catch (error) {
        console.error('Error deleting exam page:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all exams without pages
router.get('/admin/exams-without-pages', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [exams] = await db.query(
            `SELECT e.id, e.name, e.slug, ec.name as category_name
             FROM exams e
             JOIN exam_categories ec ON e.category_id = ec.id
             LEFT JOIN exam_details ed ON e.id = ed.exam_id
             WHERE ed.id IS NULL AND e.is_active = 1`
        );
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;