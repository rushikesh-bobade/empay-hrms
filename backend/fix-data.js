const { pool } = require('./src/config/db');
const payrollService = require('./src/modules/payroll/payroll.service');

async function fixData() {
  try {
    console.log('Fixing leave allocations...');
    // Update all leave allocations to 30 days
    await pool.query('UPDATE leave_allocations SET allocated_days = 30');
    console.log('Leave allocations updated to 30 days.');

    console.log('Regenerating payrun for May 2026...');
    // Generate payrun for May 2026 (Month 5) using admin user id (assuming id 1 is admin)
    // First let's get the admin user
    const adminRes = await pool.query("SELECT id FROM users WHERE email = 'admin@empay.com'");
    if (adminRes.rows.length > 0) {
      const adminId = adminRes.rows[0].id;
      await payrollService.generatePayrun(5, 2026, adminId);
      console.log('May 2026 payrun regenerated successfully.');
    } else {
      console.log('Admin user not found. Skipping payrun generation.');
    }

    console.log('All fixes applied successfully.');
  } catch (error) {
    console.error('Error applying fixes:', error);
  } finally {
    pool.end();
  }
}

fixData();
