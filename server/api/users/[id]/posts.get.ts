import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, desc, inArray, and } from 'drizzle-orm'
import { getCurrentUser } from '../../../utils/auth'
import { serializePosts } from '../../../utils/postQuery'
import { enrichUsers, publicUser } from '../../../utils/userExtras'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50)
  const offset = Number(query.offset) || 0

  const currentUser = await getCurrentUser(event)

  // Private ("鍵") account: only self and followers may see posts.
  const target = await db.query.users.findFirst({
    where: eq(schema.users.id, id!),
    columns: { id: true, isPrivate: true },
  })
  if (target?.isPrivate && currentUser?.id !== id) {
    let isFollowing = false
    if (currentUser) {
      const f = await db.query.follows.findFirst({
        where: and(eq(schema.follows.followerId, currentUser.id), eq(schema.follows.followingId, id!)),
      })
      isFollowing = !!f
    }
    if (!isFollowing) {
      return { posts: [], nextOffset: offset, hasMore: false, locked: true }
    }
  }

  // Merge the user's own posts with their simple reposts (rendered as boosts)
  // so the profile shows both, ordered newest-first.
  const posts = await db.query.posts.findMany({
    where: eq(schema.posts.userId, id),
    limit, offset,
    orderBy: [desc(schema.posts.createdAt)],
  })
  const reposts = await db.query.reposts.findMany({
    where: eq(schema.reposts.userId, id),
    limit, offset,
    orderBy: [desc(schema.reposts.createdAt)],
  })

  const repostedIds = [...new Set(reposts.map(r => r.postId))]
  const repostedRows = repostedIds.length
    ? await db.query.posts.findMany({ where: inArray(schema.posts.id, repostedIds) })
    : []
  const repostedMap = new Map(repostedRows.map(p => [p.id, p]))

  const targetUser = await db.query.users.findFirst({ where: eq(schema.users.id, id!) })
  const extras = targetUser ? await enrichUsers([targetUser]) : {}
  const reposterPublic = targetUser ? publicUser(targetUser, extras[targetUser.id]) : null

  const postItems = posts.map(p => ({ createdAt: p.createdAt, row: p }))
  const boostItems = reposts
    .filter(r => repostedMap.has(r.postId))
    .map(r => ({
      createdAt: r.createdAt,
      row: {
        ...repostedMap.get(r.postId)!,
        boostedBy: { user: reposterPublic, repostedAt: r.createdAt },
      },
    }))

  const merged: any[] = []
  let i = 0
  let j = 0
  while (i < postItems.length || j < boostItems.length) {
    if (j >= boostItems.length || (i < postItems.length && +postItems[i].createdAt >= +boostItems[j].createdAt)) {
      merged.push(postItems[i]); i++
    } else {
      merged.push(boostItems[j]); j++
    }
  }
  const rows = merged.slice(0, limit)

  const result = await serializePosts(rows.map(r => r.row), currentUser)
  return { posts: result, nextOffset: offset + rows.length, hasMore: rows.length === limit }
})