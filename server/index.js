// Toate rutele Express trebuie să fie după inițializarea variabilei app!

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  port: process.env.DB_PORT || 3306
};

let pool;

async function initDatabase() {
  // Connect to MySQL server (no DB yet)
  const connection = await mysql.createConnection({ ...dbConfig });
  await connection.query('CREATE DATABASE IF NOT EXISTS enterprise_auth');
  await connection.end();

  // Connect to the new DB
  pool = mysql.createPool({ ...dbConfig, database: 'enterprise_auth' });

  // Create tables if not exist
  await pool.query(`CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(30),
    custom_fields JSON,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id)
  )`);

  // Create audit log table
  await pool.query(`CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(50),
    action VARCHAR(255),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert test roles and users if empty
  const [roles] = await pool.query('SELECT COUNT(*) as count FROM roles');
  if (roles[0].count === 0) {
    await pool.query('INSERT INTO roles (name) VALUES (?), (?)', ['admin', 'user']);
  }
  const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
  if (users[0].count === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await pool.query('INSERT INTO users (username, email, first_name, last_name, phone, custom_fields, password, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
      'admin', 'admin@company.com', 'Admin', 'User', '0700000000', '{}', hash, 1
    ]);
  }
}

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role_id: user.role_id }, JWT_SECRET, { expiresIn: '8h' });
}

function authMiddleware(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid token' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      if (roles.length > 0 && !roles.includes(decoded.role_id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = generateToken(user);
  // Audit log
  await pool.query('INSERT INTO audit_log (user_id, username, action) VALUES (?, ?, ?)', [user.id, user.username, 'login']);
  res.json({ token, user: { id: user.id, username: user.username, role_id: user.role_id } });
});

app.get('/api/profile', authMiddleware(), async (req, res) => {
  const [rows] = await pool.query('SELECT id, username, role_id FROM users WHERE id = ?', [req.user.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
});

app.get('/api/admin', authMiddleware([1]), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

app.get('/api/roles', authMiddleware(), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM roles');
  res.json(rows);
});

// Create role (admin only)
app.post('/api/roles', authMiddleware([1]), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Missing fields' });
  try {
    await pool.query('INSERT INTO roles (name) VALUES (?)', [name]);
    await pool.query('INSERT INTO audit_log (user_id, username, action) VALUES (?, ?, ?)', [req.user.id, req.user.username, `create role ${name}`]);
    res.json({ message: 'Role created' });
  } catch (err) {
    res.status(400).json({ message: 'Role already exists' });
  }
});

// Update role (admin only)
app.put('/api/roles/:id', authMiddleware([1]), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Missing fields' });
  try {
    await pool.query('UPDATE roles SET name = ? WHERE id = ?', [name, req.params.id]);
    await pool.query('INSERT INTO audit_log (user_id, username, action) VALUES (?, ?, ?)', [req.user.id, req.user.username, `update role ${name}`]);
    res.json({ message: 'Role updated' });
  } catch (err) {
    res.status(400).json({ message: 'Update failed' });
  }
});

// Delete role (admin only)
app.delete('/api/roles/:id', authMiddleware([1]), async (req, res) => {
  try {
    const [roleRows] = await pool.query('SELECT name FROM roles WHERE id = ?', [req.params.id]);
    if (roleRows.length === 0) return res.status(404).json({ message: 'Role not found' });
    await pool.query('DELETE FROM roles WHERE id = ?', [req.params.id]);
    await pool.query('INSERT INTO audit_log (user_id, username, action) VALUES (?, ?, ?)', [req.user.id, req.user.username, `delete role ${roleRows[0].name}`]);
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Delete failed' });
  }
});

// Update user (admin only)
app.put('/api/users/:id', authMiddleware([1]), async (req, res) => {
  const { username, email, first_name, last_name, phone, custom_fields, password, role_id } = req.body;
  if (!username || !email || !role_id) return res.status(400).json({ message: 'Missing fields' });
  let query = 'UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, phone = ?, custom_fields = ?, role_id = ?';
  let params = [username, email, first_name || '', last_name || '', phone || '', JSON.stringify(custom_fields || {}), role_id, req.params.id];
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    query = 'UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, phone = ?, custom_fields = ?, password = ?, role_id = ? WHERE id = ?';
    params = [username, email, first_name || '', last_name || '', phone || '', JSON.stringify(custom_fields || {}), hash, role_id, req.params.id];
  } else {
    query = 'UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, phone = ?, custom_fields = ?, role_id = ? WHERE id = ?';
    params = [username, email, first_name || '', last_name || '', phone || '', JSON.stringify(custom_fields || {}), role_id, req.params.id];
  }
  try {
    await pool.query(query, params);
    await pool.query('INSERT INTO audit_log (user_id, username, action) VALUES (?, ?, ?)', [req.user.id, req.user.username, `update user ${username}`]);
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(400).json({ message: 'Update failed' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', authMiddleware([1]), async (req, res) => {
  try {
    const [userRows] = await pool.query('SELECT username FROM users WHERE id = ?', [req.params.id]);
    if (userRows.length === 0) return res.status(404).json({ message: 'User not found' });
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    await pool.query('INSERT INTO audit_log (user_id, username, action) VALUES (?, ?, ?)', [req.user.id, req.user.username, `delete user ${userRows[0].username}`]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Delete failed' });
  }
});
app.get('/api/users', authMiddleware([1]), async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM users');
  res.json(rows);
});
app.get('/api/audit_log', authMiddleware([1]), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, user_id, username, action, timestamp FROM audit_log ORDER BY timestamp DESC LIMIT 200'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch audit log' });
  }
});

async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
