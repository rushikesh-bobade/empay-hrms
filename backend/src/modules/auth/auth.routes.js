const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

// POST /api/auth/register - Admin and HR only
router.post('/register', authMiddleware, roleGuard(['admin', 'hr_officer']), authController.register);

// POST /api/auth/login - Public
router.post('/login', authController.login);

// GET /api/auth/me - Authenticated
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
