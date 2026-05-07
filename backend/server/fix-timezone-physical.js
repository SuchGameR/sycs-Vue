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
    console.log("Starting physical migration to TIMESTAMPTZ...");
    
    const tables = ['users', 'servers', 'channels', 'messages', 'follows', 'message_likes', 'bookmarks'];
    
    for (const table of tables) {
      console.log(`Migrating table: ${table}`);
      // created_at を TIMESTAMPTZ に変更
      await pool.query(`ALTER TABLE ${table} ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';`);
      
      // updated_at があるテーブルはそれも変更
      if (['users', 'servers', 'channels', 'messages'].includes(table)) {
        await pool.query(`ALTER TABLE ${table} ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';`);
      }
    }
    
    console.log("Physical migration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await pool.end();
  }
}

migrate();
