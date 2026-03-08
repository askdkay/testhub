const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// 1. Environment variables load karo
dotenv.config();

// 2. Database se connect karo
connectDB();

const app = express();

// 3. CORS Configuration (Taki frontend se request block na ho)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://your-frontend.netlify.app' // Jab deploy karoge tab ye kaam aayega
];

app.use(cors({
  origin: function(origin, callback) {
    // Mobile apps ya curl jaise tools ke liye allow karo
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// 4. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Saare Routes (Ensure karna ki ye files routes folder mein hain)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/admin', require('./routes/admin'));

// 6. Health check & Root route
app.get('/', (req, res) => {
    res.json({ message: 'API is working!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 7. Server Start
const PORT = process.env.PORT || 5000;
const mode = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${mode} mode on http://localhost:${PORT}`);
});