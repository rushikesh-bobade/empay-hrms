const express = require('express');
const router = express.Router();
const usersController = require('./users.controller');
const authMiddleware = require('../../middleware/auth');
const roleGuard = require('../../middleware/roleGuard');

router.use(authMiddleware);

// GET /api/users/directory — accessible by ALL authenticated users (employee directory)
router.get('/directory', usersController.getDirectory);

// GET /api/users/messages/:userId — get chat history with a user
router.get('/messages/:userId', usersController.getMessages);

// POST /api/users/messages — send a message (also persisted via socket, this is fallback)
router.post('/messages', usersController.sendMessage);

// GET /api/users
router.get('/', roleGuard(['admin', 'hr_officer', 'payroll_officer']), usersController.getAll);

// GET /api/users/:id
router.get('/:id', usersController.getById);

// PUT /api/users/:id
router.put('/:id', usersController.update);

// PATCH /api/users/:id/password
router.patch('/:id/password', usersController.changePassword);

// POST /api/users/:id/avatar
router.post('/:id/avatar', usersController.uploadAvatar);

// PATCH /api/users/:id/toggle-active
router.patch('/:id/toggle-active', roleGuard(['admin']), usersController.toggleActive);

// DELETE /api/users/:id
router.delete('/:id', roleGuard(['admin']), usersController.deleteUser);

module.exports = router;
