import { db } from '../../db'
import * as schema from '../../db/schema'
import { desc, inArray, eq, and, notInArray, or } from 'drizzle-orm'
import { getCurrentUser } from '../../utils/auth'
import { isServerMember } from '../../utils/serverAuth'
import { serializePosts } from '../../utils/postQuery'
import { enrichUsers, publicUser } from '../../utils/userExtras'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50)
  const offset = Number(query.offset) || 0

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

  // Media type filtering
  if (mediaType === 'text') {
    const withAttachments = await db.query.postAttachments.findMany({
      columns: { postId: true },
    })
    const ids = [...new Set(withAttachments.map(a => a.postId))]
    if (ids.length) conditions.push(notInArray(schema.posts.id, ids))
  } else if (mediaType) {
    const matching = await db.query.postAttachments.findMany({
      where: eq(schema.postAttachments.type, mediaType),
      columns: { postId: true },
    })
    const ids = [...new Set(matching.map(a => a.postId))]
    if (!ids.length) return { posts: [] }
    conditions.push(inArray(schema.posts.id, ids))
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

  const boostWhere = includeBoosts && boostPool?.length
    ? and(inArray(schema.reposts.userId, boostPool))
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

  // Fetch in batches until we have `limit` visible posts (or boosts) or the source
  // is exhausted, merging posts and boosts by createdAt so the combined feed stays
  // newest-first. `offset`/`nextOffset` stay correct across both streams.
  const collected: any[] = []
  const boostShown = new Set<string>()
  let cursor = offset
  let reachedEnd = false
  let pageFull = false
  while (collected.length < limit && !reachedEnd && !pageFull) {
    const postsBatch = await db.query.posts.findMany({ limit, offset: cursor, where, orderBy })
    const boostsBatch = includeBoosts ? await fetchBoosts(cursor) : []
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
      cursor++
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
    if (postsBatch.length < limit && boostsBatch.length < limit) reachedEnd = true
  }

  const result = await serializePosts(collected, currentUser)
  return { posts: result, nextOffset: cursor, hasMore: !reachedEnd }
})