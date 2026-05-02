const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const auth = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

// PUT /api/users/me — self profile update
router.put('/me', auth, usersController.updateMe);

// GET /api/users
router.get('/', auth, roleGuard(['admin', 'hr_officer', 'payroll_officer']), usersController.getAllUsers);

// GET /api/users/:id
router.get('/:id', auth, usersController.getUserById);

// PUT /api/users/:id
router.put('/:id', auth, roleGuard(['admin', 'hr_officer', 'employee']), usersController.updateUser);

// PATCH /api/users/:id/toggle-active
router.patch('/:id/toggle-active', auth, roleGuard(['admin']), usersController.toggleActive);

// DELETE /api/users/:id
router.delete('/:id', auth, roleGuard(['admin']), usersController.deleteUser);

module.exports = router;
