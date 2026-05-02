const { pool } = require('../../config/db');

const getAdminDashboard = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Employee counts
    const empCounts = await pool.query(`
      SELECT
        COUNT(*) as total_employees,
        COUNT(*) FILTER (WHERE is_active = true) as active_employees,
        COUNT(DISTINCT department) as departments_count
      FROM users
    `);

    // Today's attendance
    const todayAtt = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE a.status = 'present' OR a.status = 'half_day') as today_present,
        COUNT(*) FILTER (WHERE a.status = 'on_leave') as today_on_leave
      FROM attendance a
      WHERE a.date = $1
    `, [today]);

    const totalActive = parseInt(empCounts.rows[0].active_employees);
    const todayPresent = parseInt(todayAtt.rows[0].today_present) || 0;
    const todayOnLeave = parseInt(todayAtt.rows[0].today_on_leave) || 0;
    const todayAbsent = totalActive - todayPresent - todayOnLeave;

    // Pending leave requests
    const pendingLeaves = await pool.query(
      `SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'`
    );

    // Monthly payroll cost
    const payrollCost = await pool.query(`
      SELECT COALESCE(SUM(ps.net_pay), 0) as monthly_payroll_cost
      FROM payslips ps
      JOIN payruns p ON ps.payrun_id = p.id
      WHERE p.month = $1 AND p.year = $2
    `, [currentMonth, currentYear]);

    // Attendance trend (last 7 days)
    const attendanceTrend = await pool.query(`
      SELECT
        a.date,
        COUNT(*) FILTER (WHERE a.status = 'present') as present,
        COUNT(*) FILTER (WHERE a.status = 'absent') as absent,
        COUNT(*) FILTER (WHERE a.status = 'on_leave') as on_leave
      FROM attendance a
      WHERE a.date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY a.date
      ORDER BY a.date
    `);

    // Department headcount
    const deptHeadcount = await pool.query(`
      SELECT department, COUNT(*) as count
      FROM users WHERE is_active = true AND department IS NOT NULL
      GROUP BY department ORDER BY count DESC
    `);

    // Leave type distribution
    const leaveDistribution = await pool.query(`
      SELECT lt.name, COALESCE(SUM(la.used_days), 0) as used_days
      FROM leave_types lt
      LEFT JOIN leave_allocations la ON lt.id = la.leave_type_id AND la.year = $1
      GROUP BY lt.name
    `, [currentYear]);

    res.json({
      success: true,
      message: 'Admin dashboard data fetched',
      data: {
        total_employees: parseInt(empCounts.rows[0].total_employees),
        active_employees: totalActive,
        departments_count: parseInt(empCounts.rows[0].departments_count),
        today_present: todayPresent,
        today_absent: todayAbsent > 0 ? todayAbsent : 0,
        today_on_leave: todayOnLeave,
        pending_leave_requests: parseInt(pendingLeaves.rows[0].count),
        monthly_payroll_cost: parseFloat(payrollCost.rows[0].monthly_payroll_cost),
        attendance_trend: attendanceTrend.rows,
        department_headcount: deptHeadcount.rows,
        leave_type_distribution: leaveDistribution.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const today = now.toLocaleDateString('en-CA');

    // Attendance this month
    const attSummary = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'present') as present,
        COUNT(*) FILTER (WHERE status = 'absent') as absent,
        COUNT(*) FILTER (WHERE status = 'half_day') as half_day,
        COUNT(*) FILTER (WHERE status = 'on_leave') as on_leave,
        COUNT(*) as total_working_days
      FROM attendance
      WHERE employee_id = $1
        AND EXTRACT(MONTH FROM date) = $2
        AND EXTRACT(YEAR FROM date) = $3
    `, [employeeId, currentMonth, currentYear]);

    // Leave balance
    const leaveBalance = await pool.query(`
      SELECT lt.name as leave_type, la.allocated_days as allocated,
             la.used_days as used, (la.allocated_days - la.used_days) as remaining
      FROM leave_allocations la
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.employee_id = $1 AND la.year = $2
    `, [employeeId, currentYear]);



    // Recent attendance (last 7 days)
    const recentAtt = await pool.query(`
      SELECT date, status, check_in, check_out
      FROM attendance
      WHERE employee_id = $1
      ORDER BY date DESC LIMIT 7
    `, [employeeId]);

    // Today's attendance
    const todayAtt = await pool.query(`
      SELECT * FROM attendance WHERE employee_id = $1 AND date = $2
    `, [employeeId, today]);

    res.json({
      success: true,
      message: 'Employee dashboard data fetched',
      data: {
        attendance_this_month: attSummary.rows[0],
        leave_balance: leaveBalance.rows,
        recent_attendance: recentAtt.rows,
        today_attendance: todayAtt.rows[0] || null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHRDashboard = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');

    const empCounts = await pool.query(`
      SELECT
        COUNT(*) as total_employees,
        COUNT(*) FILTER (WHERE is_active = true) as active_employees
      FROM users
    `);

    const pendingLeaves = await pool.query(
      `SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'`
    );

    const todaySummary = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE a.status = 'present' OR a.status = 'half_day') as present,
        COUNT(*) FILTER (WHERE a.status = 'absent') as absent,
        COUNT(*) FILTER (WHERE a.status = 'on_leave') as on_leave
      FROM attendance a WHERE a.date = $1
    `, [today]);

    const onLeaveToday = await pool.query(`
      SELECT u.id, u.full_name, u.department, u.designation
      FROM users u
      JOIN attendance a ON u.id = a.employee_id
      WHERE a.date = $1 AND a.status = 'on_leave'
    `, [today]);

    const recentRequests = await pool.query(`
      SELECT lr.*, lt.name as leave_type_name, u.full_name, u.department
      FROM leave_requests lr
      JOIN leave_types lt ON lr.leave_type_id = lt.id
      JOIN users u ON lr.employee_id = u.id
      ORDER BY lr.created_at DESC LIMIT 10
    `);

    res.json({
      success: true,
      message: 'HR dashboard data fetched',
      data: {
        total_employees: parseInt(empCounts.rows[0].total_employees),
        active_employees: parseInt(empCounts.rows[0].active_employees),
        pending_leave_requests: parseInt(pendingLeaves.rows[0].count),
        today_summary: todaySummary.rows[0],
        on_leave_today: onLeaveToday.rows,
        recent_leave_requests: recentRequests.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPayrollDashboard = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const pendingApprovals = await pool.query(
      `SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'`
    );

    const thisMonthPayrun = await pool.query(
      `SELECT * FROM payruns WHERE month = $1 AND year = $2`,
      [currentMonth, currentYear]
    );

    const totalCost = await pool.query(`
      SELECT COALESCE(SUM(ps.net_pay), 0) as total
      FROM payslips ps
      JOIN payruns p ON ps.payrun_id = p.id
      WHERE p.month = $1 AND p.year = $2
    `, [currentMonth, currentYear]);

    const recentPayruns = await pool.query(`
      SELECT p.*, u.full_name as generated_by_name,
             (SELECT SUM(net_pay) FROM payslips WHERE payrun_id = p.id) as total_cost,
             (SELECT COUNT(*) FROM payslips WHERE payrun_id = p.id) as employee_count
      FROM payruns p
      LEFT JOIN users u ON p.generated_by = u.id
      ORDER BY p.year DESC, p.month DESC LIMIT 5
    `);

    const empCount = await pool.query(`SELECT COUNT(*) as count FROM users WHERE is_active = true`);

    res.json({
      success: true,
      message: 'Payroll dashboard data fetched',
      data: {
        pending_leave_approvals: parseInt(pendingApprovals.rows[0].count),
        this_month_payrun: thisMonthPayrun.rows[0] || null,
        total_payroll_cost_this_month: parseFloat(totalCost.rows[0].total),
        recent_payruns: recentPayruns.rows,
        employees_count: parseInt(empCount.rows[0].count),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminDashboard, getEmployeeDashboard, getHRDashboard, getPayrollDashboard };
