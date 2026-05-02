const usersService = require('./users.service');

const getAllUsers = async (req, res) => {
  try {
    const users = await usersService.getAllUsers(req.query);
    res.json({ success: true, message: 'Users fetched.', data: users });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to fetch users.' });
  }
};

const getUserById = async (req, res) => {
  try {
    // Employees can only see their own details
    if (req.user.role === 'employee' && req.params.id !== req.user.id) {
      // Allow viewing basic info from directory
      const user = await usersService.getUserById(req.params.id);
      const { phone, ...publicInfo } = user;
      return res.json({ success: true, message: 'User fetched.', data: publicInfo });
    }
    const user = await usersService.getUserById(req.params.id);
    res.json({ success: true, message: 'User fetched.', data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to fetch user.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await usersService.updateUser(req.params.id, req.body, req.user);
    res.json({ success: true, message: 'User updated successfully.', data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to update user.' });
  }
};

const updateMe = async (req, res) => {
  try {
    const user = await usersService.updateUser(req.user.id, req.body, req.user);
    res.json({ success: true, message: 'Profile updated successfully.', data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to update profile.' });
  }
};

const toggleActive = async (req, res) => {
  try {
    const user = await usersService.toggleActive(req.params.id);
    res.json({ success: true, message: `User ${user.is_active ? 'activated' : 'deactivated'}.`, data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to toggle user status.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await usersService.deleteUser(req.params.id);
    res.json({ success: true, message: 'User deactivated.', data: user });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to delete user.' });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, updateMe, toggleActive, deleteUser };
