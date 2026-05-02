const { pool } = require('../../config/db');

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
    if (currentUser.role === 'payroll_officer' && currentUser.id !== id) {
      throw { status: 403, message: 'Payroll officers cannot modify employee data' };
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
}

module.exports = new UsersService();
