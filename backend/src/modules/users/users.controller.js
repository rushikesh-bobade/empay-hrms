const usersService = require('./users.service');
const { getIo } = require('../../config/socket');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config for avatar uploads
const uploadDir = path.join(__dirname, '..', '..', '..', 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.params.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const avatarUpload = upload.single('avatar');

const getAll = async (req, res) => {
  try {
    const users = await usersService.getAll(req.query);
    res.json({ success: true, message: 'Users fetched successfully', data: users });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const getById = async (req, res) => {
  try {
    // Employee can only view own profile
    if (req.user.role === 'employee' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const user = await usersService.getById(req.params.id);
    res.json({ success: true, message: 'User fetched successfully', data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const user = await usersService.update(req.params.id, req.body, req.user);
    try { getIo().emit('user_updated', { type: 'updated', user }); } catch(e) {}
    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const toggleActive = async (req, res) => {
  try {
    const user = await usersService.toggleActive(req.params.id);
    try { getIo().emit('user_updated', { type: 'status_changed', user }); } catch(e) {}
    res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully`, data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await usersService.softDelete(req.params.id);
    try { getIo().emit('user_updated', { type: 'deleted', user }); } catch(e) {}
    res.json({ success: true, message: 'User deactivated successfully', data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Old and new passwords are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    // Only allow changing own password or admin changing anyone's
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    await usersService.changePassword(req.params.id, old_password, new_password);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    // Only own avatar or admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    avatarUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const filePath = `/uploads/avatars/${req.file.filename}`;
      const user = await usersService.updateProfilePic(req.params.id, filePath);
      try { getIo().emit('user_updated', { type: 'avatar_updated', user }); } catch(e) {}
      res.json({ success: true, message: 'Avatar uploaded successfully', data: user });
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const getDirectory = async (req, res) => {
  try {
    const users = await usersService.getDirectory(req.query.search);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await usersService.getMessages(req.user.id, req.params.userId);
    // Mark as read
    await usersService.markMessagesRead(req.user.id, req.params.userId);
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and text are required' });
    }
    const message = await usersService.sendMessage(req.user.id, receiverId, text.trim());
    // Emit via socket
    try {
      getIo().emit('private_message', {
        id: message.id,
        senderId: req.user.id,
        receiverId,
        text: message.text,
        timestamp: message.created_at,
      });
    } catch(e) {}
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

module.exports = { getAll, getById, update, toggleActive, deleteUser, changePassword, uploadAvatar, getDirectory, getMessages, sendMessage };
