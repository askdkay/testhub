const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(auth);
router.use(adminController.isAdmin);

// ============================================
// TEST MANAGEMENT ROUTES
// ============================================

router.get('/tests', async (req, res) => {
  try {
    const [tests] = await db.query(`
      SELECT t.*, 
             (SELECT COUNT(*) FROM questions WHERE test_id = t.id) as total_questions 
      FROM tests t 
      ORDER BY t.created_at DESC
    `);
    res.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/test-categories', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT DISTINCT category_id FROM tests WHERE category_id IS NOT NULL');
    res.json(categories.map(c => c.category_id));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/tests/:testId/questions', async (req, res) => {
  try {
    const [questions] = await db.query(
      'SELECT * FROM questions WHERE test_id = ? ORDER BY id',
      [req.params.testId]
    );
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ FIX 1: POST /tests
router.post('/tests', async (req, res) => {
  try {
    const { 
      title, description, category_id, exam_id, difficulty,
      duration, negative_marking, passing_marks, is_free, 
      price, instructions, tags 
    } = req.body;

    // ✅ Manually generate ID
    const [testRows] = await db.query('SELECT MAX(id) as maxId FROM tests');
    const testId = (testRows[0].maxId || 0) + 1;

    await db.query(
      `INSERT INTO tests (
        id, title, description, category_id, exam_id, difficulty,
        duration, negative_marking, passing_marks, is_free,
        price, instructions, tags, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testId, title, description, category_id, exam_id, difficulty,
        duration, negative_marking, passing_marks, is_free,
        price, instructions, JSON.stringify(tags || []), req.userId
      ]
    );
    
    res.status(201).json({ 
      message: 'Test created successfully', 
      testId: testId
    });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ message: 'Server error', error: error.message || error.sqlMessage });
  }
});

router.put('/tests/:testId', async (req, res) => {
  try {
    const { title, description, category_id, exam_id, status } = req.body;
    await db.query(
      `UPDATE tests SET 
        title = ?, description = ?, category_id = ?, exam_id = ?, status = ?
       WHERE id = ?`,
      [title, description, category_id, exam_id, status, req.params.testId]
    );
    res.json({ message: 'Test updated successfully' });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ message: 'Server error', error: error.message || error.sqlMessage });
  }
});

router.delete('/tests/:testId', async (req, res) => {
  try {
    await db.query('DELETE FROM tests WHERE id = ?', [req.params.testId]);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ FIX 2: POST /tests/:testId/duplicate
router.post('/tests/:testId/duplicate', async (req, res) => {
  try {
    const [test] = await db.query('SELECT * FROM tests WHERE id = ?', [req.params.testId]);
    if (test.length === 0) return res.status(404).json({ message: 'Test not found' });
    
    const originalTest = test[0];

    // ✅ Manually generate ID for duplicated test
    const [testRows] = await db.query('SELECT MAX(id) as maxId FROM tests');
    const newTestId = (testRows[0].maxId || 0) + 1;

    await db.query(
      `INSERT INTO tests (id, title, description, duration, category_id, exam_id, price, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newTestId, `${originalTest.title} (Copy)`, originalTest.description, originalTest.duration, 
       originalTest.category_id, originalTest.exam_id, originalTest.price, 'draft', req.userId]
    );
    
    // Copy questions with manual IDs
    const [questions] = await db.query('SELECT * FROM questions WHERE test_id = ?', [req.params.testId]);
    for (const q of questions) {
      const [qRows] = await db.query('SELECT MAX(id) as maxId FROM questions');
      const newQId = (qRows[0].maxId || 0) + 1;

      await db.query(
        `INSERT INTO questions (id, test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [newQId, newTestId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    
    res.json({ message: 'Test duplicated successfully', testId: newTestId });
  } catch (error) {
    console.error('Error duplicating test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/tests/:testId/publish', async (req, res) => {
  try {
    await db.query('UPDATE tests SET status = ? WHERE id = ?', ['published', req.params.testId]);
    res.json({ message: 'Test published successfully' });
  } catch (error) {
    console.error('Error publishing test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// QUESTIONS MANAGEMENT ROUTES
// ============================================

// ✅ FIX 3: POST /questions
router.post('/questions', async (req, res) => {
  try {
    const { testId, questions } = req.body;
    
    console.log('📥 Received request to add questions:', { testId, questionsCount: questions?.length });
    
    if (!testId) return res.status(400).json({ message: 'testId is required' });
    if (!questions || !Array.isArray(questions) || questions.length === 0)
      return res.status(400).json({ message: 'questions array is required' });

    for (const q of questions) {
      // ✅ Manually generate ID for each question
      const [qRows] = await db.query('SELECT MAX(id) as maxId FROM questions');
      const qId = (qRows[0].maxId || 0) + 1;

      await db.query(
        `INSERT INTO questions (
          id, test_id, question_text, question_text_hindi,
          option_a, option_b, option_c, option_d,
          correct_answer, explanation, explanation_hindi,
          marks, difficulty, topic, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          qId, testId, 
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

    await db.query(
      'UPDATE tests SET total_questions = ? WHERE id = ?',
      [questions.length, testId]
    );

    res.json({ message: 'Questions added successfully', count: questions.length });
    
  } catch (error) {
    console.error('❌ Error adding questions:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ✅ FIX 4: POST /tests/bulk
router.post('/tests/bulk', async (req, res) => {
  try {
    console.log('📥 Received bulk test request:', JSON.stringify(req.body, null, 2));
    
    const {
      title, description, category_id, exam_id, duration, total_questions,
      total_marks, passing_marks, negative_marking, is_free,
      price, language, status, banner_image, tags, instructions
    } = req.body;

    if (!title) return res.status(400).json({ message: 'Title is required' });

    // ✅ Manually generate ID
    const [testRows] = await db.query('SELECT MAX(id) as maxId FROM tests');
    const testId = (testRows[0].maxId || 0) + 1;

    await db.query(
      `INSERT INTO tests (
        id, title, description, category_id, exam_id, duration, total_questions,
        total_marks, passing_marks, negative_marking, is_free,
        price, language, status, banner_image, tags, instructions, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testId,
        title || '', description || '', category_id || null, exam_id || null,
        duration || 60, total_questions || 0, total_marks || 0,
        passing_marks || 40, negative_marking || 0.25, is_free || false,
        price || 0, language || 'english', status || 'draft', banner_image || null,
        tags ? JSON.stringify(tags) : JSON.stringify([]),
        instructions || '', req.userId
      ]
    );

    res.status(201).json({ message: 'Test created successfully', testId: testId });
    
  } catch (error) {
    console.error('❌ Error creating test:', error);
    res.status(500).json({ message: 'Server error', error: error.sqlMessage || error.message });
  }
});

// ✅ FIX 5: POST /questions/bulk
router.post('/questions/bulk', async (req, res) => {
  try {
    console.log('📥 Received bulk questions request:', JSON.stringify(req.body, null, 2));
    
    const { testId, questions } = req.body;

    if (!testId) return res.status(400).json({ message: 'testId is required' });
    if (!questions || !Array.isArray(questions)) return res.status(400).json({ message: 'questions array is required' });
    if (questions.length === 0) return res.json({ message: 'No questions to add', count: 0 });

    let addedCount = 0;
    const errors = [];

    for (const q of questions) {
      try {
        // ✅ Manually generate ID for each question
        const [qRows] = await db.query('SELECT MAX(id) as maxId FROM questions');
        const qId = (qRows[0].maxId || 0) + 1;

        await db.query(
          `INSERT INTO questions (
            id, test_id, question_text, question_text_hindi,
            option_a, option_b, option_c, option_d,
            correct_answer, explanation, explanation_hindi,
            marks, difficulty, topic, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            qId, testId, q.question_text || '', q.question_text_hindi || null,
            q.option_a || '', q.option_b || '', q.option_c || '', q.option_d || '',
            q.correct_answer || 'A', q.explanation || null, q.explanation_hindi || null,
            q.marks || 4, q.difficulty || 'medium', q.topic || null, q.image_url || null
          ]
        );
        addedCount++;
      } catch (qError) {
        console.error('❌ Error adding individual question:', qError);
        errors.push(qError.message);
      }
    }

    if (addedCount > 0) {
      await db.query('UPDATE tests SET total_questions = ? WHERE id = ?', [addedCount, testId]);
    }

    res.json({ 
      message: 'Questions added successfully',
      count: addedCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('❌ Error adding questions:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

router.get('/users', async (req, res) => {
  try {
    const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'last_login'");
    const hasLastLogin = columns.length > 0;
    
    let query = hasLastLogin 
      ? `SELECT id, name, email, phone, exam_preparation, role, created_at, last_login FROM users ORDER BY created_at DESC`
      : `SELECT id, name, email, phone, exam_preparation, role, created_at FROM users ORDER BY created_at DESC`;
    
    const [users] = await db.query(query);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user-stats', async (req, res) => {
  try {
    const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
    const [todayUsers] = await db.query(`SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()`);
    const [weekUsers] = await db.query(`SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`);
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
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

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
      console.log('Optional tables not found, using defaults.');
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
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/recent-activity', async (req, res) => {
  try {
    const activity = [
      { type: 'user', message: 'New user registered: Rahul Sharma', time: '2 min ago' },
      { type: 'test', message: 'Test completed: SSC CGL Mock Test', time: '5 min ago' },
      { type: 'payment', message: 'Payment received: ₹499', time: '10 min ago' },
    ];
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    res.json([
      { type: 'user', message: 'Weekly activity data', time: 'now' },
      { type: 'test', message: 'Test performance data', time: 'now' },
    ]);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;