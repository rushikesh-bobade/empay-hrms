const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async ({ full_name, email, password, role, department, designation, phone }) => {
  // Check if user already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw { status: 409, message: 'User with this email already exists.' };
  }

  const password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, department, designation, phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active, created_at`,
    [full_name, email, password_hash, role, department, designation, phone]
  );

  return result.rows[0];
};

const login = async ({ email, password }) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw { status: 401, message: 'Invalid email or password.' };
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw { status: 403, message: 'Your account has been deactivated. Contact admin.' };
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw { status: 401, message: 'Invalid email or password.' };
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    department: user.department,
    designation: user.designation,
    profile_pic: user.profile_pic,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return {
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      phone: user.phone,
      profile_pic: user.profile_pic,
      date_joined: user.date_joined,
      is_active: user.is_active,
    },
  };
};

const getMe = async (userId) => {
  const result = await pool.query(
    `SELECT id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw { status: 404, message: 'User not found.' };
  }

  return result.rows[0];
};

module.exports = { register, login, getMe };
