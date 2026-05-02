import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

export async function getUsers() {
  const [rows] = await pool.query('SELECT id, username, email, first_name, last_name, phone, role_id FROM users');
  return rows;
}

export async function createUser(data) {
  const { username, email, first_name, last_name, phone, custom_fields, password, role_id } = data;
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await pool.query(
    'INSERT INTO users (username, email, first_name, last_name, phone, custom_fields, password, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      username,
      email,
      first_name || '',
      last_name || '',
      phone || '',
      JSON.stringify(custom_fields || {}),
      hashedPassword,
      role_id
    ]
  );
}

export async function updateUser(id, data) {
  const {
    username, email, first_name, last_name,
    phone, custom_fields, role_id, password
  } = data;

  // Fetch current user to preserve existing values
  const [existingRows] = await pool.query('SELECT * FROM users WHERE id=?', [id]);
  if (existingRows.length === 0) throw new Error('User not found');
  const existing = existingRows[0];

  let query;
  let params;

  if (password) {
    query = `
      UPDATE users
      SET username=?, email=?, first_name=?, last_name=?,
          phone=?, custom_fields=?, password=?, role_id=?
      WHERE id=?
    `;
    params = [
      username || existing.username,
      email || existing.email,
      first_name && first_name.trim() ? first_name : existing.first_name,
      last_name && last_name.trim() ? last_name : existing.last_name,
      phone && phone.trim() ? phone : existing.phone,
      JSON.stringify(custom_fields || JSON.parse(existing.custom_fields || '{}')),
      password,
      role_id || existing.role_id,
      id
    ];
  } else {
    query = `
      UPDATE users
      SET username=?, email=?, first_name=?, last_name=?,
          phone=?, custom_fields=?, role_id=?
      WHERE id=?
    `;
    params = [
      username || existing.username,
      email || existing.email,
      first_name && first_name.trim() ? first_name : existing.first_name,
      last_name && last_name.trim() ? last_name : existing.last_name,
      phone && phone.trim() ? phone : existing.phone,
      JSON.stringify(custom_fields || JSON.parse(existing.custom_fields || '{}')),
      role_id || existing.role_id,
      id
    ];
  }

  await pool.query(query, params);
}

export async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE id=?', [id]);
}

export async function getUserById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id=?', [id]);
  return rows[0];
}