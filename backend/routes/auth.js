const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('../config/database');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, exam_preparation } = req.body;
        
        console.log('Registration attempt:', { name, email, phone, exam_preparation });
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email and password are required' 
            });
        }
        
        const [existing] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // ✅ ID manually generate kar rahe hain (TiDB AUTO_INCREMENT support nahi karta)
        const [rows] = await db.query('SELECT MAX(id) as maxId FROM users');
        const newId = (rows[0].maxId || 0) + 1;
        
        const [result] = await db.query(
            'INSERT INTO users (id, name, email, password, phone, exam_preparation, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [newId, name, email, hashedPassword, phone || null, exam_preparation || null, 'student']
        );
        
        console.log('User created with ID:', newId);
        
        const token = jwt.sign(
            { id: newId, email: email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token, 
            user: { 
                id: newId, 
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
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt:', email);
        
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        let validPassword = false;
        
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            validPassword = await bcrypt.compare(password, user.password);
        } else {
            validPassword = (password === user.password);
        }
        
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        try {
            const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'last_login'");
            if (columns.length > 0) {
                await db.query(
                    'UPDATE users SET last_login = NOW() WHERE id = ?',
                    [user.id]
                );
            }
        } catch (loginErr) {
            console.log('Last login update skipped:', loginErr.message);
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
                phone: user.phone,
                role: user.role,
                exam_preparation: user.exam_preparation
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;