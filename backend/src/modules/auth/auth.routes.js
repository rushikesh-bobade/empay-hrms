const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

// POST /api/auth/register — Admin only
router.post('/register', auth, roleGuard(['admin']), authController.register);

// POST /api/auth/login — Public
router.post('/login', authController.login);

// GET /api/auth/me — Authenticated
router.get('/me', auth, authController.getMe);

module.exports = router;
