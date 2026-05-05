import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../../env/.env");
console.log("Loading env:", envPath);
dotenv.config({ path: envPath });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // 開発用。必要に応じてフロントエンドのURLに制限してください
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  socket.on("join-channel", (channelId) => {
    socket.join(`channel-${channelId}`);
    console.log(`User ${socket.id} joined channel-${channelId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

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

// Auth Middleware (unchanged...)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ... (Auth Routes: signup, signin, me, settings - unchanged) ...

// --- Auth Routes ---
app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password are required" });
  }

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, avatar_url",
      [username, email, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.post("/api/auth/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
    res.json({
      user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url, attributes: user.attributes },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sign in" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, email, avatar_url, attributes FROM users WHERE id = $1", [req.user.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

app.put("/api/auth/settings", authenticateToken, async (req, res) => {
  const { username, avatar_url, attributes } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET username = COALESCE($1, username), avatar_url = COALESCE($2, avatar_url), attributes = COALESCE($3, attributes) WHERE id = $4 RETURNING id, username, email, avatar_url, attributes",
      [username, avatar_url, attributes, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// --- Server & Message Routes ---

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
    const serverResult = await pool.query(
      "INSERT INTO servers (name, icon) VALUES ($1, $2) RETURNING *",
      [name, icon || null]
    );
    const newServer = serverResult.rows[0];
    await pool.query("INSERT INTO channels (server_id, name) VALUES ($1, $2)", [newServer.id, "general"]);
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
    const result = await pool.query("SELECT * FROM channels WHERE server_id = $1 ORDER BY id ASC", [serverId]);
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
    const result = await pool.query("INSERT INTO channels (server_id, name) VALUES ($1, $2) RETURNING *", [serverId, name]);
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
    const result = await pool.query("SELECT * FROM messages WHERE channel_id = $1 ORDER BY created_at ASC", [channelId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message to a channel
app.post("/api/channels/:channelId/messages", async (req, res) => {
  const { channelId } = req.params;
  const { author_name, content, user_id } = req.body;
  if (!author_name || !content) return res.status(400).json({ error: "Author name and content are required" });

  try {
    const result = await pool.query(
      "INSERT INTO messages (channel_id, author_name, content, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [channelId, author_name, content, user_id || null]
    );
    const newMessage = result.rows[0];
    
    // Emit message to everyone in the channel
    io.to(`channel-${channelId}`).emit("new-message", newMessage);
    // Also emit for landing page timeline (optionally)
    io.emit("public-message", newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Start server
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
