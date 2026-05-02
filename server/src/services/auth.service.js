import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

export async function login(username, password) {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length === 0) throw new Error('Invalid credentials');
  
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid credentials');
  
  const token = jwt.sign(
    { id: user.id, username: user.username, role_id: user.role_id },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  
  return {
    token,
    user: { id: user.id, username: user.username, role_id: user.role_id }
  };
}

export async function getProfile(userId) {
  const [rows] = await pool.query('SELECT id, username, role_id FROM users WHERE id = ?', [userId]);
  if (rows.length === 0) throw new Error('User not found');
  return rows[0];
}
