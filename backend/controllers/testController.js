const db = require('../config/database');

// Saare tests fetch karo
exports.getAllTests = async (req, res) => {
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
};

// Ek test ki details fetch karo (questions ke saath)
exports.getTestById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Test details
        const [tests] = await db.query('SELECT * FROM tests WHERE id = ?', [id]);
        
        if (tests.length === 0) {
            return res.status(404).json({ message: 'Test not found' });
        }
        
        // Test ke saare questions
        const [questions] = await db.query(
            'SELECT id, question_text, option_a, option_b, option_c, option_d, correct_answer FROM questions WHERE test_id = ?',
            [id]
        );
        
        res.json({
            ...tests[0],
            questions: questions || []
        });
    } catch (error) {
        console.error('Error fetching test:', error);
        res.status(500).json({ message: 'Server error' });
    }
};