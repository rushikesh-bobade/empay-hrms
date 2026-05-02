const { Pool } = require('pg');
require('dotenv').config();

// ─── Pool Setup ───────────────────────────────────────────────────────────────

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in environment variables.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message);
  process.exit(-1);
});

// ─── Schema ───────────────────────────────────────────────────────────────────

const SCHEMA = `

  -- ── Users ──────────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS users (
    id               SERIAL        PRIMARY KEY,
    full_name        VARCHAR(100)  NOT NULL
                                   CHECK (LENGTH(TRIM(full_name)) >= 2),
    email            VARCHAR(150)  NOT NULL UNIQUE
                                   CHECK (email ~* '^[A-Z0-9._%+\\-]+@[A-Z0-9.\\-]+\\.[A-Z]{2,}$'),
    password_hash    TEXT          NOT NULL
                                   CHECK (LENGTH(password_hash) >= 8),
    role             VARCHAR(30)   NOT NULL
                                   CHECK (role IN ('admin', 'hr_officer', 'employee', 'payroll_officer')),
    department       VARCHAR(100)  CHECK (department IS NULL OR LENGTH(TRIM(department)) >= 2),
    designation      VARCHAR(100)  CHECK (designation IS NULL OR LENGTH(TRIM(designation)) >= 2),
    phone            VARCHAR(20)   CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\\s\\-()]{7,20}$'),
    profile_pic      TEXT,
    date_joined      DATE          NOT NULL DEFAULT CURRENT_DATE CHECK (date_joined <= CURRENT_DATE),
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  );

  -- ── Attendance ─────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS attendance (
    id               SERIAL        PRIMARY KEY,
    employee_id      INT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date             DATE          NOT NULL,
    check_in         TIMESTAMPTZ,
    check_out        TIMESTAMPTZ,
    duration_minutes INT           GENERATED ALWAYS AS (
                                     CASE
                                       WHEN check_in IS NOT NULL AND check_out IS NOT NULL
                                       THEN (EXTRACT(EPOCH FROM (check_out - check_in))::INT + 86400) % 86400 / 60
                                       ELSE NULL
                                     END
                                   ) STORED,
    status           VARCHAR(20)   NOT NULL DEFAULT 'present'
                                   CHECK (status IN ('present', 'absent', 'half_day', 'on_leave', 'unpaid_leave')),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (employee_id, date),
    CONSTRAINT checkout_after_checkin
      CHECK (check_out IS NULL OR check_in IS NULL OR check_out > check_in),
    CONSTRAINT max_shift_24h
      CHECK (
        check_out IS NULL OR check_in IS NULL
        OR EXTRACT(EPOCH FROM (check_out - check_in)) <= 86400
      )
  );

  -- ── Leave Types ────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS leave_types (
    id               SERIAL        PRIMARY KEY,
    name             VARCHAR(50)   NOT NULL UNIQUE
                                   CHECK (LENGTH(TRIM(name)) >= 2),
    description      TEXT,
    max_days_per_year INT          NOT NULL DEFAULT 12
                                   CHECK (max_days_per_year BETWEEN 0 AND 365),
    is_paid          BOOLEAN       NOT NULL DEFAULT TRUE   -- FALSE = unpaid leave type
  );

  -- ── Leave Allocations ──────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS leave_allocations (
    id               SERIAL        PRIMARY KEY,
    employee_id      INT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type_id    INT           NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    allocated_days   INT           NOT NULL DEFAULT 0 CHECK (allocated_days >= 0),
    used_days        INT           NOT NULL DEFAULT 0 CHECK (used_days >= 0),
    year             INT           NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()) CHECK (year >= 2000),
    UNIQUE (employee_id, leave_type_id, year),
    CONSTRAINT used_within_allocated CHECK (used_days <= allocated_days)
  );

  -- ── Leave Requests ─────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS leave_requests (
    id               SERIAL        PRIMARY KEY,
    employee_id      INT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type_id    INT           NOT NULL REFERENCES leave_types(id),
    start_date       DATE          NOT NULL,
    end_date         DATE          NOT NULL,
    total_days       INT           NOT NULL CHECK (total_days > 0),
    reason           TEXT          CHECK (reason IS NULL OR LENGTH(TRIM(reason)) >= 5),
    status           VARCHAR(20)   NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by      INT           REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT review_ts_requires_reviewer
      CHECK (reviewed_at IS NULL OR reviewed_by IS NOT NULL)
  );

  -- ── Salary Structures ──────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS salary_structures (
    id               SERIAL        PRIMARY KEY,
    employee_id      INT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    basic_salary     NUMERIC(12,2) NOT NULL CHECK (basic_salary > 0),
    hra_percent      NUMERIC(5,2)  NOT NULL DEFAULT 40.00
                                   CHECK (hra_percent BETWEEN 0 AND 100),
    special_allowance NUMERIC(12,2) NOT NULL DEFAULT 0
                                   CHECK (special_allowance >= 0),
    effective_from   DATE          NOT NULL DEFAULT CURRENT_DATE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (employee_id)
  );

  -- ── Pay Runs ───────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS payruns (
    id               SERIAL        PRIMARY KEY,
    month            INT           NOT NULL CHECK (month BETWEEN 1 AND 12),
    year             INT           NOT NULL CHECK (year >= 2000),
    status           VARCHAR(20)   NOT NULL DEFAULT 'draft'
                                   CHECK (status IN ('draft', 'finalized')),
    generated_by     INT           REFERENCES users(id) ON DELETE SET NULL,
    generated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (month, year)
  );

  -- ── Payslips ───────────────────────────────────────────────────────────────
  -- unpaid_leave_days : days of unpaid leave taken this month
  -- unpaid_deduction  : (basic / working_days) * unpaid_leave_days
  CREATE TABLE IF NOT EXISTS payslips (
    id                  SERIAL        PRIMARY KEY,
    payrun_id           INT           NOT NULL REFERENCES payruns(id) ON DELETE CASCADE,
    employee_id         INT           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    working_days        INT           NOT NULL CHECK (working_days > 0),
    present_days        NUMERIC(6,2)  NOT NULL CHECK (present_days >= 0),
    leaves_approved     INT           NOT NULL DEFAULT 0 CHECK (leaves_approved >= 0),
    unpaid_leave_days   INT           NOT NULL DEFAULT 0 CHECK (unpaid_leave_days >= 0),
    unpaid_deduction    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (unpaid_deduction >= 0),
    basic               NUMERIC(12,2) NOT NULL,
    hra                 NUMERIC(12,2) NOT NULL,
    special_allowance   NUMERIC(12,2) NOT NULL,
    gross_salary        NUMERIC(12,2) NOT NULL,
    pf_employee         NUMERIC(12,2) NOT NULL,
    pf_employer         NUMERIC(12,2) NOT NULL,
    professional_tax    NUMERIC(12,2) NOT NULL,
    total_deductions    NUMERIC(12,2) NOT NULL,
    net_pay             NUMERIC(12,2) NOT NULL CHECK (net_pay >= 0),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (payrun_id, employee_id),
    CONSTRAINT present_within_working  CHECK (present_days  <= working_days),
    CONSTRAINT unpaid_within_working   CHECK (unpaid_leave_days <= working_days)
  );

  -- ── Notifications ──────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- ── Settings ───────────────────────────────────────────────────────────────
  CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- ── Indexes ────────────────────────────────────────────────────────────────

  -- Users: role/department/active-status are common filters
  CREATE INDEX IF NOT EXISTS idx_users_email        ON users (email);
  CREATE INDEX IF NOT EXISTS idx_users_role         ON users (role);
  CREATE INDEX IF NOT EXISTS idx_users_is_active    ON users (is_active);
  CREATE INDEX IF NOT EXISTS idx_users_department   ON users (department);

  -- Attendance: most queries filter by employee + date range
  CREATE INDEX IF NOT EXISTS idx_att_employee       ON attendance (employee_id);
  CREATE INDEX IF NOT EXISTS idx_att_date           ON attendance (date);
  CREATE INDEX IF NOT EXISTS idx_att_emp_date       ON attendance (employee_id, date);
  CREATE INDEX IF NOT EXISTS idx_att_status         ON attendance (status);

  -- Leave: HR filters by status, employees query their own history
  CREATE INDEX IF NOT EXISTS idx_lr_employee        ON leave_requests (employee_id);
  CREATE INDEX IF NOT EXISTS idx_lr_status          ON leave_requests (status);
  CREATE INDEX IF NOT EXISTS idx_lr_dates           ON leave_requests (start_date, end_date);
  CREATE INDEX IF NOT EXISTS idx_la_employee_year   ON leave_allocations (employee_id, year);

  -- Payroll: payrun lookups by month/year, payslips by employee
  CREATE INDEX IF NOT EXISTS idx_payslip_payrun     ON payslips (payrun_id);
  CREATE INDEX IF NOT EXISTS idx_payslip_employee   ON payslips (employee_id);
  CREATE INDEX IF NOT EXISTS idx_payrun_month_year  ON payruns (month, year);
`;

// ─── Attendance Helpers ───────────────────────────────────────────────────────

/**
 * Record a check-in for an employee.
 * 'date' is set to the calendar date of the check-in timestamp.
 *
 * Usage:
 *   await checkIn(5, '2024-06-10T09:00:00+05:30');
 *
 * @param {number}      employeeId
 * @param {Date|string} checkInTime  default: now
 */
const checkIn = async (employeeId, checkInTime = new Date()) => {
  const ts = new Date(checkInTime);
  const date = ts.toISOString().slice(0, 10); // canonical check-in date

  const { rows } = await pool.query(
    `INSERT INTO attendance (employee_id, date, check_in, status)
     VALUES ($1, $2, $3, 'present')
     ON CONFLICT (employee_id, date) DO UPDATE
       SET check_in = EXCLUDED.check_in
     RETURNING *`,
    [employeeId, date, ts]
  );
  return rows[0];
};

/**

 * @param {number}      employeeId
 * @param {string}      checkInDate   YYYY-MM-DD — the date used at check-in
 * @param {Date|string} checkOutTime  default: now
 */
const checkOut = async (employeeId, checkInDate, checkOutTime = new Date()) => {
  const ts = new Date(checkOutTime);

  const { rows } = await pool.query(
    `UPDATE attendance
     SET check_out = $3
     WHERE employee_id = $1 AND date = $2
     RETURNING *`,
    [employeeId, checkInDate, ts]
  );

  if (rows.length === 0) {
    throw new Error(
      `No attendance record found for employee ${employeeId} on ${checkInDate}. ` +
      `Did you call checkIn first?`
    );
  }
  return rows[0];
};

// ─── Payroll Helpers ──────────────────────────────────────────────────────────

/**
 * Calculate the salary deduction for unpaid leave days.
 *
 * Formula:  deduction = ROUND( (basic / workingDays) * unpaidLeaveDays, 2 )
 *
 * @param {number} basicSalary
 * @param {number} workingDays      total working days in the month
 * @param {number} unpaidLeaveDays
 * @returns {number}
 */
const calcUnpaidDeduction = (basicSalary, workingDays, unpaidLeaveDays) => {
  if (workingDays <= 0) throw new Error('workingDays must be > 0');
  if (unpaidLeaveDays < 0) throw new Error('unpaidLeaveDays must be >= 0');
  if (unpaidLeaveDays > workingDays) throw new Error('unpaidLeaveDays cannot exceed workingDays');

  return Math.round((basicSalary / workingDays) * unpaidLeaveDays * 100) / 100;
};

/**
 * Build a complete payslip payload.
 * Unpaid leave days are deducted from basic before all other calculations.
 *
 * @param {object} p
 * @param {number} p.basicSalary
 * @param {number} p.hraPercent         e.g. 40 for 40 %
 * @param {number} p.specialAllowance
 * @param {number} p.workingDays
 * @param {number} p.presentDays
 * @param {number} p.leavesApproved     paid leaves taken
 * @param {number} p.unpaidLeaveDays    unpaid leaves taken  → triggers deduction
 * @returns {object}  ready to INSERT into payslips
 */
const buildPayslip = ({
  basicSalary,
  hraPercent,
  specialAllowance,
  workingDays,
  presentDays,
  leavesApproved,
  unpaidLeaveDays,
}) => {
  const unpaidDeduction = calcUnpaidDeduction(basicSalary, workingDays, unpaidLeaveDays);
  const effectiveBasic = Math.round((basicSalary - unpaidDeduction) * 100) / 100;
  const hra = Math.round(effectiveBasic * (hraPercent / 100) * 100) / 100;
  const grossSalary = Math.round((effectiveBasic + hra + specialAllowance) * 100) / 100;

  const pfEmployee = Math.round(effectiveBasic * 0.12 * 100) / 100;  // 12 % of effective basic
  const pfEmployer = Math.round(effectiveBasic * 0.12 * 100) / 100;
  const professionalTax = grossSalary > 15000 ? 200 : 0;                  // flat slab; adjust per state

  const totalDeductions = Math.round((pfEmployee + professionalTax + unpaidDeduction) * 100) / 100;
  const netPay = Math.max(0, Math.round((grossSalary - totalDeductions) * 100) / 100);

  return {
    working_days: workingDays,
    present_days: presentDays,
    leaves_approved: leavesApproved,
    unpaid_leave_days: unpaidLeaveDays,
    unpaid_deduction: unpaidDeduction,
    basic: effectiveBasic,
    hra,
    special_allowance: specialAllowance,
    gross_salary: grossSalary,
    pf_employee: pfEmployee,
    pf_employer: pfEmployer,
    professional_tax: professionalTax,
    total_deductions: totalDeductions,
    net_pay: netPay,
  };
};

// ─── Migration ────────────────────────────────────────────────────────────────

const initTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(SCHEMA);
    // Drop restrictive profile_pic CHECK constraint if it exists (allows local paths like /avatars/...)
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_profile_pic_check;
      EXCEPTION WHEN undefined_object THEN NULL;
      END $$;
    `);
    await client.query('COMMIT');
    console.log('✅ All tables created successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed, rolled back:', err.message);
    throw err;
  } finally {
    client.release();
  }

  // Seed demo data
  await seedDemoData();
};

/**
 * Seeds demo users and leave types if they don't exist.
 * Uses ON CONFLICT to avoid duplicates on re-runs.
 */
const seedDemoData = async () => {
  const bcrypt = require('bcrypt');
  const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

  const demoUsers = [
    { full_name: 'Admin User',     email: 'admin@empay.com',   role: 'admin',           department: 'Management',  designation: 'System Admin' },
    { full_name: 'Priya Sharma',   email: 'hr@empay.com',      role: 'hr_officer',      department: 'Human Resources', designation: 'HR Manager' },
    { full_name: 'Rahul Verma',    email: 'payroll@empay.com',  role: 'payroll_officer', department: 'Finance',     designation: 'Payroll Manager' },
    { full_name: 'Sneha Patil',    email: 'sneha@empay.com',    role: 'employee',        department: 'Engineering', designation: 'Software Engineer' },
    { full_name: 'Amit Kumar',     email: 'amit@empay.com',     role: 'employee',        department: 'Engineering', designation: 'Frontend Developer' },
    { full_name: 'Neha Gupta',     email: 'neha@empay.com',     role: 'employee',        department: 'Design',      designation: 'UI/UX Designer' },
    { full_name: 'Vikram Singh',   email: 'vikram@empay.com',   role: 'employee',        department: 'Marketing',   designation: 'Marketing Lead' },
    { full_name: 'Ananya Desai',   email: 'ananya@empay.com',   role: 'employee',        department: 'Finance',     designation: 'Financial Analyst' },
  ];

  const defaultPassword = 'Password@123';

  for (const u of demoUsers) {
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [u.email]);
    if (exists.rows.length === 0) {
      const hash = await bcrypt.hash(defaultPassword, ROUNDS);
      await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role, department, designation)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [u.full_name, u.email, hash, u.role, u.department, u.designation]
      );
      console.log(`   👤 Seeded user: ${u.email} (${u.role})`);
    }
  }

  // Seed default leave types
  const leaveTypes = [
    { name: 'Casual Leave',      description: 'For personal or casual reasons',     max_days: 12 },
    { name: 'Sick Leave',        description: 'For illness or medical appointments', max_days: 10 },
    { name: 'Earned Leave',      description: 'Accumulated earned/privilege leave',  max_days: 15 },
    { name: 'Maternity Leave',   description: 'Maternity leave as per policy',       max_days: 180 },
  ];

  for (const lt of leaveTypes) {
    const exists = await pool.query('SELECT id FROM leave_types WHERE name = $1', [lt.name]);
    if (exists.rows.length === 0) {
      await pool.query(
        `INSERT INTO leave_types (name, description, max_days_per_year) VALUES ($1, $2, $3)`,
        [lt.name, lt.description, lt.max_days]
      );
      console.log(`   📋 Seeded leave type: ${lt.name}`);
    }
  }

  console.log('✅ Demo data seeding complete.');
};

// ─── Entry Point ──────────────────────────────────────────────────────────────

if (process.argv.includes('--migrate')) {
  initTables()
    .then(() => {
      console.log('✅ Migration complete.');
      process.exit(0);
    })
    .catch(() => process.exit(1));
}

module.exports = {
  pool,
  initTables,
  checkIn,
  checkOut,
  calcUnpaidDeduction,
  buildPayslip,
};