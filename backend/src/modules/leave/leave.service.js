const { pool } = require('../../config/db');

// ---------- Leave Types ----------
const getLeaveTypes = async () => {
  const result = await pool.query('SELECT * FROM leave_types ORDER BY name');
  return result.rows;
};

const createLeaveType = async ({ name, description, max_days_per_year }) => {
  const result = await pool.query(
    `INSERT INTO leave_types (name, description, max_days_per_year) VALUES ($1, $2, $3) RETURNING *`,
    [name, description, max_days_per_year]
  );
  return result.rows[0];
};

// ---------- Leave Allocations ----------
const getMyAllocations = async (employeeId, year) => {
  const y = year || new Date().getFullYear();
  const result = await pool.query(
    `SELECT la.*, lt.name AS leave_type_name, lt.description,
            la.allocated_days - la.used_days AS remaining
     FROM leave_allocations la
     JOIN leave_types lt ON la.leave_type_id = lt.id
     WHERE la.employee_id = $1 AND la.year = $2
     ORDER BY lt.name`,
    [employeeId, y]
  );
  return result.rows;
};

const getAllocationByEmployee = async (employeeId, year) => {
  return getMyAllocations(employeeId, year || new Date().getFullYear());
};

const upsertAllocation = async ({ employee_id, leave_type_id, allocated_days, year }) => {
  const y = year || new Date().getFullYear();
  const result = await pool.query(
    `INSERT INTO leave_allocations (employee_id, leave_type_id, allocated_days, year)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (employee_id, leave_type_id, year)
     DO UPDATE SET allocated_days = $3
     RETURNING *`,
    [employee_id, leave_type_id, allocated_days, y]
  );
  return result.rows[0];
};

// ---------- Leave Requests ----------
const countBusinessDays = (startDate, endDate) => {
  let count = 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};

const createLeaveRequest = async (employeeId, { leave_type_id, start_date, end_date, reason }) => {
  const total_days = countBusinessDays(start_date, end_date);

  if (total_days <= 0) throw { status: 400, message: 'Invalid date range.' };

  // Check balance
  const balanceResult = await pool.query(
    `SELECT allocated_days, used_days FROM leave_allocations
     WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3`,
    [employeeId, leave_type_id, new Date().getFullYear()]
  );

  if (balanceResult.rows.length === 0) {
    throw { status: 400, message: 'No leave allocation found. Contact HR.' };
  }

  const balance = balanceResult.rows[0];
  const remaining = balance.allocated_days - balance.used_days;
  if (remaining < total_days) {
    throw { status: 400, message: `Insufficient leave balance. Remaining: ${remaining} days.` };
  }

  const result = await pool.query(
    `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [employeeId, leave_type_id, start_date, end_date, total_days, reason]
  );

  return result.rows[0];
};

const getMyLeaveRequests = async (employeeId) => {
  const result = await pool.query(
    `SELECT lr.*, lt.name AS leave_type_name,
            u.full_name AS reviewed_by_name
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     LEFT JOIN users u ON lr.reviewed_by = u.id
     WHERE lr.employee_id = $1
     ORDER BY lr.created_at DESC`,
    [employeeId]
  );
  return result.rows;
};

const getAllLeaveRequests = async ({ status, employee_id }) => {
  let query = `
    SELECT lr.*, lt.name AS leave_type_name,
           e.full_name AS employee_name, e.department, e.designation, e.email,
           r.full_name AS reviewed_by_name
    FROM leave_requests lr
    JOIN leave_types lt ON lr.leave_type_id = lt.id
    JOIN users e ON lr.employee_id = e.id
    LEFT JOIN users r ON lr.reviewed_by = r.id
    WHERE 1=1`;
  const params = [];
  let idx = 1;

  if (status) {
    query += ` AND lr.status = $${idx++}`;
    params.push(status);
  }
  if (employee_id) {
    query += ` AND lr.employee_id = $${idx++}`;
    params.push(employee_id);
  }

  query += ` ORDER BY lr.created_at DESC`;
  const result = await pool.query(query, params);
  return result.rows;
};

const approveLeaveRequest = async (requestId, reviewerId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get the request
    const reqResult = await client.query('SELECT * FROM leave_requests WHERE id = $1', [requestId]);
    if (reqResult.rows.length === 0) throw { status: 404, message: 'Leave request not found.' };

    const request = reqResult.rows[0];
    if (request.status !== 'pending') throw { status: 400, message: `Request is already ${request.status}.` };

    // Update request
    await client.query(
      `UPDATE leave_requests SET status = 'approved', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2`,
      [reviewerId, requestId]
    );

    // Update used_days in allocation
    await client.query(
      `UPDATE leave_allocations SET used_days = used_days + $1
       WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
      [request.total_days, request.employee_id, request.leave_type_id, new Date().getFullYear()]
    );

    // Create attendance records for each leave day
    const start = new Date(request.start_date);
    const end = new Date(request.end_date);
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        const dateStr = current.toISOString().split('T')[0];
        await client.query(
          `INSERT INTO attendance (employee_id, date, status)
           VALUES ($1, $2, 'on_leave')
           ON CONFLICT (employee_id, date) DO UPDATE SET status = 'on_leave'`,
          [request.employee_id, dateStr]
        );
      }
      current.setDate(current.getDate() + 1);
    }

    await client.query('COMMIT');

    const updated = await pool.query(
      `SELECT lr.*, lt.name AS leave_type_name FROM leave_requests lr
       JOIN leave_types lt ON lr.leave_type_id = lt.id WHERE lr.id = $1`,
      [requestId]
    );
    return updated.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const rejectLeaveRequest = async (requestId, reviewerId) => {
  const reqResult = await pool.query('SELECT * FROM leave_requests WHERE id = $1', [requestId]);
  if (reqResult.rows.length === 0) throw { status: 404, message: 'Leave request not found.' };

  const request = reqResult.rows[0];
  if (request.status !== 'pending') throw { status: 400, message: `Request is already ${request.status}.` };

  const result = await pool.query(
    `UPDATE leave_requests SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW()
     WHERE id = $2 RETURNING *`,
    [reviewerId, requestId]
  );
  return result.rows[0];
};

module.exports = {
  getLeaveTypes, createLeaveType,
  getMyAllocations, getAllocationByEmployee, upsertAllocation,
  createLeaveRequest, getMyLeaveRequests, getAllLeaveRequests,
  approveLeaveRequest, rejectLeaveRequest,
};
