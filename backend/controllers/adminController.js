const db = require('../config/database');

// Check if user is admin
exports.isAdmin = async (req, res, next) => {
  try {
    const [users] = await db.query('SELECT role FROM users WHERE id = ?', [req.userId]);
    
    if (users.length === 0 || users[0].role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, phone, exam_preparation, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new test
exports.createTest = async (req, res) => {
  try {
    const { title, description, duration, category, is_free, price, negative_marking, passing_marks, instructions, tags } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO tests (title, description, duration, category, is_free, price, negative_marking, passing_marks, instructions, tags, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, duration, category, is_free, price || 0, negative_marking || 0.25, passing_marks || 40, instructions || '', JSON.stringify(tags || []), req.userId, 'draft']
    );
    
    res.status(201).json({ message: 'Test created successfully', testId: result.insertId });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add questions to test
exports.addQuestions = async (req, res) => {
  try {
    const { testId, questions } = req.body;
    
    for (const q of questions) {
      await db.query(
        'INSERT INTO questions (test_id, question_text, question_text_hindi, option_a, option_b, option_c, option_d, correct_answer, explanation, explanation_hindi, marks, difficulty, topic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [testId, q.question_text, q.question_text_hindi || '', q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation || '', q.explanation_hindi || '', q.marks || 4, q.difficulty || 'medium', q.topic || '']
      );
    }
    
    // Update total questions in tests table
    await db.query(
      'UPDATE tests SET total_questions = ? WHERE id = ?',
      [questions.length, testId]
    );
    
    res.json({ message: 'Questions added successfully' });
  } catch (error) {
    console.error('Error adding questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};