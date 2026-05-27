/**
 * seed-demo-data.js
 * 
 * Seeds realistic demo data for EmPay HRMS: attendance, leave allocations,
 * leave requests, salary structures, payruns, and payslips.
 * 
 * Run: node seed-demo-data.js
 * 
 * This is SAFE to re-run — uses ON CONFLICT / checks to avoid duplicates.
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────

const today = new Date();
const fmt = (d) => d.toISOString().slice(0, 10);

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function subtractDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

// ────────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting demo data seeding...\n');

  // 1. Get all employees
  const { rows: employees } = await pool.query(
    "SELECT id, full_name, role FROM users WHERE role = 'employee' ORDER BY id"
  );

  if (employees.length === 0) {
    console.log('⚠️  No employees found. Start the backend first (node src/app.js) to seed users.');
    process.exit(1);
  }

  console.log(`Found ${employees.length} employees: ${employees.map(e => e.full_name).join(', ')}\n`);

  // 2. Get leave types
  const { rows: leaveTypes } = await pool.query('SELECT id, name, max_days_per_year FROM leave_types ORDER BY id');
  console.log(`Found ${leaveTypes.length} leave types: ${leaveTypes.map(lt => lt.name).join(', ')}\n`);

  // ── Attendance (last 30 days) ───────────────────────────────────────────────
  console.log('📅 Seeding attendance records (last 30 days)...');

  for (const emp of employees) {
    for (let daysAgo = 30; daysAgo >= 1; daysAgo--) {
      const date = subtractDays(today, daysAgo);
      const dow = date.getDay();

      // Skip weekends
      if (dow === 0 || dow === 6) continue;

      // 85% present, 10% absent, 5% half-day
      const roll = Math.random();
      if (roll > 0.85) continue; // absent days

      const checkInHour = randomBetween(8, 10);
      const checkInMin = randomBetween(0, 59);
      const checkIn = new Date(date);
      checkIn.setHours(checkInHour, checkInMin, 0, 0);

      let checkOut = null;
      let status = 'present';

      if (roll > 0.80) {
        // Half day
        checkOut = new Date(checkIn);
        checkOut.setHours(checkInHour + 4, randomBetween(0, 59), 0, 0);
        status = 'half_day';
      } else {
        // Full day (8-10 hours)
        checkOut = new Date(checkIn);
        checkOut.setHours(checkInHour + randomBetween(8, 10), randomBetween(0, 59), 0, 0);
        status = 'present';
      }

      try {
        await pool.query(
          `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (employee_id, date) DO NOTHING`,
          [emp.id, fmt(date), checkIn ? checkIn.toTimeString().split(' ')[0] : null, checkOut ? checkOut.toTimeString().split(' ')[0] : null, status]
        );
      } catch (e) {
        console.error('Insert error:', e.message);
      }
    }
    process.stdout.write(`   ✅ ${emp.full_name}\n`);
  }

  // ── Leave Allocations ──────────────────────────────────────────────────────
  console.log('\n📋 Seeding leave allocations...');

  const currentYear = today.getFullYear();
  for (const emp of employees) {
    for (const lt of leaveTypes) {
      const exists = await pool.query(
        'SELECT id FROM leave_allocations WHERE employee_id=$1 AND leave_type_id=$2 AND year=$3',
        [emp.id, lt.id, currentYear]
      );
      if (exists.rows.length === 0) {
        await pool.query(
          'INSERT INTO leave_allocations (employee_id, leave_type_id, allocated_days, used_days, year) VALUES ($1,$2,$3,$4,$5)',
          [emp.id, lt.id, lt.max_days_per_year, randomBetween(0, 3), currentYear]
        );
      }
    }
    process.stdout.write(`   ✅ ${emp.full_name}\n`);
  }

  // ── Leave Requests ─────────────────────────────────────────────────────────
  console.log('\n📝 Seeding leave requests...');

  const statuses = ['pending', 'approved', 'approved', 'rejected'];
  for (const emp of employees) {
    const numRequests = randomBetween(1, 3);
    for (let i = 0; i < numRequests; i++) {
      const startDaysAgo = randomBetween(5, 25);
      const duration = randomBetween(1, 3);
      const startDate = subtractDays(today, startDaysAgo);
      const endDate = subtractDays(today, startDaysAgo - duration);
      const leaveType = leaveTypes[randomBetween(0, Math.min(2, leaveTypes.length - 1))];
      const status = statuses[randomBetween(0, statuses.length - 1)];
      const reasons = ['Personal work needed', 'Family function event', 'Not feeling well today', 'Doctor appointment visit', 'Travel plans ahead'];

      try {
        await pool.query(
          `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [emp.id, leaveType.id, fmt(startDate), fmt(endDate), duration, reasons[randomBetween(0, reasons.length - 1)], status]
        );
      } catch (e) {
        // ignore
      }
    }
    process.stdout.write(`   ✅ ${emp.full_name} (${numRequests} requests)\n`);
  }

  // ── Salary Structures ──────────────────────────────────────────────────────
  console.log('\n💰 Seeding salary structures...');

  const salaryData = {
    'Software Engineer': { basic: 50000, hra_pct: 40, special: 10000 },
    'Frontend Developer': { basic: 45000, hra_pct: 40, special: 8000 },
    'UI/UX Designer': { basic: 42000, hra_pct: 40, special: 7000 },
    'Marketing Lead': { basic: 48000, hra_pct: 40, special: 9000 },
    'Financial Analyst': { basic: 46000, hra_pct: 40, special: 8500 },
  };

  for (const emp of employees) {
    const { rows: existingSalary } = await pool.query(
      'SELECT id FROM salary_structures WHERE employee_id=$1', [emp.id]
    );
    if (existingSalary.length > 0) continue;

    const { rows: userRows } = await pool.query('SELECT designation FROM users WHERE id=$1', [emp.id]);
    const designation = userRows[0]?.designation || 'Software Engineer';
    const sal = salaryData[designation] || salaryData['Software Engineer'];

    await pool.query(
      `INSERT INTO salary_structures (employee_id, basic_salary, hra_percent, special_allowance, effective_from)
       VALUES ($1,$2,$3,$4,$5)`,
      [emp.id, sal.basic, sal.hra_pct, sal.special, `${currentYear}-01-01`]
    );
    process.stdout.write(`   ✅ ${emp.full_name} — ₹${sal.basic} basic\n`);
  }

  // ── Payruns & Payslips (last 3 months) ─────────────────────────────────────
  console.log('\n📊 Seeding payruns & payslips...');

  for (let monthsAgo = 3; monthsAgo >= 1; monthsAgo--) {
    const payMonth = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
    const month = payMonth.getMonth() + 1; // 1-12
    const year = payMonth.getFullYear();
    const monthStr = payMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Check if payrun exists
    const { rows: existingPayrun } = await pool.query(
      'SELECT id FROM payruns WHERE month=$1 AND year=$2', [month, year]
    );

    let payrunId;
    if (existingPayrun.length > 0) {
      payrunId = existingPayrun[0].id;
      console.log(`   ⏭️  Payrun for ${monthStr} already exists, skipping.`);
      continue;
    } else {
      const { rows: payrunRows } = await pool.query(
        `INSERT INTO payruns (month, year, status, generated_by)
         VALUES ($1, $2, 'finalized', (SELECT id FROM users WHERE role='admin' LIMIT 1))
         RETURNING id`,
        [month, year]
      );
      payrunId = payrunRows[0].id;
    }

    // Create payslips for each employee
    for (const emp of employees) {
      const { rows: salStruct } = await pool.query(
        'SELECT * FROM salary_structures WHERE employee_id=$1 ORDER BY effective_from DESC LIMIT 1',
        [emp.id]
      );
      if (salStruct.length === 0) continue;

      const sal = salStruct[0];
      const workingDays = 22;
      const presentDays = randomBetween(18, 22);
      const leavesApproved = randomBetween(0, 2);
      const unpaidLeaveDays = Math.max(0, workingDays - presentDays - leavesApproved);

      const basic = parseFloat(sal.basic_salary);
      const hraPercent = parseFloat(sal.hra_percent);
      const specialAllowance = parseFloat(sal.special_allowance);

      const unpaidDeduction = unpaidLeaveDays > 0 ? Math.round((basic / workingDays) * unpaidLeaveDays * 100) / 100 : 0;
      const effectiveBasic = Math.round((basic - unpaidDeduction) * 100) / 100;
      const hra = Math.round(effectiveBasic * (hraPercent / 100) * 100) / 100;
      const grossSalary = Math.round((effectiveBasic + hra + specialAllowance) * 100) / 100;

      const pfEmployee = Math.round(effectiveBasic * 0.12 * 100) / 100;
      const pfEmployer = Math.round(effectiveBasic * 0.12 * 100) / 100;
      const professionalTax = grossSalary > 15000 ? 200 : 0;
      const totalDeductions = Math.round((pfEmployee + professionalTax + unpaidDeduction) * 100) / 100;
      const netPay = Math.round((grossSalary - totalDeductions) * 100) / 100;

      try {
        await pool.query(
          `INSERT INTO payslips (payrun_id, employee_id, working_days, present_days, leaves_approved, 
            unpaid_leave_days, unpaid_deduction, basic, hra, special_allowance, gross_salary,
            pf_employee, pf_employer, professional_tax, total_deductions, net_pay)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
           ON CONFLICT (payrun_id, employee_id) DO NOTHING`,
          [payrunId, emp.id, workingDays, presentDays, leavesApproved,
            unpaidLeaveDays, unpaidDeduction, effectiveBasic, hra, specialAllowance, grossSalary,
            pfEmployee, pfEmployer, professionalTax, totalDeductions, netPay]
        );
      } catch (e) {
        // ignore
      }
    }
    console.log(`   ✅ Payrun: ${monthStr} (${employees.length} payslips)`);
  }

  console.log('\n🎉 Demo data seeding complete!');
  console.log('   You should now see data in dashboards and graphs.\n');

  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
