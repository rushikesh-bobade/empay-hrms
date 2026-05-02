const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

// POST /api/attendance/mark
router.post('/mark', auth, attendanceController.markAttendance);

// GET /api/attendance/today-status — own status for today
router.get('/today-status', auth, attendanceController.getTodayStatus);

// GET /api/attendance/my
router.get('/my', auth, attendanceController.getMyAttendance);

// GET /api/attendance/monthly-summary
router.get('/monthly-summary', auth, attendanceController.getMonthlySummary);

// GET /api/attendance/all
router.get('/all', auth, roleGuard(['admin', 'hr_officer', 'payroll_officer']), attendanceController.getAllAttendance);

// GET /api/attendance/today
router.get('/today', auth, roleGuard(['admin', 'hr_officer']), attendanceController.getTodayAttendance);

module.exports = router;
