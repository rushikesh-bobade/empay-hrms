const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../../utils/mailer');
const { resetPasswordEmail, welcomeEmail } = require('../../utils/emailTemplates');

class AuthService {
  async register(userData) {
    const { full_name, email, password, role, department, designation, phone } = userData;
    
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      throw { status: 409, message: 'User with this email already exists' };
    }

    const password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, department, designation, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active, created_at`,
      [full_name, email, password_hash, role, department, designation, phone]
    );

    // Send welcome email with credentials (fire-and-forget — don't block registration)
    const loginUrl = (process.env.FRONTEND_URL || 'http://localhost:5173') + '/login';
    const html = welcomeEmail(full_name, email, password, role || 'employee', loginUrl);
    sendEmail(email, 'Welcome to EmPay HRMS – Your Login Credentials', `Hi ${full_name}, your EmPay HRMS account is ready. Email: ${email}, Password: ${password}. Login at ${loginUrl}`, html)
      .then(() => console.log(`📧 Welcome email sent to ${email}`))
      .catch(err => console.error(`⚠️ Failed to send welcome email to ${email}:`, err.message));

    return result.rows[0];
  }

  async login(email, password) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw { status: 403, message: 'Account is deactivated. Contact your administrator.' };
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw { status: 401, message: 'Invalid email or password' };
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
  }

  async getProfile(userId) {
    const result = await pool.query(
      `SELECT id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw { status: 404, message: 'User not found' };
    }

    return result.rows[0];
  }

  async forgotPassword(email) {
    const result = await pool.query('SELECT id, full_name FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return; // Do nothing if user not found, prevent enumeration

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Token expires in 1 hour
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetTokenHash, expiry, user.id]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const emailHtml = resetPasswordEmail(user.full_name, resetUrl);
    
    await sendEmail(
      email,
      'Password Reset Request - EmPay HRMS',
      `Hi ${user.full_name}, you requested a password reset. Click here: ${resetUrl}`,
      emailHtml
    );
  }

  async resetPassword(token, newPassword) {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [resetTokenHash]
    );

    if (result.rows.length === 0) {
      throw { status: 400, message: 'Invalid or expired password reset token' };
    }

    const userId = result.rows[0].id;
    const passwordHash = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [passwordHash, userId]
    );
  }
}

module.exports = new AuthService();
