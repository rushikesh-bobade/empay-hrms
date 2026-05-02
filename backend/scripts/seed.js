require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { pool, createTables } = require('../src/config/db');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

const users = [
  {
    full_name: "Arjun Mehta", email: "admin@empay.com", password: "Password@123",
    role: "admin", department: "Management", designation: "System Administrator",
    phone: "9876543210", date_joined: "2023-01-15"
  },
  {
    full_name: "Priya Sharma", email: "hr@empay.com", password: "Password@123",
    role: "hr_officer", department: "Human Resources", designation: "HR Manager",
    phone: "9876543211", date_joined: "2023-02-01"
  },
  {
    full_name: "Vikram Joshi", email: "payroll@empay.com", password: "Password@123",
    role: "payroll_officer", department: "Finance", designation: "Payroll Manager",
    phone: "9876543212", date_joined: "2023-02-15"
  },
  {
    full_name: "Sneha Patil", email: "sneha@empay.com", password: "Password@123",
    role: "employee", department: "Engineering", designation: "Frontend Developer",
    phone: "9876543213", date_joined: "2023-03-01"
  },
  {
    full_name: "Rahul Desai", email: "rahul@empay.com", password: "Password@123",
    role: "employee", department: "Engineering", designation: "Backend Developer",
    phone: "9876543214", date_joined: "2023-04-01"
  },
  {
    full_name: "Ananya Singh", email: "ananya@empay.com", password: "Password@123",
    role: "employee", department: "Design", designation: "UI/UX Designer",
    phone: "9876543215", date_joined: "2023-05-15"
  },
  {
    full_name: "Karan Nair", email: "karan@empay.com", password: "Password@123",
    role: "employee", department: "Marketing", designation: "Marketing Executive",
    phone: "9876543216", date_joined: "2023-06-01"
  },
  {
    full_name: "Pooja Iyer", email: "pooja@empay.com", password: "Password@123",
    role: "employee", department: "Engineering", designation: "Full Stack Developer",
    phone: "9876543217", date_joined: "2023-07-01"
  },
];

const leaveTypes = [
  { name: "Casual Leave", description: "Personal errands and casual absences", max_days_per_year: 12 },
  { name: "Sick Leave", description: "Medical illness or health reasons", max_days_per_year: 6 },
  { name: "Earned Leave", description: "Planned vacation or earned rest days", max_days_per_year: 15 },
];

const salaryMap = {
  "sneha@empay.com":   { basic: 45000, hra_percent: 40, special: 5000 },
  "rahul@empay.com":   { basic: 55000, hra_percent: 40, special: 8000 },
  "ananya@empay.com":  { basic: 40000, hra_percent: 40, special: 4000 },
  "karan@empay.com":   { basic: 35000, hra_percent: 40, special: 3000 },
  "pooja@empay.com":   { basic: 60000, hra_percent: 40, special: 10000 },
  "hr@empay.com":      { basic: 50000, hra_percent: 40, special: 6000 },
  "payroll@empay.com": { basic: 52000, hra_percent: 40, special: 7000 },
  "admin@empay.com":   { basic: 80000, hra_percent: 40, special: 15000 },
};

function randomTime(minHour, maxHour, minMin, maxMin) {
  const h = minHour + Math.floor(Math.random() * (maxHour - minHour + 1));
  const m = minMin + Math.floor(Math.random() * (maxMin - minMin + 1));
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting seed...');

    // Create tables
    await createTables();

    // Clean existing data (in reverse dependency order)
    await client.query('DELETE FROM payslips');
    await client.query('DELETE FROM payruns');
    await client.query('DELETE FROM leave_requests');
    await client.query('DELETE FROM leave_allocations');
    await client.query('DELETE FROM leave_types');
    await client.query('DELETE FROM salary_structures');
    await client.query('DELETE FROM attendance');
    await client.query('DELETE FROM users');
    console.log('  ✓ Cleaned existing data');

    // Seed users
    const userMap = {};
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, BCRYPT_ROUNDS);
      const result = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role, department, designation, phone, date_joined)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email, role`,
        [u.full_name, u.email, hash, u.role, u.department, u.designation, u.phone, u.date_joined]
      );
      userMap[u.email] = result.rows[0];
    }
    console.log(`  ✓ Created ${Object.keys(userMap).length} users`);

    // Seed leave types
    const leaveTypeIds = {};
    for (const lt of leaveTypes) {
      const result = await client.query(
        `INSERT INTO leave_types (name, description, max_days_per_year) VALUES ($1, $2, $3) RETURNING id, name`,
        [lt.name, lt.description, lt.max_days_per_year]
      );
      leaveTypeIds[lt.name] = result.rows[0].id;
    }
    console.log(`  ✓ Created ${Object.keys(leaveTypeIds).length} leave types`);

    // Seed salary structures
    let salaryCount = 0;
    for (const [email, salary] of Object.entries(salaryMap)) {
      if (userMap[email]) {
        await client.query(
          `INSERT INTO salary_structures (employee_id, basic_salary, hra_percent, special_allowance)
           VALUES ($1, $2, $3, $4)`,
          [userMap[email].id, salary.basic, salary.hra_percent, salary.special]
        );
        salaryCount++;
      }
    }
    console.log(`  ✓ Created ${salaryCount} salary structures`);

    // Seed leave allocations for all non-admin users
    const currentYear = new Date().getFullYear();
    let allocCount = 0;
    for (const [email, userData] of Object.entries(userMap)) {
      for (const [typeName, typeId] of Object.entries(leaveTypeIds)) {
        const maxDays = leaveTypes.find(lt => lt.name === typeName).max_days_per_year;
        await client.query(
          `INSERT INTO leave_allocations (employee_id, leave_type_id, allocated_days, used_days, year)
           VALUES ($1, $2, $3, 0, $4)`,
          [userData.id, typeId, maxDays, currentYear]
        );
        allocCount++;
      }
    }
    console.log(`  ✓ Created ${allocCount} leave allocations`);

    // Seed attendance (last 30 weekdays)
    const employeeEmails = Object.keys(userMap);
    let attendanceCount = 0;
    const today = new Date();

    for (const email of employeeEmails) {
      const empId = userMap[email].id;
      for (let i = 1; i <= 40; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

        const dateStr = d.toISOString().split('T')[0];
        const rand = Math.random();
        let status, checkIn, checkOut;

        if (rand < 0.80) {
          status = 'present';
          checkIn = randomTime(8, 9, 30, 59);
          checkOut = randomTime(17, 18, 0, 45);
        } else if (rand < 0.90) {
          status = 'absent';
          checkIn = null;
          checkOut = null;
        } else if (rand < 0.95) {
          status = 'half_day';
          checkIn = randomTime(9, 10, 0, 30);
          checkOut = randomTime(13, 14, 0, 30);
        } else {
          status = 'on_leave';
          checkIn = null;
          checkOut = null;
        }

        try {
          await client.query(
            `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (employee_id, date) DO NOTHING`,
            [empId, dateStr, checkIn, checkOut, status]
          );
          attendanceCount++;
        } catch (e) {
          // Ignore conflicts
        }
      }
    }
    console.log(`  ✓ Created ${attendanceCount} attendance records`);

    // Seed leave requests (2-3 per employee)
    const payrollOfficerId = userMap['payroll@empay.com'].id;
    const employeeUsers = Object.entries(userMap).filter(([_, u]) => u.role === 'employee');
    let leaveReqCount = 0;

    for (const [email, userData] of employeeUsers) {
      const leaveTypeNames = Object.keys(leaveTypeIds);

      // Approved leave
      const start1 = new Date(today);
      start1.setDate(start1.getDate() - 20);
      const end1 = new Date(start1);
      end1.setDate(end1.getDate() + 2);
      await client.query(
        `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, reviewed_by, reviewed_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'approved', $7, NOW())`,
        [userData.id, leaveTypeIds[leaveTypeNames[0]], start1.toISOString().split('T')[0],
         end1.toISOString().split('T')[0], 2, 'Family function', payrollOfficerId]
      );
      // Update used_days
      await client.query(
        `UPDATE leave_allocations SET used_days = used_days + 2
         WHERE employee_id = $1 AND leave_type_id = $2 AND year = $3`,
        [userData.id, leaveTypeIds[leaveTypeNames[0]], currentYear]
      );
      leaveReqCount++;

      // Pending leave
      const start2 = new Date(today);
      start2.setDate(start2.getDate() + 5);
      const end2 = new Date(start2);
      end2.setDate(end2.getDate() + 1);
      await client.query(
        `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
        [userData.id, leaveTypeIds[leaveTypeNames[1]], start2.toISOString().split('T')[0],
         end2.toISOString().split('T')[0], 1, 'Doctor appointment']
      );
      leaveReqCount++;

      // Rejected leave
      const start3 = new Date(today);
      start3.setDate(start3.getDate() - 10);
      const end3 = new Date(start3);
      end3.setDate(end3.getDate() + 4);
      await client.query(
        `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, reviewed_by, reviewed_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'rejected', $7, NOW())`,
        [userData.id, leaveTypeIds[leaveTypeNames[2]], start3.toISOString().split('T')[0],
         end3.toISOString().split('T')[0], 3, 'Vacation plan', payrollOfficerId]
      );
      leaveReqCount++;
    }
    console.log(`  ✓ Created ${leaveReqCount} leave requests`);

    // Seed last month's payrun
    const lastMonth = today.getMonth(); // 0-indexed, so this is "last month" as 1-indexed
    const lastMonthYear = lastMonth === 0 ? today.getFullYear() - 1 : today.getFullYear();
    const lastMonthNum = lastMonth === 0 ? 12 : lastMonth;

    const payrunResult = await client.query(
      `INSERT INTO payruns (month, year, status, generated_by)
       VALUES ($1, $2, 'finalized', $3) RETURNING id`,
      [lastMonthNum, lastMonthYear, userMap['admin@empay.com'].id]
    );
    const payrunId = payrunResult.rows[0].id;

    // Calculate working days for last month
    const daysInLastMonth = new Date(lastMonthYear, lastMonthNum, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= daysInLastMonth; d++) {
      const day = new Date(lastMonthYear, lastMonthNum - 1, d).getDay();
      if (day !== 0 && day !== 6) workingDays++;
    }

    const firstDay = `${lastMonthYear}-${String(lastMonthNum).padStart(2, '0')}-01`;
    const lastDay = `${lastMonthYear}-${String(lastMonthNum).padStart(2, '0')}-${daysInLastMonth}`;

    let payslipCount = 0;
    for (const [email, salary] of Object.entries(salaryMap)) {
      if (!userMap[email]) continue;
      const empId = userMap[email].id;

      // Get attendance for last month
      const attResult = await client.query(
        `SELECT
           COALESCE(SUM(CASE WHEN status='present' THEN 1 WHEN status='half_day' THEN 0.5 WHEN status='on_leave' THEN 1 ELSE 0 END), 0) AS present_days,
           COALESCE(COUNT(*) FILTER (WHERE status = 'on_leave'), 0) AS leaves_approved
         FROM attendance WHERE employee_id = $1 AND date BETWEEN $2 AND $3`,
        [empId, firstDay, lastDay]
      );

      const presentDays = parseFloat(attResult.rows[0].present_days) || workingDays * 0.85;
      const leavesApproved = parseInt(attResult.rows[0].leaves_approved) || 0;

      const perDay = salary.basic / workingDays;
      const effectiveBasic = perDay * presentDays;
      const hra = (salary.hra_percent / 100) * effectiveBasic;
      const gross = effectiveBasic + hra + salary.special;
      const pfEmp = 0.12 * effectiveBasic;
      const pfEmpr = 0.12 * effectiveBasic;
      const profTax = gross > 15000 ? 200 : 0;
      const totalDed = pfEmp + profTax;
      const netPay = gross - totalDed;

      await client.query(
        `INSERT INTO payslips (payrun_id, employee_id, working_days, present_days, leaves_approved,
         basic, hra, special_allowance, gross_salary, pf_employee, pf_employer,
         professional_tax, total_deductions, net_pay)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [payrunId, empId, workingDays, presentDays.toFixed(2), leavesApproved,
         effectiveBasic.toFixed(2), hra.toFixed(2), salary.special,
         gross.toFixed(2), pfEmp.toFixed(2), pfEmpr.toFixed(2),
         profTax.toFixed(2), totalDed.toFixed(2), netPay.toFixed(2)]
      );
      payslipCount++;
    }
    console.log(`  ✓ Created payrun with ${payslipCount} payslips for ${lastMonthNum}/${lastMonthYear}`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:          admin@empay.com    / Password@123');
    console.log('  HR Officer:     hr@empay.com       / Password@123');
    console.log('  Payroll Officer: payroll@empay.com  / Password@123');
    console.log('  Employee:       sneha@empay.com    / Password@123');
    console.log('  Employee:       rahul@empay.com    / Password@123');

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

seed();
