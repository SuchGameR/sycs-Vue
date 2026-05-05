-- 1. UUID生成関数の有効化（PostgreSQL 13未満などの場合）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. メッセージの種類を定義（列挙型）
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_scope') THEN
        CREATE TYPE message_scope AS ENUM ('TIMELINE', 'LOCAL', 'GLOBAL', 'DM', 'CHANNEL', 'SERVER');
    END IF;
END $$;

-- 3. ユーザーテーブル (Account)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(255) UNIQUE,                  -- 追加：String形式のID
    uid UUID DEFAULT gen_random_uuid() UNIQUE,   -- 追加：UUID-8相当
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    attributes JSONB DEFAULT '{}'::jsonb,        -- 追加：拡張属性
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. サーバーテーブル (Server)
CREATE TABLE IF NOT EXISTS servers (
    id SERIAL PRIMARY KEY,
    serverid UUID DEFAULT gen_random_uuid() UNIQUE, -- 追加
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    serverowner INTEGER REFERENCES users(id),       -- 追加：所有者
    serverjoins JSONB DEFAULT '[]'::jsonb,          -- 追加：参加状況
    serversettings JSONB DEFAULT '{}'::jsonb,       -- 追加：設定
    attributes JSONB DEFAULT '{}'::jsonb,           -- 追加：拡張属性
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. チャンネルテーブル (Channel)
CREATE TABLE IF NOT EXISTS channels (
    id SERIAL PRIMARY KEY,
    channelid UUID DEFAULT gen_random_uuid() UNIQUE, -- 追加
    server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    channelsettings JSONB DEFAULT '{}'::jsonb,       -- 追加
    attributes JSONB DEFAULT '{}'::jsonb,            -- 追加
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. メッセージテーブル (Message)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    messageid UUID DEFAULT gen_random_uuid() UNIQUE, -- 追加
    channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    post_type message_scope DEFAULT 'CHANNEL',       -- 追加：投稿範囲
    poston UUID,                                     -- 追加：投稿先UUID
    attachment JSONB DEFAULT '[]'::jsonb,            -- 追加
    reactions JSONB DEFAULT '{}'::jsonb,             -- 追加
    edit_history JSONB DEFAULT '[]'::jsonb,          -- 追加
    attributes JSONB DEFAULT '{}'::jsonb,            -- 追加
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. インデックス（高速化のお守り）
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
CREATE INDEX IF NOT EXISTS idx_messages_poston ON messages(poston);