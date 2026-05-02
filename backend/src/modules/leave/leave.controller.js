const leaveService = require('./leave.service');

const getLeaveTypes = async (req, res) => {
  try {
    const data = await leaveService.getLeaveTypes();
    res.json({ success: true, message: 'Leave types fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createLeaveType = async (req, res) => {
  try {
    const data = await leaveService.createLeaveType(req.body);
    res.status(201).json({ success: true, message: 'Leave type created.', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getMyAllocations = async (req, res) => {
  try {
    const data = await leaveService.getMyAllocations(req.user.id, req.query.year);
    res.json({ success: true, message: 'Leave allocations fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllocationByEmployee = async (req, res) => {
  try {
    const data = await leaveService.getAllocationByEmployee(req.params.employee_id, req.query.year);
    res.json({ success: true, message: 'Leave allocations fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upsertAllocation = async (req, res) => {
  try {
    const data = await leaveService.upsertAllocation(req.body);
    res.json({ success: true, message: 'Leave allocation updated.', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const createLeaveRequest = async (req, res) => {
  try {
    const data = await leaveService.createLeaveRequest(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Leave request submitted.', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getMyLeaveRequests = async (req, res) => {
  try {
    const data = await leaveService.getMyLeaveRequests(req.user.id);
    res.json({ success: true, message: 'Leave requests fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllLeaveRequests = async (req, res) => {
  try {
    const data = await leaveService.getAllLeaveRequests(req.query);
    res.json({ success: true, message: 'All leave requests fetched.', data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveLeaveRequest = async (req, res) => {
  try {
    const data = await leaveService.approveLeaveRequest(req.params.id, req.user.id);
    res.json({ success: true, message: 'Leave request approved.', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const rejectLeaveRequest = async (req, res) => {
  try {
    const data = await leaveService.rejectLeaveRequest(req.params.id, req.user.id);
    res.json({ success: true, message: 'Leave request rejected.', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLeaveTypes, createLeaveType,
  getMyAllocations, getAllocationByEmployee, upsertAllocation,
  createLeaveRequest, getMyLeaveRequests, getAllLeaveRequests,
  approveLeaveRequest, rejectLeaveRequest,
};
