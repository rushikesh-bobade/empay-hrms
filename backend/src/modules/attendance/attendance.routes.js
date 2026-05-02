const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const authMiddleware = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.use(authMiddleware);

// POST /api/attendance/mark
router.post('/mark', attendanceController.markAttendance);

// GET /api/attendance/my
router.get('/my', attendanceController.getMyAttendance);

// GET /api/attendance/monthly-summary
router.get('/monthly-summary', attendanceController.getMonthlySummary);

// GET /api/attendance/all
router.get('/all', roleGuard(['admin', 'hr_officer', 'payroll_officer']), attendanceController.getAllAttendance);

// GET /api/attendance/today
router.get('/today', roleGuard(['admin', 'hr_officer', 'payroll_officer']), attendanceController.getTodayAttendance);

module.exports = router;
