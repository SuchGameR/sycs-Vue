import { db } from '../db'
import * as schema from '../db/schema'
import { sql, eq } from 'drizzle-orm'
import { getCurrentUser } from '../utils/auth'
import { serializePosts } from '../utils/postQuery'
import { enrichUsers, publicUser } from '../utils/userExtras'

/**
 * Cross-type search: users, posts, servers.
 *
 * Efficiency: every table is backed by a GIN trigram index (pg_trgm), so the
 * ILIKE '%q%' predicates are resolved with an index bitmap scan instead of a
 * full table scan. Results are ranked so prefix matches surface first, and
 * post hits are pre-ranked by engagement before visibility filtering.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const qRaw = String(query.q || '').trim()
  const type = String(query.type || 'all')
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50)

  if (!qRaw) return { users: [], posts: [], servers: [], query: '' }

  const q = qRaw.toLowerCase()
  const currentUser = await getCurrentUser(event)

  const wantUsers = type === 'all' || type === 'users'
  const wantPosts = type === 'all' || type === 'posts'
  const wantServers = type === 'all' || type === 'servers'

  const like = sql`'%' || ${q} || '%'`
  const prefix = sql`${q} || '%'`

  const users: any[] = []
  const posts: any[] = []
  const serverRows: any[] = []

  if (wantUsers) {
    const res = await db.execute(sql`
      SELECT * FROM users
      WHERE username ILIKE ${like} OR display_name ILIKE ${like}
      ORDER BY
        (username ILIKE ${prefix})::int DESC,
        (display_name ILIKE ${prefix})::int DESC,
        created_at DESC
      LIMIT ${limit}
    `)
    const rows = (res as any).rows
    if (rows.length) {
      const extras = await enrichUsers(rows)
      for (const u of rows) users.push(publicUser(u, extras[u.id]))
    }
  }

  if (wantServers) {
    const res = await db.execute(sql`
      SELECT s.*,
        (SELECT count(*)::int FROM server_members m WHERE m.server_id = s.id) AS member_count
      FROM servers s
      WHERE s.name ILIKE ${like} OR COALESCE(s.description, '') ILIKE ${like}
      ORDER BY
        (s.name ILIKE ${prefix})::int DESC,
        s.created_at DESC
      LIMIT ${limit}
    `)
    serverRows.push(...(res as any).rows)
  }

  if (wantPosts) {
    // Pre-rank by engagement, then apply visibility in code (same rules as feeds).
    const res = await db.execute(sql`
      SELECT
        p.id, p.content, p.image_url AS "imageUrl", p.visibility, p.visible_to AS "visibleTo",
        p.server_id AS "serverId", p.channel_id AS "channelId", p.quoted_post_id AS "quotedPostId",
        p.like_count AS "likeCount", p.repost_count AS "repostCount", p.view_count AS "viewCount",
        p.created_at AS "createdAt", p.updated_at AS "updatedAt", p.user_id AS "userId",
        u.is_private AS "authorIsPrivate"
      FROM posts p
      JOIN users u ON u.id = p.user_id
      WHERE p.content ILIKE ${like}
      ORDER BY
        (p.view_count + p.repost_count + p.like_count) DESC NULLS LAST,
        p.created_at DESC
      LIMIT ${Math.min(limit * 3, 60)}
    `)
    const candidates: any[] = (res as any).rows
    if (candidates.length) {
      const followers = new Set<string>()
      const close = new Set<string>()
      if (currentUser) {
        const fls = await db.query.follows.findMany({ where: eq(schema.follows.followerId, currentUser.id) })
        fls.forEach(f => followers.add(f.followingId))
        const cfs = await db.query.closeFriends.findMany({ where: eq(schema.closeFriends.userId, currentUser.id) })
        cfs.forEach(f => close.add(f.friendId))
      }

      const out: any[] = []
      for (const p of candidates) {
        if (out.length >= limit) break
        if (p.authorIsPrivate && !(currentUser && (p.userId === currentUser.id || followers.has(p.userId)))) continue
        if (p.visibility === 'public') { out.push(p); continue }
        if (!currentUser) continue
        if (p.userId === currentUser.id) { out.push(p); continue }
        if (p.visibility === 'followers' && followers.has(p.userId)) { out.push(p); continue }
        if (p.visibility === 'close_friends' && close.has(p.userId)) { out.push(p); continue }
        if (p.visibility === 'specific') {
          try {
            const visibleTo = JSON.parse(p.visibleTo || '[]')
            if (visibleTo.includes(currentUser.id)) { out.push(p); continue }
          } catch { /* ignore malformed */ }
        }
      }

      if (out.length) posts.push(...(await serializePosts(out, currentUser)))
    }
  }

  return { users, posts, servers: serverRows, query: qRaw }
})