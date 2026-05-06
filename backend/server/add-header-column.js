import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../env/.env');
dotenv.config({ path: envPath });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  try {
    console.log("Checking for 'header' column in 'servers' table...");
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='servers' AND column_name='header';
    `);

    if (res.rows.length === 0) {
      console.log("Adding 'header' column to 'servers' table...");
      await pool.query("ALTER TABLE servers ADD COLUMN header VARCHAR(255);");
      console.log("Column added successfully.");
    } else {
      console.log("'header' column already exists.");
    }
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();
