const authService = require('./auth.service');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password must be strings',
      });
    }
    
    const safeEmail = email.trim();
    if (!safeEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const data = await authService.login(safeEmail, password);
    res.json({
      success: true,
      message: 'Login successful',
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({
      success: true,
      message: 'Profile fetched successfully',
      data: user,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
    await authService.forgotPassword(email);
    // Always return success to prevent email enumeration
    res.json({ success: true, message: 'If an account exists, a reset link has been sent' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Token and new password required' });
    await authService.resetPassword(token, newPassword);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const testEmail = async (req, res) => {
  try {
    const { sendEmail } = require('../../utils/mailer');
    await sendEmail(
      req.body.email || req.user.email,
      'EmPay SMTP Test 📧',
      'This is a test email to verify that your Gmail SMTP is configured correctly! If you received this, everything is working perfectly.',
      '<h2>EmPay SMTP Test 📧</h2><p>This is a test email to verify that your Gmail SMTP is configured correctly! If you received this, everything is working perfectly.</p>'
    );
    res.json({ success: true, message: 'Test email sent successfully! Check your inbox.' });
  } catch (error) {
    console.error('❌ SMTP Test Failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email', 
      error: error.message,
      hint: 'Ensure you are using a 16-character Google App Password, not your regular password.'
    });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, testEmail };
