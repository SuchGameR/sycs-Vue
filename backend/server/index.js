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

// Get all servers
app.get("/api/servers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM servers ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch servers" });
  }
});

// Create a new server
app.post("/api/servers", async (req, res) => {
  const { name, icon } = req.body;
  if (!name) return res.status(400).json({ error: "Server name is required" });
  
  try {
    // サーバー作成
    const serverResult = await pool.query(
      "INSERT INTO servers (name, icon) VALUES ($1, $2) RETURNING *",
      [name, icon || null]
    );
    const newServer = serverResult.rows[0];

    // デフォルトチャンネル "#general" を作成
    await pool.query(
      "INSERT INTO channels (server_id, name) VALUES ($1, $2)",
      [newServer.id, "general"]
    );

    res.status(201).json(newServer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create server" });
  }
});

// Get channels for a server
app.get("/api/servers/:serverId/channels", async (req, res) => {
  const { serverId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM channels WHERE server_id = $1 ORDER BY id ASC",
      [serverId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// Create a new channel
app.post("/api/servers/:serverId/channels", async (req, res) => {
  const { serverId } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Channel name is required" });

  try {
    const result = await pool.query(
      "INSERT INTO channels (server_id, name) VALUES ($1, $2) RETURNING *",
      [serverId, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// Get messages for a channel
app.get("/api/channels/:channelId/messages", async (req, res) => {
  const { channelId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM messages WHERE channel_id = $1 ORDER BY created_at ASC",
      [channelId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message to a channel
app.post("/api/channels/:channelId/messages", async (req, res) => {
  const { channelId } = req.params;
  const { author_name, content } = req.body;
  if (!author_name || !content) return res.status(400).json({ error: "Author name and content are required" });

  try {
    const result = await pool.query(
      "INSERT INTO messages (channel_id, author_name, content) VALUES ($1, $2, $3) RETURNING *",
      [channelId, author_name, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
