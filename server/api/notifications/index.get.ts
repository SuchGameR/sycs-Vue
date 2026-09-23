import { db } from '../../db'
import * as schema from '../../db/schema'
import { and, desc, eq, inArray, ne } from 'drizzle-orm'
import { getCurrentUser } from '../../utils/auth'
import { serializePosts } from '../../utils/postQuery'

export default defineEventHandler(async (event) => {
  const currentUser = await getCurrentUser(event)
  if (!currentUser) throw createError({ statusCode: 401, message: 'ログインが必要です' })

  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50)
  const offset = Math.max(Number(query.offset) || 0, 0)
  const cap = offset + limit

  const myPosts = await db.query.posts.findMany({
    where: eq(schema.posts.userId, currentUser.id),
    columns: { id: true },
  })
  const myPostIds = myPosts.map(p => p.id)

  type Item = {
    id: string
    type: string
    actorId: string
    postId?: string | null
    emoji?: string | null
    content?: string | null
    createdAt: Date
  }
  const items: Item[] = []

  // Every query below is independent, so fan them out instead of awaiting them
  // one-by-one (cuts notification page latency noticeably).
  const [repostRows, commentRows, reactionRows] =
    myPostIds.length
      ? await Promise.all([
          db.query.reposts.findMany({
            where: and(inArray(schema.reposts.postId, myPostIds), ne(schema.reposts.userId, currentUser.id)),
            orderBy: [desc(schema.reposts.createdAt)],
            limit: cap,
          }),
          db.query.postComments.findMany({
            where: and(inArray(schema.postComments.postId, myPostIds), ne(schema.postComments.userId, currentUser.id)),
            orderBy: [desc(schema.postComments.createdAt)],
            limit: cap,
          }),
          db.query.postReactions.findMany({
            where: and(inArray(schema.postReactions.postId, myPostIds), ne(schema.postReactions.userId, currentUser.id)),
            orderBy: [desc(schema.postReactions.createdAt)],
            limit: cap,
          }),
        ])
      : [[], [], []]
  const [fls, frs] = await Promise.all([
    db.query.follows.findMany({
      where: eq(schema.follows.followingId, currentUser.id),
      orderBy: [desc(schema.follows.createdAt)],
      limit: cap,
    }),
    db.query.friends.findMany({
      where: and(eq(schema.friends.friendId, currentUser.id), eq(schema.friends.status, 'pending')),
      orderBy: [desc(schema.friends.createdAt)],
      limit: cap,
    }),
  ])
  for (const r of repostRows) items.push({ id: 'repost-' + r.id, type: 'repost', actorId: r.userId, postId: r.postId, createdAt: r.createdAt })
  for (const r of commentRows) items.push({ id: 'comment-' + r.id, type: 'comment', actorId: r.userId, postId: r.postId, content: r.content, createdAt: r.createdAt })
  for (const r of reactionRows) items.push({ id: 'reaction-' + r.id, type: 'reaction', actorId: r.userId, postId: r.postId, emoji: r.emoji, createdAt: r.createdAt })
  for (const r of fls) items.push({ id: 'follow-' + r.id, type: 'follow', actorId: r.followerId, createdAt: r.createdAt })
  for (const r of frs) items.push({ id: 'friend-' + r.id, type: 'friend_request', actorId: r.userId, createdAt: r.createdAt })

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const page = items.slice(offset, offset + limit)
  const hasMore = items.length > offset + page.length

  const [actors, authorities] = await Promise.all([
    (async () => {
      const actorIds = [...new Set(page.map(i => i.actorId))]
      return actorIds.length
        ? db.query.users.findMany({ where: inArray(schema.users.id, actorIds) })
        : []
    })(),
    (async () => {
      const postIds = [...new Set(page.map(i => i.postId).filter(Boolean) as string[])]
      if (!postIds.length) return []
      return db.query.posts.findMany({ where: inArray(schema.posts.id, postIds) })
    })(),
  ])
  const actorMap = Object.fromEntries(actors.map(u => [u.id, u]))

  const serializedPosts = await serializePosts(authorities, currentUser)
  const postMap = Object.fromEntries(serializedPosts.map(p => [p.id, p]))

  const result = page.map(i => ({
    id: i.id,
    type: i.type,
    emoji: i.emoji || null,
    content: i.content || null,
    createdAt: i.createdAt,
    post: i.postId ? (postMap[i.postId] || null) : null,
    actor: actorMap[i.actorId]
      ? {
          id: actorMap[i.actorId].id,
          username: actorMap[i.actorId].username,
          displayName: actorMap[i.actorId].displayName,
          avatarUrl: actorMap[i.actorId].avatarUrl,
        }
      : null,
  }))

  return { items: result, nextOffset: offset + page.length, hasMore }
})