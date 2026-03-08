const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// MongoDB Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  exam_preparation: String,
  role: { type: String, default: 'student' },
  created_at: { type: Date, default: Date.now },
  last_login: Date
});

const TestSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: Number,
  category: String,
  is_free: Boolean,
  price: Number,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now }
});

const QuestionSchema = new mongoose.Schema({
  test_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  question_text: String,
  option_a: String,
  option_b: String,
  option_c: String,
  option_d: String,
  correct_answer: String,
  explanation: String,
  marks: { type: Number, default: 4 }
});

const User = mongoose.model('User', UserSchema);
const Test = mongoose.model('Test', TestSchema);
const Question = mongoose.model('Question', QuestionSchema);

async function migrate() {
  try {
    // Connect to MySQL
    const mysqlConn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'your_password',
      database: 'test_series_db'
    });

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Connected to both databases');

    // Migrate Users
    const [mysqlUsers] = await mysqlConn.execute('SELECT * FROM users');
    for (const user of mysqlUsers) {
      await User.create(user);
    }
    console.log(`Migrated ${mysqlUsers.length} users`);

    // Migrate Tests
    const [mysqlTests] = await mysqlConn.execute('SELECT * FROM tests');
    for (const test of mysqlTests) {
      await Test.create(test);
    }
    console.log(`Migrated ${mysqlTests.length} tests`);

    // Migrate Questions
    const [mysqlQuestions] = await mysqlConn.execute('SELECT * FROM questions');
    for (const q of mysqlQuestions) {
      await Question.create(q);
    }
    console.log(`Migrated ${mysqlQuestions.length} questions`);

    console.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();