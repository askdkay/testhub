const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const auth = require('../middleware/auth');
// const adminController = require('../middleware/adminController');

// Admin middleware
const isAdmin = async (req, res, next) => {
    try {
        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [req.userId]);
        if (users.length === 0 || users[0].role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Configure multer for JSON upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/content');
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `content-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 50 // Max 50 files at once
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json') {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed'), false);
        }
    }
});

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================

// Get all published content for an exam
// Get all published content for an exam (WITH SUBTOPICS)
router.get('/exam/:examSlug', async (req, res) => {
    try {
        // Get main topics (level = 1 or parent_id IS NULL)
        const [mainTopics] = await db.query(`
            SELECT ec.*, u.name as author_name,
                   (SELECT COUNT(*) FROM exam_content WHERE parent_id = ec.id) as subtopic_count
            FROM exam_content ec
            JOIN exam_categories cat ON ec.exam_id = cat.id
            LEFT JOIN users u ON ec.author_id = u.id
            WHERE cat.slug = ? AND ec.status = 'published' AND (ec.parent_id IS NULL OR ec.level = 1)
            ORDER BY ec.topic_order, ec.created_at DESC
        `, [req.params.examSlug]);
        
        // Get subtopics for each main topic
        const result = [];
        for (const topic of mainTopics) {
            const [subtopics] = await db.query(`
                SELECT * FROM exam_content 
                WHERE parent_id = ? AND status = 'published'
                ORDER BY topic_order, created_at DESC
            `, [topic.id]);
            
            result.push({
                ...topic,
                subtopics: subtopics
            });
        }
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching exam content:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single content by slug
// Get single content by slug (with parent info)
router.get('/content/:slug', async (req, res) => {
    try {
        // Update view count
        await db.query(
            'UPDATE exam_content SET views = views + 1 WHERE slug = ?',
            [req.params.slug]
        );
        
        const [content] = await db.query(`
            SELECT ec.*, u.name as author_name, cat.name as exam_name,
                   parent.title as parent_title, parent.slug as parent_slug
            FROM exam_content ec
            JOIN exam_categories cat ON ec.exam_id = cat.id
            LEFT JOIN users u ON ec.author_id = u.id
            LEFT JOIN exam_content parent ON ec.parent_id = parent.id
            WHERE ec.slug = ?
        `, [req.params.slug]);
        
        if (content.length === 0) {
            return res.status(404).json({ message: 'Content not found' });
        }
        
        // Get next and previous content
        const [navigation] = await db.query(`
            SELECT id, title, slug 
            FROM exam_content 
            WHERE exam_id = ? AND status = 'published' 
              AND (parent_id IS NULL OR parent_id = ?)
              AND topic_order ${content[0].topic_order ? '<' : '>'} ?
            ORDER BY topic_order ${content[0].topic_order ? 'DESC' : 'ASC'}
            LIMIT 1
        `, [content[0].exam_id, content[0].parent_id, content[0].topic_order || 0]);
        
        res.json({
            ...content[0],
            nextTopic: navigation[0] || null
        });
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// ADMIN ROUTES (Auth Required)
// ============================================

// Get all content (admin)
router.get('/admin/all', auth, isAdmin, async (req, res) => {
    try {
        const [contents] = await db.query(`
            SELECT ec.*, u.name as author_name, cat.name as exam_name
            FROM exam_content ec
            LEFT JOIN exam_categories cat ON ec.exam_id = cat.id
            LEFT JOIN users u ON ec.author_id = u.id
            ORDER BY ec.created_at DESC
        `);
        
        res.json(contents);
    } catch (error) {
        console.error('Error fetching all content:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Import content from JSON
// Import content from JSON
router.post('/admin/import-multiple', auth, isAdmin, upload.array('files', 50), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const results = [];
        const errors = [];

        for (const file of req.files) {
            try {
                // Read and parse each JSON file
                const fileContent = fs.readFileSync(file.path, 'utf8');
                const contentData = JSON.parse(fileContent);

                // Validate each file
                if (!contentData.title || !contentData.content) {
                    errors.push({
                        file: file.originalname,
                        error: 'Missing title or content'
                    });
                    continue;
                }

                // Get exam ID
                let examId = contentData.exam_id;
                if (contentData.exam_slug) {
                    const [exam] = await db.query(
                        'SELECT id FROM exam_categories WHERE slug = ?',
                        [contentData.exam_slug]
                    );
                    if (exam.length > 0) examId = exam[0].id;
                }

                // Create slug
                const slug = contentData.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');

                // Check duplicate slug
                const [existing] = await db.query(
                    'SELECT id FROM exam_content WHERE slug = ?',
                    [slug]
                );
                const finalSlug = existing.length > 0 ? `${slug}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` : slug;

                // Insert into database
                const [result] = await db.query(
                    `INSERT INTO exam_content (
                        exam_id, title, slug, content, summary, 
                        featured_image, category, tags, author_id, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        examId || 1,
                        contentData.title,
                        finalSlug,
                        contentData.content,
                        contentData.summary || contentData.content.substring(0, 200),
                        contentData.featured_image || null,
                        contentData.category || null,
                        JSON.stringify(contentData.tags || []),
                        req.userId,
                        'draft'
                    ]
                );

                results.push({
                    file: file.originalname,
                    success: true,
                    id: result.insertId,
                    title: contentData.title
                });

            } catch (fileError) {
                errors.push({
                    file: file.originalname,
                    error: fileError.message
                });
            } finally {
                // Clean up uploaded file
                fs.unlinkSync(file.path);
            }
        }

        res.json({
            message: `Imported ${results.length} files, ${errors.length} errors`,
            results,
            errors
        });

    } catch (error) {
        console.error('Error importing files:', error);
        res.status(500).json({ message: 'Error importing files' });
    }
})

// Create new content
router.post('/admin/create', auth, isAdmin, async (req, res) => {
    try {
        const { exam_id, title, content, summary, featured_image, category, tags, status } = req.body;

        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const [result] = await db.query(
            `INSERT INTO exam_content (
                exam_id, title, slug, content, summary, 
                featured_image, category, tags, author_id, status,
                published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                exam_id || 1,
                title,
                slug,
                content,
                summary || content.substring(0, 200),
                featured_image || null,
                category || null,
                JSON.stringify(tags || []),
                req.userId,
                status || 'draft',
                status === 'published' ? new Date() : null
            ]
        );

        res.status(201).json({
            message: 'Content created successfully',
            id: result.insertId,
            slug
        });

    } catch (error) {
        console.error('Error creating content:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Update content
router.put('/admin/content/:id', auth, isAdmin, async (req, res) => {
    try {
        const { title, content, summary, featured_image, category, tags, status } = req.body;

        let updateQuery = `
            UPDATE exam_content SET
                title = ?, content = ?, summary = ?,
                featured_image = ?, category = ?, tags = ?
        `;
        const params = [title, content, summary, featured_image, category, JSON.stringify(tags || [])];

        // If status changed to published and not already published
        if (status === 'published') {
            updateQuery += ', status = ?, published_at = COALESCE(published_at, NOW())';
            params.push(status);
        } else {
            updateQuery += ', status = ?';
            params.push(status);
        }

        updateQuery += ' WHERE id = ?';
        params.push(req.params.id);

        await db.query(updateQuery, params);

        res.json({ message: 'Content updated successfully' });

    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete content
router.delete('/admin/content/:id', auth, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM exam_content WHERE id = ?', [req.params.id]);
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all exams for dropdown
router.get('/admin/exams', auth, isAdmin, async (req, res) => {
    try {
        const [exams] = await db.query('SELECT id, name, slug FROM exam_categories WHERE is_active = true ORDER BY name');
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;