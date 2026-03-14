const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// ✅ IMPORT ADMIN CONTROLLER
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(auth);
router.use(adminController.isAdmin);

// ============================================
// TEST MANAGEMENT ROUTES
// ============================================

// Get all tests with details
router.get('/tests', auth, adminController.isAdmin, async (req, res) => {
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

// Get all categories
router.get('/test-categories', auth, adminController.isAdmin, async (req, res) => {
  try {
    const [categories] = await db.query('SELECT DISTINCT category FROM tests');
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get questions for a specific test
router.get('/tests/:testId/questions', auth, adminController.isAdmin, async (req, res) => {
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

// Create new test
router.post('/tests', adminController.createTest);

// Update test
router.put('/tests/:testId', auth, adminController.isAdmin, async (req, res) => {
  try {
    const { title, description, duration, category, price, status } = req.body;
    await db.query(
      'UPDATE tests SET title = ?, description = ?, duration = ?, category = ?, price = ?, status = ? WHERE id = ?',
      [title, description, duration, category, price, status, req.params.testId]
    );
    res.json({ message: 'Test updated successfully' });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete test
router.delete('/tests/:testId', auth, adminController.isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM tests WHERE id = ?', [req.params.testId]);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Duplicate test
router.post('/tests/:testId/duplicate', auth, adminController.isAdmin, async (req, res) => {
  try {
    const [test] = await db.query('SELECT * FROM tests WHERE id = ?', [req.params.testId]);
    const originalTest = test[0];
    
    const [result] = await db.query(
      'INSERT INTO tests (title, description, duration, category, price, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [`${originalTest.title} (Copy)`, originalTest.description, originalTest.duration, 
       originalTest.category, originalTest.price, 'draft', req.userId]
    );
    
    // Copy questions
    const [questions] = await db.query('SELECT * FROM questions WHERE test_id = ?', [req.params.testId]);
    for (const q of questions) {
      await db.query(
        'INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [result.insertId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
      );
    }
    
    res.json({ message: 'Test duplicated successfully', testId: result.insertId });
  } catch (error) {
    console.error('Error duplicating test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Publish test
router.post('/tests/:testId/publish', auth, adminController.isAdmin, async (req, res) => {
  try {
    const { testId } = req.params;
    
    await db.query(
      'UPDATE tests SET status = ? WHERE id = ?',
      ['published', testId]
    );
    
    res.json({ message: 'Test published successfully' });
    
  } catch (error) {
    console.error('Error publishing test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// QUESTIONS MANAGEMENT ROUTES
// ============================================

// Add questions to test
router.post('/questions', auth, adminController.isAdmin, async (req, res) => {
  try {
    const { testId, questions } = req.body;
    
    // Debug log
    console.log('📥 Received request to add questions:', { testId, questionsCount: questions?.length });
    
    if (!testId) {
      return res.status(400).json({ message: 'testId is required' });
    }
    
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

    // Update total questions count
    await db.query(
      'UPDATE tests SET total_questions = ? WHERE id = ?',
      [questions.length, testId]
    );

    res.json({ 
      message: 'Questions added successfully',
      count: questions.length 
    });
    
  } catch (error) {
    console.error('❌ Error adding questions:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Bulk create test - FIXED VERSION
router.post('/tests/bulk', auth, adminController.isAdmin, async (req, res) => {
  try {
    console.log('📥 Received bulk test request:', JSON.stringify(req.body, null, 2));
    
    const {
      title, description, category, duration, total_questions,
      total_marks, passing_marks, negative_marking, is_free,
      price, language, status, banner_image, tags, instructions
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Set default values
    const testData = {
      title: title || '',
      description: description || '',
      category: category || 'General',
      duration: duration || 60,
      total_questions: total_questions || 0,
      total_marks: total_marks || 0,
      passing_marks: passing_marks || 40,
      negative_marking: negative_marking || 0.25,
      is_free: is_free || false,
      price: price || 0,
      language: language || 'english',
      status: status || 'draft',
      banner_image: banner_image || null,
      tags: tags ? JSON.stringify(tags) : JSON.stringify([]),
      instructions: instructions || '',
      created_by: req.userId
    };

    console.log('📤 Inserting test data:', testData);

    // Simple INSERT query with explicit column names
    const query = `
      INSERT INTO tests (
        title, description, category, duration, total_questions,
        total_marks, passing_marks, negative_marking, is_free,
        price, language, status, banner_image, tags, instructions,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      testData.title,
      testData.description,
      testData.category,
      testData.duration,
      testData.total_questions,
      testData.total_marks,
      testData.passing_marks,
      testData.negative_marking,
      testData.is_free,
      testData.price,
      testData.language,
      testData.status,
      testData.banner_image,
      testData.tags,
      testData.instructions,
      testData.created_by
    ];

    console.log('Executing query with values:', values);
    
    const [result] = await db.query(query, values);

    console.log('✅ Test created with ID:', result.insertId);

    res.status(201).json({ 
      message: 'Test created successfully', 
      testId: result.insertId 
    });
    
  } catch (error) {
    console.error('❌ Error creating test:', error);
    console.error('SQL Error:', error.sql);
    console.error('SQL Message:', error.sqlMessage);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.sqlMessage || error.message 
    });
  }
});

// Bulk create questions - FIXED VERSION
router.post('/questions/bulk', auth, adminController.isAdmin, async (req, res) => {
  try {
    console.log('📥 Received bulk questions request:', JSON.stringify(req.body, null, 2));
    
    const { testId, questions } = req.body;

    // Validation
    if (!testId) {
      return res.status(400).json({ message: 'testId is required' });
    }

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'questions array is required' });
    }

    if (questions.length === 0) {
      return res.json({ message: 'No questions to add', count: 0 });
    }

    let addedCount = 0;
    const errors = [];

    for (const q of questions) {
      try {
        const query = `
          INSERT INTO questions (
            test_id, question_text, question_text_hindi,
            option_a, option_b, option_c, option_d,
            correct_answer, explanation, explanation_hindi,
            marks, difficulty, topic, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
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
        ];

        await db.query(query, values);
        addedCount++;
        
      } catch (qError) {
        console.error('❌ Error adding individual question:', qError);
        errors.push(qError.message);
      }
    }

    // Update total questions count in tests table
    if (addedCount > 0) {
      await db.query(
        'UPDATE tests SET total_questions = ? WHERE id = ?',
        [addedCount, testId]
      );
    }

    console.log(`✅ Added ${addedCount} questions to test ${testId}`);

    res.json({ 
      message: 'Questions added successfully',
      count: addedCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('❌ Error adding questions:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
  }
});

// Get all users - FIXED VERSION
router.get('/users', auth, adminController.isAdmin, async (req, res) => {
  try {
    // Check if last_login column exists
    const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'last_login'");
    const hasLastLogin = columns.length > 0;
    
    let query;
    if (hasLastLogin) {
      query = `
        SELECT id, name, email, phone, exam_preparation, role, 
               created_at, last_login 
        FROM users 
        ORDER BY created_at DESC
      `;
    } else {
      query = `
        SELECT id, name, email, phone, exam_preparation, role, 
               created_at 
        FROM users 
        ORDER BY created_at DESC
      `;
    }
    
    const [users] = await db.query(query);
    res.json(users);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/user-stats', auth, adminController.isAdmin, async (req, res) => {
  try {
    // Total users
    const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Users joined today
    const [todayUsers] = await db.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE DATE(created_at) = CURDATE()
    `);
    
    // Users joined this week
    const [weekUsers] = await db.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    // Exam preparation distribution
    const [examDist] = await db.query(`
      SELECT exam_preparation, COUNT(*) as count 
      FROM users 
      WHERE exam_preparation IS NOT NULL 
      GROUP BY exam_preparation
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

// Get dashboard stats
router.get('/stats', auth, adminController.isAdmin, async (req, res) => {
  try {
    const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users');
    const [totalTests] = await db.query('SELECT COUNT(*) as count FROM tests');
    const [activeTests] = await db.query("SELECT COUNT(*) as count FROM tests WHERE status = 'published'");
    const [newToday] = await db.query("SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()");
    const [testsToday] = await db.query("SELECT COUNT(*) as count FROM test_attempts WHERE DATE(created_at) = CURDATE()");
    
    // Revenue calculation (if you have payments table)
    const [revenue] = await db.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success'");
    
    res.json({
      totalUsers: totalUsers[0].count,
      activeTests: activeTests[0].count,
      totalRevenue: revenue[0].total,
      newToday: newToday[0].count,
      testsTakenToday: testsToday[0].count,
      avgScore: 68.5, // Calculate from your data
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent activity
router.get('/recent-activity', auth, adminController.isAdmin, async (req, res) => {
  try {
    // Mock data for now - replace with actual queries
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

// Get analytics data
router.get('/analytics', auth, adminController.isAdmin, async (req, res) => {
  try {
    // Mock data for charts
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