import dotenv from 'dotenv';
import app from './app.js';
import { pool } from './config/db.js';
dotenv.config();

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await pool.getConnection(); // verify DB

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (err) {
    console.error('DB connection failed', err);
  }
}

start();