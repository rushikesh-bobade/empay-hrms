const { pool } = require('../../config/db');
const notificationsService = require('../notifications/notifications.service');


class AttendanceService {
  async markAttendance(employeeId) {
    const today = new Date().toLocaleDateString('en-CA');
    
    // Check existing record for today
    const existing = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = $1 AND date = $2',
      [employeeId, today]
    );

    if (existing.rows.length === 0) {
      // No record — create check-in
      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const result = await pool.query(
        `INSERT INTO attendance (employee_id, date, check_in, status)
         VALUES ($1, $2, $3, 'present')
         RETURNING *`,
        [employeeId, today, now]
      );
      return { action: 'checked_in', record: result.rows[0] };
    }

    const record = existing.rows[0];

    if (!record.check_out) {
      // Record exists, no check-out — update check-out
      const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const result = await pool.query(
        `UPDATE attendance SET check_out = $1 WHERE id = $2 RETURNING *`,
        [now, record.id]
      );
      return { action: 'checked_out', record: result.rows[0] };
    }

    // Already checked out — allow re-check-in (e.g. returned after half day)
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const result = await pool.query(
      `UPDATE attendance 
       SET 
         accumulated_minutes = accumulated_minutes + (EXTRACT(EPOCH FROM (check_out - check_in))::INT + 86400) % 86400 / 60,
         check_in = $1, 
         check_out = NULL 
       WHERE id = $2 
       RETURNING *`,
      [now, record.id]
    );
    return { action: 'checked_in', record: result.rows[0] };
  }

  async getMyAttendance(employeeId, filters = {}) {
    const now = new Date();
    const month = filters.month || now.getMonth() + 1;
    const year = filters.year || now.getFullYear();

    const result = await pool.query(
      `SELECT * FROM attendance
       WHERE employee_id = $1
         AND EXTRACT(MONTH FROM date) = $2
         AND EXTRACT(YEAR FROM date) = $3
       ORDER BY date DESC`,
      [employeeId, month, year]
    );
    return result.rows;
  }

  async getMonthlySummary(employeeId, filters = {}) {
    const now = new Date();
    const month = filters.month || now.getMonth() + 1;
    const year = filters.year || now.getFullYear();

    const result = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'present') as present,
         COUNT(*) FILTER (WHERE status = 'absent') as absent,
         COUNT(*) FILTER (WHERE status = 'half_day') as half_day,
         COUNT(*) FILTER (WHERE status = 'on_leave') as on_leave,
         COUNT(*) as total_working_days
       FROM attendance
       WHERE employee_id = $1
         AND EXTRACT(MONTH FROM date) = $2
         AND EXTRACT(YEAR FROM date) = $3`,
      [employeeId, month, year]
    );

    return result.rows[0];
  }

  async getAllAttendance(filters = {}) {
    const now = new Date();
    const month = filters.month || now.getMonth() + 1;
    const year = filters.year || now.getFullYear();

    const query = `
      SELECT a.*, u.full_name, u.email, u.department, u.designation
      FROM attendance a
      JOIN users u ON a.employee_id = u.id
      WHERE EXTRACT(MONTH FROM a.date) = $1
        AND EXTRACT(YEAR FROM a.date) = $2
        AND ($3::text IS NULL OR u.department ILIKE $3)
        AND ($4::int IS NULL OR a.employee_id = $4)
      ORDER BY a.date DESC, u.full_name ASC
    `;
    
    const params = [
      month, 
      year, 
      filters.department ? `%${filters.department}%` : null,
      filters['employee' + '_id'] ? parseInt(filters['employee' + '_id'], 10) : null
    ];
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  async getTodayAttendance() {
    const today = new Date().toLocaleDateString('en-CA');

    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.department, u.designation, u.profile_pic,
              a.check_in, a.check_out, a.accumulated_minutes, COALESCE(a.status, 'absent') as status
       FROM users u
       LEFT JOIN attendance a ON u.id = a.employee_id AND a.date = $1
       WHERE u.is_active = true
       ORDER BY u.full_name`,
      [today]
    );
    return result.rows;
  }

  /**
   * Performs smart checks and notifies HR
   */
  async checkAndNotifyHR() {
    const today = new Date().toLocaleDateString('en-CA');
    
    // 1. Daily Attendance Summary Ready
    // We'll notify once per day when the dashboard is accessed.
    await notificationsService.notifyHR(
      '📊 Daily Attendance Summary',
      "Today's attendance summary is available",
      'info',
      'DAILY_ATTENDANCE_SUMMARY'
    );

    // 2. Smart Alerts: Frequent Absentee (absent > 3 times in last 30 days)
    const frequentAbsentees = await pool.query(`
      SELECT u.full_name, COUNT(*) as absent_count
      FROM attendance a
      JOIN users u ON a.employee_id = u.id
      WHERE a.status = 'absent' AND a.date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY u.id, u.full_name
      HAVING COUNT(*) >= 3
    `);

    for (const row of frequentAbsentees.rows) {
      await notificationsService.notifyHR(
        '⚠ Frequent Absentee Detected',
        `${row.full_name} has irregular attendance (${row.absent_count} absences recently)`,
        'warning',
        `ABSENTEE_${row.full_name}_${today}`
      );
    }
  }

}

module.exports = new AttendanceService();
