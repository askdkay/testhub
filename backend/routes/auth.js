const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ DATABASE CONNECTION IMPORT
const db = require('../config/database');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, exam_preparation } = req.body;
        
        console.log('Registration attempt:', { name, email, phone, exam_preparation });
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email and password are required' 
            });
        }
        
        // Check if user exists
        const [existing] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, phone, exam_preparation, role) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone || null, exam_preparation || null, 'student']
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
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt:', email);
        
        // Check if user exists
        const [users] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Compare password
        let validPassword = false;
        
        // Check if password is bcrypt hash ya plain text
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            validPassword = await bcrypt.compare(password, user.password);
        } else {
            // Plain text comparison (temporary for admin)
            validPassword = (password === user.password);
        }
        
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // ✅ UPDATE LAST LOGIN
        try {
            // Check if last_login column exists
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
        
        // Create token
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

// ✅ NAYA ROUTE: SOCIAL LOGIN (Google & Phone OTP)
router.post('/social-login', async (req, res) => {
    try {
        const { email, name, phone, provider, uid } = req.body;
        
        console.log(`Social Login attempt (${provider}):`, email || phone);

        if (!email && !phone) {
            return res.status(400).json({ message: 'Email or phone is required' });
        }

        // Search query banayein (Email ya Phone ke base par)
        let query, queryParam;
        if (email) {
            query = 'SELECT * FROM users WHERE email = ?';
            queryParam = email;
        } else {
            query = 'SELECT * FROM users WHERE phone = ?';
            queryParam = phone;
        }

        // 1. Check karo ki user pehle se database me hai ya nahi
        const [users] = await db.query(query, [queryParam]);
        let user;

        if (users.length > 0) {
            // USER MIL GAYA
            user = users[0];
            
            // Last login update kar do (purane login code ki tarah)
            try {
                const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'last_login'");
                if (columns.length > 0) {
                    await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
                }
            } catch (e) {}
            
        } else {
            // USER NAHI MILA (Naya Account Banao)
            // MySQL ko password field me kuch chahiye hota hai, toh random hash de diya
            const randomPassword = Math.random().toString(36).slice(-10);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            
            const insertName = name || 'Student';
            const insertEmail = email || `${phone}@temp.com`;
            const insertPhone = phone || null;

            const [result] = await db.query(
                'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
                [insertName, insertEmail, hashedPassword, insertPhone, 'student']
            );
            
            console.log('New social user created with ID:', result.insertId);
            
            // Naye banaye hue user ka data wapas nikal lo
            const [newUsers] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = newUsers[0];
        }

        // 2. Apne backend ka JWT token generate karo
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // 3. Frontend ko response bhej do
        res.json({ 
            success: true, // Frontend yahi check kar raha hai success: true
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
        console.error('Social Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during social login', error: error.message });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, phone, exam_preparation, role, created_at, last_login FROM users WHERE id = ?',
            [req.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ CHECK SESSION ROUTE (Yeh Frontend ke refresh ke liye zaroori hai)
router.get('/verify', auth, async (req, res) => {
    try {
        // auth middleware ne token verify kar liya hai aur req.userId set kar diya hai
        const [users] = await db.query(
            'SELECT id, name, email, phone, role, exam_preparation FROM users WHERE id = ?',
            [req.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ valid: false, message: 'User not found' });
        }
        
        // Frontend ko { valid: true } chahiye isiliye aise bhej rahe hain
        res.json({ 
            valid: true, 
            user: users[0] 
        });
    } catch (error) {
        console.error('Session check error:', error);
        res.status(500).json({ valid: false, message: 'Server error' });
    }
});

// module.exports = router; // Yeh tumhari file ke end mein already hoga
module.exports = router;