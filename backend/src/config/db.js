const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const initTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(30) NOT NULL CHECK (role IN ('admin','hr_officer','employee','payroll_officer')),
        department VARCHAR(100),
        designation VARCHAR(100),
        phone VARCHAR(20),
        profile_pic TEXT,
        date_joined DATE DEFAULT CURRENT_DATE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present','absent','half_day','on_leave')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(employee_id, date)
      );

      CREATE TABLE IF NOT EXISTS leave_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL,
        description TEXT,
        max_days_per_year INT NOT NULL DEFAULT 12
      );

      CREATE TABLE IF NOT EXISTS leave_allocations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        leave_type_id UUID NOT NULL REFERENCES leave_types(id),
        allocated_days INT NOT NULL DEFAULT 0,
        used_days INT NOT NULL DEFAULT 0,
        year INT NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
        UNIQUE(employee_id, leave_type_id, year)
      );

      CREATE TABLE IF NOT EXISTS leave_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        leave_type_id UUID NOT NULL REFERENCES leave_types(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_days INT NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
        reviewed_by UUID REFERENCES users(id),
        reviewed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS salary_structures (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        basic_salary NUMERIC(12,2) NOT NULL,
        hra_percent NUMERIC(5,2) DEFAULT 40.00,
        special_allowance NUMERIC(12,2) DEFAULT 0,
        effective_from DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(employee_id)
      );

      CREATE TABLE IF NOT EXISTS payruns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
        year INT NOT NULL,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','finalized')),
        generated_by UUID REFERENCES users(id),
        generated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(month, year)
      );

      CREATE TABLE IF NOT EXISTS payslips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        payrun_id UUID NOT NULL REFERENCES payruns(id) ON DELETE CASCADE,
        employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        working_days INT NOT NULL,
        present_days NUMERIC(6,2) NOT NULL,
        leaves_approved INT DEFAULT 0,
        basic NUMERIC(12,2) NOT NULL,
        hra NUMERIC(12,2) NOT NULL,
        special_allowance NUMERIC(12,2) NOT NULL,
        gross_salary NUMERIC(12,2) NOT NULL,
        pf_employee NUMERIC(12,2) NOT NULL,
        pf_employer NUMERIC(12,2) NOT NULL,
        professional_tax NUMERIC(12,2) NOT NULL,
        total_deductions NUMERIC(12,2) NOT NULL,
        net_pay NUMERIC(12,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(payrun_id, employee_id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, receiver_id, created_at);
    `);
    console.log('✅ All tables initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing tables:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, initTables };
