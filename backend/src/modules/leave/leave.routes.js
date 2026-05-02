const express = require('express');
const router = express.Router();
const leaveController = require('./leave.controller');
const authMiddleware = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.use(authMiddleware);

// Leave Types
router.get('/types', leaveController.getLeaveTypes);
router.post('/types', roleGuard(['admin']), leaveController.createLeaveType);

// Leave Allocations
router.get('/allocation/my', leaveController.getAllocationsByEmployee);
router.get('/allocation/:employee_id', roleGuard(['admin', 'hr_officer']), leaveController.getAllocationsByEmployee);
router.post('/allocation', roleGuard(['admin', 'hr_officer']), leaveController.upsertAllocation);

// Leave Requests
router.post('/request', leaveController.createRequest);
router.get('/requests/my', leaveController.getMyRequests);
router.get('/requests/all', roleGuard(['admin', 'hr_officer', 'payroll_officer']), leaveController.getAllRequests);
router.patch('/requests/:id/approve', roleGuard(['admin', 'payroll_officer']), leaveController.approveRequest);
router.patch('/requests/:id/reject', roleGuard(['admin', 'payroll_officer']), leaveController.rejectRequest);

module.exports = router;
