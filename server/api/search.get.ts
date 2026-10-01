import { db } from '../db'
import * as schema from '../db/schema'
import { sql, eq } from 'drizzle-orm'
import { getCurrentUser } from '../utils/auth'
import { serializePosts } from '../utils/postQuery'
import { enrichUsers, publicUser } from '../utils/userExtras'
import { normalizeTag } from '../utils/hashtags'
import { attachmentKindFilter, isMediaKind, type MediaKind } from '../utils/mediaFilter'

/**
 * Cross-type search: users, posts, servers, hashtags.
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

  // --- advanced filters (long-press panel on /search) ------------------------
  // `sort` / `since` apply to posts. `media` filters posts to those carrying an
  // attachment of that kind. All three are validated against fixed allowlists
  // rather than interpolated raw into the ORDER BY / WHERE text.
  const SORTS = ['relevance', 'new', 'old', 'popular'] as const
  const sort = (SORTS as readonly string[]).includes(String(query.sort))
    ? String(query.sort) as typeof SORTS[number]
    : 'relevance'

  const SINCE = { day: 1, week: 7, month: 30, year: 365 } as const
  const sinceDays = SINCE[String(query.since) as keyof typeof SINCE] ?? 0

  const media: MediaKind | '' = isMediaKind(query.media) ? query.media : ''

  if (!qRaw) return { users: [], posts: [], servers: [], hashtags: [], query: '' }

  const q = qRaw.toLowerCase()
  const currentUser = await getCurrentUser(event)

  // An explicit leading '#' is a hashtag lookup, not a text search: routing it to
  // the indexed link table is both exact and far cheaper than ILIKE over post
  // content, and it makes "#foo" in the search box behave like tapping a hashtag
  // link in the feed.
  //
  // A *bare* word must NOT be tag-only in the `all` tab. The tag grammar accepts
  // plain words, so `normalizeTag('sub2')` succeeds, which used to swallow every
  // cross-type query -- searching a username returned zero users. In the
  // `hashtags` tab a bare word is still an exact tag lookup, since that is the
  // only thing that tab can show.
  const tagKey = normalizeTag(qRaw)
  const hasHashPrefix = qRaw.startsWith('#')
  const wantHashtags = type === 'all' || type === 'hashtags'
  const tagOnly = !!tagKey && wantHashtags && (hasHashPrefix || type === 'hashtags')
  const wantUsers = !tagOnly && (type === 'all' || type === 'users')
  const wantPosts = !tagOnly && (type === 'all' || type === 'posts')
  const wantServers = !tagOnly && (type === 'all' || type === 'servers')

  const like = sql`'%' || ${q} || '%'`
  const prefix = sql`${q} || '%'`

  const users: any[] = []
  const posts: any[] = []
  const serverRows: any[] = []
  const hashtagRows: any[] = []

  if (tagOnly) {
    // Rank by the same time-decayed engagement the trending endpoint uses, so a
    // tag that spiked today outranks one with a higher all-time count.
    const res = await db.execute(sql`
      WITH scored AS (
        SELECT ph.tag,
          SUM(
            (1 + (
              (SELECT count(*)::int FROM post_reactions r WHERE r.post_id = p.id)
              + 2 * (SELECT count(*)::int FROM post_comments c WHERE c.post_id = p.id)
              + 3 * (SELECT count(*)::int FROM reposts rp WHERE rp.post_id = p.id)
              + 0.25 * COALESCE(p.view_count, 0)
            ))
            / POWER(GREATEST(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600.0, 0) + 2, 1.5)
          ) AS score,
          COUNT(*)::int AS "scoredPosts"
        FROM post_hashtags ph
        JOIN posts p ON p.id = ph.post_id
        WHERE ph.tag = ${tagKey}
          AND p.created_at > NOW() - INTERVAL '30 days'
          AND p.visibility = 'public'
          AND p.server_id IS NULL
        GROUP BY ph.tag
      )
      SELECT h.tag, h.display_tag AS "displayTag", h.post_count AS "postCount",
        COALESCE(s.score, 0) AS score, COALESCE(s."scoredPosts", 0) AS "scoredPosts"
      FROM hashtags h
      LEFT JOIN scored s ON s.tag = h.tag
      WHERE h.tag = ${tagKey}
    `)
    const r: any = (res as any).rows[0]
    if (r) {
      hashtagRows.push({
        tag: r.tag,
        displayTag: r.displayTag || r.tag,
        postCount: r.postCount,
        recentPosts: r.scoredPosts,
        score: Math.round(Number(r.score) * 1000) / 1000,
      })
    }
    return { users: [], posts: [], servers: [], hashtags: hashtagRows, query: qRaw }
  }

  if (wantHashtags && tagKey) {
    const res = await db.execute(sql`
      SELECT tag, display_tag AS "displayTag", post_count AS "postCount"
      FROM hashtags
      WHERE tag = ${tagKey}
      LIMIT 1
    `)
    const r: any = (res as any).rows[0]
    if (r) {
      hashtagRows.push({
        tag: r.tag,
        displayTag: r.displayTag || r.tag,
        postCount: r.postCount,
        recentPosts: 0,
        score: r.postCount,
      })
    }
  }

  if (wantUsers) {
    // Explicit column list, aliased to camelCase. `SELECT *` returns raw
    // snake_case keys here, which publicUser() cannot strip (it destructures
    // `passwordHash`), so the hash was serialized straight to the client -- and
    // `displayName`/`avatarUrl` came back undefined, breaking the UI and
    // computeTitles' account-age calculation.
    const res = await db.execute(sql`
      SELECT
        id,
        username,
        display_name AS "displayName",
        avatar_url AS "avatarUrl",
        banner_url AS "bannerUrl",
        bio,
        is_private AS "isPrivate",
        status_message AS "statusMessage",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM users
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
    // ORDER BY is chosen from a fixed map rather than interpolated from the
    // request, so `sort` can never inject SQL.
    const ORDER_BY: Record<typeof sort, ReturnType<typeof sql>> = {
      relevance: sql`(p.view_count + p.repost_count + p.like_count) DESC NULLS LAST, p.created_at DESC`,
      popular: sql`(p.like_count * 3 + p.repost_count * 5 + p.view_count) DESC NULLS LAST, p.created_at DESC`,
      new: sql`p.created_at DESC`,
      old: sql`p.created_at ASC`,
    }

    // Both extra predicates are optional, so each is spliced in as a fragment
    // only when the caller actually asked for that filter.
    const sinceFilter = sinceDays ? sql`AND p.created_at > NOW() - (${sinceDays} * INTERVAL '1 day')` : undefined
    const mediaFilter = media
      ? sql`AND EXISTS (
            SELECT 1 FROM post_attachments pa
            WHERE pa.post_id = p.id AND ${attachmentKindFilter(media, sql`pa.mime`, sql`pa.url`)}
          )`
      : undefined

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
        ${sinceFilter}
        ${mediaFilter}
      ORDER BY ${ORDER_BY[sort]}
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

  return { users, posts, servers: serverRows, hashtags: hashtagRows, query: qRaw }
})