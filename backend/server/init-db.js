import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// message
import chalk from "chalk";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../env/.env');
console.log("Loading env from:", envPath);
dotenv.config({ path: envPath });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function init() {
  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    console.log("Reading schema from:", schemaPath);
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log("Running schema.sql...");
    await pool.query(schema);
    console.log("Database initialized successfully!");
  } catch (err) {
    console.error("Failed to initialize database:", err.message);
  } finally {
    await pool.end();
  }
}

init();

console.log(`
╭──────────────────────────────────────╮
│                                      │
│　${chalk.hex("#BFFF00").bold("データベースの情報をクリアしました")}　│
│                                      │
╰──────────────────────────────────────╯
`);
