const express = require('express');
const router = express.Router();
const settingsController = require('./settings.controller');
const authMiddleware = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

// GET /api/settings
router.get('/', authMiddleware, settingsController.getAll);

// PUT /api/settings
router.put('/', authMiddleware, roleGuard(['admin']), settingsController.update);

// GET /api/settings/db-stats
router.get('/db-stats', authMiddleware, roleGuard(['admin']), settingsController.getDbStats);

module.exports = router;
