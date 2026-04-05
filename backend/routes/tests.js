const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const db = require('../config/database');
const auth = require('../middleware/auth');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }
});

// ============================================
// PUBLIC ROUTES
// ============================================

// Get all published tests
router.get('/', async (req, res) => {
    try {
        const [tests] = await db.query(
            `SELECT t.id, t.title, t.description, t.duration, t.total_questions,
                    t.total_marks, t.is_free, t.price, t.difficulty, t.status,
                    t.json_file_url, ec.name as category_name, e.name as exam_name
             FROM tests t
             LEFT JOIN exam_categories ec ON t.category_id = ec.id
             LEFT JOIN exams e ON t.exam_id = e.id
             WHERE t.status = 'published'
             ORDER BY t.created_at DESC`
        );
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Get single test by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const [tests] = await db.query('SELECT * FROM tests WHERE id = ?', [req.params.id]);
        
        if (tests.length === 0) {
            return res.status(404).json({ message: 'Test not found' });
        }
        
        const test = tests[0];
        
        let questions = [];
        if (test.json_file_url) {
            try {
                const response = await fetch(test.json_file_url);
                const data = await response.json();
                questions = data.questions || [];
            } catch (err) {
                console.error('Error fetching JSON from Cloudinary:', err);
            }
        }
        
        res.json({
            ...test,
            questions: questions
        });
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all tests for admin
router.get('/admin/tests', auth, async (req, res) => {
    try {
        const { status, exam_id, search } = req.query;
        
        let query = `
            SELECT t.*, u.name as creator_name,
                   ec.name as category_name, e.name as exam_name
            FROM tests t
            LEFT JOIN users u ON t.created_by = u.id
            LEFT JOIN exam_categories ec ON t.category_id = ec.id
            LEFT JOIN exams e ON t.exam_id = e.id
            WHERE 1=1
        `;
        const params = [];
        
        if (status && status !== 'all') {
            query += ` AND t.status = ?`;
            params.push(status);
        }
        
        if (exam_id) {
            query += ` AND t.exam_id = ?`;
            params.push(exam_id);
        }
        
        if (search) {
            query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }
        
        query += ` ORDER BY t.created_at DESC`;
        
        const [tests] = await db.query(query, params);
        res.json(tests);
    } catch (error) {
        console.error('Error fetching admin tests:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Create/Update test (upload JSON to Cloudinary)
router.post('/admin/create', auth, upload.single('jsonFile'), async (req, res) => {
    try {
        console.log('Creating/Updating test...');
        
        const {
            id, title, description, category_id, exam_id, duration,
            total_questions, total_marks, passing_marks, negative_marking,
            is_free, price, language, difficulty, instructions, status
        } = req.body;
        
        // Convert string values to proper types
        const parsedIsFree = is_free === 'true' || is_free === true || is_free === 1;
        const parsedPrice = parseFloat(price) || 0;
        const parsedDuration = parseInt(duration) || 60;
        const parsedTotalQuestions = parseInt(total_questions) || 0;
        const parsedTotalMarks = parseInt(total_marks) || 0;
        const parsedPassingMarks = parseInt(passing_marks) || 40;
        const parsedNegativeMarking = parseFloat(negative_marking) || 0.25;
        
        let jsonUrl = null;
        let publicId = null;
        
        // Handle JSON file upload
        if (req.file) {
            console.log('Uploading JSON to Cloudinary...');
            
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'testhub/tests',
                        public_id: `test-${id || Date.now()}-${Date.now()}`,
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
            console.log('Uploaded to Cloudinary:', jsonUrl);
        }
        
        let testId;
        
        if (id && id !== 'undefined') {
            // UPDATE existing test
            console.log('Updating existing test:', id);
            
            const [oldTest] = await db.query('SELECT json_public_id FROM tests WHERE id = ?', [id]);
            if (oldTest[0]?.json_public_id) {
                await cloudinary.uploader.destroy(oldTest[0].json_public_id, { resource_type: 'raw' });
            }
            
            await db.query(
                `UPDATE tests SET 
                    title = ?, description = ?, category_id = ?, exam_id = ?, duration = ?,
                    total_questions = ?, total_marks = ?, passing_marks = ?, negative_marking = ?,
                    is_free = ?, price = ?, language = ?, difficulty = ?, instructions = ?,
                    status = ?, json_file_url = ?, json_public_id = ?, updated_at = NOW()
                 WHERE id = ?`,
                [
                    title, description, category_id || null, exam_id || null, parsedDuration,
                    parsedTotalQuestions, parsedTotalMarks, parsedPassingMarks, parsedNegativeMarking,
                    parsedIsFree, parsedPrice, language || 'english', difficulty || 'medium',
                    instructions || '', status || 'draft', jsonUrl, publicId, id
                ]
            );
            testId = id;
        } else {
            // CREATE new test
            console.log('Creating new test...');
            
            const [result] = await db.query(
                `INSERT INTO tests (
                    title, description, category_id, exam_id, duration,
                    total_questions, total_marks, passing_marks, negative_marking,
                    is_free, price, language, difficulty, instructions,
                    status, json_file_url, json_public_id, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title, description, category_id || null, exam_id || null, parsedDuration,
                    parsedTotalQuestions, parsedTotalMarks, parsedPassingMarks, parsedNegativeMarking,
                    parsedIsFree, parsedPrice, language || 'english', difficulty || 'medium',
                    instructions || '', status || 'draft', jsonUrl, publicId, req.userId
                ]
            );
            testId = result.insertId;
        }
        
        console.log('Test saved successfully with ID:', testId);
        
        res.json({
            message: id ? 'Test updated successfully' : 'Test created successfully',
            testId: testId,
            jsonUrl: jsonUrl
        });
        
    } catch (error) {
        console.error('Error saving test:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Delete test
router.delete('/admin/:id', auth, async (req, res) => {
    try {
        const [test] = await db.query('SELECT json_public_id FROM tests WHERE id = ?', [req.params.id]);
        
        if (test[0]?.json_public_id) {
            await cloudinary.uploader.destroy(test[0].json_public_id, { resource_type: 'raw' });
        }
        
        await db.query('DELETE FROM tests WHERE id = ?', [req.params.id]);
        
        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        console.error('Error deleting test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// TEST SUBMISSION
// ============================================

// Submit test answers
router.post('/:testId/submit', auth, async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;
        const { answers, timeTaken } = req.body;
        
        const [tests] = await db.query('SELECT * FROM tests WHERE id = ?', [testId]);
        if (tests.length === 0) {
            return res.status(404).json({ message: 'Test not found' });
        }
        
        const test = tests[0];
        
        let questions = [];
        if (test.json_file_url) {
            const response = await fetch(test.json_file_url);
            const data = await response.json();
            questions = data.questions || [];
        }
        
        let correctCount = 0;
        let wrongCount = 0;
        let skippedCount = 0;
        let totalMarks = 0;
        let obtainedMarks = 0;
        
        for (const q of questions) {
            const marks = q.marks || 4;
            totalMarks += marks;
            const userAnswer = answers ? answers[q.id] : null;
            
            if (!userAnswer) {
                skippedCount++;
            } else if (userAnswer === q.correct_answer) {
                correctCount++;
                obtainedMarks += marks;
            } else {
                wrongCount++;
                const negativeMarking = test.negative_marking || 0;
                obtainedMarks -= negativeMarking;
            }
        }
        
        const attemptedCount = correctCount + wrongCount;
        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
        
        const [attempt] = await db.query(
            `INSERT INTO test_attempts 
             (user_id, test_id, start_time, end_time, time_taken, 
              total_questions, attempted_questions, correct_answers, 
              wrong_answers, skipped_questions, marks_obtained, 
              score, total_score, percentage, status)
             VALUES (?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
            [
                userId, testId, timeTaken || 0, 
                questions.length, attemptedCount, correctCount, 
                wrongCount, skippedCount, obtainedMarks,
                obtainedMarks, totalMarks, percentage
            ]
        );
        
        const attemptId = attempt.insertId;
        
        for (const q of questions) {
            const userAnswer = answers ? answers[q.id] : null;
            const isCorrect = userAnswer && userAnswer === q.correct_answer;
            
            await db.query(
                `INSERT INTO user_answers 
                 (attempt_id, question_id, selected_answer, is_correct, time_taken_seconds, marked_for_review)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [attemptId, q.id, userAnswer || null, isCorrect, 0, false]
            );
        }
        
        res.json({
            message: 'Test submitted successfully',
            attemptId,
            score: {
                obtained: obtainedMarks,
                total: totalMarks,
                percentage: Math.round(percentage),
                correct: correctCount,
                wrong: wrongCount,
                skipped: skippedCount,
                totalQuestions: questions.length
            }
        });
        
    } catch (error) {
        console.error('Error submitting test:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Get test result
router.get('/:testId/result', auth, async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.userId;
        
        const [attempts] = await db.query(
            `SELECT * FROM test_attempts 
             WHERE test_id = ? AND user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [testId, userId]
        );
        
        if (attempts.length === 0) {
            return res.status(404).json({ message: 'No attempt found' });
        }
        
        res.json(attempts[0]);
    } catch (error) {
        console.error('Error fetching result:', error);
        res.status(500).json({ message: 'Server error' });
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
        
        const [tests] = await db.query('SELECT json_file_url FROM tests WHERE id = ?', [testId]);
        
        let questions = [];
        if (tests[0]?.json_file_url) {
            const response = await fetch(tests[0].json_file_url);
            const data = await response.json();
            questions = data.questions || [];
        }
        
        const [userAnswers] = await db.query(
            `SELECT question_id, selected_answer, is_correct, time_taken_seconds, marked_for_review
             FROM user_answers WHERE attempt_id = ?`,
            [attemptId]
        );
        
        const questionsWithAnswers = questions.map(q => ({
            ...q,
            user_answer: userAnswers.find(ua => ua.question_id === q.id)?.selected_answer,
            is_correct: userAnswers.find(ua => ua.question_id === q.id)?.is_correct,
            time_taken: userAnswers.find(ua => ua.question_id === q.id)?.time_taken_seconds,
            marked_for_review: userAnswers.find(ua => ua.question_id === q.id)?.marked_for_review
        }));
        
        res.json(questionsWithAnswers);
    } catch (error) {
        console.error('Error fetching questions with answers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;