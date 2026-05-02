import { pool } from '../config/db.js';

export async function log(user, action) {
  await pool.query(
    'INSERT INTO audit_log (user_id, username, action) VALUES (?, ?, ?)',
    [user.id, user.username, action]
  );
}

export async function getLogs() {
  const [rows] = await pool.query(
    'SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 200'
  );
  return rows;
}