import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://sycs:sycs_password@localhost:5432/sycs',
})

let initPromise: Promise<void> | null = null

export async function ensureDb() {
  if (!initPromise) {
    initPromise = initDbInternal()
  }
  return initPromise
}

async function initDbInternal() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        password_hash TEXT,
        avatar_url TEXT,
        banner_url TEXT,
        bio TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        provider_refresh_token TEXT,
        provider_access_token TEXT,
        provider_token_expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        image_url TEXT,
        like_count INTEGER DEFAULT 0,
        repost_count INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS likes_user_post_idx ON likes(user_id, post_id)
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS reposts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS reposts_user_post_idx ON reposts(user_id, post_id)
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS follows (
        id TEXT PRIMARY KEY,
        follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS follows_follower_following_idx ON follows(follower_id, following_id)
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS servers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        icon_url TEXT,
        banner_url TEXT,
        owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_public BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS server_roles (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#99aab5',
        position INTEGER DEFAULT 0,
        permissions TEXT DEFAULT '',
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS server_members (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id TEXT REFERENCES server_roles(id),
        nickname TEXT,
        joined_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS server_members_server_user_idx ON server_members(server_id, user_id)
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS server_channels (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT DEFAULT 'text',
        position INTEGER DEFAULT 0,
        description TEXT DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS channel_messages (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL REFERENCES server_channels(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS server_invites (
        id TEXT PRIMARY KEY,
        server_id TEXT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
        code TEXT NOT NULL UNIQUE,
        created_by TEXT NOT NULL REFERENCES users(id),
        max_uses INTEGER DEFAULT 0,
        use_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS close_friends (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS close_friends_user_friend_idx ON close_friends(user_id, friend_id)
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS friends (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS friends_user_friend_idx ON friends(user_id, friend_id)
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS dm_channels (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS dm_channel_members (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL REFERENCES dm_channels(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS dm_channel_members_channel_user_idx ON dm_channel_members(channel_id, user_id)
    `)
    // DM pair key: canonical key for a 1:1 channel so duplicates can never be created.
    // Non-destructive: backfill existing channels, then create the unique index. If
    // duplicate rows remain (created before this migration), create the index anyway
    // when safe, and report instead of crashing the boot.
    await client.query(`ALTER TABLE dm_channels ADD COLUMN IF NOT EXISTS pair_key TEXT`)
    await client.query(`
      WITH pairs AS (
        SELECT channel_id, string_agg(user_id, ':' ORDER BY user_id) AS pair_key
        FROM dm_channel_members
        GROUP BY channel_id
      )
      UPDATE dm_channels c SET pair_key = p.pair_key
      FROM pairs p
      WHERE c.id = p.channel_id AND c.pair_key IS NULL
    `)
    try {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS dm_channels_pair_key_idx ON dm_channels(pair_key)
      `)
    } catch (err: any) {
      console.warn('[db] Skipping dm_channels_pair_key_idx:', err?.message || err)
    }
    await client.query(`
      CREATE TABLE IF NOT EXISTS dm_messages (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL REFERENCES dm_channels(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS edited BOOLEAN DEFAULT FALSE`)
    await client.query(`ALTER TABLE dm_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`)
    await client.query(`
      CREATE TABLE IF NOT EXISTS dm_message_edits (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL REFERENCES dm_messages(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        edited_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`CREATE INDEX IF NOT EXISTS dm_message_edits_message_idx ON dm_message_edits(message_id)`)
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_attachments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        blur_url TEXT,
        watermark_url TEXT,
        type TEXT NOT NULL DEFAULT 'image',
        mime TEXT NOT NULL DEFAULT 'image/png',
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    // Migration: add new columns
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public'`)
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS visible_to TEXT DEFAULT '[]'`)
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0`)
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS settings TEXT DEFAULT '{}'`)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_post_idx ON bookmarks(user_id, post_id)
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_views (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    // Media SNS migrations
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS server_id TEXT`)
    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS channel_id TEXT`)
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS post_reactions (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        emoji TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS post_reactions_user_post_emoji_idx ON post_reactions(user_id, post_id, emoji)
    `)
    await client.query(`CREATE INDEX IF NOT EXISTS posts_server_channel_idx ON posts(server_id, channel_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS post_comments_post_idx ON post_comments(post_id)`)
    await client.query(`ALTER TABLE post_comments ADD COLUMN IF NOT EXISTS attachments TEXT DEFAULT '[]'`)
    // Server system migrations
    await client.query(`ALTER TABLE server_roles ADD COLUMN IF NOT EXISTS permissions_mask BIGINT DEFAULT 0`)
    await client.query(`ALTER TABLE server_channels ADD COLUMN IF NOT EXISTS slow_mode_seconds INTEGER DEFAULT 0`)
    await client.query(`ALTER TABLE server_channels ADD COLUMN IF NOT EXISTS nsfw BOOLEAN DEFAULT FALSE`)
    await client.query(`ALTER TABLE server_channels ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`)
    // Custom emoji migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_emojis (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        url TEXT NOT NULL,
        mime TEXT NOT NULL DEFAULT 'image/png',
        animated BOOLEAN DEFAULT FALSE,
        creator_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`CREATE INDEX IF NOT EXISTS custom_emojis_name_idx ON custom_emojis(name)`)
    // Playlists
    await client.query(`
      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`
      CREATE TABLE IF NOT EXISTS playlist_items (
        id TEXT PRIMARY KEY,
        playlist_id TEXT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        position INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS playlist_items_playlist_post_idx ON playlist_items(playlist_id, post_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS playlists_user_idx ON playlists(user_id)`)
    // Badges & private accounts
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE`)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        kind TEXT NOT NULL DEFAULT 'icon',
        value TEXT NOT NULL,
        label TEXT,
        position INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)
    await client.query(`CREATE INDEX IF NOT EXISTS user_badges_user_idx ON user_badges(user_id)`)
    // Merge legacy likes into ❤️ reactions (likes are deprecated in favour of reactions)
    await client.query(`
      INSERT INTO post_reactions (id, post_id, user_id, emoji)
      SELECT md5(random()::text || clock_timestamp()::text || l.post_id || l.user_id), l.post_id, l.user_id, '❤️'
      FROM likes l
      ON CONFLICT (user_id, post_id, emoji) DO NOTHING
    `)
  } finally {
    client.release()
  }
}

export const db = drizzle(pool, { schema })

// Kept for backward compatibility - route handlers may still call this,
// but the server plugin handles initialization at startup.
export const initDb = ensureDb
