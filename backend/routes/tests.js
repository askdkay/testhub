const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', testController.getAllTests);
router.get('/:id', auth, testController.getTestById);

module.exports = router;