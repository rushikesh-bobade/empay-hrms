const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const authMiddleware = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.use(authMiddleware);

// GET /api/users
router.get('/', roleGuard(['admin', 'hr_officer', 'payroll_officer', 'employee']), usersController.getAll);

// GET /api/users/:id
router.get('/:id', usersController.getById);

// PUT /api/users/:id
router.put('/:id', usersController.update);

// PATCH /api/users/:id/toggle-active
router.patch('/:id/toggle-active', roleGuard(['admin']), usersController.toggleActive);

// DELETE /api/users/:id
router.delete('/:id', roleGuard(['admin']), usersController.deleteUser);

module.exports = router;
