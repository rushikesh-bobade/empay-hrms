const { pool } = require('../../config/db');
const { sendEmail } = require('../../utils/mailer');
const { alertEmail } = require('../../utils/emailTemplates');

class NotificationsService {
  async getAll(userId) {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    return result.rows;
  }

  async create(userId, title, message, type = 'info') {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, title, message, type]
    );

    // Emit socket event if io is available
    // Note: We need a way to access io here. For now, we'll assume the caller might handle it or we'll just rely on polling/refresh.
    
    return result.rows[0];
  }

  async notifyHR(title, message, type = 'info', uniqueKey = null) {
    // If uniqueKey is provided, check if we already notified HR today for this key
    if (uniqueKey) {
      const today = new Date().toLocaleDateString('en-CA');
      const existing = await pool.query(
        `SELECT id FROM notifications 
         WHERE title = $1 AND message = $2 AND created_at::date = $3 LIMIT 1`,
        [title, message, today]
      );
      if (existing.rows.length > 0) return;
    }

    const hrUsers = await pool.query(
      `SELECT id, email, full_name FROM users WHERE role IN ('admin', 'hr_officer') AND is_active = true`
    );

    for (const hr of hrUsers.rows) {
      // In-app notification
      await this.create(hr.id, title, message, type);
      
      // Email notification (for important alerts)
      if (type === 'warning' || title.includes('Leave')) {
        const emailHtml = alertEmail(title, message, type);
        sendEmail(
          hr.email, 
          `EmPay Alert: ${title}`, 
          `Hi ${hr.full_name},\n\nThis is an automated HRMS alert:\n\n${message}`,
          emailHtml
        ).catch(err => console.error(`Failed to send HR email to ${hr.email}:`, err.message));
      }
    }
  }


  async markAsRead(notificationId, userId) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true 
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [notificationId, userId]
    );
    if (result.rows.length === 0) {
      throw { status: 404, message: 'Notification not found' };
    }
    return result.rows[0];
  }

  async markAllAsRead(userId) {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [userId]
    );
  }
}

module.exports = new NotificationsService();
