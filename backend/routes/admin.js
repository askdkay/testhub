const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const db = require('../config/database');

// 🔥 IMPORTANT: Pehle auth middleware apply karo
router.use(auth);
router.use(adminController.isAdmin);

// ============ EXISTING ROUTES (Jo pehle se the) ============
router.post('/tests', adminController.createTest);
router.post('/questions', adminController.addQuestions);
router.get('/users', adminController.getAllUsers);

// ============ NEW ROUTES (Ab add kar rahe hain) ============

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');
    
    // Users stats
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as newToday,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as activeUsers
      FROM users
    `);
    
    // Tests stats
    const [testStats] = await db.query(`
      SELECT 
        COUNT(*) as totalTests,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as activeTests
      FROM tests
    `);
    
    // Test attempts today
    const [todayTests] = await db.query(`
      SELECT COUNT(*) as testsToday
      FROM test_attempts
      WHERE DATE(created_at) = CURDATE()
    `);
    
    res.json({
      totalUsers: userStats[0]?.totalUsers || 0,
      activeUsers: userStats[0]?.activeUsers || 0,
      newToday: userStats[0]?.newToday || 0,
      totalTests: testStats[0]?.totalTests || 0,
      activeTests: testStats[0]?.activeTests || 0,
      testsToday: todayTests[0]?.testsToday || 0,
      totalRevenue: 4567890,
      monthlyRevenue: 987654,
      avgScore: 68.5,
      passRate: 72.3,
      conversionRate: 23.4,
      bounceRate: 12.5
    });
    
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    console.log('📝 Fetching recent activity...');
    
    // Mock data for now (since tables might not exist)
    const activities = [
      { id: 1, type: 'user', action: 'New registration', user: 'Rahul Sharma', time: '2 min ago', icon: '👤' },
      { id: 2, type: 'test', action: 'Test completed', user: 'Priya Patel', time: '5 min ago', icon: '📝', score: 156 },
      { id: 3, type: 'payment', action: 'Payment received', user: 'Amit Kumar', time: '10 min ago', icon: '💰', amount: 999 }
    ];
    
    res.json(activities);
    
  } catch (error) {
    console.error('❌ Error fetching activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get top students
router.get('/top-students', async (req, res) => {
  try {
    console.log('🏆 Fetching top students...');
    
    const students = [
      { id: 1, name: 'Priya Sharma', score: 98.5, tests: 45, rank: 1, avatar: '👩‍🎓' },
      { id: 2, name: 'Rahul Verma', score: 97.2, tests: 52, rank: 2, avatar: '👨‍🎓' },
      { id: 3, name: 'Amit Kumar', score: 96.8, tests: 38, rank: 3, avatar: '👨‍💼' },
      { id: 4, name: 'Neha Patel', score: 95.4, tests: 41, rank: 4, avatar: '👩‍💼' },
      { id: 5, name: 'Vikram Singh', score: 94.7, tests: 33, rank: 5, avatar: '👨‍🏫' }
    ];
    
    res.json(students);
    
  } catch (error) {
    console.error('❌ Error fetching top students:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get popular tests
router.get('/popular-tests', async (req, res) => {
  try {
    console.log('🔥 Fetching popular tests...');
    
    const tests = [
      { id: 1, name: 'SSC CGL Mock Test 2024', attempts: 15432, avgScore: 68, revenue: 876543, status: 'trending' },
      { id: 2, name: 'UPSC Prelims GS Paper I', attempts: 12345, avgScore: 72, revenue: 765432, status: 'hot' },
      { id: 3, name: 'IBPS PO Prelims 2024', attempts: 10987, avgScore: 65, revenue: 654321, status: 'new' }
    ];
    
    res.json(tests);
    
  } catch (error) {
    console.error('❌ Error fetching popular tests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent users
router.get('/recent-users', async (req, res) => {
  try {
    console.log('👥 Fetching recent users...');
    
    const users = [
      { id: 1, name: 'Rahul Sharma', email: 'rahul@email.com', exam: 'SSC CGL', joined: '2 min ago', status: 'active', avatar: '👤' },
      { id: 2, name: 'Priya Patel', email: 'priya@email.com', exam: 'UPSC', joined: '5 min ago', status: 'active', avatar: '👩' },
      { id: 3, name: 'Amit Kumar', email: 'amit@email.com', exam: 'Banking', joined: '10 min ago', status: 'inactive', avatar: '👨' }
    ];
    
    res.json(users);
    
  } catch (error) {
    console.error('❌ Error fetching recent users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get chart data
router.get('/chart-data', async (req, res) => {
  try {
    const { range } = req.query;
    console.log(`📈 Fetching chart data for range: ${range}`);
    
    // Mock data
    const data = {
      day: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        newUsers: [5, 12, 25, 42, 38, 29],
        activeUsers: [45, 78, 156, 234, 198, 167],
        testsTaken: [23, 45, 89, 134, 112, 78]
      },
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        newUsers: [45, 52, 48, 67, 89, 112, 98],
        activeUsers: [234, 289, 312, 356, 398, 423, 387],
        testsTaken: [145, 178, 192, 210, 234, 267, 245]
      },
      month: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        newUsers: [345, 412, 389, 467],
        activeUsers: [1234, 1456, 1389, 1567],
        testsTaken: [654, 723, 812, 897]
      },
      year: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        newUsers: [1234, 1456, 1678, 1890, 2100, 2345],
        activeUsers: [4567, 4789, 5123, 5456, 5789, 6123],
        testsTaken: [2345, 2567, 2789, 3012, 3234, 3456]
      }
    };
    
    res.json(data[range] || data.week);
    
  } catch (error) {
    console.error('❌ Error fetching chart data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get all users with details
router.get('/users', auth, adminController.isAdmin, async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, phone, exam_preparation, role, 
             created_at, last_login 
      FROM users 
      ORDER BY created_at DESC
    `);
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

module.exports = router;