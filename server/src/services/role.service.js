import { pool } from '../config/db.js';

export async function getRoles() {
  const [rows] = await pool.query('SELECT * FROM roles');
  return rows;
}

export async function createRole(name) {
  await pool.query('INSERT INTO roles (name) VALUES (?)', [name]);
}

export async function updateRole(id, name) {
  await pool.query('UPDATE roles SET name=? WHERE id=?', [name, id]);
}

export async function deleteRole(id) {
  await pool.query('DELETE FROM roles WHERE id=?', [id]);
}

export async function getRoleById(id) {
  const [rows] = await pool.query('SELECT * FROM roles WHERE id=?', [id]);
  return rows[0];
}