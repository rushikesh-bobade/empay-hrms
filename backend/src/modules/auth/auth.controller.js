const authService = require('./auth.service');

const register = async (req, res) => {
  try {
    const { full_name, email, password, role, department, designation, phone } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Full name, email, password, and role are required.' });
    }

    const user = await authService.register({ full_name, email, password, role, department, designation, phone });
    res.status(201).json({ success: true, message: 'User registered successfully.', data: user });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const data = await authService.login({ email, password });
    res.status(200).json({ success: true, message: 'Login successful.', data });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message || 'Login failed.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ success: true, message: 'Profile fetched.', data: user });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message || 'Failed to fetch profile.' });
  }
};

module.exports = { register, login, getMe };
