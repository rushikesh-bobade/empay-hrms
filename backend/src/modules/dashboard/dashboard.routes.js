const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.get('/admin', auth, roleGuard(['admin']), async (req, res) => {
  try {
    const data = await dashboardController.getAdminDashboard();
    res.json({ success: true, message: 'Admin dashboard fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/employee', auth, async (req, res) => {
  try {
    const data = await dashboardController.getEmployeeDashboard(req.user.id);
    res.json({ success: true, message: 'Employee dashboard fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/hr', auth, roleGuard(['hr_officer', 'admin']), async (req, res) => {
  try {
    const data = await dashboardController.getHRDashboard();
    res.json({ success: true, message: 'HR dashboard fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/payroll', auth, roleGuard(['payroll_officer', 'admin']), async (req, res) => {
  try {
    const data = await dashboardController.getPayrollDashboard();
    res.json({ success: true, message: 'Payroll dashboard fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
