require('dotenv').config();
const { pool, initTables } = require('../src/config/db');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;
const USER_COUNT = 300;

function randomTime(startH, startM, endH, endM) {
  const h = Math.floor(Math.random() * (endH - startH + 1)) + startH;
  const m = Math.floor(Math.random() * (endM - startM + 1)) + startM;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

async function seed300() {
  const client = await pool.connect();
  try {
    console.log(`🌱 Starting mass seed for ${USER_COUNT} users...`);
    
    await initTables();

    // Generate 300 users
    console.log('Generating users...');
    const defaultPassword = 'Password@123';
    const hash = await bcrypt.hash(defaultPassword, BCRYPT_ROUNDS);
    
    const users = [];
    const departments = ['Engineering', 'Human Resources', 'Finance', 'Design', 'Marketing', 'Sales', 'Product', 'Support'];
    const designations = ['Developer', 'Manager', 'Analyst', 'Designer', 'Executive', 'Specialist', 'Lead', 'Coordinator'];

    for (let i = 0; i < USER_COUNT; i++) {
      users.push({
        full_name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password_hash: hash,
        role: 'employee', // most are employees
        department: faker.helpers.arrayElement(departments),
        designation: faker.helpers.arrayElement(designations),
        phone: faker.phone.number({ style: 'international' }).replace(/[^0-9+]/g, '').substring(0, 15),
        date_joined: faker.date.past({ years: 3 }).toISOString().split('T')[0]
      });
    }

    // Insert Users
    const insertedUserIds = [];
    for (const u of users) {
      const res = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role, department, designation, phone, date_joined)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [u.full_name, u.email, u.password_hash, u.role, u.department, u.designation, u.phone, u.date_joined]
      );
      if (res.rows.length > 0) insertedUserIds.push(res.rows[0].id);
    }
    console.log(`✅ Seeded ${insertedUserIds.length} users.`);

    if (insertedUserIds.length === 0) {
      console.log('No new users to insert. (Already seeded?)');
      return;
    }

    // Insert Salary Structures
    console.log('Generating salary structures...');
    for (const id of insertedUserIds) {
      const basic = faker.number.int({ min: 20000, max: 150000 });
      const special = faker.number.int({ min: 1000, max: 20000 });
      await client.query(
        `INSERT INTO salary_structures (employee_id, basic_salary, hra_percent, special_allowance)
         VALUES ($1, $2, 40.00, $3)
         ON CONFLICT (employee_id) DO NOTHING`,
        [id, basic, special]
      );
    }
    console.log('✅ Salary structures seeded.');

    // Fetch leave types
    const ltRes = await client.query('SELECT id, max_days_per_year FROM leave_types');
    const leaveTypes = ltRes.rows;

    // Leave Allocations
    console.log('Generating leave allocations...');
    const currentYear = new Date().getFullYear();
    for (const id of insertedUserIds) {
      for (const lt of leaveTypes) {
        await client.query(
          `INSERT INTO leave_allocations (employee_id, leave_type_id, allocated_days, year)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING`,
          [id, lt.id, lt.max_days_per_year, currentYear]
        );
      }
    }
    console.log('✅ Leave allocations seeded.');

    // Seed Attendance (Last 30 days)
    console.log('Generating attendance data (last 30 days)...');
    let attCount = 0;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const day = d.getDay();
      if (day === 0 || day === 6) continue; // skip weekends

      const dateStr = d.toISOString().split('T')[0];
      
      // Batch insert for performance
      for (const id of insertedUserIds) {
        const rand = Math.random();
        let status, checkIn, checkOut;

        if (rand < 0.85) {
          status = 'present';
          checkIn = `${dateStr}T${randomTime(8, 30, 9, 30)}`;
          checkOut = `${dateStr}T${randomTime(17, 30, 18, 30)}`;
        } else if (rand < 0.90) {
          status = 'absent';
          checkIn = null;
          checkOut = null;
        } else if (rand < 0.95) {
          status = 'half_day';
          checkIn = `${dateStr}T${randomTime(8, 30, 9, 30)}`;
          checkOut = `${dateStr}T${randomTime(13, 0, 14, 0)}`;
        } else {
          status = 'on_leave';
          checkIn = null;
          checkOut = null;
        }

        await client.query(
          `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (employee_id, date) DO NOTHING`,
          [id, dateStr, checkIn, checkOut, status]
        );
        attCount++;
      }
    }
    console.log(`✅ Seeded ${attCount} attendance records.`);

    console.log('🎉 Mass seed completed successfully!');
  } catch (error) {
    console.error('❌ Mass Seed failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seed300();
