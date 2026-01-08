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

    // 4. サーバーの起動
    httpServer.listen(port, () => {
        console.log(`🚀 Server is running at http://localhost:${port}`);
    });
}

// 実行！
startServer().catch(err => {
    console.error('Failed to start server:', err);
});