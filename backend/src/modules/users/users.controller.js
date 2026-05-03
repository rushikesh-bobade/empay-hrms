const usersService = require('./users.service');

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
    res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const toggleActive = async (req, res) => {
  try {
    const user = await usersService.toggleActive(req.params.id);
    res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully`, data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await usersService.softDelete(req.params.id);
    res.json({ success: true, message: 'User deactivated successfully', data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    const avatarUrl = req.file.path; // This will be the secure Cloudinary URL
    const user = await usersService.updateProfilePic(req.user.id, avatarUrl);
    res.json({ success: true, message: 'Profile picture updated', data: { profile_pic: user.profile_pic } });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

module.exports = { getAll, getById, update, toggleActive, deleteUser, uploadAvatar };
