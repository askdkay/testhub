const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const app = express();
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const blogRoutes = require('./routes/blogs');
const examCategoryRoutes = require('./routes/examCategories');
dotenv.config();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/content', require('./routes/content'));
app.use('/api/blogs', require('./routes/blogs'));     
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/admin', require('./routes/admin'));  
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/exams', examCategoryRoutes);// New route for exams categories
app.use('/api/examDetails', require('./routes/examDetails'));
app.use('/api/ai-generator', require('./routes/aiGenerator'));


// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API is working!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Registered routes:');
    console.log('- /api/auth');
    console.log('- /api/tests');
    console.log('- /api/admin');
    console.log('- /api/content');
    console.log('- /api/blogs');
});