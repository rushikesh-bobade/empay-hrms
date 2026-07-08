const express = require('express');
const router = express.Router();
const twoFactorController = require('./twoFactor.controller');
const authMiddleware = require('../../middleware/auth');

router.use(authMiddleware);

router.post('/setup', twoFactorController.setup);
router.post('/verify', twoFactorController.verify);
router.post('/disable', twoFactorController.disable);

module.exports = router;
