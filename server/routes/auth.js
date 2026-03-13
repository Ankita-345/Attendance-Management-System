const express = require('express');
const router = express.Router();
const { login, logout, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.post('/reset-password', protect, resetPassword);

module.exports = router;