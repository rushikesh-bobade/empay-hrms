const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

// POST /api/auth/register - Admin and HR only
router.post('/register', authMiddleware, roleGuard(['admin', 'hr_officer']), authController.register);

// POST /api/auth/register-company - Public (New Company Signup)
router.post('/register-company', authController.registerCompany);

// POST /api/auth/login - Public
router.post('/login', authController.login);

// GET /api/auth/me - Authenticated
router.get('/me', authMiddleware, authController.getMe);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

// POST /api/auth/test-email - Admin only
router.post('/test-email', authMiddleware, roleGuard(['admin']), authController.testEmail);

module.exports = router;
