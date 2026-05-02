const { pool } = require('./src/config/db');
const payrollService = require('./src/modules/payroll/payroll.service');

async function regenPayrun() {
  try {
    console.log('Regenerating payrun for May 2026...');
    const adminRes = await pool.query("SELECT id FROM users WHERE email = 'admin@empay.com'");
    if (adminRes.rows.length > 0) {
      const adminId = adminRes.rows[0].id;
      await payrollService.generatePayrun(5, 2026, adminId);
      console.log('May 2026 payrun regenerated successfully with deduction logic.');
    }
  } catch (error) {
    console.error('Error applying fixes:', error);
  } finally {
    pool.end();
  }
}

regenPayrun();
