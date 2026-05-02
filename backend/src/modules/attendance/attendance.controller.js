const attendanceService = require('./attendance.service');
const { getIo } = require('../../config/socket');

const markAttendance = async (req, res) => {
  try {
    const data = await attendanceService.markAttendance(req.user.id);
    // Broadcast real-time event to all connected clients
    try {
      getIo().emit('attendance_updated', { employee_id: req.user.id, ...data });
    } catch (e) {
      console.error('Socket emit error:', e);
    }
    res.json({ success: true, message: `Successfully ${data.action === 'checked_in' ? 'checked in' : 'checked out'}`, data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const data = await attendanceService.getMyAttendance(req.user.id, req.query);
    res.json({ success: true, message: 'Attendance fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const getMonthlySummary = async (req, res) => {
  try {
    const employeeId = req.query.employee_id || req.user.id;
    const data = await attendanceService.getMonthlySummary(employeeId, req.query);
    res.json({ success: true, message: 'Summary fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const data = await attendanceService.getAllAttendance(req.query);
    res.json({ success: true, message: 'All attendance fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const data = await attendanceService.getTodayAttendance();
    res.json({ success: true, message: 'Today attendance fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

module.exports = { markAttendance, getMyAttendance, getMonthlySummary, getAllAttendance, getTodayAttendance };
