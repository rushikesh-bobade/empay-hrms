const { pool } = require('../../config/db');

const getAllUsers = async ({ role, department, search, is_active }) => {
  let query = `SELECT id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active, created_at, updated_at FROM users WHERE 1=1`;
  const params = [];
  let idx = 1;

  if (role) {
    query += ` AND role = $${idx++}`;
    params.push(role);
  }
  if (department) {
    query += ` AND department ILIKE $${idx++}`;
    params.push(`%${department}%`);
  }
  if (search) {
    query += ` AND (full_name ILIKE $${idx} OR email ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (is_active !== undefined && is_active !== '') {
    query += ` AND is_active = $${idx++}`;
    params.push(is_active === 'true');
  }

  query += ` ORDER BY created_at DESC`;
  const result = await pool.query(query, params);
  return result.rows;
};

const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active, created_at, updated_at FROM users WHERE id = $1`,
    [id]
  );
  if (result.rows.length === 0) throw { status: 404, message: 'User not found.' };
  return result.rows[0];
};

const updateUser = async (id, data, requestingUser) => {
  const { full_name, department, designation, phone, role, profile_pic } = data;

  // Only admin can change role
  if (role && requestingUser.role !== 'admin') {
    throw { status: 403, message: 'Only admin can change user roles.' };
  }

  // HR can only edit employees
  if (requestingUser.role === 'hr_officer') {
    const target = await getUserById(id);
    if (target.role !== 'employee') {
      throw { status: 403, message: 'HR officers can only edit employee profiles.' };
    }
  }

  // Employee can only edit own profile
  if (requestingUser.role === 'employee' && requestingUser.id !== id) {
    throw { status: 403, message: 'You can only edit your own profile.' };
  }

  const fields = [];
  const params = [];
  let idx = 1;

  if (full_name) { fields.push(`full_name = $${idx++}`); params.push(full_name); }
  if (department) { fields.push(`department = $${idx++}`); params.push(department); }
  if (designation) { fields.push(`designation = $${idx++}`); params.push(designation); }
  if (phone) { fields.push(`phone = $${idx++}`); params.push(phone); }
  if (profile_pic !== undefined) { fields.push(`profile_pic = $${idx++}`); params.push(profile_pic); }
  if (role && requestingUser.role === 'admin') { fields.push(`role = $${idx++}`); params.push(role); }
  fields.push(`updated_at = NOW()`);

  if (fields.length === 1) throw { status: 400, message: 'No fields to update.' };

  params.push(id);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, full_name, email, role, department, designation, phone, profile_pic, date_joined, is_active, updated_at`,
    params
  );

  if (result.rows.length === 0) throw { status: 404, message: 'User not found.' };
  return result.rows[0];
};

const toggleActive = async (id) => {
  const result = await pool.query(
    `UPDATE users SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1 RETURNING id, full_name, email, is_active`,
    [id]
  );
  if (result.rows.length === 0) throw { status: 404, message: 'User not found.' };
  return result.rows[0];
};

const deleteUser = async (id) => {
  const result = await pool.query(
    `UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id, full_name, email, is_active`,
    [id]
  );
  if (result.rows.length === 0) throw { status: 404, message: 'User not found.' };
  return result.rows[0];
};

module.exports = { getAllUsers, getUserById, updateUser, toggleActive, deleteUser };
