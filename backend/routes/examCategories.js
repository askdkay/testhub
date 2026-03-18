const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// ============================================
// PUBLIC ROUTES (No Auth Required)
// ============================================

// Get all categories with exam counts
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.query(`
            SELECT ec.*, 
                   COUNT(e.id) as exam_count
            FROM exam_categories ec
            LEFT JOIN exams e ON ec.id = e.category_id AND e.is_active = 1
            WHERE ec.is_active = 1
            GROUP BY ec.id
            ORDER BY ec.display_order
        `);
        
        // Get exams for each category
        for (let cat of categories) {
            const [exams] = await db.query(
                'SELECT id, name, slug, short_name FROM exams WHERE category_id = ? AND is_active = 1 ORDER BY name',
                [cat.id]
            );
            cat.exams = exams;
        }
        
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single category by slug
router.get('/categories/:slug', async (req, res) => {
    try {
        const [categories] = await db.query(
            'SELECT * FROM exam_categories WHERE slug = ? AND is_active = 1',
            [req.params.slug]
        );

        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const [exams] = await db.query(
            'SELECT * FROM exams WHERE category_id = ? AND is_active = 1 ORDER BY name',
            [categories[0].id]
        );

        res.json({
            ...categories[0],
            exams
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all exams (public)
router.get('/exams-list', async (req, res) => {
    try {
        const [exams] = await db.query(`
            SELECT e.*, ec.name as category_name, ec.slug as category_slug
            FROM exams e
            JOIN exam_categories ec ON e.category_id = ec.id
            WHERE e.is_active = 1
            ORDER BY e.name
        `);
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single exam by slug (public)
router.get('/exam/:slug', async (req, res) => {
    try {
        const [exams] = await db.query(`
            SELECT e.*, ec.name as category_name, ec.slug as category_slug
            FROM exams e
            JOIN exam_categories ec ON e.category_id = ec.id
            WHERE e.slug = ? AND e.is_active = 1
        `, [req.params.slug]);

        if (exams.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.json(exams[0]);
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// ADMIN ROUTES (Auth Required)
// ============================================

// Get all categories for dropdown
router.get('/admin/categories-list', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [categories] = await db.query('SELECT id, name FROM exam_categories ORDER BY name');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all exams (admin)
router.get('/admin/exams-list', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [exams] = await db.query(`
            SELECT e.*, ec.name as category_name 
            FROM exams e
            JOIN exam_categories ec ON e.category_id = ec.id
            ORDER BY e.created_at DESC
        `);
        res.json(exams);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ IMPORTANT: Get single exam by ID (admin)
router.get('/admin/exams/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [exams] = await db.query(`
            SELECT e.*, ec.name as category_name 
            FROM exams e
            JOIN exam_categories ec ON e.category_id = ec.id
            WHERE e.id = ?
        `, [req.params.id]);
        
        if (exams.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        res.json(exams[0]);
    } catch (error) {
        console.error('Error fetching exam:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new exam
router.post('/admin/exams', auth, adminController.isAdmin, async (req, res) => {
    try {
        const {
            category_id, name, short_name, full_form, description,
            total_questions, total_marks, duration
        } = req.body;

        // Generate slug from name
        let slug = slugify(name, { lower: true, strict: true });
        
        // Check if slug exists
        const [existing] = await db.query('SELECT id FROM exams WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            slug = `${slug}-${Date.now()}`;
        }

        const [result] = await db.query(
            `INSERT INTO exams (
                category_id, name, slug, short_name, full_form, description,
                total_questions, total_marks, duration, color, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                category_id, name, slug, short_name || null, full_form || null, description || null,
                total_questions || 0, total_marks || 0, duration || 0,
                'from-blue-500 to-cyan-500', 1
            ]
        );

        res.status(201).json({
            message: 'Exam created successfully',
            id: result.insertId,
            slug
        });
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Update exam
router.put('/admin/exams/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        const {
            category_id, name, short_name, full_form, description,
            total_questions, total_marks, duration, is_active
        } = req.body;

        await db.query(
            `UPDATE exams 
             SET category_id = ?, name = ?, short_name = ?, full_form = ?, description = ?,
                 total_questions = ?, total_marks = ?, duration = ?, is_active = ?
             WHERE id = ?`,
            [
                category_id, name, short_name, full_form, description,
                total_questions, total_marks, duration, is_active,
                req.params.id
            ]
        );

        res.json({ message: 'Exam updated successfully' });
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete exam
router.delete('/admin/exams/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM exams WHERE id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Create new category
router.post('/admin/categories', auth, adminController.isAdmin, async (req, res) => {
    try {
        const { name, description, icon, color, display_order } = req.body;

        // Generate slug from name
        let slug = slugify(name, { lower: true, strict: true });
        
        // Check if slug exists
        const [existing] = await db.query('SELECT id FROM exam_categories WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            slug = `${slug}-${Date.now()}`;
        }

        const [result] = await db.query(
            `INSERT INTO exam_categories (name, slug, description, icon, color, display_order, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, slug, description || null, icon || null, color || null, display_order || 0, 1]
        );

        res.status(201).json({
            message: 'Category created successfully',
            id: result.insertId,
            slug
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update category
router.put('/admin/categories/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        const { name, description, icon, color, display_order, is_active } = req.body;
        
        await db.query(
            `UPDATE exam_categories 
             SET name = ?, description = ?, icon = ?, color = ?, display_order = ?, is_active = ?
             WHERE id = ?`,
            [name, description, icon, color, display_order || 0, is_active !== undefined ? is_active : 1, req.params.id]
        );

        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Delete category
router.delete('/admin/categories/:id', auth, adminController.isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM exam_categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;