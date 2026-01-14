import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // 開発用
    }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // アップロードされたファイルを公開

// --- ファイル保存ディレクトリの準備 ---
const uploadDirs = ['uploads', 'uploads/avatars', 'uploads/messages'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Multer のストレージ設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'avatar') {
            cb(null, 'uploads/avatars');
        } else {
            cb(null, 'uploads/messages');
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 許可される拡張子のリスト
const ALLOWED_EXTENSIONS = {
    image: ['.png', '.jpg', '.jpeg', '.svg', '.ico', '.gif'],
    video: ['.mp4', '.mov', '.webm'],
    audio: ['.mp3', '.wav', '.ogg', '.flac']
};

const allAllowedExtensions = [
    ...ALLOWED_EXTENSIONS.image,
    ...ALLOWED_EXTENSIONS.video,
    ...ALLOWED_EXTENSIONS.audio
];

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 30 * 1024 * 1024 // 30MB 制限
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allAllowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('許可されていないファイル形式です'));
        }
    }
});

// --- Utility ---
function generateUUID(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase(); // 8文字の英数字
}

// Socket.io の挙動設定
io.on('connection', (socket) => {
    console.log('A user connected');

    // スレッドのルームに参加
    socket.on('join_thread', (threadId) => {
        socket.join(`thread_${threadId}`);
        console.log(`User joined thread: ${threadId}`);
    });

    // DMチャンネルのルームに参加
    socket.on('join_dm', (channelId) => {
        socket.join(`dm_${channelId}`);
        console.log(`User joined DM channel: ${channelId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// データベースの準備とサーバーの起動を一つの流れにします
async function startServer() {
    // 1. データベースを開く
    const db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    // 2. テーブル作成
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT UNIQUE,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            avatar_url TEXT DEFAULT '/default-avatar.svg'
        )
    `);

    // カラムの追加 (既存DBがある場合のため)
    // 注意: SQLiteの ADD COLUMN では UNIQUE 制約を直接付けられないため、インデックスを別途作成します
    try { await db.exec(`ALTER TABLE users ADD COLUMN uuid TEXT`); } catch (e) { }
    try { await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid)`); } catch (e) { }
    try { await db.exec(`ALTER TABLE users ADD COLUMN email TEXT`); } catch (e) { }
    try { await db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)`); } catch (e) { }
    try { await db.exec(`ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT '/default-avatar.svg'`); } catch (e) { }

    // UUIDがまだ設定されていない既存ユーザーにUUIDを割り当てる
    const usersWithoutUuid = await db.all('SELECT id FROM users WHERE uuid IS NULL');
    for (const u of usersWithoutUuid) {
        await db.run('UPDATE users SET uuid = ? WHERE id = ?', [generateUUID(), u.id]);
        console.log(`Initialized UUID for user ID: ${u.id}`);
    }

    // スレッドテーブル (高度な設定に対応)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            icon_url TEXT DEFAULT '/default-thread.svg',
            creator_id INTEGER NOT NULL,
            visibility TEXT DEFAULT 'public', -- public, private, invite
            spam_check INTEGER DEFAULT 0, -- 0: OFF, 1: ON
            mod_enabled INTEGER DEFAULT 0,
            allow_msg_delete INTEGER DEFAULT 1,
            allow_attachments INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES users(id)
        )
    `);

    // カラムの追加 (既存DBがある場合のため)
    try { await db.exec(`ALTER TABLE threads ADD COLUMN visibility TEXT DEFAULT 'public'`); } catch (e) { }
    try { await db.exec(`ALTER TABLE threads ADD COLUMN spam_check INTEGER DEFAULT 0`); } catch (e) { }
    try { await db.exec(`ALTER TABLE threads ADD COLUMN mod_enabled INTEGER DEFAULT 0`); } catch (e) { }
    try { await db.exec(`ALTER TABLE threads ADD COLUMN allow_msg_delete INTEGER DEFAULT 1`); } catch (e) { }
    try { await db.exec(`ALTER TABLE threads ADD COLUMN allow_attachments INTEGER DEFAULT 1`); } catch (e) { }
    try { await db.exec(`ALTER TABLE threads ADD COLUMN icon_url TEXT DEFAULT '/default-thread.svg'`); } catch (e) { }

    // メッセージテーブル (チャット内容)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            parent_id INTEGER DEFAULT NULL,
            is_pinned BOOLEAN DEFAULT 0,
            file_url TEXT DEFAULT NULL,
            file_name TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (thread_id) REFERENCES threads(id),
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (parent_id) REFERENCES messages(id)
        )
    `);
    try { await db.exec(`ALTER TABLE messages ADD COLUMN parent_id INTEGER DEFAULT NULL`); } catch (e) { }
    try { await db.exec(`ALTER TABLE messages ADD COLUMN is_pinned BOOLEAN DEFAULT 0`); } catch (e) { }
    try { await db.exec(`ALTER TABLE messages ADD COLUMN file_url TEXT DEFAULT NULL`); } catch (e) { }
    try { await db.exec(`ALTER TABLE messages ADD COLUMN file_name TEXT DEFAULT NULL`); } catch (e) { }

    // --- Friend & DM System Tables ---

    // フレンドリクエストテーブル
    await db.exec(`
        CREATE TABLE IF NOT EXISTS friend_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(sender_id, receiver_id)
        )
    `);

    // フレンドシップテーブル (承認済みフレンド)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS friendships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id_1 INTEGER NOT NULL,
            user_id_2 INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id_1, user_id_2)
        )
    `);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user_id_1)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user_id_2)`);

    // ブロックテーブル
    await db.exec(`
        CREATE TABLE IF NOT EXISTS blocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            blocker_id INTEGER NOT NULL,
            blocked_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(blocker_id, blocked_id)
        )
    `);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id)`);

    // DMチャンネルテーブル
    await db.exec(`
        CREATE TABLE IF NOT EXISTS dm_channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // DM参加者テーブル (2人のユーザーを紐付け)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS dm_participants (
            channel_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (channel_id) REFERENCES dm_channels(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            PRIMARY KEY (channel_id, user_id)
        )
    `);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_dm_participants_user ON dm_participants(user_id)`);

    // DMメッセージテーブル
    await db.exec(`
        CREATE TABLE IF NOT EXISTS dm_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            channel_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            parent_id INTEGER DEFAULT NULL,
            file_url TEXT DEFAULT NULL,
            file_name TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (channel_id) REFERENCES dm_channels(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES dm_messages(id) ON DELETE SET NULL
        )
    `);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_dm_messages_channel ON dm_messages(channel_id)`);

    // --- 初期データの投入 (SYCS公式ハブ) ---
    const officialHub = await db.get('SELECT * FROM threads WHERE id = 1');
    if (!officialHub) {
        await db.run(
            'INSERT INTO threads (id, title, creator_id) VALUES (1, ?, 0)',
            ['SYCS公式ハブ']
        );
    }

    console.log('✅ Database is ready!');

    // 3. ルートの設定
    app.get('/', (req, res) => {
        res.send('SYCS Backend (Express + SQLite + TS) is running!');
    });

    // --- アップロード API ---

    // アバターアップロード (エラーハンドリング付き)
    app.post('/api/upload/avatar', (req, res) => {
        upload.single('avatar')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).send('ファイルサイズは30MBまでです');
                }
                return res.status(400).send(err.message);
            } else if (err) {
                return res.status(400).send(err.message);
            }

            if (!req.file) return res.status(400).send('No file uploaded');
            const fileUrl = `/uploads/avatars/${req.file.filename}`;
            res.json({ url: `http://localhost:${port}${fileUrl}` });
        });
    });

    // メッセージ添付ファイルアップロード (エラーハンドリング付き)
    app.post('/api/upload/file', (req, res) => {
        upload.single('file')(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(413).send('ファイルサイズは30MBまでです');
                }
                return res.status(400).send(err.message);
            } else if (err) {
                return res.status(400).send(err.message);
            }

            if (!req.file) return res.status(400).send('No file uploaded');
            const fileUrl = `/uploads/messages/${req.file.filename}`;
            res.json({ url: fileUrl, originalName: req.file.originalname });
        });
    });

    // ユーザープロフィール更新 (設定画面用)
    app.patch('/api/users/:id/profile', async (req, res) => {
        const { id } = req.params;
        const { username, avatar_url } = req.body;
        try {
            await db.run(
                'UPDATE users SET username = COALESCE(?, username), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
                [username, avatar_url, id]
            );
            const user = await db.get('SELECT id, uuid, username, avatar_url FROM users WHERE id = ?', [id]);
            res.json(user);
        } catch (error) {
            res.status(500).send('Failed to update profile');
        }
    });

    // --- 認証系 API (高度な機能) ---

    // ユーザー存在確認 (ログインのステップ1用)
    app.post('/api/auth/check-user', async (req, res) => {
        const { identity } = req.body;
        try {
            const user = await db.get(
                'SELECT id, uuid, username, avatar_url FROM users WHERE username = ? OR email = ?',
                [identity, identity]
            );
            if (user) {
                res.json(user);
            } else {
                res.status(404).send('User not found');
            }
        } catch (error) {
            res.status(500).send('Server error');
        }
    });

    // 高度なサインアップ
    app.post('/api/signup', async (req, res) => {
        const { username, email, password, avatar_url } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const uuid = generateUUID(); // UUID生成
            await db.run(
                `INSERT INTO users (uuid, username, email, password, avatar_url) VALUES (?, ?, ?, ?, ?)`,
                [uuid, username, email, hashedPassword, avatar_url || '/default-avatar.svg']
            );
            res.status(201).json({ uuid, username });
        } catch (error: any) {
            console.error(error);
            if (error.code === 'SQLITE_CONSTRAINT') {
                res.status(400).send('Username or Email already exists');
            } else {
                res.status(500).send('Registration failed');
            }
        }
    });

    // 高度なログイン
    app.post('/api/login', async (req, res) => {
        const { identity, password } = req.body;

        try {
            const user = await db.get(
                'SELECT * FROM users WHERE username = ? OR email = ?',
                [identity, identity]
            );

            if (user && await bcrypt.compare(password, user.password)) {
                res.status(200).json({
                    id: user.id,
                    uuid: user.uuid,
                    username: user.username,
                    avatar_url: user.avatar_url
                });
            } else {
                res.status(401).send('Invalid identity or password');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    });

    // 【デバッグ用】登録されているユーザーを確認するための窓口
    app.get('/api/debug/users', async (req, res) => {
        try {
            const users = await db.all('SELECT id, uuid, username FROM users');
            res.json(users);
        } catch (error) {
            res.status(500).send('Error fetching users');
        }
    });

    // --- スレッド関連 API ---

    // スレッド一覧取得 (アイコンURLも含む)
    app.get('/api/threads', async (req, res) => {
        try {
            const threads = await db.all('SELECT * FROM threads ORDER BY created_at DESC');
            res.json(threads);
        } catch (error) {
            res.status(500).send('Error fetching threads');
        }
    });

    // スレッド作成 (フル設定)
    app.post('/api/threads', async (req, res) => {
        const { title, icon_url, creator_id, visibility, spam_check, mod_enabled, allow_msg_delete, allow_attachments } = req.body;
        try {
            const result = await db.run(
                `INSERT INTO threads (title, icon_url, creator_id, visibility, spam_check, mod_enabled, allow_msg_delete, allow_attachments) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, icon_url || '/default-thread.svg', creator_id, visibility || 'public', spam_check ? 1 : 0, mod_enabled ? 1 : 0, allow_msg_delete ? 1 : 0, allow_attachments ? 1 : 0]
            );
            const newThread = await db.get('SELECT * FROM threads WHERE id = ?', [result.lastID]);
            res.status(201).json(newThread);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to create thread');
        }
    });

    // スレッド更新 (作成者のみ)
    app.patch('/api/threads/:id', async (req, res) => {
        const { id } = req.params;
        const { title, icon_url, visibility, spam_check, mod_enabled, allow_msg_delete, allow_attachments, user_id } = req.body;

        try {
            const thread = await db.get('SELECT creator_id FROM threads WHERE id = ?', [id]);
            if (!thread) return res.status(404).send('Thread not found');
            if (thread.creator_id !== user_id) return res.status(403).send('権限がありません');

            await db.run(
                `UPDATE threads SET 
                    title = COALESCE(?, title), 
                    icon_url = COALESCE(?, icon_url),
                    visibility = COALESCE(?, visibility),
                    spam_check = COALESCE(?, spam_check),
                    mod_enabled = COALESCE(?, mod_enabled),
                    allow_msg_delete = COALESCE(?, allow_msg_delete),
                    allow_attachments = COALESCE(?, allow_attachments)
                 WHERE id = ?`,
                [title, icon_url, visibility, spam_check, mod_enabled, allow_msg_delete, allow_attachments, id]
            );
            const updatedThread = await db.get('SELECT * FROM threads WHERE id = ?', [id]);
            res.json(updatedThread);
        } catch (error) {
            res.status(500).send('Failed to update thread');
        }
    });

    // スレッド削除 (作成者のみ)
    app.delete('/api/threads/:id', async (req, res) => {
        const { id } = req.params;
        const { user_id } = req.body;

        try {
            const thread = await db.get('SELECT creator_id FROM threads WHERE id = ?', [id]);
            if (!thread) return res.status(404).send('Thread not found');
            if (thread.creator_id !== user_id) return res.status(403).send('権限がありません');

            // 関連メッセージも削除
            await db.run('DELETE FROM messages WHERE thread_id = ?', [id]);
            await db.run('DELETE FROM threads WHERE id = ?', [id]);

            res.status(200).send('Deleted successfully');
        } catch (error) {
            res.status(500).send('Failed to delete thread');
        }
    });

    // 特定のスレッドのメッセージ取得 (リプライ階層対応用データ)
    app.get('/api/threads/:id/messages', async (req, res) => {
        const threadId = req.params.id;
        try {
            const messages = await db.all(`
                SELECT m.*, u.username, u.uuid as user_uuid, u.avatar_url FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.thread_id = ?
                ORDER BY m.is_pinned DESC, m.created_at ASC
            `, [threadId]);
            res.json(messages);
        } catch (error) {
            res.status(500).send('Error fetching messages');
        }
    });

    // メッセージ投稿 (リプライ対応 + リアルタイム配信)
    app.post('/api/messages', async (req, res) => {
        const { thread_id, sender_id, content, parent_id, file_url, file_name } = req.body;
        try {
            const result = await db.run(
                'INSERT INTO messages (thread_id, sender_id, content, parent_id, file_url, file_name) VALUES (?, ?, ?, ?, ?, ?)',
                [thread_id, sender_id, content, parent_id || null, file_url || null, file_name || null]
            );

            // 投稿者情報を取得してリアルタイム配信
            const postedMessage = await db.get(`
                SELECT m.*, u.username, u.uuid as user_uuid, u.avatar_url FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.id = ?
            `, [result.lastID]);

            io.to(`thread_${thread_id}`).emit('new_message', postedMessage);

            res.status(201).json(postedMessage);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error posting message');
        }
    });

    // メッセージ削除 API (権限チェック + リアルタイム反映)
    app.delete('/api/messages/:id', async (req, res) => {
        const { id } = req.params;
        const { user_id } = req.body;

        try {
            // メッセージとスレッド設定を取得
            const message = await db.get(`
                SELECT m.*, t.creator_id, t.allow_msg_delete FROM messages m
                JOIN threads t ON m.thread_id = t.id
                WHERE m.id = ?
            `, [id]);

            if (!message) return res.status(404).send('Message not found');

            // 権限判定:
            // 1. 本人であること
            // 2. スレッド作成者であること
            // かつ、スレッド設定で削除が許可されていること (作成者は強制許可でも良いが、一旦設定に従う)
            const isOwner = message.sender_id === user_id;
            const isThreadCreator = message.creator_id === user_id;

            if (!isOwner && !isThreadCreator) {
                return res.status(403).send('削除権限がありません');
            }

            if (!message.allow_msg_delete && !isThreadCreator) {
                return res.status(403).send('このスレッドではメッセージの削除が制限されています');
            }

            // 削除実行
            await db.run('DELETE FROM messages WHERE id = ?', [id]);

            // リアルタイム反映
            io.to(`thread_${message.thread_id}`).emit('message_deleted', { id: parseInt(id) });

            res.status(200).send('Deleted');
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to delete message');
        }
    });

    // --- Friend Request API ---

    // フレンドリクエスト送信 (UUID/ユーザー名で検索)
    app.post('/api/friends/request', async (req, res) => {
        const { sender_id, search_query } = req.body;

        // 入力検証
        if (!sender_id || !search_query || typeof search_query !== 'string') {
            return res.status(400).send('Invalid request');
        }

        // XSS対策: 検索クエリのトリム
        const sanitizedQuery = search_query.trim();
        if (sanitizedQuery.length === 0 || sanitizedQuery.length > 100) {
            return res.status(400).send('Invalid search query');
        }

        try {
            // 検索対象ユーザーを取得 (SQLインジェクション対策: パラメータ化クエリ)
            const targetUser = await db.get(
                'SELECT id FROM users WHERE uuid = ? OR username = ?',
                [sanitizedQuery, sanitizedQuery]
            );

            if (!targetUser) {
                return res.status(404).send('User not found');
            }

            if (targetUser.id === sender_id) {
                return res.status(400).send('Cannot send friend request to yourself');
            }

            // ブロック確認 (双方向)
            const isBlocked = await db.get(
                'SELECT * FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
                [sender_id, targetUser.id, targetUser.id, sender_id]
            );

            if (isBlocked) {
                return res.status(403).send('Cannot send friend request');
            }

            // 既にフレンドかチェック
            const existingFriendship = await db.get(
                'SELECT * FROM friendships WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)',
                [sender_id, targetUser.id, targetUser.id, sender_id]
            );

            if (existingFriendship) {
                return res.status(400).send('Already friends');
            }

            // 既存のリクエストチェック
            const existingRequest = await db.get(
                'SELECT * FROM friend_requests WHERE sender_id = ? AND receiver_id = ?',
                [sender_id, targetUser.id]
            );

            if (existingRequest) {
                return res.status(400).send('Request already sent');
            }

            // リクエスト作成
            await db.run(
                'INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)',
                [sender_id, targetUser.id]
            );

            res.status(201).json({ message: 'Friend request sent' });
        } catch (error: any) {
            console.error(error);
            if (error.code === 'SQLITE_CONSTRAINT') {
                res.status(400).send('Request already exists');
            } else {
                res.status(500).send('Failed to send friend request');
            }
        }
    });

    // フレンドリクエスト承認
    app.post('/api/friends/approve', async (req, res) => {
        const { request_id, user_id } = req.body;

        if (!request_id || !user_id) {
            return res.status(400).send('Invalid request');
        }

        try {
            // リクエスト確認 (受信者のみ承認可能)
            const request = await db.get(
                'SELECT * FROM friend_requests WHERE id = ? AND receiver_id = ?',
                [request_id, user_id]
            );

            if (!request) {
                return res.status(404).send('Friend request not found');
            }

            // フレンドシップ作成 (小さいIDを user_id_1 に統一)
            const [id1, id2] = [request.sender_id, request.receiver_id].sort((a, b) => a - b);

            await db.run(
                'INSERT INTO friendships (user_id_1, user_id_2) VALUES (?, ?)',
                [id1, id2]
            );

            // リクエスト削除
            await db.run('DELETE FROM friend_requests WHERE id = ?', [request_id]);

            res.status(200).json({ message: 'Friend request approved' });
        } catch (error: any) {
            console.error(error);
            if (error.code === 'SQLITE_CONSTRAINT') {
                res.status(400).send('Already friends');
            } else {
                res.status(500).send('Failed to approve friend request');
            }
        }
    });

    // フレンドリクエスト拒否/キャンセル
    app.delete('/api/friends/request/:id', async (req, res) => {
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).send('Invalid request');
        }

        try {
            // リクエスト確認 (送信者または受信者のみ削除可能)
            const request = await db.get(
                'SELECT * FROM friend_requests WHERE id = ? AND (sender_id = ? OR receiver_id = ?)',
                [id, user_id, user_id]
            );

            if (!request) {
                return res.status(404).send('Friend request not found');
            }

            await db.run('DELETE FROM friend_requests WHERE id = ?', [id]);
            res.status(200).send('Friend request deleted');
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to delete friend request');
        }
    });

    // フレンドリクエスト一覧取得 (受信/送信)
    app.get('/api/friends/requests', async (req, res) => {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).send('Invalid request');
        }

        try {
            // 受信したリクエスト
            const received = await db.all(`
                SELECT fr.id, fr.created_at, u.id as user_id, u.uuid, u.username, u.avatar_url
                FROM friend_requests fr
                JOIN users u ON fr.sender_id = u.id
                WHERE fr.receiver_id = ?
                ORDER BY fr.created_at DESC
            `, [user_id]);

            // 送信したリクエスト
            const sent = await db.all(`
                SELECT fr.id, fr.created_at, u.id as user_id, u.uuid, u.username, u.avatar_url
                FROM friend_requests fr
                JOIN users u ON fr.receiver_id = u.id
                WHERE fr.sender_id = ?
                ORDER BY fr.created_at DESC
            `, [user_id]);

            res.json({ received, sent });
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to fetch friend requests');
        }
    });

    // フレンド一覧取得
    app.get('/api/friends', async (req, res) => {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).send('Invalid request');
        }

        try {
            const friends = await db.all(`
                SELECT u.id, u.uuid, u.username, u.avatar_url, f.created_at
                FROM friendships f
                JOIN users u ON (
                    CASE 
                        WHEN f.user_id_1 = ? THEN u.id = f.user_id_2
                        WHEN f.user_id_2 = ? THEN u.id = f.user_id_1
                    END
                )
                WHERE f.user_id_1 = ? OR f.user_id_2 = ?
                ORDER BY f.created_at DESC
            `, [user_id, user_id, user_id, user_id]);

            res.json(friends);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to fetch friends');
        }
    });

    // フレンド削除
    app.delete('/api/friends/:friend_id', async (req, res) => {
        const { friend_id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).send('Invalid request');
        }

        try {
            const result = await db.run(
                'DELETE FROM friendships WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)',
                [user_id, friend_id, friend_id, user_id]
            );

            if (result.changes === 0) {
                return res.status(404).send('Friendship not found');
            }

            res.status(200).send('Friend removed');
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to remove friend');
        }
    });

    // --- Block API ---

    // ユーザーブロック
    app.post('/api/users/block', async (req, res) => {
        const { blocker_id, blocked_id } = req.body;

        if (!blocker_id || !blocked_id) {
            return res.status(400).send('Invalid request');
        }

        if (blocker_id === blocked_id) {
            return res.status(400).send('Cannot block yourself');
        }

        try {
            // ブロック追加
            await db.run(
                'INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)',
                [blocker_id, blocked_id]
            );

            // フレンドシップ削除
            await db.run(
                'DELETE FROM friendships WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)',
                [blocker_id, blocked_id, blocked_id, blocker_id]
            );

            // フレンドリクエスト削除
            await db.run(
                'DELETE FROM friend_requests WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
                [blocker_id, blocked_id, blocked_id, blocker_id]
            );

            res.status(201).json({ message: 'User blocked' });
        } catch (error: any) {
            console.error(error);
            if (error.code === 'SQLITE_CONSTRAINT') {
                res.status(400).send('User already blocked');
            } else {
                res.status(500).send('Failed to block user');
            }
        }
    });

    // ユーザーブロック解除
    app.delete('/api/users/block/:blocked_id', async (req, res) => {
        const { blocked_id } = req.params;
        const { blocker_id } = req.body;

        if (!blocker_id) {
            return res.status(400).send('Invalid request');
        }

        try {
            const result = await db.run(
                'DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?',
                [blocker_id, blocked_id]
            );

            if (result.changes === 0) {
                return res.status(404).send('Block not found');
            }

            res.status(200).send('User unblocked');
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to unblock user');
        }
    });

    // ブロックリスト取得
    app.get('/api/users/blocks', async (req, res) => {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).send('Invalid request');
        }

        try {
            const blocked = await db.all(`
                SELECT u.id, u.uuid, u.username, u.avatar_url, b.created_at
                FROM blocks b
                JOIN users u ON b.blocked_id = u.id
                WHERE b.blocker_id = ?
                ORDER BY b.created_at DESC
            `, [user_id]);

            res.json(blocked);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to fetch blocked users');
        }
    });

    // --- DM API ---

    // DMチャンネル一覧取得 (最新メッセージ順)
    app.get('/api/dm/channels', async (req, res) => {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).send('Invalid request');
        }

        try {
            const channels = await db.all(`
                SELECT 
                    dc.id as channel_id,
                    dc.updated_at,
                    u.id as friend_id,
                    u.uuid,
                    u.username,
                    u.avatar_url,
                    (SELECT content FROM dm_messages WHERE channel_id = dc.id ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM dm_messages WHERE channel_id = dc.id ORDER BY created_at DESC LIMIT 1) as last_message_time
                FROM dm_channels dc
                JOIN dm_participants dp1 ON dc.id = dp1.channel_id AND dp1.user_id = ?
                JOIN dm_participants dp2 ON dc.id = dp2.channel_id AND dp2.user_id != ?
                JOIN users u ON dp2.user_id = u.id
                ORDER BY dc.updated_at DESC
            `, [user_id, user_id]);

            res.json(channels);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to fetch DM channels');
        }
    });

    // DMチャンネル取得/作成 (特定ユーザーとの)
    app.post('/api/dm/channels', async (req, res) => {
        const { user_id, friend_id } = req.body;

        if (!user_id || !friend_id) {
            return res.status(400).send('Invalid request');
        }

        if (user_id === friend_id) {
            return res.status(400).send('Cannot create DM with yourself');
        }

        try {
            // フレンドシップ確認
            const friendship = await db.get(
                'SELECT * FROM friendships WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)',
                [user_id, friend_id, friend_id, user_id]
            );

            if (!friendship) {
                return res.status(403).send('Can only DM with friends');
            }

            // ブロック確認
            const isBlocked = await db.get(
                'SELECT * FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
                [user_id, friend_id, friend_id, user_id]
            );

            if (isBlocked) {
                return res.status(403).send('Cannot create DM');
            }

            // 既存チャンネル確認
            const existingChannel = await db.get(`
                SELECT dc.id as channel_id
                FROM dm_channels dc
                JOIN dm_participants dp1 ON dc.id = dp1.channel_id AND dp1.user_id = ?
                JOIN dm_participants dp2 ON dc.id = dp2.channel_id AND dp2.user_id = ?
            `, [user_id, friend_id]);

            if (existingChannel) {
                return res.json({ channel_id: existingChannel.channel_id });
            }

            // 新規チャンネル作成
            const result = await db.run('INSERT INTO dm_channels DEFAULT VALUES');
            const channelId = result.lastID;

            await db.run('INSERT INTO dm_participants (channel_id, user_id) VALUES (?, ?)', [channelId, user_id]);
            await db.run('INSERT INTO dm_participants (channel_id, user_id) VALUES (?, ?)', [channelId, friend_id]);

            res.status(201).json({ channel_id: channelId });
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to create DM channel');
        }
    });

    // DMメッセージ取得
    app.get('/api/dm/:channelId/messages', async (req, res) => {
        const { channelId } = req.params;
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).send('Invalid request');
        }

        try {
            // チャンネル参加確認
            const participant = await db.get(
                'SELECT * FROM dm_participants WHERE channel_id = ? AND user_id = ?',
                [channelId, user_id]
            );

            if (!participant) {
                return res.status(403).send('Not a participant of this channel');
            }

            const messages = await db.all(`
                SELECT dm.*, u.username, u.uuid as user_uuid, u.avatar_url
                FROM dm_messages dm
                JOIN users u ON dm.sender_id = u.id
                WHERE dm.channel_id = ?
                ORDER BY dm.created_at ASC
            `, [channelId]);

            res.json(messages);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to fetch DM messages');
        }
    });

    // DMメッセージ送信
    app.post('/api/dm/:channelId/messages', async (req, res) => {
        const { channelId } = req.params;
        const { sender_id, content, parent_id, file_url, file_name } = req.body;

        if (!sender_id || !content || typeof content !== 'string') {
            return res.status(400).send('Invalid request');
        }

        // XSS対策: コンテンツのトリム
        const sanitizedContent = content.trim();
        if (sanitizedContent.length === 0 || sanitizedContent.length > 5000) {
            return res.status(400).send('Invalid message content');
        }

        try {
            // チャンネル参加確認
            const participant = await db.get(
                'SELECT * FROM dm_participants WHERE channel_id = ? AND user_id = ?',
                [channelId, sender_id]
            );

            if (!participant) {
                return res.status(403).send('Not a participant of this channel');
            }

            // ブロック確認 (相手がブロックしていないか)
            const otherParticipant = await db.get(
                'SELECT user_id FROM dm_participants WHERE channel_id = ? AND user_id != ?',
                [channelId, sender_id]
            );

            if (otherParticipant) {
                const isBlocked = await db.get(
                    'SELECT * FROM blocks WHERE blocker_id = ? AND blocked_id = ?',
                    [otherParticipant.user_id, sender_id]
                );

                if (isBlocked) {
                    return res.status(403).send('Cannot send message');
                }
            }

            // メッセージ作成
            const result = await db.run(
                'INSERT INTO dm_messages (channel_id, sender_id, content, parent_id, file_url, file_name) VALUES (?, ?, ?, ?, ?, ?)',
                [channelId, sender_id, sanitizedContent, parent_id || null, file_url || null, file_name || null]
            );

            // チャンネルの更新時刻を更新
            await db.run('UPDATE dm_channels SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [channelId]);

            // 投稿者情報を取得してリアルタイム配信
            const postedMessage = await db.get(`
                SELECT dm.*, u.username, u.uuid as user_uuid, u.avatar_url
                FROM dm_messages dm
                JOIN users u ON dm.sender_id = u.id
                WHERE dm.id = ?
            `, [result.lastID]);

            io.to(`dm_${channelId}`).emit('new_dm_message', postedMessage);

            res.status(201).json(postedMessage);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to send DM message');
        }
    });

    // DMメッセージ削除
    app.delete('/api/dm/messages/:id', async (req, res) => {
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).send('Invalid request');
        }

        try {
            // メッセージ取得
            const message = await db.get('SELECT * FROM dm_messages WHERE id = ?', [id]);

            if (!message) {
                return res.status(404).send('Message not found');
            }

            // 送信者のみ削除可能
            if (message.sender_id !== user_id) {
                return res.status(403).send('Cannot delete this message');
            }

            await db.run('DELETE FROM dm_messages WHERE id = ?', [id]);

            // リアルタイム反映
            io.to(`dm_${message.channel_id}`).emit('dm_message_deleted', { id: parseInt(id) });

            res.status(200).send('Message deleted');
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to delete message');
        }
    });

    // ユーザー検索 API (フレンド申請用)
    app.get('/api/users/search', async (req, res) => {
        const { query, user_id } = req.query;

        if (!query || typeof query !== 'string' || !user_id) {
            return res.status(400).send('Invalid request');
        }

        const sanitizedQuery = (query as string).trim();
        if (sanitizedQuery.length === 0 || sanitizedQuery.length > 100) {
            return res.status(400).send('Invalid search query');
        }

        try {
            // 自分以外のユーザーを検索
            const users = await db.all(`
                SELECT id, uuid, username, avatar_url
                FROM users
                WHERE (uuid LIKE ? OR username LIKE ?) AND id != ?
                LIMIT 20
            `, [`%${sanitizedQuery}%`, `%${sanitizedQuery}%`, user_id]);

            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to search users');
        }
    });

    // ユーザー情報取得 API (ID指定)
    app.get('/api/users/:id', async (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send('Invalid request');
        }

        try {
            const user = await db.get(
                'SELECT id, uuid, username, avatar_url FROM users WHERE id = ?',
                [id]
            );

            if (!user) {
                return res.status(404).send('User not found');
            }

            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to fetch user');
        }
    });

    // 4. サーバーの起動
    httpServer.listen(port, () => {
        console.log(`🚀 Server is running at http://localhost:${port}`);
    });
}

// 実行！
startServer().catch(err => {
    console.error('Failed to start server:', err);
});