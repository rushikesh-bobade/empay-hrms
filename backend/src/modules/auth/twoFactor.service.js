const crypto = require('crypto');
const { pool } = require('../../config/db');

class TwoFactorService {
  generateSecret() {
    return crypto.randomBytes(20).toString('hex');
  }

  generateTOTP(secret, timestamp = Date.now()) {
    const timeStep = 30 * 1000;
    const counter = Math.floor(timestamp / timeStep);
    const counterBuffer = Buffer.alloc(8);
    for (let i = 7; i >= 0; i--) {
      counterBuffer[i] = counter & 0xff;
      counter >>>= 8;
    }
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex')).update(counterBuffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const binary = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }

  async setup(userId) {
    const user = await pool.query('SELECT two_factor_enabled FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) throw { status: 404, message: 'User not found' };
    if (user.rows[0].two_factor_enabled) throw { status: 400, message: '2FA is already enabled' };

    const secret = this.generateSecret();
    await pool.query('UPDATE users SET two_factor_secret = $1 WHERE id = $2', [secret, userId]);

    return {
      secret,
      uri: `otpauth://totp/EmPay:${userId}?secret=${secret}&issuer=EmPay`,
    };
  }

  async verify(userId, token) {
    const user = await pool.query('SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) throw { status: 404, message: 'User not found' };
    if (user.rows[0].two_factor_enabled) throw { status: 400, message: '2FA is already enabled' };

    const secret = user.rows[0].two_factor_secret;
    if (!secret) throw { status: 400, message: '2FA not set up. Call setup first.' };

    const expected = this.generateTOTP(secret);
    if (token !== expected) throw { status: 401, message: 'Invalid 2FA token' };

    await pool.query('UPDATE users SET two_factor_enabled = true WHERE id = $1', [userId]);
    return { enabled: true };
  }

  async disable(userId) {
    const user = await pool.query('SELECT two_factor_enabled FROM users WHERE id = $1', [userId]);
    if (user.rows.length === 0) throw { status: 404, message: 'User not found' };
    if (!user.rows[0].two_factor_enabled) throw { status: 400, message: '2FA is not enabled' };

    await pool.query(
      'UPDATE users SET two_factor_secret = NULL, two_factor_enabled = false WHERE id = $1',
      [userId]
    );
  }
}

module.exports = new TwoFactorService();
