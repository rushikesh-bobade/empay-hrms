const { pool } = require('../../config/db');
const { sendEmail } = require('../../utils/mailer');
const { leaveStatusEmail } = require('../../utils/emailTemplates');
const notificationsService = require('../notifications/notifications.service');
const usersService = require('../users/users.service');


class LeaveService {
  // ----- Leave Types -----
  async getLeaveTypes() {
    const result = await pool.query('SELECT * FROM leave_types ORDER BY name');
    return result.rows;
  }

  async createLeaveType(data) {
    const { name, description, max_days_per_year } = data;
    const result = await pool.query(
      `INSERT INTO leave_types (name, description, max_days_per_year)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description, max_days_per_year]
    );
    return result.rows[0];
  }

  // ----- Leave Allocations -----
  /*async getMyAllocations(employeeId) {
    const currentYear = new Date().getFullYear();
    const result = await pool.query(
      `SELECT la.*, lt.name, lt.max_days_per_year,
              (la.allocated_days - la.used_days) as remaining
       FROM leave_allocations la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.employee_id = $1 AND la.year = $2
       ORDER BY lt.name`,
      [employeeId, currentYear]
    );
    return result.rows;
  }*/

  async getAllocationsByEmployee(employeeId) {
    const currentYear = new Date().getFullYear();
    const result = await pool.query(
      `SELECT la.*, lt.name, lt.max_days_per_year,
              (la.allocated_days - la.used_days) as remaining
       FROM leave_allocations la
       JOIN leave_types lt ON la.leave_type_id = lt.id
       WHERE la.employee_id = $1 AND la.year = $2
       ORDER BY lt.name`,
      [employeeId, currentYear]
    );
    return result.rows;
  }

  async upsertAllocation(data) {
    const { employee_id, leave_type_id, allocated_days, year } = data;
    const currentYear = year || new Date().getFullYear();

    const result = await pool.query(
      `INSERT INTO leave_allocations (employee_id, leave_type_id, allocated_days, year)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (employee_id, leave_type_id, year)
       DO UPDATE SET allocated_days = $3
       RETURNING *`,
      [employee_id, leave_type_id, allocated_days, currentYear]
    );
    return result.rows[0];
  }

  // ----- Leave Requests -----
  _countWorkingDays(start, end) {
    let count = 0;
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  async createRequest(employeeId, data) {
    const { leave_type_id, start_date, end_date, reason } = data;
    const total_days = this._countWorkingDays(start_date, end_date);

    if (total_days <= 0) {
      throw { status: 400, message: 'Invalid date range' };
    }

    // Check remaining balance
    const currentYear = new Date().getFullYear();
    const allocation = await pool.query(
      `SELECT * FROM leave_allocations
       WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3`,
      [employeeId, leave_type_id, currentYear]
    );

    if (allocation.rows.length > 0) {
      const remaining = allocation.rows[0].allocated_days - allocation.rows[0].used_days;
      if (remaining < total_days) {
        throw { status: 400, message: `Insufficient leave balance. Available: ${remaining} days, Requested: ${total_days} days` };
      }
    }

    const result = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [employeeId, leave_type_id, start_date, end_date, total_days, reason]
    );
    const request = result.rows[0];

    // Notify HR
    try {
      const employee = await usersService.getById(employeeId);
      await notificationsService.notifyHR(
        '📩 New Leave Request',
        `New leave request from ${employee.full_name}`,
        'info'
      );
    } catch (err) {
      console.error('Failed to send leave notification:', err.message);
    }

    return request;

  }

  async getMyRequests(employeeId) {
    const result = await pool.query(
      `SELECT lr.*, lt.name as leave_type_name
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       WHERE lr.employee_id = $1
       ORDER BY lr.created_at DESC`,
      [employeeId]
    );
    return result.rows;
  }

  async getAllRequests(filters = {}) {
    let query = `
      SELECT lr.*, lt.name as leave_type_name,
             u.full_name, u.email, u.department, u.designation,
             reviewer.full_name as reviewer_name
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN users u ON lr.employee_id = u.id
      LEFT JOIN users reviewer ON lr.reviewed_by = reviewer.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND lr.status = $${paramIndex++}`;
      params.push(filters.status);
    }
    if (filters.employee_id) {
      query += ` AND lr.employee_id = $${paramIndex++}`;
      params.push(filters.employee_id);
    }

    query += ' ORDER BY lr.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async approveRequest(requestId, reviewerId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get the request
      const reqResult = await client.query(
        `SELECT lr.*, lt.is_paid 
         FROM leave_requests lr
         JOIN leave_types lt ON lr.leave_type_id = lt.id
         WHERE lr.id = $1`,
        [requestId]
      );
      if (reqResult.rows.length === 0) {
        throw { status: 404, message: 'Leave request not found' };
      }

      const request = reqResult.rows[0];
      if (request.status !== 'pending') {
        throw { status: 400, message: `Request is already ${request.status}` };
      }

      // Update request status
      await client.query(
        `UPDATE leave_requests SET status = 'approved', reviewed_by = $1, reviewed_at = NOW()
         WHERE id = $2`,
        [reviewerId, requestId]
      );

      // Increment used_days in leave_allocations
      const currentYear = new Date().getFullYear();
      await client.query(
        `UPDATE leave_allocations SET used_days = used_days + $1
         WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
        [request.total_days, request.employee_id, request.leave_type_id, currentYear]
      );

      // Create attendance records with 'on_leave' or 'unpaid_leave' status for each working day
      const current = new Date(request.start_date);
      const endDate = new Date(request.end_date);
      const attendanceStatus = request.is_paid ? 'on_leave' : 'unpaid_leave';
      while (current <= endDate) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) {
          const dateStr = current.toISOString().split('T')[0];
          await client.query(
            `INSERT INTO attendance (employee_id, date, status)
             VALUES ($1, $2, $3)
             ON CONFLICT (employee_id, date) DO UPDATE SET status = $3`,
            [request.employee_id, dateStr, attendanceStatus]
          );
        }
        current.setDate(current.getDate() + 1);
      }

      await client.query('COMMIT');

      // Return updated request
      const updated = await pool.query(
        `SELECT lr.*, lt.name as leave_type_name, u.full_name, u.email
         FROM leave_requests lr
         JOIN leave_types lt ON lr.leave_type_id = lt.id
         JOIN users u ON lr.employee_id = u.id
         WHERE lr.id = $1`,
        [requestId]
      );

      // Send email to employee
      if (updated.rows[0] && updated.rows[0].email) {
        const employeeName = updated.rows[0].full_name;
        const leaveType = updated.rows[0].leave_type_name;
        const sDate = new Date(request.start_date).toLocaleDateString();
        const eDate = new Date(request.end_date).toLocaleDateString();
        
        const emailHtml = leaveStatusEmail(employeeName, leaveType, sDate, eDate, 'Approved');
        await sendEmail(
          updated.rows[0].email,
          'Leave Request Approved - EmPay HRMS',
          `Hi ${employeeName}, your request for ${leaveType} from ${sDate} to ${eDate} has been approved.`,
          emailHtml
        );
      }

      return updated.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async rejectRequest(requestId, reviewerId) {
    const reqResult = await pool.query(
      'SELECT * FROM leave_requests WHERE id = $1',
      [requestId]
    );
    if (reqResult.rows.length === 0) {
      throw { status: 404, message: 'Leave request not found' };
    }
    if (reqResult.rows[0].status !== 'pending') {
      throw { status: 400, message: `Request is already ${reqResult.rows[0].status}` };
    }

    const result = await pool.query(
      `UPDATE leave_requests SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [reviewerId, requestId]
    );

    const updated = await pool.query(
      `SELECT lr.*, lt.name as leave_type_name, u.full_name, u.email
       FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id
       JOIN users u ON lr.employee_id = u.id
       WHERE lr.id = $1`,
      [requestId]
    );

    if (updated.rows[0] && updated.rows[0].email) {
      const employeeName = updated.rows[0].full_name;
      const leaveType = updated.rows[0].leave_type_name;
      const request = updated.rows[0];
      const sDate = new Date(request.start_date).toLocaleDateString();
      const eDate = new Date(request.end_date).toLocaleDateString();
      
      const emailHtml = leaveStatusEmail(employeeName, leaveType, sDate, eDate, 'Rejected');
      await sendEmail(
        updated.rows[0].email,
        'Leave Request Rejected - EmPay HRMS',
        `Hi ${employeeName}, your request for ${leaveType} from ${sDate} to ${eDate} has been rejected.`,
        emailHtml
      );
    }

    return result.rows[0];
  }
}

module.exports = new LeaveService();
