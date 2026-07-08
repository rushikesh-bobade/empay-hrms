const express = require('express');
const router = express.Router();
const payslipController = require('./payslip.controller');
const authMiddleware = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.use(authMiddleware);

router.post('/bulk-export', roleGuard(['admin', 'payroll_officer']), payslipController.bulkExport);

module.exports = router;
