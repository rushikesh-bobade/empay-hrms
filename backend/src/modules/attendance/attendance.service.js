const { pool } = require('../../config/db');

const markAttendance = async (employeeId) => {
  const today = new Date().toISOString().split('T')[0];

  // Check if record exists for today
  const existing = await pool.query(
    'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
    [employeeId, today]
  );

  if (existing.rows.length === 0) {
    // No record — check in
    const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const result = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, status)
       VALUES ($1, $2, $3, 'present')
       RETURNING *`,
      [employeeId, today, now]
    );
    return { action: 'checked_in', record: result.rows[0] };
  }

  const record = existing.rows[0];

  if (record.check_out) {
    throw { status: 400, message: 'Already checked out today.' };
  }

  // Check out
  const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const result = await pool.query(
    `UPDATE attendance SET check_out = $1 WHERE id = $2 RETURNING *`,
    [now, record.id]
  );

  return { action: 'checked_out', record: result.rows[0] };
};

const getMyAttendance = async (employeeId, { month, year }) => {
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();

  const result = await pool.query(
    `SELECT * FROM attendance
     WHERE employee_id = $1
       AND EXTRACT(MONTH FROM date) = $2
       AND EXTRACT(YEAR FROM date) = $3
     ORDER BY date DESC`,
    [employeeId, m, y]
  );
  return result.rows;
};

const getMonthlySummary = async (employeeId, { month, year }) => {
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();

  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'present') AS present,
       COUNT(*) FILTER (WHERE status = 'absent') AS absent,
       COUNT(*) FILTER (WHERE status = 'half_day') AS half_day,
       COUNT(*) FILTER (WHERE status = 'on_leave') AS on_leave
     FROM attendance
     WHERE employee_id = $1
       AND EXTRACT(MONTH FROM date) = $2
       AND EXTRACT(YEAR FROM date) = $3`,
    [employeeId, m, y]
  );

  // Calculate total working days in month (Mon-Fri)
  const daysInMonth = new Date(y, m, 0).getDate();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(y, m - 1, d).getDay();
    if (day !== 0 && day !== 6) workingDays++;
  }

  return {
    ...result.rows[0],
    total_working_days: workingDays,
  };
};

const getAllAttendance = async ({ month, year, department, employee_id }) => {
  const m = parseInt(month) || new Date().getMonth() + 1;
  const y = parseInt(year) || new Date().getFullYear();

  let query = `
    SELECT a.*, u.full_name, u.department, u.designation, u.email
    FROM attendance a
    JOIN users u ON a.employee_id = u.id
    WHERE EXTRACT(MONTH FROM a.date) = $1
      AND EXTRACT(YEAR FROM a.date) = $2`;
  const params = [m, y];
  let idx = 3;

  if (department) {
    query += ` AND u.department ILIKE $${idx++}`;
    params.push(`%${department}%`);
  }
  if (employee_id) {
    query += ` AND a.employee_id = $${idx++}`;
    params.push(employee_id);
  }

  query += ` ORDER BY a.date DESC, u.full_name`;
  const result = await pool.query(query, params);
  return result.rows;
};

const getTodayAttendance = async () => {
  const today = new Date().toISOString().split('T')[0];

  const result = await pool.query(
    `SELECT u.id, u.full_name, u.department, u.designation, u.email,
            a.check_in, a.check_out, a.status,
            CASE WHEN a.id IS NULL THEN 'absent' ELSE a.status END AS today_status
     FROM users u
     LEFT JOIN attendance a ON u.id = a.employee_id AND a.date = $1
     WHERE u.is_active = true
     ORDER BY u.full_name`,
    [today]
  );
  return result.rows;
};

const getTodayStatus = async (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  const result = await pool.query(
    'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
    [employeeId, today]
  );
  return result.rows[0] || null;
};

module.exports = { markAttendance, getMyAttendance, getMonthlySummary, getAllAttendance, getTodayAttendance, getTodayStatus };
