require('dotenv').config();
const { pool } = require('./src/config/db');

async function test() {
  try {
    const employeeId = '20a25d02-abe6-45ed-80ae-4ff4252f3d6d';
    const currentYear = 2026;
    const currentMonth = 5;

    const leaveBalance = await pool.query(`
      SELECT 
        lt.id as leave_type_id,
        lt.name as leave_type, 
        la.allocated_days as allocated,
        la.used_days as used, 
        (la.allocated_days - la.used_days) as remaining,
        COALESCE((
          SELECT SUM(total_days)
          FROM leave_requests
          WHERE employee_id = $1 
            AND leave_type_id = lt.id
            AND status = 'approved'
            AND EXTRACT(MONTH FROM start_date) = $3
            AND EXTRACT(YEAR FROM start_date) = $2
        ), 0) as used_this_month
      FROM leave_allocations la
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.employee_id = $1 AND la.year = $2
    `, [employeeId, currentYear, currentMonth]);

    console.log('Rows found:', leaveBalance.rows.length);
    console.log('Rows:', JSON.stringify(leaveBalance.rows, null, 2));
  } catch (error) {
    console.error('Query failed:', error);
  } finally {
    pool.end();
  }
}

test();
