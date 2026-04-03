const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const auth = require('../middleware/auth');
const db = require('../config/database'); // ✅ IMPORTANT: Add this line

// Public routes - Get all tests
router.get('/', async (req, res) => {
    try {
        const [tests] = await db.query(
            `SELECT t.*, 
                    (SELECT COUNT(*) FROM questions WHERE test_id = t.id) as total_questions 
             FROM tests t 
             WHERE t.status = 'published'
             ORDER BY t.created_at DESC`
        );
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single test with questions
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [tests] = await db.query('SELECT * FROM tests WHERE id = ?', [id]);
        
        if (tests.length === 0) {
            return res.status(404).json({ message: 'Test not found' });
        }
        
        const [questions] = await db.query(
            'SELECT id, question_text, option_a, option_b, option_c, option_d, marks FROM questions WHERE test_id = ?',
            [id]
        );
        
        res.json({
            ...tests[0],
            questions
        });
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

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

// ============================================
// TEST RESULT ROUTES
// ============================================

// Get test result data (attempt details)
// Get test result data (attempt details) - WITH DEBUG LOGGING
router.get('/:testId/result', auth, async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;
        
        console.log('=== TEST RESULT REQUEST ===');
        console.log('Test ID:', testId);
        console.log('User ID:', userId);
        
        // Check if tables exist first
        const [tables] = await db.query("SHOW TABLES LIKE 'test_attempts'");
        if (tables.length === 0) {
            console.error('test_attempts table does not exist!');
            return res.status(500).json({ message: 'test_attempts table not found. Please run database migrations.' });
        }
        
        const [attempts] = await db.query(
            `SELECT * FROM test_attempts 
             WHERE test_id = ? AND user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [testId, userId]
        );
        
        console.log('Attempts found:', attempts.length);
        
        if (attempts.length === 0) {
            return res.status(404).json({ message: 'No attempt found for this test. Please take the test first.' });
        }
        
        res.json(attempts[0]);
        
    } catch (error) {
        console.error('Error fetching test result:', error);
        console.error('SQL Error:', error.sql);
        console.error('SQL Message:', error.sqlMessage);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.sqlMessage || error.message 
        });
    }
});

// Get questions with user answers
router.get('/:testId/questions-with-answers', auth, async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;
        
        const [attempts] = await db.query(
            `SELECT id FROM test_attempts 
             WHERE test_id = ? AND user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [testId, userId]
        );
        
        if (attempts.length === 0) {
            return res.status(404).json({ message: 'No attempt found' });
        }
        
        const attemptId = attempts[0].id;
        
        const [questions] = await db.query(
            `SELECT q.*, 
                    ua.selected_answer as user_answer, 
                    ua.is_correct, 
                    ua.time_taken_seconds as time_taken,
                    ua.marked_for_review
             FROM questions q
             LEFT JOIN user_answers ua ON q.id = ua.question_id AND ua.attempt_id = ?
             WHERE q.test_id = ?
             ORDER BY q.id`,
            [attemptId, testId]
        );
        
        res.json(questions);
        
    } catch (error) {
        console.error('Error fetching questions with answers:', error);
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

// ============================================
// SUBMIT TEST ROUTE (Naya add kiya gaya hai)
// ============================================
router.post('/:testId/submit', auth, async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;
        const { answers, timeSpent, markedForReview } = req.body;

        // 1. Test ke saare questions backend se lo (taki correct answers match kar sakein)
        const [questions] = await db.query('SELECT * FROM questions WHERE test_id = ?', [testId]);
        
        let score = 0;
        let totalScore = 0;

        // 2. Score Calculate karo backend me (Security ke liye)
        questions.forEach(q => {
            const marksForQuestion = q.marks || 4; // Default 4 marks
            totalScore += marksForQuestion;
            
            if (answers[q.id] && answers[q.id] === q.correct_answer) {
                score += marksForQuestion;
            }
        });

        // 3. test_attempts table me entry dalo
        const [attemptResult] = await db.query(
            `INSERT INTO test_attempts (test_id, user_id, score, total_score, time_taken) 
             VALUES (?, ?, ?, ?, ?)`,
            [testId, userId, score, totalScore, timeSpent]
        );

        const attemptId = attemptResult.insertId;

        // 4. user_answers table me ek-ek question ka answer dalo
        for (const q of questions) {
            const userAnswer = answers[q.id] || null;
            const isCorrect = userAnswer === q.correct_answer ? 1 : 0;
            const isMarked = markedForReview && markedForReview.includes(q.id) ? 1 : 0;
            
            await db.query(
                `INSERT INTO user_answers (attempt_id, question_id, selected_answer, is_correct, marked_for_review)
                 VALUES (?, ?, ?, ?, ?)`,
                [attemptId, q.id, userAnswer, isCorrect, isMarked]
            );
        }

        res.json({ success: true, attemptId, score });

    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ message: 'Server error during submission', error: error.message });
    }
});
module.exports = router;