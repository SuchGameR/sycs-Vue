import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // 今後データを送る時に必要になるので追加しておきましょう

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
            username TEXT UNIQUE,
            password TEXT
        )
    `);
    console.log('✅ Database is ready!');

    // 3. ルートの設定
    app.get('/', (req, res) => {
        res.send('SYCS Backend (Express + SQLite + TS) is running!');
    });

    app.post('/api/signup', async (req, res) => {
        const { username, password } = req.body;

        try {
            // TB => "users"
            await db.run(`INSERT INTO users (username, password) VALUES (?, ?)`,
                [username, password]
            );
            res.status(201).send('User registered successfully!');
        } catch (error) {
            console.error(error);
            res.status(400).send(error);
        }
    });

    app.post('/api/login', async (req, res) => {
        const { username, password } = req.body;

        try {
            // DBからユーザーを探す
            const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

            // ユーザーが見つかって、かつパスワードが一致するか確認
            if (user && user.password === password) {
                res.status(200).send('Login successful!');
            } else {
                res.status(401).send('Invalid username or password');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    });

    // 4. サーバーの起動
    app.listen(port, () => {
        console.log(`🚀 Server is running at http://localhost:${port}`);
    });
}

// 実行！
startServer().catch(err => {
    console.error('Failed to start server:', err);
});