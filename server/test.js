import bcrypt from 'bcrypt';
import { pool } from './src/config/db.js';

const hash = await bcrypt.hash('admin', 10);
await pool.query('UPDATE users SET password = ? WHERE username = ?', [hash, 'admin']);
console.log('Parola resetata! Hash nou:', hash);
process.exit(0);