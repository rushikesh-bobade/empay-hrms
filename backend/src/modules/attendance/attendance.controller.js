const attendanceService = require('./attendance.service');

const markAttendance = async (req, res) => {
  try {
    const data = await attendanceService.markAttendance(req.user.id);
    res.json({ success: true, message: `Successfully ${data.action === 'checked_in' ? 'checked in' : 'checked out'}.`, data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Failed to mark attendance.' });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const data = await attendanceService.getMyAttendance(req.user.id, req.query);
    res.json({ success: true, message: 'Attendance fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch attendance.' });
  }
};

const getMonthlySummary = async (req, res) => {
  try {
    const employeeId = req.query.employee_id || req.user.id;
    const data = await attendanceService.getMonthlySummary(employeeId, req.query);
    res.json({ success: true, message: 'Summary fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch summary.' });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const data = await attendanceService.getAllAttendance(req.query);
    res.json({ success: true, message: 'All attendance fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch attendance.' });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const data = await attendanceService.getTodayAttendance();
    res.json({ success: true, message: 'Today attendance fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch today attendance.' });
  }
};

const getTodayStatus = async (req, res) => {
  try {
    const data = await attendanceService.getTodayStatus(req.user.id);
    res.json({ success: true, message: 'Today status fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch today status.' });
  }
};

module.exports = { markAttendance, getMyAttendance, getMonthlySummary, getAllAttendance, getTodayAttendance, getTodayStatus };
