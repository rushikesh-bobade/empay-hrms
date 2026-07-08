const twoFactorService = require('./twoFactor.service');

const setup = async (req, res) => {
  try {
    const result = await twoFactorService.setup(req.user.id);
    res.json({ success: true, message: '2FA setup initiated', data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const verify = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });
    const result = await twoFactorService.verify(req.user.id, token);
    res.json({ success: true, message: '2FA verified and enabled', data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const disable = async (req, res) => {
  try {
    await twoFactorService.disable(req.user.id);
    res.json({ success: true, message: '2FA disabled' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

module.exports = { setup, verify, disable };
