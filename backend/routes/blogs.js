const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const auth = require('../middleware/auth');

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

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/blogs');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ============================================
// TEST ROUTE - Check if router is working
// ============================================
router.get('/test', (req, res) => {
    res.json({ message: 'Blogs router is working!' });
});

// ============================================
// PUBLIC ROUTES
// ============================================

// Get all published blogs
router.get('/blogs', async (req, res) => {
    try {
        console.log('Fetching all published blogs...');
        const [blogs] = await db.query(`
            SELECT b.*, u.name as author_name 
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            WHERE b.status = 'published'
            ORDER BY b.published_at DESC
        `);
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Get single blog by slug
router.get('/blogs/:slug', async (req, res) => {
    try {
        console.log('Fetching blog with slug:', req.params.slug);
        
        // Update view count
        await db.query('UPDATE blogs SET views = views + 1 WHERE slug = ?', [req.params.slug]);

        const [blogs] = await db.query(`
            SELECT b.*, u.name as author_name
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            WHERE b.slug = ? AND b.status = 'published'
        `, [req.params.slug]);

        if (blogs.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json(blogs[0]);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Get blog categories
router.get('/blog-categories', async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT category, COUNT(*) as count 
            FROM blogs 
            WHERE status = 'published' AND category IS NOT NULL
            GROUP BY category
        `);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// ADMIN ROUTES (Protected)
// ============================================

// Get all blogs (admin)
router.get('/admin/blogs', auth, isAdmin, async (req, res) => {
    try {
        console.log('Fetching all blogs for admin...');
        const [blogs] = await db.query(`
            SELECT b.*, u.name as author_name
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            ORDER BY b.created_at DESC
        `);
        res.json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Create new blog
router.post('/admin/blogs', auth, isAdmin, async (req, res) => {
    try {
        console.log('📥 Received blog data:', JSON.stringify(req.body, null, 2));
        
        const { title, content, excerpt, category, tags, featured_image, status, is_featured, scheduled_at } = req.body;

        // Validation
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        // Generate slug from title
        const baseSlug = title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const slug = baseSlug + '-' + Date.now();

        // Calculate reading time
        const wordCount = content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        // Insert into database
        const [result] = await db.query(
            `INSERT INTO blogs (
                title, slug, content, excerpt, featured_image,
                category, tags, author_id, reading_time, status,
                is_featured, scheduled_at, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, 
                slug, 
                content, 
                excerpt || content.substring(0, 200) + '...',
                featured_image || null, 
                category || null, 
                JSON.stringify(tags || []),
                req.userId, 
                readingTime, 
                status || 'draft',
                is_featured || false, 
                scheduled_at || null,
                status === 'published' ? new Date() : null
            ]
        );

        console.log('✅ Blog created with ID:', result.insertId);

        res.status(201).json({
            message: 'Blog created successfully',
            id: result.insertId,
            slug
        });

    } catch (error) {
        console.error('❌ Error creating blog:', error);
        res.status(500).json({ 
            message: 'Server error: ' + error.message,
            sqlMessage: error.sqlMessage 
        });
    }
});

// Update blog
router.put('/admin/blogs/:id', auth, isAdmin, async (req, res) => {
    try {
        const { title, content, excerpt, category, tags, featured_image, status, is_featured } = req.body;

        await db.query(
            `UPDATE blogs SET
                title = ?, content = ?, excerpt = ?,
                category = ?, tags = ?, featured_image = ?,
                status = ?, is_featured = ?
            WHERE id = ?`,
            [
                title, content, excerpt,
                category, JSON.stringify(tags || []), featured_image,
                status, is_featured,
                req.params.id
            ]
        );

        res.json({ message: 'Blog updated successfully' });
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete blog
router.delete('/admin/blogs/:id', auth, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM blogs WHERE id = ?', [req.params.id]);
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload image
router.post('/admin/blogs/upload-image', auth, isAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const imageUrl = `/uploads/blogs/${req.file.filename}`;
        console.log('Image uploaded:', imageUrl);
        res.json({ url: imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get blog stats
router.get('/admin/blog-stats', auth, isAdmin, async (req, res) => {
    try {
        const [total] = await db.query('SELECT COUNT(*) as count FROM blogs');
        const [published] = await db.query("SELECT COUNT(*) as count FROM blogs WHERE status = 'published'");
        const [drafts] = await db.query("SELECT COUNT(*) as count FROM blogs WHERE status = 'draft'");
        const [views] = await db.query('SELECT SUM(views) as total FROM blogs');
        
        res.json({
            total: total[0].count,
            published: published[0].count,
            drafts: drafts[0].count,
            totalViews: views[0].total || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;