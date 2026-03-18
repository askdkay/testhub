const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Sabse pehle environment variables load karein
dotenv.config();

const app = express();

// ✅ FIXED CORS for production (Multiple Origins Support)
const corsOptions = {
    origin: [
        'https://testhub-three.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL // Safety ke liye ise bhi rakh liya hai
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (agar koi image/pdf wagarah upload ho rahi hai)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint (Server live hai ya nahi check karne ke liye)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        env: process.env.NODE_ENV 
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Test Series API is running',
        environment: process.env.NODE_ENV,
        frontend: process.env.FRONTEND_URL || 'Not configured'
    });
});

// API Routes (Dono files ke saare routes yahan mila diye gaye hain)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/content', require('./routes/content')); 
app.use('/api/exams', require('./routes/examCategories'));
app.use('/api/examDetails', require('./routes/examDetails'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/ai-generator', require('./routes/aiGenerator'));

// 404 handler (Agar koi aisi API call kare jo hai hi nahi)
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global Error handler (Agar code mein koi issue aaye toh server crash na ho)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});