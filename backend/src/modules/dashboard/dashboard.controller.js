const { pool } = require('../../config/db');

const getAdminDashboard = async () => {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Employee counts
  const empCount = await pool.query(
    `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_active = true) AS active FROM users`
  );

  // Department count
  const deptCount = await pool.query(
    `SELECT COUNT(DISTINCT department) AS count FROM users WHERE department IS NOT NULL AND is_active = true`
  );

  // Today's attendance
  const todayAttendance = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE a.status = 'present' OR a.status = 'half_day') AS present,
       COUNT(*) FILTER (WHERE a.status = 'on_leave') AS on_leave
     FROM attendance a
     JOIN users u ON a.employee_id = u.id
     WHERE a.date = $1 AND u.is_active = true`,
    [today]
  );

  const totalActive = parseInt(empCount.rows[0].active);
  const todayPresent = parseInt(todayAttendance.rows[0].present || 0);
  const todayOnLeave = parseInt(todayAttendance.rows[0].on_leave || 0);
  const todayAbsent = totalActive - todayPresent - todayOnLeave;

  // Pending leaves
  const pendingLeaves = await pool.query(
    `SELECT COUNT(*) AS count FROM leave_requests WHERE status = 'pending'`
  );

  // Monthly payroll
  const monthlyPayroll = await pool.query(
    `SELECT COALESCE(SUM(ps.net_pay), 0) AS total
     FROM payslips ps
     JOIN payruns p ON ps.payrun_id = p.id
     WHERE p.month = $1 AND p.year = $2`,
    [currentMonth, currentYear]
  );

  // Attendance trend (last 7 weekdays)
  const trendResult = await pool.query(
    `SELECT a.date,
       COUNT(*) FILTER (WHERE a.status = 'present' OR a.status = 'half_day') AS present,
       COUNT(*) FILTER (WHERE a.status = 'absent') AS absent,
       COUNT(*) FILTER (WHERE a.status = 'on_leave') AS on_leave
     FROM attendance a
     JOIN users u ON a.employee_id = u.id
     WHERE a.date >= CURRENT_DATE - INTERVAL '10 days' AND u.is_active = true
     GROUP BY a.date
     ORDER BY a.date DESC
     LIMIT 7`
  );

  // Department headcount
  const deptHeadcount = await pool.query(
    `SELECT department, COUNT(*) AS count FROM users
     WHERE is_active = true AND department IS NOT NULL
     GROUP BY department ORDER BY count DESC`
  );

  // Leave type distribution
  const leaveDistribution = await pool.query(
    `SELECT lt.name, COALESCE(SUM(la.used_days), 0) AS used_days
     FROM leave_types lt
     LEFT JOIN leave_allocations la ON lt.id = la.leave_type_id AND la.year = $1
     GROUP BY lt.name`,
    [currentYear]
  );

  return {
    total_employees: parseInt(empCount.rows[0].total),
    active_employees: totalActive,
    departments_count: parseInt(deptCount.rows[0].count),
    today_present: todayPresent,
    today_absent: todayAbsent > 0 ? todayAbsent : 0,
    today_on_leave: todayOnLeave,
    pending_leave_requests: parseInt(pendingLeaves.rows[0].count),
    monthly_payroll_cost: parseFloat(monthlyPayroll.rows[0].total),
    attendance_trend: trendResult.rows.reverse(),
    department_headcount: deptHeadcount.rows,
    leave_type_distribution: leaveDistribution.rows,
  };
};

const getEmployeeDashboard = async (employeeId) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Attendance this month
  const attendanceSummary = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE status = 'present') AS present,
       COUNT(*) FILTER (WHERE status = 'absent') AS absent,
       COUNT(*) FILTER (WHERE status = 'half_day') AS half_day,
       COUNT(*) FILTER (WHERE status = 'on_leave') AS on_leave
     FROM attendance
     WHERE employee_id = $1 AND EXTRACT(MONTH FROM date) = $2 AND EXTRACT(YEAR FROM date) = $3`,
    [employeeId, currentMonth, currentYear]
  );

  // Working days
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  let workingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(currentYear, currentMonth - 1, d).getDay();
    if (day !== 0 && day !== 6) workingDays++;
  }

  // Leave balance
  const leaveBalance = await pool.query(
    `SELECT la.*, lt.name AS leave_type_name,
            la.allocated_days - la.used_days AS remaining
     FROM leave_allocations la
     JOIN leave_types lt ON la.leave_type_id = lt.id
     WHERE la.employee_id = $1 AND la.year = $2`,
    [employeeId, currentYear]
  );

  // Last payslip
  const lastPayslip = await pool.query(
    `SELECT ps.*, p.month, p.year
     FROM payslips ps
     JOIN payruns p ON ps.payrun_id = p.id
     WHERE ps.employee_id = $1
     ORDER BY p.year DESC, p.month DESC LIMIT 1`,
    [employeeId]
  );

  // Recent attendance (last 7 days)
  const recentAttendance = await pool.query(
    `SELECT date, status, check_in, check_out
     FROM attendance
     WHERE employee_id = $1
     ORDER BY date DESC LIMIT 7`,
    [employeeId]
  );

  return {
    attendance_this_month: {
      ...attendanceSummary.rows[0],
      total_working_days: workingDays,
    },
    leave_balance: leaveBalance.rows,
    last_payslip: lastPayslip.rows[0] || null,
    recent_attendance: recentAttendance.rows,
  };
};

const getHRDashboard = async () => {
  const today = new Date().toISOString().split('T')[0];

  const empCount = await pool.query(
    `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_active = true) AS active FROM users`
  );

  const pendingLeaves = await pool.query(
    `SELECT COUNT(*) AS count FROM leave_requests WHERE status = 'pending'`
  );

  const todaySummary = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE a.status = 'present' OR a.status = 'half_day') AS present,
       COUNT(*) FILTER (WHERE a.status = 'absent') AS absent,
       COUNT(*) FILTER (WHERE a.status = 'on_leave') AS on_leave
     FROM attendance a
     JOIN users u ON a.employee_id = u.id
     WHERE a.date = $1 AND u.is_active = true`,
    [today]
  );

  const onLeaveToday = await pool.query(
    `SELECT u.id, u.full_name, u.department, u.designation
     FROM attendance a
     JOIN users u ON a.employee_id = u.id
     WHERE a.date = $1 AND a.status = 'on_leave'`,
    [today]
  );

  const recentLeaves = await pool.query(
    `SELECT lr.*, lt.name AS leave_type_name, u.full_name AS employee_name, u.department
     FROM leave_requests lr
     JOIN leave_types lt ON lr.leave_type_id = lt.id
     JOIN users u ON lr.employee_id = u.id
     ORDER BY lr.created_at DESC LIMIT 10`
  );

  return {
    total_employees: parseInt(empCount.rows[0].total),
    active_employees: parseInt(empCount.rows[0].active),
    pending_leave_requests: parseInt(pendingLeaves.rows[0].count),
    today_summary: todaySummary.rows[0],
    on_leave_today: onLeaveToday.rows,
    recent_leave_requests: recentLeaves.rows,
  };
};

const getPayrollDashboard = async () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const pendingApprovals = await pool.query(
    `SELECT COUNT(*) AS count FROM leave_requests WHERE status = 'pending'`
  );

  const thisMonthPayrun = await pool.query(
    `SELECT * FROM payruns WHERE month = $1 AND year = $2`,
    [currentMonth, currentYear]
  );

  const totalCost = await pool.query(
    `SELECT COALESCE(SUM(ps.net_pay), 0) AS total
     FROM payslips ps
     JOIN payruns p ON ps.payrun_id = p.id
     WHERE p.month = $1 AND p.year = $2`,
    [currentMonth, currentYear]
  );

  const recentPayruns = await pool.query(
    `SELECT p.*, u.full_name AS generated_by_name,
            COALESCE(SUM(ps.net_pay), 0) AS total_cost,
            COUNT(ps.id) AS payslip_count
     FROM payruns p
     LEFT JOIN users u ON p.generated_by = u.id
     LEFT JOIN payslips ps ON p.id = ps.payrun_id
     GROUP BY p.id, u.full_name
     ORDER BY p.year DESC, p.month DESC LIMIT 5`
  );

  const empCount = await pool.query(`SELECT COUNT(*) AS count FROM users WHERE is_active = true`);

  return {
    pending_leave_approvals: parseInt(pendingApprovals.rows[0].count),
    this_month_payrun: thisMonthPayrun.rows[0] || null,
    total_payroll_cost_this_month: parseFloat(totalCost.rows[0].total),
    recent_payruns: recentPayruns.rows,
    employees_count: parseInt(empCount.rows[0].count),
  };
};

module.exports = { getAdminDashboard, getEmployeeDashboard, getHRDashboard, getPayrollDashboard };
