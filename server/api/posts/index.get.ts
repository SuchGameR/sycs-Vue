import { db } from '../../db'
import * as schema from '../../db/schema'
import { desc, asc, inArray, eq, and, or, lt, sql } from 'drizzle-orm'
import { getCurrentUser } from '../../utils/auth'
import { isServerMember } from '../../utils/serverAuth'
import { serializePosts } from '../../utils/postQuery'
import { enrichUsers, publicUser } from '../../utils/userExtras'

interface Cursor { createdAt: number; id: string }
function decodeCursor(raw?: string | string[]): Cursor | null {
  const s = Array.isArray(raw) ? raw[0] : raw
  if (!s) return null
  const [ts, id] = String(s).split('|')
  const n = Number(ts)
  if (!id || !Number.isFinite(n)) return null
  return { createdAt: n, id }
}
interface CursorPair { posts: Cursor | null; boosts: Cursor | null }
function decodeCursorPair(raw?: string | string[]): CursorPair {
  const s = Array.isArray(raw) ? raw[0] : raw
  if (!s) return { posts: null, boosts: null }
  try {
    const o = JSON.parse(Buffer.from(String(s), 'base64url').toString('utf8'))
    return {
      posts: o && Array.isArray(o.p) && o.p.length === 2 ? { createdAt: Number(o.p[0]), id: String(o.p[1]) } : null,
      boosts: o && Array.isArray(o.b) && o.b.length === 2 ? { createdAt: Number(o.b[0]), id: String(o.b[1]) } : null,
    }
  } catch {
    const legacy = decodeCursor(s)
    return { posts: legacy, boosts: legacy }
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50)
  const offset = Number(query.offset) || 0
  const initialCursor = decodeCursorPair(query.cursor)

  let scope = String(query.scope || '')
  const legacy = String(query.timeline || '')
  if (!scope && legacy) scope = legacy
  if (!scope) scope = 'global'

  const sort = String(query.sort || (scope === 'recommended' || scope === 'trending' ? 'popular' : 'latest'))
  const mediaType = query.mediaType ? String(query.mediaType) : ''
  const targetUserId = query.userId ? String(query.userId) : ''
  const related = String(query.related || '') === 'true'
  const serverId = query.serverId ? String(query.serverId) : ''
  const channelId = query.channelId ? String(query.channelId) : ''

  const currentUser = await getCurrentUser(event)

  const conditions: any[] = []
  // Who may appear in this feed as a reposter ("boosted by"). `null` = everyone.
  let boostPool: string[] | null = null

  if (serverId) {
    if (!currentUser || !(await isServerMember(currentUser.id, serverId))) {
      throw createError({ statusCode: 403, message: 'このサーバーの投稿を閲覧する権限がありません' })
    }
    conditions.push(eq(schema.posts.serverId, serverId))
    if (channelId) conditions.push(eq(schema.posts.channelId, channelId))
    const members = await db.query.serverMembers.findMany({
      where: eq(schema.serverMembers.serverId, serverId),
      columns: { userId: true },
    })
    boostPool = members.map(m => m.userId)
  }

  if (targetUserId) {
    conditions.push(eq(schema.posts.userId, targetUserId))
    boostPool = [targetUserId]
  }

  let orderBy: any = sort === 'popular'
    ? [desc(schema.posts.viewCount), desc(schema.posts.repostCount), desc(schema.posts.createdAt)]
    : [desc(schema.posts.createdAt)]

  // Scoped audience
  if (!serverId && !targetUserId && currentUser) {
    if (scope === 'local') {
      const close = await db.query.closeFriends.findMany({
        where: eq(schema.closeFriends.userId, currentUser.id),
        columns: { friendId: true },
      })
      conditions.push(inArray(schema.posts.userId, [currentUser.id, ...close.map(c => c.friendId)]))
      boostPool = [currentUser.id, ...close.map(c => c.friendId)]
    } else if (scope === 'following') {
      const follows = await db.query.follows.findMany({
        where: eq(schema.follows.followerId, currentUser.id),
        columns: { followingId: true },
      })
      conditions.push(inArray(schema.posts.userId, [currentUser.id, ...follows.map(f => f.followingId)]))
      boostPool = [currentUser.id, ...follows.map(f => f.followingId)]
    } else if (scope === 'recommended' || scope === 'trending' || related) {
      const follows = await db.query.follows.findMany({
        where: eq(schema.follows.followerId, currentUser.id),
        columns: { followingId: true },
      })
      const followedIds = follows.map(f => f.followingId)
      let recommendedIds: string[] = [currentUser.id, ...followedIds]
      if (scope === 'recommended' || related) {
        const reactedPosts = await db.query.postReactions.findMany({
          where: eq(schema.postReactions.userId, currentUser.id),
          columns: { postId: true },
          limit: 50,
          orderBy: [desc(schema.postReactions.createdAt)],
        })
        if (reactedPosts.length) {
          const reactedPosters = await db.query.posts.findMany({
            where: inArray(schema.posts.id, reactedPosts.map(l => l.postId)),
            columns: { userId: true },
          })
          recommendedIds = [...new Set([...recommendedIds, ...reactedPosters.map(p => p.userId)])]
        }
      }
      if (recommendedIds.length) {
        conditions.push(inArray(schema.posts.userId, recommendedIds))
      }
      boostPool = recommendedIds.length ? recommendedIds : null
      if (scope === 'recommended' || scope === 'trending') {
        orderBy = [desc(schema.posts.viewCount), desc(schema.posts.repostCount), desc(schema.posts.createdAt)]
      }
    }
  }

  // Media type filtering (EXISTS subqueries so we never scan the whole attachments table)
  if (mediaType === 'text') {
    conditions.push(sql`NOT EXISTS (SELECT 1 FROM post_attachments pa WHERE pa.post_id = posts.id)`)
  } else if (mediaType) {
    conditions.push(sql`EXISTS (SELECT 1 FROM post_attachments pa WHERE pa.post_id = posts.id AND pa.type = ${mediaType})`)
  }

  const where = conditions.length ? and(...conditions) : undefined

  // Visibility filtering
  const followers = new Set<string>()
  const closeFriends = new Set<string>()
  if (currentUser) {
    const fls = await db.query.follows.findMany({ where: eq(schema.follows.followerId, currentUser.id) })
    fls.forEach(f => followers.add(f.followingId))
    const cfs = await db.query.closeFriends.findMany({ where: eq(schema.closeFriends.userId, currentUser.id) })
    cfs.forEach(f => closeFriends.add(f.friendId))
  }

  const isVisible = (p: typeof schema.posts.$inferSelect) => {
    if (p.visibility === 'public') return true
    if (!currentUser) return false
    if (p.userId === currentUser.id) return true
    if (p.visibility === 'followers' && followers.has(p.userId)) return true
    if (p.visibility === 'close_friends' && closeFriends.has(p.userId)) return true
    if (p.visibility === 'specific') {
      const visibleTo = JSON.parse(p.visibleTo || '[]')
      if (visibleTo.includes(currentUser.id)) return true
    }
    return false
  }

  // Private ("鍵") accounts: only self and followers can see their posts.
  const privacyCache = new Map<string, boolean>()
  async function ensurePrivacy(rows: any[]) {
    const missing = [...new Set(rows.map(r => r.userId))].filter(uid => !privacyCache.has(uid))
    if (!missing.length) return
    const us = await db.query.users.findMany({
      where: inArray(schema.users.id, missing),
      columns: { id: true, isPrivate: true },
    })
    for (const u of us) privacyCache.set(u.id, !!u.isPrivate)
  }
  const authorVisible = (p: typeof schema.posts.$inferSelect) => {
    if (serverId) return true
    if (!privacyCache.get(p.userId)) return true
    if (!currentUser) return false
    if (p.userId === currentUser.id) return true
    return followers.has(p.userId)
  }

  // Simple reposts shown as "boosted by" in the feed. Only mixed into newest-first
  // feeds so a boost appears at the point in time it was made. Media/popular feeds
  // stay boost-free to keep sorting meaningful.
  const includeBoosts = sort === 'latest' && !mediaType && !related

  // boostPool === null means "every reposter may appear" (e.g. global feed), so a
  // boost never needs a user filter and still shows with the reposter's name.
  const boostWhere = includeBoosts
    ? (boostPool && boostPool.length ? and(inArray(schema.reposts.userId, boostPool)) : undefined)
    : undefined

  async function fetchBoosts(cursor: number) {
    const reposts = await db.query.reposts.findMany({
      where: boostWhere,
      limit,
      offset: cursor,
      orderBy: [desc(schema.reposts.createdAt)],
    })
    if (!reposts.length) return []
    const ids = [...new Set(reposts.map(r => r.postId))]
    const rows = await db.query.posts.findMany({ where: inArray(schema.posts.id, ids) })
    const map = new Map(rows.map(p => [p.id, p]))
    return reposts
      .filter(r => map.has(r.postId))
      .map(r => ({ createdAt: r.createdAt, reposterId: r.userId, post: map.get(r.postId)! }))
  }

  const reposterCache = new Map<string, any>()
  async function ensureReposters(ids: string[]) {
    const missing = [...new Set(ids)].filter(id => !reposterCache.has(id))
    if (!missing.length) return
    const us = await db.query.users.findMany({ where: inArray(schema.users.id, missing) })
    const extras = await enrichUsers(us)
    for (const u of us) reposterCache.set(u.id, publicUser(u, extras[u.id]))
  }

  // Keyset pagination for newest-first feeds: each stream (posts, boosts) keeps
  // its own (createdAt, id) cursor so pages stay stable while new posts arrive.
  const useKeyset = sort === 'latest'

  function encodeCursorPair(postsCur: Cursor | null, boostsCur: Cursor | null): string {
    return Buffer.from(JSON.stringify({
      p: postsCur ? [postsCur.createdAt, postsCur.id] : null,
      b: boostsCur ? [boostsCur.createdAt, boostsCur.id] : null,
    })).toString('base64url')
  }

  async function fetchPostsWindow(prev: Cursor | null, take: number) {
    const keyCond = prev ? or(
      lt(schema.posts.createdAt, new Date(prev.createdAt)),
      and(eq(schema.posts.createdAt, new Date(prev.createdAt)), lt(schema.posts.id, prev.id)),
    ) : undefined
    return db.query.posts.findMany({
      where: and(...conditions, keyCond),
      orderBy: [desc(schema.posts.createdAt), desc(schema.posts.id)],
      limit: take,
    })
  }

  async function fetchBoostsKeyset(prev: Cursor | null, take: number) {
    const keyCond = prev ? or(
      lt(schema.reposts.createdAt, new Date(prev.createdAt)),
      and(eq(schema.reposts.createdAt, new Date(prev.createdAt)), lt(schema.reposts.id, prev.id)),
    ) : undefined
    const reposts = await db.query.reposts.findMany({
      where: and(boostWhere, keyCond),
      orderBy: [desc(schema.reposts.createdAt), desc(schema.reposts.id)],
      limit: take,
    })
    if (!reposts.length) return []
    const ids = [...new Set(reposts.map(r => r.postId))]
    const rows = await db.query.posts.findMany({ where: inArray(schema.posts.id, ids) })
    const map = new Map(rows.map(p => [p.id, p]))
    return reposts
      .filter(r => map.has(r.postId))
      .map(r => ({ createdAt: r.createdAt, reposterId: r.userId, post: map.get(r.postId)!, repostId: r.id }))
  }

  // Fetch in batches until we have `limit` visible posts (or boosts) or the source
  // is exhausted, merging posts and boosts by createdAt so the combined feed stays
  // newest-first.
  const collected: any[] = []
  const boostShown = new Set<string>()
  let cursor = offset
  let postCursor: Cursor | null = initialCursor.posts
  let boostCursor: Cursor | null = initialCursor.boosts
  let postExhausted = false
  let boostExhausted = false
  const boostActive = includeBoosts && (boostPool ? boostPool.length > 0 : true)
  let reachedEnd = false
  let pageFull = false

  while (collected.length < limit && !reachedEnd && !pageFull) {
    let postsBatch: any[]
    let boostsBatch: any[]
    if (useKeyset) {
      postsBatch = postExhausted ? [] : await fetchPostsWindow(postCursor, limit)
      if (!postsBatch.length) postExhausted = true
      boostsBatch = (boostActive && !boostExhausted) ? await fetchBoostsKeyset(boostCursor, limit) : []
      if (boostActive && !boostsBatch.length) boostExhausted = true
    } else {
      postsBatch = await db.query.posts.findMany({ limit, offset: cursor, where, orderBy })
      boostsBatch = boostActive ? await fetchBoosts(cursor) : []
    }
    if (!postsBatch.length && !boostsBatch.length) { reachedEnd = true; break }

    await ensurePrivacy([...postsBatch, ...boostsBatch.map(b => b.post)])
    await ensureReposters(boostsBatch.map(b => b.reposterId))

    const postsItems = postsBatch.map(p => ({ kind: 'post' as const, createdAt: p.createdAt, row: p }))
    const boostItems = boostsBatch.map(b => ({ kind: 'boost' as const, createdAt: b.createdAt, row: b }))

    const merged: any[] = []
    let i = 0
    let j = 0
    while (i < postsItems.length || j < boostItems.length) {
      if (j >= boostItems.length || (i < postsItems.length && +postsItems[i].createdAt >= +boostItems[j].createdAt)) {
        merged.push(postsItems[i])
        i++
      } else {
        merged.push(boostItems[j])
        j++
      }
    }

    for (const item of merged) {
      if (collected.length >= limit) { pageFull = true; break }
      if (useKeyset) {
        if (item.kind === 'post') postCursor = { createdAt: +item.createdAt, id: item.row.id }
        else boostCursor = { createdAt: +item.createdAt, id: item.row.repostId }
      } else {
        cursor++
      }
      if (item.kind === 'post') {
        if (isVisible(item.row) && authorVisible(item.row)) collected.push(item.row)
      } else {
        const p = item.row.post
        if (boostShown.has(p.id)) continue
        if (isVisible(p) && authorVisible(p)) {
          collected.push({
            ...p,
            boostedBy: { user: reposterCache.get(item.row.reposterId) || null, repostedAt: item.row.createdAt },
          })
          boostShown.add(p.id)
        }
      }
    }

    if (useKeyset) {
      if (postExhausted && (!boostActive || boostExhausted)) { reachedEnd = true; break }
    } else if (postsBatch.length < limit && boostsBatch.length < limit) {
      reachedEnd = true
    }
  }

  const result = await serializePosts(collected, currentUser)
  if (useKeyset) {
    return { posts: result, nextOffset: cursor, nextCursor: encodeCursorPair(postCursor, boostCursor), hasMore: !reachedEnd }
  }
  return { posts: result, nextOffset: cursor, hasMore: !reachedEnd }
})