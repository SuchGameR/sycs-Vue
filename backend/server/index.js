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
import multer from "multer";
import path from "path";
import fs from "fs";

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
    // origin: "*",
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
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
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(resolve(__dirname, "uploads")));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resolve(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

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

const getUserFromToken = (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// ... (Auth Routes: signup, signin, me, settings - unchanged) ...

// --- Auth Routes ---

// Upload Avatar
app.post(
  "/api/auth/upload-avatar",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const avatarUrl = `http://${req.hostname}:${port}/uploads/${req.file.filename}`;

    try {
      const result = await pool.query(
        "UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING avatar_url",
        [avatarUrl, req.user.id],
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update avatar" });
    }
  },
);

// Upload Header
app.post(
  "/api/auth/upload-header",
  authenticateToken,
  upload.single("header"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const headerUrl = `http://${req.hostname}:${port}/uploads/${req.file.filename}`;

    try {
      const result = await pool.query(
        "UPDATE users SET header_url = $1 WHERE id = $2 RETURNING header_url",
        [headerUrl, req.user.id],
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update header" });
    }
  },
);

app.post("/api/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, email, and password are required" });
  }

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultUserId = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "");
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, userid) VALUES ($1, $2, $3, $4) RETURNING id, username, email, avatar_url, header_url, userid",
      [username, email, hashedPassword, defaultUserId],
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" },
    );
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
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" },
    );
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar_url: user.avatar_url,
        header_url: user.header_url,
        userid: user.userid,
        attributes: user.attributes,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to sign in" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, avatar_url, header_url, userid, attributes FROM users WHERE id = $1",
      [req.user.id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

app.put("/api/auth/settings", authenticateToken, async (req, res) => {
  const { username, avatar_url, header_url, attributes } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET username = COALESCE($1, username), avatar_url = COALESCE($2, avatar_url), header_url = COALESCE($3, header_url), attributes = COALESCE($4, attributes) WHERE id = $5 RETURNING id, username, email, avatar_url, header_url, attributes",
      [username, avatar_url, header_url, attributes, req.user.id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// --- Server & Message Routes ---

// Get public servers (Discovery)
app.get("/api/servers", async (req, res) => {
  const { search } = req.query;
  try {
    let query =
      "SELECT * FROM servers WHERE serversettings->>'visibility' = 'public'";
    const params = [];

    if (search) {
      query += " AND name ILIKE $1";
      params.push(`%${search}%`);
    }

    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch public servers" });
  }
});

// Get user's joined/owned servers
app.get("/api/servers/mine", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT * FROM servers 
       WHERE serverowner = $1 
       OR serverjoins @> $2::jsonb 
       ORDER BY id ASC`,
      [userId, JSON.stringify([userId])],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch your servers" });
  }
});

app.get("/api/servers/:serverId", async (req, res) => {
  const { serverId } = req.params;
  const user = getUserFromToken(req);

  try {
    const result = await pool.query("SELECT * FROM servers WHERE id = $1", [
      serverId,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Server not found" });

    const server = result.rows[0];
    const visibility = server.serversettings?.visibility || "public";
    const joinedUsers = server.serverjoins || [];

    if (visibility === "public") {
      return res.json(server);
    }

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (visibility === "private") {
      if (server.serverowner !== user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      return res.json(server);
    }

    if (visibility === "limited") {
      if (server.serverowner === user.id || joinedUsers.includes(user.id)) {
        return res.json(server);
      }
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(server);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch server" });
  }
});

// Join a server
app.post("/api/servers/:serverId/join", authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const userId = req.user.id;

  try {
    const serverResult = await pool.query(
      "SELECT serverjoins, serversettings FROM servers WHERE id = $1",
      [serverId],
    );
    if (serverResult.rows.length === 0)
      return res.status(404).json({ error: "Server not found" });

    const server = serverResult.rows[0];
    const visibility = server.serversettings?.visibility || "public";

    // Check if user is already in server
    let joins = server.serverjoins || [];
    if (joins.includes(userId)) {
      return res.status(400).json({ error: "Already joined this server" });
    }

    if (visibility === "limited") {
      return res.status(403).json({ error: "This server is invite-only" });
    }

    joins.push(userId);
    await pool.query("UPDATE servers SET serverjoins = $1 WHERE id = $2", [
      JSON.stringify(joins),
      serverId,
    ]);

    res.json({ message: "Joined successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join server" });
  }
});

// Create a new server
app.post("/api/servers", authenticateToken, async (req, res) => {
  const { name, icon, settings } = req.body;
  const owner_id = req.user.id;

  if (!name) return res.status(400).json({ error: "Server name is required" });

  try {
    const defaultSettings = {
      visibility: "public", // 'public', 'private', 'limited'
      allow_invite: true,
      ...settings,
    };

    const serverResult = await pool.query(
      "INSERT INTO servers (name, icon, serverowner, serversettings) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, icon || null, owner_id, JSON.stringify(defaultSettings)],
    );
    const newServer = serverResult.rows[0];
    await pool.query("INSERT INTO channels (server_id, name) VALUES ($1, $2)", [
      newServer.id,
      "general",
    ]);
    res.status(201).json(newServer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create server" });
  }
});

// Update server settings
app.put("/api/servers/:serverId", authenticateToken, async (req, res) => {
  const { serverId } = req.params;
  const { name, icon, header, settings } = req.body;
  const userId = req.user.id;

  try {
    // Check if user is owner
    const checkResult = await pool.query(
      "SELECT serverowner, serversettings FROM servers WHERE id = $1",
      [serverId],
    );
    if (checkResult.rows.length === 0)
      return res.status(404).json({ error: "Server not found" });
    if (checkResult.rows[0].serverowner !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const currentSettings = checkResult.rows[0].serversettings || {};
    const newSettings = { ...currentSettings, ...settings };

    const result = await pool.query(
      `UPDATE servers 
       SET name = COALESCE($1, name), 
           icon = COALESCE($2, icon), 
           header = COALESCE($3, header),
           serversettings = $4,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
      [name, icon, header, JSON.stringify(newSettings), serverId],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update server settings" });
  }
});

// Upload Server Icon
app.post(
  "/api/servers/:serverId/upload-icon",
  authenticateToken,
  upload.single("icon"),
  async (req, res) => {
    const { serverId } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const iconUrl = `http://${req.hostname}:${port}/uploads/${req.file.filename}`;

    try {
      const check = await pool.query(
        "SELECT serverowner FROM servers WHERE id = $1",
        [serverId],
      );
      if (check.rows.length === 0)
        return res.status(404).json({ error: "Server not found" });
      if (check.rows[0].serverowner !== req.user.id)
        return res.status(403).json({ error: "Unauthorized" });

      const result = await pool.query(
        "UPDATE servers SET icon = $1 WHERE id = $2 RETURNING icon",
        [iconUrl, serverId],
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update server icon" });
    }
  },
);

// Upload Server Header
app.post(
  "/api/servers/:serverId/upload-header",
  authenticateToken,
  upload.single("header"),
  async (req, res) => {
    const { serverId } = req.params;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const headerUrl = `http://${req.hostname}:${port}/uploads/${req.file.filename}`;

    try {
      const check = await pool.query(
        "SELECT serverowner FROM servers WHERE id = $1",
        [serverId],
      );
      if (check.rows.length === 0)
        return res.status(404).json({ error: "Server not found" });
      if (check.rows[0].serverowner !== req.user.id)
        return res.status(403).json({ error: "Unauthorized" });

      const result = await pool.query(
        "UPDATE servers SET header = $1 WHERE id = $2 RETURNING header",
        [headerUrl, serverId],
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update server header" });
    }
  },
);

// Get channels for a server
app.get("/api/servers/:serverId/channels", async (req, res) => {
  const { serverId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM channels WHERE server_id = $1 ORDER BY id ASC",
      [serverId],
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
      [serverId, name],
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
      `SELECT m.*, u.avatar_url, u.userid as author_handle,
              (SELECT json_build_object('author_name', p.author_name, 'content', p.content) 
               FROM messages p WHERE p.id = m.parent_id) as parent_msg
       FROM messages m 
       LEFT JOIN users u ON m.user_id = u.id 
       WHERE m.channel_id = $1 
       ORDER BY m.created_at ASC`,
      [channelId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message to a channel
app.post(
  "/api/channels/:channelId/messages",
  authenticateToken,
  async (req, res) => {
    const { channelId } = req.params;
    const { content, parent_id } = req.body;
    const user_id = req.user.id;

    if (!content) return res.status(400).json({ error: "Content is required" });

    try {
      // Fetch author_name from DB to be safe (in case token is old or missing it)
      const authorResult = await pool.query(
        "SELECT username FROM users WHERE id = $1",
        [user_id],
      );
      const author_name = authorResult.rows[0]?.username || "Unknown";

      const result = await pool.query(
        "INSERT INTO messages (channel_id, author_name, content, user_id, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [channelId, author_name, content, user_id, parent_id || null],
      );

      const userResult = await pool.query(
        "SELECT avatar_url, userid FROM users WHERE id = $1",
        [user_id],
      );
      const avatar_url = userResult.rows[0]?.avatar_url || null;
      const author_handle = userResult.rows[0]?.userid || null;

      let parent_msg = null;
      if (parent_id) {
        const pResult = await pool.query(
          "SELECT author_name, content FROM messages WHERE id = $1",
          [parent_id],
        );
        parent_msg = pResult.rows[0];
      }

      const newMessage = {
        ...result.rows[0],
        avatar_url,
        author_handle,
        parent_msg,
      };

      io.to(`channel-${channelId}`).emit("new-message", newMessage);
      io.emit("public-message", newMessage);

      res.status(201).json(newMessage);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send message" });
    }
  },
);

// Get global messages (Twitter-like timeline)
app.get("/api/messages/global", authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT m.id, m.messageid, m.channel_id, m.user_id, m.parent_id, m.retweet_id, m.author_name, m.content, m.post_type, m.poston, m.attachment, m.reactions, m.edit_history, m.attributes, m.views_count,
              m.created_at AT TIME ZONE 'UTC' as created_at,
              m.updated_at AT TIME ZONE 'UTC' as updated_at,
              u.avatar_url, u.userid as author_handle,
              (SELECT json_build_object('author_name', p.author_name, 'content', p.content) 
               FROM messages p WHERE p.id = m.parent_id) as parent_msg,
              (SELECT COUNT(*) FROM messages r WHERE r.retweet_id = m.id) as retweet_count,
              (SELECT COUNT(*) FROM bookmarks b WHERE b.message_id = m.id) as bookmark_count,
              COALESCE(m.reactions->'❤️', '[]'::jsonb) @> jsonb_build_array($3::int) as is_liked,
              EXISTS(SELECT 1 FROM messages r WHERE r.retweet_id = m.id AND r.user_id = $3) as is_retweeted,
              EXISTS(SELECT 1 FROM bookmarks b WHERE b.message_id = m.id AND b.user_id = $3) as is_bookmarked,
              orig.content as orig_content, orig.author_name as orig_author_name, ou.avatar_url as orig_avatar_url, ou.userid as orig_author_handle
       FROM messages m 
       LEFT JOIN users u ON m.user_id = u.id 
       LEFT JOIN messages orig ON m.retweet_id = orig.id
       LEFT JOIN users ou ON orig.user_id = ou.id
       ORDER BY m.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset, userId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch global messages" });
  }
});

// Increment view count
app.post("/api/messages/:messageId/views", async (req, res) => {
  const { messageId } = req.params;
  try {
    await pool.query(
      "UPDATE messages SET views_count = views_count + 1 WHERE id = $1",
      [messageId],
    );
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to increment views" });
  }
});

// Retweet
app.post(
  "/api/messages/:messageId/retweet",
  authenticateToken,
  async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;

    try {
      // Check if already retweeted
      const exists = await pool.query(
        "SELECT id FROM messages WHERE retweet_id = $1 AND user_id = $2",
        [messageId, userId],
      );

      if (exists.rows.length > 0) {
        // Undo retweet
        await pool.query("DELETE FROM messages WHERE id = $1", [
          exists.rows[0].id,
        ]);
        return res.json({ retweeted: false });
      }

      const authorResult = await pool.query(
        "SELECT username FROM users WHERE id = $1",
        [userId],
      );
      const authorName = authorResult.rows[0].username;

      const result = await pool.query(
        "INSERT INTO messages (author_name, content, user_id, post_type, retweet_id) VALUES ($1, '', $2, 'GLOBAL', $3) RETURNING *",
        [authorName, userId, messageId],
      );

      res.status(201).json({ ...result.rows[0], retweeted: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to retweet" });
    }
  },
);

// Bookmark
app.post(
  "/api/messages/:messageId/bookmark",
  authenticateToken,
  async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.id;

    try {
      const exists = await pool.query(
        "SELECT 1 FROM bookmarks WHERE user_id = $1 AND message_id = $2",
        [userId, messageId],
      );

      if (exists.rows.length > 0) {
        await pool.query(
          "DELETE FROM bookmarks WHERE user_id = $1 AND message_id = $2",
          [userId, messageId],
        );
        return res.json({ bookmarked: false });
      }

      await pool.query(
        "INSERT INTO bookmarks (user_id, message_id) VALUES ($1, $2)",
        [userId, messageId],
      );
      res.json({ bookmarked: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to bookmark" });
    }
  },
);

// Send a global message
app.post("/api/messages/global", authenticateToken, async (req, res) => {
  const { content, parent_id } = req.body;
  const user_id = req.user.id;

  if (!content) return res.status(400).json({ error: "Content is required" });

  try {
    // Fetch author_name from DB to be safe
    const authorResult = await pool.query(
      "SELECT username FROM users WHERE id = $1",
      [user_id],
    );
    const author_name = authorResult.rows[0]?.username || "Unknown";

    const result = await pool.query(
      "INSERT INTO messages (author_name, content, user_id, post_type, parent_id) VALUES ($1, $2, $3, 'GLOBAL', $4) RETURNING *",
      [author_name, content, user_id, parent_id || null],
    );
    // Get user avatar
    const userResult = await pool.query(
      "SELECT avatar_url, userid FROM users WHERE id = $1",
      [user_id],
    );
    const avatar_url = userResult.rows[0]?.avatar_url || null;
    const author_handle = userResult.rows[0]?.userid || null;

    let parent_msg = null;
    if (parent_id) {
      const pResult = await pool.query(
        "SELECT author_name, content FROM messages WHERE id = $1",
        [parent_id],
      );
      parent_msg = pResult.rows[0];
    }

    const newMessage = {
      ...result.rows[0],
      avatar_url,
      author_handle,
      parent_msg,
    };

    io.emit("new-global-message", newMessage);
    io.emit("public-message", newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send global message" });
  }
});

// Reaction Route
app.post(
  "/api/messages/:messageId/reactions",
  authenticateToken,
  async (req, res) => {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!emoji) return res.status(400).json({ error: "Emoji is required" });

    try {
      const msgResult = await pool.query(
        "SELECT reactions FROM messages WHERE id = $1",
        [messageId],
      );
      if (msgResult.rows.length === 0)
        return res.status(404).json({ error: "Message not found" });

      let reactions = msgResult.rows[0].reactions || {};
      if (!reactions[emoji]) reactions[emoji] = [];

      const index = reactions[emoji].indexOf(userId);
      if (index === -1) {
        reactions[emoji].push(userId);
      } else {
        reactions[emoji].splice(index, 1);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      }

      const updateResult = await pool.query(
        "UPDATE messages SET reactions = $1 WHERE id = $2 RETURNING reactions",
        [JSON.stringify(reactions), messageId],
      );

      const updatedReactions = updateResult.rows[0].reactions;
      io.emit("message-reaction", {
        messageId: parseInt(messageId),
        reactions: updatedReactions,
      });

      res.json(updatedReactions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update reaction" });
    }
  },
);

// Edit message
app.put("/api/messages/:messageId", authenticateToken, async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content) return res.status(400).json({ error: "Content is required" });

  try {
    const checkResult = await pool.query(
      "SELECT user_id, content, edit_history FROM messages WHERE id = $1",
      [messageId],
    );
    if (checkResult.rows.length === 0)
      return res.status(404).json({ error: "Message not found" });
    if (checkResult.rows[0].user_id !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const oldContent = checkResult.rows[0].content;
    const historyItem = {
      content: oldContent,
      edited_at: new Date(),
    };

    const result = await pool.query(
      `UPDATE messages 
       SET content = $1, 
           edit_history = COALESCE(edit_history, '[]'::jsonb) || $2::jsonb,
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 RETURNING *`,
      [content, JSON.stringify([historyItem]), messageId],
    );

    const updatedMsg = result.rows[0];
    io.emit("message-updated", updatedMsg);
    res.json(updatedMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// Delete message
app.delete("/api/messages/:messageId", authenticateToken, async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  try {
    const checkResult = await pool.query(
      "SELECT user_id FROM messages WHERE id = $1",
      [messageId],
    );
    if (checkResult.rows.length === 0)
      return res.status(404).json({ error: "Message not found" });
    if (checkResult.rows[0].user_id !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    await pool.query("DELETE FROM messages WHERE id = $1", [messageId]);
    io.emit("message-deleted", { messageId: parseInt(messageId) });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Start server
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
