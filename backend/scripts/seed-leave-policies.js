require('dotenv').config();
const { pool } = require('../src/config/db');

const leavePolicies = [
  { name: "Earned/Privilege Leave", description: "Planned vacations and rest days. Accrued monthly.", max_days_per_year: 18, is_paid: true },
  { name: "Casual Leave", description: "Sudden, unforeseen personal work or emergencies.", max_days_per_year: 10, is_paid: true },
  { name: "Sick/Medical Leave", description: "Health-related issues. Medical certificate required for >3 days.", max_days_per_year: 10, is_paid: true },
  { name: "Maternity Leave", description: "Mandated 26 weeks for women expecting a child.", max_days_per_year: 182, is_paid: true },
  { name: "Paternity Leave", description: "Assistance with a newborn or adopted child for fathers.", max_days_per_year: 15, is_paid: true },
  { name: "Adoption/Surrogacy Leave", description: "Leave granted for adopting a child.", max_days_per_year: 15, is_paid: true },
  { name: "Bereavement Leave", description: "Demise of an immediate family member.", max_days_per_year: 5, is_paid: true },
  { name: "Marriage Leave", description: "Employee wedding.", max_days_per_year: 5, is_paid: true },
  { name: "Compensatory Off", description: "Earned when working on weekends or holidays.", max_days_per_year: 0, is_paid: true },
  { name: "Sabbatical Leave", description: "Extended time off for education or personal ventures.", max_days_per_year: 0, is_paid: false },
  { name: "Loss of Pay (LOP)", description: "Leave Without Pay when balances are exhausted.", max_days_per_year: 0, is_paid: false }
];

async function seedLeavePolicies() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting Indian IT Leave Policies Seeding...');

    // Ensure is_paid column exists
    try {
      await client.query("ALTER TABLE leave_types ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT TRUE");
      console.log('Added missing column is_paid to leave_types.');
    } catch (e) {
      // Column likely exists already
    }
    
    // Check if we need to rename some existing ones
    await client.query("UPDATE leave_types SET name = 'Loss of Pay (LOP)' WHERE name = 'Unpaid Leave'");
    await client.query("UPDATE leave_types SET name = 'Earned/Privilege Leave' WHERE name = 'Earned Leave'");
    await client.query("UPDATE leave_types SET name = 'Sick/Medical Leave' WHERE name = 'Sick Leave'");

    const insertedOrUpdated = [];

    for (const policy of leavePolicies) {
      const existingRes = await client.query('SELECT id FROM leave_types WHERE name = $1', [policy.name]);
      let result;
      if (existingRes.rows.length > 0) {
        result = await client.query(
          `UPDATE leave_types 
           SET description = $2, max_days_per_year = $3, is_paid = $4
           WHERE name = $1 RETURNING *`,
          [policy.name, policy.description, policy.max_days_per_year, policy.is_paid]
        );
      } else {
        result = await client.query(
          `INSERT INTO leave_types (name, description, max_days_per_year, is_paid) 
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [policy.name, policy.description, policy.max_days_per_year, policy.is_paid]
        );
      }
      insertedOrUpdated.push(result.rows[0]);
    }

    console.log(`✅ Upserted ${insertedOrUpdated.length} leave types.`);

    // Now, ensure all current employees have allocations for the new leave types
    console.log('Syncing leave allocations for all employees...');
    const usersRes = await client.query("SELECT id FROM users");
    const users = usersRes.rows;
    const currentYear = new Date().getFullYear();

    let newAllocations = 0;
    for (const user of users) {
      for (const policy of insertedOrUpdated) {
        const allocRes = await client.query(
          `INSERT INTO leave_allocations (employee_id, leave_type_id, allocated_days, year)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING`,
          [user.id, policy.id, policy.max_days_per_year, currentYear]
        );
        if (allocRes.rowCount > 0) newAllocations++;
      }
    }
    
    console.log(`✅ Created ${newAllocations} missing leave allocations for users.`);
    console.log('🎉 Leave policies seeded successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seedLeavePolicies();
