import { db } from '../../db'
import * as schema from '../../db/schema'
import { desc, inArray, eq, and, notInArray, or } from 'drizzle-orm'
import { getCurrentUser } from '../../utils/auth'
import { isServerMember } from '../../utils/serverAuth'
import { serializePosts } from '../../utils/postQuery'

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

  if (serverId) {
    if (!currentUser || !(await isServerMember(currentUser.id, serverId))) {
      throw createError({ statusCode: 403, message: 'このサーバーの投稿を閲覧する権限がありません' })
    }
    conditions.push(eq(schema.posts.serverId, serverId))
    if (channelId) conditions.push(eq(schema.posts.channelId, channelId))
  }

  if (targetUserId) {
    conditions.push(eq(schema.posts.userId, targetUserId))
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
    } else if (scope === 'following') {
      const follows = await db.query.follows.findMany({
        where: eq(schema.follows.followerId, currentUser.id),
        columns: { followingId: true },
      })
      conditions.push(inArray(schema.posts.userId, [currentUser.id, ...follows.map(f => f.followingId)]))
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

  // Fetch in batches until we have `limit` visible posts or the source is exhausted,
  // so `offset`/`nextOffset` stay correct despite post-fetch visibility filtering.
  const collected: any[] = []
  let cursor = offset
  let reachedEnd = false
  let pageFull = false
  while (collected.length < limit && !reachedEnd && !pageFull) {
    const batch = await db.query.posts.findMany({ limit, offset: cursor, where, orderBy })
    if (!batch.length) { reachedEnd = true; break }
    await ensurePrivacy(batch)
    for (const row of batch) {
      if (isVisible(row) && authorVisible(row)) {
        if (collected.length >= limit) { pageFull = true; break }
        collected.push(row)
      }
      cursor++
    }
    if (batch.length < limit) reachedEnd = true
  }

  const result = await serializePosts(collected, currentUser)
  return { posts: result, nextOffset: cursor, hasMore: !reachedEnd }
})
