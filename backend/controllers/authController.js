const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Register user
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, exam_preparation } = req.body;
        
        console.log('Registration attempt:', { name, email, phone, exam_preparation });
        
        // Check if user exists
        const [existing] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Insert user (without password hash for simplicity)
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, phone, exam_preparation, role) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, password, phone || null, exam_preparation || null, 'student']
        );
        
        console.log('User created with ID:', result.insertId);
        
        // Create token
        const token = jwt.sign(
            { id: result.insertId, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token, 
            user: { 
                id: result.insertId, 
                name, 
                email,
                phone,
                exam_preparation,
                role: 'student'
            } 
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt:', { email, password });
        
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Direct password comparison (since we're not hashing)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email,
                role: user.role 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};