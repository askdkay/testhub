const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(auth);
router.use(adminController.isAdmin);
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
// ============================================
// TEST MANAGEMENT ROUTES
// ============================================

// ✅ CREATE NEW TEST - YEH ROUTE MISSING THA
router.post('/tests', async (req, res) => {
    try {
        console.log('📥 Creating test:', req.body);
        
        const {
            title,
            description,
            category_id,
            exam_id,
            duration,
            total_questions,
            total_marks,
            passing_marks,
            negative_marking,
            is_free,
            price,
            language,
            instructions,
            tags,
            status = 'draft'
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO tests (
                title, description, category_id, exam_id, duration,
                total_questions, total_marks, passing_marks, negative_marking,
                is_free, price, language, instructions, tags, status, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title || '',
                description || '',
                category_id || null,
                exam_id || null,
                duration || 60,
                total_questions || 0,
                total_marks || 0,
                passing_marks || 40,
                negative_marking || 0.25,
                is_free || true,
                price || 0,
                language || 'english',
                instructions || '',
                JSON.stringify(tags || []),
                status,
                req.userId
            ]
        );

        // console.log('✅ Test created with ID:', result.insertId);

        res.status(201).json({
            message: 'Test created successfully',
            testId: result.insertId
        });

    } catch (error) {
        console.error('❌ Error creating test:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Get all tests (with optional exam_id filter)
// Get all tests (with optional exam_id filter) - FIXED
router.get('/tests', async (req, res) => {
    try {
        const { exam_id } = req.query;
        let query = `
            SELECT t.*, 
                   t.total_questions as total_questions
            FROM tests t
            WHERE 1=1
        `;
        const params = [];
        
        if (exam_id) {
            query += ` AND t.exam_id = ?`;
            params.push(exam_id);
        }
        
        query += ` ORDER BY t.created_at DESC`;
        
        const [tests] = await db.query(query, params);
        res.json(tests);
    } catch (error) {
        // console.error('Error fetching tests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single test by ID with questions
router.get('/tests/:id', async (req, res) => {
    try {
        const [tests] = await db.query('SELECT * FROM tests WHERE id = ?', [req.params.id]);
        
        if (tests.length === 0) {
            return res.status(404).json({ message: 'Test not found' });
        }
        
        const [questions] = await db.query('SELECT * FROM questions WHERE test_id = ? ORDER BY id', [req.params.id]);
        
        res.json({
            ...tests[0],
            questions: questions
        });
    } catch (error) {
        // console.error('Error fetching test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get questions for a test
router.get('/tests/:id/questions', async (req, res) => {
    try {
        const [questions] = await db.query('SELECT * FROM questions WHERE test_id = ? ORDER BY id', [req.params.id]);
        res.json(questions);
    } catch (error) {
        // console.error('Error fetching questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update test
router.put('/tests/:id', async (req, res) => {
    try {
        const { title, description, duration, price, is_free, passing_marks, negative_marking, status } = req.body;
        
        await db.query(
            `UPDATE tests SET 
                title = ?, description = ?, duration = ?, price = ?, 
                is_free = ?, passing_marks = ?, negative_marking = ?, status = ?
             WHERE id = ?`,
            [title, description, duration, price, is_free, passing_marks, negative_marking, status, req.params.id]
        );
        
        res.json({ message: 'Test updated successfully' });
    } catch (error) {
        // console.error('Error updating test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete all questions of a test
router.delete('/tests/:id/questions', async (req, res) => {
    try {
        await db.query('DELETE FROM questions WHERE test_id = ?', [req.params.id]);
        
        // Update total_questions count
        await db.query('UPDATE tests SET total_questions = 0 WHERE id = ?', [req.params.id]);
        
        res.json({ message: 'Questions deleted successfully' });
    } catch (error) {
        // console.error('Error deleting questions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete test
router.delete('/tests/:testId', async (req, res) => {
    try {
        await db.query('DELETE FROM tests WHERE id = ?', [req.params.testId]);
        res.json({ message: 'Test deleted successfully' });
    } catch (error) {
        // console.error('Error deleting test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Duplicate test
router.post('/tests/:testId/duplicate', async (req, res) => {
    try {
        const [test] = await db.query('SELECT * FROM tests WHERE id = ?', [req.params.testId]);
        if (test.length === 0) return res.status(404).json({ message: 'Test not found' });
        
        const originalTest = test[0];
        
        const [result] = await db.query(
            `INSERT INTO tests (title, description, duration, category_id, exam_id, price, status, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [`${originalTest.title} (Copy)`, originalTest.description, originalTest.duration, 
             originalTest.category_id, originalTest.exam_id, originalTest.price, 'draft', req.userId]
        );
        
        // Copy questions
        const [questions] = await db.query('SELECT * FROM questions WHERE test_id = ?', [req.params.testId]);
        for (const q of questions) {
            await db.query(
                `INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [result.insertId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
            );
        }
        
        res.json({ message: 'Test duplicated successfully', testId: result.insertId });
    } catch (error) {
        // console.error('Error duplicating test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Publish test
router.post('/tests/:testId/publish', async (req, res) => {
    try {
        await db.query('UPDATE tests SET status = ? WHERE id = ?', ['published', req.params.testId]);
        res.json({ message: 'Test published successfully' });
    } catch (error) {
        // console.error('Error publishing test:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// QUESTIONS MANAGEMENT ROUTES
// ============================================

// Add questions to test
router.post('/questions', async (req, res) => {
    try {
        const { testId, questions } = req.body;
        
        if (!testId) return res.status(400).json({ message: 'testId is required' });
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'questions array is required' });
        }

        for (const q of questions) {
            await db.query(
                `INSERT INTO questions (
                    test_id, question_text, question_text_hindi,
                    option_a, option_b, option_c, option_d,
                    correct_answer, explanation, explanation_hindi,
                    marks, difficulty, topic, image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    testId, 
                    q.question_text || '',
                    q.question_text_hindi || null,
                    q.option_a || '',
                    q.option_b || '',
                    q.option_c || '',
                    q.option_d || '',
                    q.correct_answer || 'A',
                    q.explanation || null,
                    q.explanation_hindi || null,
                    q.marks || 4,
                    q.difficulty || 'medium',
                    q.topic || null,
                    q.image_url || null
                ]
            );
        }

        await db.query('UPDATE tests SET total_questions = ? WHERE id = ?', [questions.length, testId]);
        res.json({ message: 'Questions added successfully', count: questions.length });
    } catch (error) {
        // console.error('Error adding questions:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Bulk create test
// Bulk create test from JSON (Upload to Cloudinary)
router.post('/tests/bulk', upload.single('jsonFile'), async (req, res) => {
    try {
        console.log('📥 Bulk test request received');
        
        if (!req.file) {
            return res.status(400).json({ message: 'No JSON file uploaded' });
        }
        
        // Parse JSON file
        let testData;
        try {
            const jsonString = req.file.buffer.toString('utf8');
            testData = JSON.parse(jsonString);
            console.log('✅ JSON parsed successfully');
        } catch (err) {
            return res.status(400).json({ message: 'Invalid JSON format: ' + err.message });
        }
        
        // Validate JSON structure
        if (!testData.test || !testData.test.title) {
            return res.status(400).json({ message: 'JSON must contain "test" object with "title"' });
        }
        
        if (!testData.questions || !Array.isArray(testData.questions) || testData.questions.length === 0) {
            return res.status(400).json({ message: 'JSON must contain "questions" array' });
        }
        
        const { test, questions } = testData;
        
        // Upload JSON to Cloudinary
        console.log('📤 Uploading JSON to Cloudinary...');
        
        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'testhub/tests',
                    public_id: `bulk-test-${Date.now()}`,
                    resource_type: 'raw'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });
        
        const jsonUrl = uploadResult.secure_url;
        const publicId = uploadResult.public_id;
        console.log('✅ Uploaded to Cloudinary:', jsonUrl);
        
        // Calculate totals
        const totalQuestions = questions.length;
        const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 4), 0);
        
        // Insert into database
        const [result] = await db.query(
            `INSERT INTO tests (
                title, description, category_id, exam_id, duration,
                total_questions, total_marks, passing_marks, negative_marking,
                is_free, price, language, difficulty, instructions,
                status, json_file_url, json_public_id, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                test.title,
                test.description || '',
                test.category_id || null,
                test.exam_id || null,
                test.duration || 60,
                totalQuestions,
                totalMarks,
                test.passing_marks || 40,
                test.negative_marking || 0.25,
                test.is_free || false,
                test.price || 0,
                test.language || 'english',
                test.difficulty || 'medium',
                test.instructions || '',
                'draft',
                jsonUrl,
                publicId,
                req.userId
            ]
        );
        
        const testId = result.insertId;
        
        console.log('✅ Test created in database with ID:', testId);
        
        res.status(201).json({
            message: 'Test imported successfully to Cloudinary',
            testId: testId,
            jsonUrl: jsonUrl,
            questionCount: totalQuestions
        });
        
    } catch (error) {
        // console.error('❌ Error in bulk import:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Bulk create questions
router.post('/questions/bulk', async (req, res) => {
    try {
        const { testId, questions } = req.body;

        if (!testId) return res.status(400).json({ message: 'testId is required' });
        if (!questions || !Array.isArray(questions)) return res.status(400).json({ message: 'questions array is required' });
        if (questions.length === 0) return res.json({ message: 'No questions to add', count: 0 });

        let addedCount = 0;
        for (const q of questions) {
            await db.query(
                `INSERT INTO questions (
                    test_id, question_text, question_text_hindi,
                    option_a, option_b, option_c, option_d,
                    correct_answer, explanation, explanation_hindi,
                    marks, difficulty, topic, image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    testId, q.question_text || '', q.question_text_hindi || null,
                    q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || '',
                    q.correct_answer || 'A', q.explanation || null, q.explanation_hindi || null,
                    q.marks || 4, q.difficulty || 'medium', q.topic || null, q.image_url || null
                ]
            );
            addedCount++;
        }

        if (addedCount > 0) {
            await db.query('UPDATE tests SET total_questions = ? WHERE id = ?', [addedCount, testId]);
        }

        res.json({ message: 'Questions added successfully', count: addedCount });
    } catch (error) {
        // console.error('Error adding questions:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

// Get all users
// Get all users
router.get('/users', async (req, res) => {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'last_login'");
        const hasLastLogin = columns.length > 0;
        
        // ✅ Added profile_image, first_name, last_name columns
        let query = hasLastLogin 
            ? `SELECT id, name, first_name, last_name, email, phone, exam_preparation, role, profile_image, created_at, last_login FROM users ORDER BY created_at DESC`
            : `SELECT id, name, first_name, last_name, email, phone, exam_preparation, role, profile_image, created_at FROM users ORDER BY created_at DESC`;
        
        const [users] = await db.query(query);
        
        // Format response to include full name from first_name + last_name
        const formattedUsers = users.map(user => ({
            ...user,
            name: user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}` 
                : (user.name || user.first_name || 'User')
        }));
        
        res.json(formattedUsers);
    } catch (error) {
        // console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user statistics
router.get('/user-stats', async (req, res) => {
    try {
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
        const [todayUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()');
        const [weekUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
        const [examDist] = await db.query(`
            SELECT exam_preparation, COUNT(*) as count 
            FROM users WHERE exam_preparation IS NOT NULL GROUP BY exam_preparation
        `);
        
        res.json({
            totalUsers: totalUsers[0].count,
            activeToday: todayUsers[0].count,
            newThisWeek: weekUsers[0].count,
            examDistribution: examDist
        });
    } catch (error) {
        // console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
        const [totalTests] = await db.query('SELECT COUNT(*) as count FROM tests');
        const [activeTests] = await db.query("SELECT COUNT(*) as count FROM tests WHERE status = 'published'");
        const [newToday] = await db.query("SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()");
        
        let testsTakenToday = 0;
        let totalRevenue = 0;

        try {
            const [testsToday] = await db.query("SELECT COUNT(*) as count FROM test_attempts WHERE DATE(created_at) = CURDATE()");
            testsTakenToday = testsToday[0].count;
            const [revenue] = await db.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success'");
            totalRevenue = revenue[0].total;
        } catch(e) {
            console.log('Optional tables (test_attempts, payments) might not exist yet.');
        }
        
        res.json({
            totalUsers: totalUsers[0].count,
            activeTests: activeTests[0].count,
            totalRevenue: totalRevenue,
            newToday: newToday[0].count,
            testsTakenToday: testsTakenToday,
            avgScore: 68.5,
        });
    } catch (error) {
        // console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
    try {
        const activity = [
            { type: 'user', message: 'New user registered: Rahul Sharma', time: '2 min ago' },
            { type: 'test', message: 'Test completed: SSC CGL Mock Test', time: '5 min ago' },
            { type: 'payment', message: 'Payment received: ₹499', time: '10 min ago' },
        ];
        res.json(activity);
    } catch (error) {
        // console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
    try {
        res.json([
            { type: 'user', message: 'Weekly activity data', time: 'now' },
            { type: 'test', message: 'Test performance data', time: 'now' },
        ]);
    } catch (error) {
        // console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;