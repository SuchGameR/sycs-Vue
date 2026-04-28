import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../../env/.env");
console.log("Loading env:", envPath);
const dotenvResult = dotenv.config({ path: envPath });
// console.log(
//   "dotenv result:",
//   dotenvResult.error ? dotenvResult.error.message : dotenvResult.parsed,
// );
// console.log(
//   "DB_USER",
//   process.env.DB_USER,
//   "DB_PASSWORD type",
//   typeof process.env.DB_PASSWORD,
// );

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "PostgreSQL connected", time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
