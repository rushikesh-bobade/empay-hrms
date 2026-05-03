require('dotenv').config();
const { pool } = require('../src/config/db');

async function cleanupLeaves() {
  const client = await pool.connect();
  try {
    console.log('🧹 Starting Leave Policy Refinement...');

    // 1. Remove Sabbatical Leave and Loss of Pay (LOP)
    // We use DELETE which will cascade to allocations and requests if constraints are set,
    // but better to be safe and check if they exist.
    const toRemove = ['Sabbatical Leave', 'Loss of Pay (LOP)'];
    for (const name of toRemove) {
      const ltRes = await client.query("SELECT id FROM leave_types WHERE name = $1", [name]);
      if (ltRes.rows.length > 0) {
        const ltId = ltRes.rows[0].id;
        await client.query("DELETE FROM leave_requests WHERE leave_type_id = $1", [ltId]);
        await client.query("DELETE FROM leave_allocations WHERE leave_type_id = $1", [ltId]);
        await client.query("DELETE FROM leave_types WHERE id = $1", [ltId]);
        console.log(`Deleted leave type and related records: ${name}`);
      }
    }

    // 2. Identify Special Leaves
    const specialLeaves = [
      'Compensatory Off',
      'Bereavement Leave',
      'Marriage Leave',
      'Maternity Leave',
      'Paternity Leave',
      'Adoption/Surrogacy Leave'
    ];

    // 3. Reset allocations for special leaves to 0 for everyone for the current year
    const currentYear = new Date().getFullYear();
    for (const name of specialLeaves) {
      // First get the ID
      const ltRes = await client.query("SELECT id FROM leave_types WHERE name = $1", [name]);
      if (ltRes.rows.length > 0) {
        const ltId = ltRes.rows[0].id;
        
        // Update leave_types max_days to 0 (since it's a special leave not common to everyone)
        await client.query("UPDATE leave_types SET max_days_per_year = 0 WHERE id = $1", [ltId]);
        
        // Reset allocations to 0
        const allocRes = await client.query(
          "UPDATE leave_allocations SET allocated_days = 0 WHERE leave_type_id = $1 AND year = $2",
          [ltId, currentYear]
        );
        console.log(`Reset ${allocRes.rowCount} allocations for special leave: ${name}`);
      }
    }

    console.log('🎉 Leave Policy Refinement completed successfully!');

  } catch (error) {
    console.error('❌ Refinement failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

cleanupLeaves();
