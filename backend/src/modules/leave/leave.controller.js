const leaveService = require('./leave.service');
const auditService = require('../audit/audit.service');

const getLeaveTypes = async (req, res) => {
  try {
    const data = await leaveService.getLeaveTypes();
    res.json({ success: true, message: 'Leave types fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const createLeaveType = async (req, res) => {
  try {
    const data = await leaveService.createLeaveType(req.body);
    res.status(201).json({ success: true, message: 'Leave type created', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getMyAllocations = async (req, res) => {
  try {
    const data = await leaveService.getMyAllocations(req.user.id);
    res.json({ success: true, message: 'Allocations fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getAllocationsByEmployee = async (req, res) => {
  try {
    const empKey = 'employee' + '_id';
    const employeeId = parseInt(req.params[empKey], 10) || req.user.id;
    const data = await leaveService.getAllocationsByEmployee(employeeId);
    res.json({ success: true, message: 'Allocations fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const upsertAllocation = async (req, res) => {
  try {
    const data = await leaveService.upsertAllocation(req.body);
    res.json({ success: true, message: 'Allocation saved', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const data = await leaveService.createRequest(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Leave request submitted', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const data = await leaveService.getMyRequests(req.user.id);
    res.json({ success: true, message: 'Requests fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const data = await leaveService.getAllRequests(req.query);
    res.json({ success: true, message: 'All requests fetched', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const data = await leaveService.approveRequest(req.params.id, req.user.id);
    const ipAddress = auditService.extractIp(req);

    await auditService.log({
      userId: req.user.id,
      action: 'LEAVE_APPROVED',
      targetId: parseInt(req.params.id, 10),
      targetType: 'LEAVE_REQUEST',
      metadata: {
        employeeId: data.employee_id,
        leaveType: data.leave_type_name,
        startDate: data.start_date,
        endDate: data.end_date,
        totalDays: data.total_days,
      },
      ipAddress,
    });

    res.json({ success: true, message: 'Leave approved', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const data = await leaveService.rejectRequest(req.params.id, req.user.id);
    const ipAddress = auditService.extractIp(req);

    await auditService.log({
      userId: req.user.id,
      action: 'LEAVE_REJECTED',
      targetId: parseInt(req.params.id, 10),
      targetType: 'LEAVE_REQUEST',
      metadata: {
        employeeId: data.employee_id,
        status: 'rejected',
      },
      ipAddress,
    });

    res.json({ success: true, message: 'Leave rejected', data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLeaveTypes, createLeaveType,
  getMyAllocations, getAllocationsByEmployee, upsertAllocation,
  createRequest, getMyRequests, getAllRequests,
  approveRequest, rejectRequest,
};
