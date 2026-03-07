const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(auth);
router.use(adminController.isAdmin);

// Test management
router.post('/tests', adminController.createTest);
router.post('/questions', adminController.addQuestions);

// User management
router.get('/users', adminController.getAllUsers);

module.exports = router;