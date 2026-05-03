const settingsService = require('./settings.service');

const getAll = async (req, res) => {
  try {
    const settings = await settingsService.getAll();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load settings' });
  }
};

const update = async (req, res) => {
  try {
    const updated = await settingsService.update(req.body);
    res.json({ success: true, message: 'Settings updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};

const getDbStats = async (req, res) => {
  try {
    const stats = await settingsService.getDbStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch database stats' });
  }
};

module.exports = { getAll, update, getDbStats };
