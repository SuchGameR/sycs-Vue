-- 1. UUID生成関数の有効化
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. メッセージの種類を定義
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_scope') THEN
        CREATE TYPE message_scope AS ENUM ('TIMELINE', 'LOCAL', 'GLOBAL', 'DM', 'CHANNEL', 'SERVER');
    END IF;
END $$;

-- 既存のテーブルを削除
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS servers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS message_likes CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;

-- 3. ユーザーテーブル (Account)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uid UUID DEFAULT gen_random_uuid() UNIQUE,
    username VARCHAR(255) NOT NULL,
    userid VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    header_url VARCHAR(255),
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. サーバーテーブル (Server)
CREATE TABLE servers (
    id SERIAL PRIMARY KEY,
    serverid UUID DEFAULT gen_random_uuid() UNIQUE,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    header VARCHAR(255),
    serverowner INTEGER REFERENCES users(id),
    serverjoins JSONB DEFAULT '[]'::jsonb,
    serversettings JSONB DEFAULT '{}'::jsonb,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. チャンネルテーブル (Channel)
CREATE TABLE channels (
    id SERIAL PRIMARY KEY,
    channelid UUID DEFAULT gen_random_uuid() UNIQUE,
    server_id INTEGER REFERENCES servers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    channelsettings JSONB DEFAULT '{}'::jsonb,
    attributes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. メッセージテーブル (Message)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    messageid UUID DEFAULT gen_random_uuid() UNIQUE,
    channel_id INTEGER REFERENCES channels(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    parent_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    retweet_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    post_type message_scope DEFAULT 'CHANNEL',
    poston UUID,
    attachment JSONB DEFAULT '[]'::jsonb,
    reactions JSONB DEFAULT '{}'::jsonb,
    edit_history JSONB DEFAULT '[]'::jsonb,
    attributes JSONB DEFAULT '{}'::jsonb,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. フォローテーブル
CREATE TABLE follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);

-- 8. いいねテーブル
CREATE TABLE message_likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, message_id)
);

-- 9. ブックマークテーブル
CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, message_id)
);

-- 10. インデックス
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
CREATE INDEX IF NOT EXISTS idx_messages_poston ON messages(poston);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
