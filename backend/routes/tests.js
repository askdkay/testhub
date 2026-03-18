const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', testController.getAllTests);
router.get('/:id', auth, testController.getTestById);

// Get all tests with category details
router.get('/tests', async (req, res) => {
    try {
        const [tests] = await db.query(`
            SELECT t.*, 
                   ec.id as category_id,
                   ec.name as category_name,
                   ec.slug as category_slug,
                   ec.color as category_color,
                   ec.icon as category_icon,
                   (SELECT COUNT(*) FROM questions WHERE test_id = t.id) as total_questions 
            FROM tests t
            LEFT JOIN exam_categories ec ON t.category_id = ec.id
            ORDER BY t.created_at DESC
        `);
        
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get tests by category slug
router.get('/tests/category/:slug', async (req, res) => {
    try {
        const [tests] = await db.query(`
            SELECT t.*, 
                   ec.name as category_name,
                   ec.slug as category_slug
            FROM tests t
            JOIN exam_categories ec ON t.category_id = ec.id
            WHERE ec.slug = ? AND t.status = 'published'
            ORDER BY t.created_at DESC
        `, [req.params.slug]);
        
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests by category:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;