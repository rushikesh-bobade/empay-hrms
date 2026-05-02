const { pool } = require('./src/config/db');

async function fixLeaves() {
  try {
    console.log('Fixing leave allocations as per new requirements...');
    
    // Casual Leave: 2
    await pool.query(`
      UPDATE leave_allocations 
      SET allocated_days = 2 
      FROM leave_types 
      WHERE leave_allocations.leave_type_id = leave_types.id 
      AND leave_types.name = 'Casual Leave'
    `);
    console.log('Casual leaves updated to 2.');

    // Sick Leave: 3
    await pool.query(`
      UPDATE leave_allocations 
      SET allocated_days = 3 
      FROM leave_types 
      WHERE leave_allocations.leave_type_id = leave_types.id 
      AND leave_types.name = 'Sick Leave'
    `);
    console.log('Sick leaves updated to 3.');

    // Earned Leave: 2
    await pool.query(`
      UPDATE leave_allocations 
      SET allocated_days = 2 
      FROM leave_types 
      WHERE leave_allocations.leave_type_id = leave_types.id 
      AND leave_types.name = 'Earned Leave'
    `);
    console.log('Earned leaves updated to 2.');

    console.log('All leave allocations fixed successfully.');
  } catch (error) {
    console.error('Error applying fixes:', error);
  } finally {
    pool.end();
  }
}

fixLeaves();
