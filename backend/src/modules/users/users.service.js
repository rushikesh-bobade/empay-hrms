const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

class UsersService {
  async getAll(filters = {}) {
    let query = `SELECT id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active, created_at, updated_at FROM users WHERE 1=1`;
    const params = [];
    let paramIndex = 1;

    if (filters.role) {
      query += ` AND role = $${paramIndex++}`;
      params.push(filters.role);
    }
    if (filters.department) {
      query += ` AND department ILIKE $${paramIndex++}`;
      params.push(`%${filters.department}%`);
    }
    if (filters.search) {
      query += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }
    if (filters.is_active !== undefined && filters.is_active !== '') {
      query += ` AND is_active = $${paramIndex++}`;
      params.push(filters.is_active === 'true');
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async getById(id) {
    const result = await pool.query(
      `SELECT id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      throw { status: 404, message: 'User not found' };
    }
    return result.rows[0];
  }

  async update(id, data, currentUser) {
    const user = await this.getById(id);
    
    // Permission checks
    if (currentUser.role === 'employee' && currentUser.id !== id) {
      throw { status: 403, message: 'You can only update your own profile' };
    }
    if (currentUser.role === 'hr_officer' && user.role !== 'employee' && currentUser.id !== id) {
      throw { status: 403, message: 'HR officers can only edit employee profiles' };
    }

    const fields = ['full_name', 'department', 'designation', 'phone', 'profile_pic'];
    // Only admin can change role
    if (currentUser.role === 'admin' && data.role) {
      fields.push('role');
    }

    const updates = [];
    const params = [];
    let paramIndex = 1;

    fields.forEach((field) => {
      if (data[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        params.push(data[field]);
      }
    });

    if (updates.length === 0) {
      throw { status: 400, message: 'No fields to update' };
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}
       RETURNING id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active, created_at, updated_at`,
      params
    );

    return result.rows[0];
  }

  async toggleActive(id) {
    const result = await pool.query(
      `UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1
       RETURNING id, full_name, email, role, is_active`,
      [id]
    );
    if (result.rows.length === 0) {
      throw { status: 404, message: 'User not found' };
    }
    return result.rows[0];
  }

  async softDelete(id) {
    const result = await pool.query(
      `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1
       RETURNING id, full_name, email`,
      [id]
    );
    if (result.rows.length === 0) {
      throw { status: 404, message: 'User not found' };
    }
    return result.rows[0];
  }

  async changePassword(id, oldPassword, newPassword) {
    // Get user with password_hash
    const result = await pool.query('SELECT id, password_hash FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      throw { status: 404, message: 'User not found' };
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) {
      throw { status: 400, message: 'Current password is incorrect' };
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, id]);
    return true;
  }

  async updateProfilePic(id, filePath) {
    const result = await pool.query(
      `UPDATE users SET profile_pic = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active`,
      [filePath, id]
    );
    if (result.rows.length === 0) {
      throw { status: 404, message: 'User not found' };
    }
    return result.rows[0];
  }

  async getDirectory(search) {
    let query = `SELECT id, full_name, email, role, department, designation, phone, profile_pic
                 FROM users WHERE is_active = true`;
    const params = [];
    if (search) {
      query += ` AND (full_name ILIKE $1 OR email ILIKE $1 OR department ILIKE $1)`;
      params.push(`%${search}%`);
    }
    query += ' ORDER BY full_name ASC';
    const result = await pool.query(query, params);
    return result.rows;
  }

  async getMessages(userId1, userId2, limit = 50, offset = 0) {
    const result = await pool.query(
      `SELECT m.id, m.sender_id, m.receiver_id, m.text, m.is_read, m.created_at
       FROM messages m
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC
       LIMIT $3 OFFSET $4`,
      [userId1, userId2, limit, offset]
    );
    return result.rows;
  }

  async sendMessage(senderId, receiverId, text) {
    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, text)
       VALUES ($1, $2, $3) RETURNING *`,
      [senderId, receiverId, text]
    );
    return result.rows[0];
  }

  async markMessagesRead(userId, senderId) {
    await pool.query(
      `UPDATE messages SET is_read = true WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false`,
      [userId, senderId]
    );
  }
}

module.exports = new UsersService();
