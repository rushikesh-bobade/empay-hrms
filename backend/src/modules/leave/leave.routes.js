const express = require('express');
const router = express.Router();
const leaveController = require('./leave.controller');
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

// Leave Types
router.get('/types', auth, leaveController.getLeaveTypes);
router.post('/types', auth, roleGuard(['admin']), leaveController.createLeaveType);

// Leave Allocations
router.get('/allocation/my', auth, leaveController.getMyAllocations);
router.get('/allocation/:employee_id', auth, roleGuard(['admin', 'hr_officer']), leaveController.getAllocationByEmployee);
router.post('/allocation', auth, roleGuard(['admin', 'hr_officer']), leaveController.upsertAllocation);

// Leave Requests
router.post('/request', auth, leaveController.createLeaveRequest);
router.get('/requests/my', auth, leaveController.getMyLeaveRequests);
router.get('/requests/all', auth, roleGuard(['admin', 'hr_officer', 'payroll_officer']), leaveController.getAllLeaveRequests);
router.patch('/requests/:id/approve', auth, roleGuard(['admin', 'payroll_officer']), leaveController.approveLeaveRequest);
router.patch('/requests/:id/reject', auth, roleGuard(['admin', 'payroll_officer']), leaveController.rejectLeaveRequest);

module.exports = router;
