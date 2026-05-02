require('dotenv').config();
const { pool, createTables } = require('../src/config/db');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

const users = [
  { full_name: "Arjun Mehta", email: "admin@empay.com", password: "Password@123", role: "admin", department: "Management", designation: "System Administrator", phone: "9876543210", date_joined: "2023-01-15" },
  { full_name: "Priya Sharma", email: "hr@empay.com", password: "Password@123", role: "hr_officer", department: "Human Resources", designation: "HR Manager", phone: "9876543211", date_joined: "2023-02-01" },
  { full_name: "Vikram Joshi", email: "payroll@empay.com", password: "Password@123", role: "payroll_officer", department: "Finance", designation: "Payroll Manager", phone: "9876543212", date_joined: "2023-02-15" },
  { full_name: "Sneha Patil", email: "sneha@empay.com", password: "Password@123", role: "employee", department: "Engineering", designation: "Frontend Developer", phone: "9876543213", date_joined: "2023-03-01" },
  { full_name: "Rahul Desai", email: "rahul@empay.com", password: "Password@123", role: "employee", department: "Engineering", designation: "Backend Developer", phone: "9876543214", date_joined: "2023-04-01" },
  { full_name: "Ananya Singh", email: "ananya@empay.com", password: "Password@123", role: "employee", department: "Design", designation: "UI/UX Designer", phone: "9876543215", date_joined: "2023-05-15" },
  { full_name: "Karan Nair", email: "karan@empay.com", password: "Password@123", role: "employee", department: "Marketing", designation: "Marketing Executive", phone: "9876543216", date_joined: "2023-06-01" },
  { full_name: "Pooja Iyer", email: "pooja@empay.com", password: "Password@123", role: "employee", department: "Engineering", designation: "Full Stack Developer", phone: "9876543217", date_joined: "2023-07-01" },
];

const leaveTypesData = [
  { name: "Casual Leave", description: "Personal errands and casual absences", max_days_per_year: 12, is_paid: true },
  { name: "Sick Leave", description: "Medical illness or health reasons", max_days_per_year: 6, is_paid: true },
  { name: "Earned Leave", description: "Planned vacation or earned rest days", max_days_per_year: 15, is_paid: true },
  { name: "Unpaid Leave", description: "Time-off without pay", max_days_per_year: 30, is_paid: false },
];

const salaryData = [
  { email: "sneha@empay.com", basic: 45000, hra_percent: 40, special: 5000 },
  { email: "rahul@empay.com", basic: 55000, hra_percent: 40, special: 8000 },
  { email: "ananya@empay.com", basic: 40000, hra_percent: 40, special: 4000 },
  { email: "karan@empay.com", basic: 35000, hra_percent: 40, special: 3000 },
  { email: "pooja@empay.com", basic: 60000, hra_percent: 40, special: 10000 },
  { email: "hr@empay.com", basic: 50000, hra_percent: 40, special: 6000 },
  { email: "payroll@empay.com", basic: 52000, hra_percent: 40, special: 7000 },
  { email: "admin@empay.com", basic: 80000, hra_percent: 40, special: 15000 },
];

function randomTime(startH, startM, endH, endM) {
  const h = Math.floor(Math.random() * (endH - startH + 1)) + startH;
  const m = Math.floor(Math.random() * (endM - startM + 1)) + startM;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting seed...');
    
    // Init tables
    await createTables();
    
    // Clear existing data in order
    await client.query('DELETE FROM payslips');
    await client.query('DELETE FROM payruns');
    await client.query('DELETE FROM leave_requests');
    await client.query('DELETE FROM leave_allocations');
    await client.query('DELETE FROM attendance');
    await client.query('DELETE FROM salary_structures');
    await client.query('DELETE FROM leave_types');
    await client.query('DELETE FROM users');
    console.log('🗑️  Cleared existing data');

    // 1. Create users
    const userMap = {};
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, BCRYPT_ROUNDS);
      const result = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role, department, designation, phone, date_joined)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, email, role`,
        [u.full_name, u.email, hash, u.role, u.department, u.designation, u.phone, u.date_joined]
      );
      userMap[u.email] = result.rows[0];
    }
    console.log(`✅ Created ${Object.keys(userMap).length} users`);

    // 2. Create leave types
    const leaveTypeMap = {};
    for (const lt of leaveTypesData) {
      const result = await client.query(
        `INSERT INTO leave_types (name, description, max_days_per_year, is_paid) VALUES ($1, $2, $3, $4) RETURNING *`,
        [lt.name, lt.description, lt.max_days_per_year, lt.is_paid]
      );
      leaveTypeMap[lt.name] = result.rows[0];
    }
    console.log(`✅ Created ${Object.keys(leaveTypeMap).length} leave types`);

    // 3. Create salary structures
    for (const s of salaryData) {
      const user = userMap[s.email];
      await client.query(
        `INSERT INTO salary_structures (employee_id, basic_salary, hra_percent, special_allowance)
         VALUES ($1, $2, $3, $4)`,
        [user.id, s.basic, s.hra_percent, s.special]
      );
    }
    console.log(`✅ Created ${salaryData.length} salary structures`);

    // 4. Create leave allocations (for all users, current year)
    const currentYear = new Date().getFullYear();
    for (const email in userMap) {
      const user = userMap[email];
      for (const ltName in leaveTypeMap) {
        const lt = leaveTypeMap[ltName];
        await client.query(
          `INSERT INTO leave_allocations (employee_id, leave_type_id, allocated_days, used_days, year)
           VALUES ($1, $2, $3, 0, $4)`,
          [user.id, lt.id, lt.max_days_per_year, currentYear]
        );
      }
    }
    console.log('✅ Created leave allocations for all users');

    // 5. Seed attendance (last 30 weekdays for each user)
    const today = new Date();
    for (const email in userMap) {
      const user = userMap[email];
      let count = 0;
      for (let i = 1; i <= 45 && count < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const day = d.getDay();
        if (day === 0 || day === 6) continue; // skip weekends
        
        const dateStr = d.toISOString().split('T')[0];
        const rand = Math.random();
        let status, checkIn, checkOut;

        if (rand < 0.80) {
          status = 'present';
          checkIn = randomTime(8, 30, 9, 30);
          checkOut = randomTime(17, 30, 18, 30);
        } else if (rand < 0.90) {
          status = 'absent';
          checkIn = null;
          checkOut = null;
        } else if (rand < 0.95) {
          status = 'half_day';
          checkIn = randomTime(8, 30, 9, 30);
          checkOut = randomTime(13, 0, 14, 0);
        } else {
          status = 'on_leave';
          checkIn = null;
          checkOut = null;
        }

        await client.query(
          `INSERT INTO attendance (employee_id, date, check_in, check_out, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (employee_id, date) DO NOTHING`,
          [user.id, dateStr, checkIn, checkOut, status]
        );
        count++;
      }
    }
    console.log('✅ Seeded attendance data (last 30 weekdays per user)');

    // 6. Seed leave requests (2-3 per non-admin employee)
    const employees = Object.values(userMap).filter(u => u.role === 'employee');
    const payrollOfficer = userMap['payroll@empay.com'];
    const leaveTypeIds = Object.values(leaveTypeMap).map(lt => lt.id);
    const statuses = ['approved', 'pending', 'rejected'];

    for (const emp of employees) {
      for (let i = 0; i < 3; i++) {
        const startOffset = Math.floor(Math.random() * 20) + 5;
        const duration = Math.floor(Math.random() * 3) + 1;
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - startOffset);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);

        const status = statuses[i];
        const leaveTypeId = leaveTypeIds[i % leaveTypeIds.length];
        const reasons = ['Personal work', 'Feeling unwell', 'Family function', 'Doctor appointment', 'Vacation'];

        await client.query(
          `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason, status, reviewed_by, reviewed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            emp.id, leaveTypeId,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
            duration,
            reasons[Math.floor(Math.random() * reasons.length)],
            status,
            status !== 'pending' ? payrollOfficer.id : null,
            status !== 'pending' ? new Date().toISOString() : null,
          ]
        );

        // Update used_days for approved
        if (status === 'approved') {
          await client.query(
            `UPDATE leave_allocations SET used_days = used_days + $1
             WHERE employee_id = $2 AND leave_type_id = $3 AND year = $4`,
            [duration, emp.id, leaveTypeId, currentYear]
          );
        }
      }
    }
    console.log('✅ Seeded leave requests');

    // 7. Seed last month's payrun
    const lastMonth = today.getMonth() === 0 ? 12 : today.getMonth();
    const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

    const payrunResult = await client.query(
      `INSERT INTO payruns (month, year, status, generated_by)
       VALUES ($1, $2, 'finalized', $3) RETURNING id`,
      [lastMonth, lastMonthYear, userMap['admin@empay.com'].id]
    );
    const payrunId = payrunResult.rows[0].id;

    // Calculate working days for last month
    const daysInMonth = new Date(lastMonthYear, lastMonth, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const day = new Date(lastMonthYear, lastMonth - 1, d).getDay();
      if (day !== 0 && day !== 6) workingDays++;
    }

    for (const s of salaryData) {
      const user = userMap[s.email];
      
      // Get attendance for last month
      const att = await client.query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'present') as present_count,
           COUNT(*) FILTER (WHERE status = 'half_day') as half_day_count,
           COUNT(*) FILTER (WHERE status = 'on_leave') as on_leave_count
         FROM attendance
         WHERE employee_id = $1
           AND EXTRACT(MONTH FROM date) = $2
           AND EXTRACT(YEAR FROM date) = $3`,
        [user.id, lastMonth, lastMonthYear]
      );

      const a = att.rows[0];
      const presentDays = parseFloat(a.present_count) + (parseFloat(a.half_day_count) * 0.5) + parseFloat(a.on_leave_count);
      const leavesApproved = parseInt(a.on_leave_count);

      const perDay = s.basic / workingDays;
      const effectiveBasic = perDay * (presentDays || workingDays * 0.8);
      const hra = (s.hra_percent / 100) * effectiveBasic;
      const grossSalary = effectiveBasic + hra + s.special;
      const pfEmployee = 0.12 * effectiveBasic;
      const pfEmployer = 0.12 * effectiveBasic;
      const professionalTax = grossSalary > 15000 ? 200 : 0;
      const totalDeductions = pfEmployee + professionalTax;
      const netPay = grossSalary - totalDeductions;

      await client.query(
        `INSERT INTO payslips (payrun_id, employee_id, working_days, present_days, leaves_approved,
         basic, hra, special_allowance, gross_salary, pf_employee, pf_employer,
         professional_tax, total_deductions, net_pay)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [payrunId, user.id, workingDays,
         (presentDays || workingDays * 0.8).toFixed(2), leavesApproved || 0,
         effectiveBasic.toFixed(2), hra.toFixed(2), s.special.toFixed(2),
         grossSalary.toFixed(2), pfEmployee.toFixed(2), pfEmployer.toFixed(2),
         professionalTax.toFixed(2), totalDeductions.toFixed(2), netPay.toFixed(2)]
      );
    }
    console.log('✅ Seeded last month payrun with payslips');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────────┬───────────────────────┬──────────────┐');
    console.log('│ Role            │ Email                 │ Password     │');
    console.log('├─────────────────┼───────────────────────┼──────────────┤');
    console.log('│ Admin           │ admin@empay.com       │ Password@123 │');
    console.log('│ HR Officer      │ hr@empay.com          │ Password@123 │');
    console.log('│ Payroll Officer │ payroll@empay.com     │ Password@123 │');
    console.log('│ Employee        │ sneha@empay.com       │ Password@123 │');
    console.log('│ Employee        │ rahul@empay.com       │ Password@123 │');
    console.log('└─────────────────┴───────────────────────┴──────────────┘');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
