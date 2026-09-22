import { db } from '../db'
import * as schema from '../db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { enrichUsers, publicUser } from './userExtras'

export interface ReactionSummary {
  emoji: string
  count: number
  mine: boolean
  users: Array<{ id: string; username: string; displayName: string }>
}

export async function serializePosts(posts: any[], currentUser: any | null) {
  const postIds = posts.map(p => p.id)
  if (!postIds.length) return []

  const postUserIds = [...new Set(posts.map(p => p.userId))]
  const postUsers = postUserIds.length
    ? await db.query.users.findMany({ where: inArray(schema.users.id, postUserIds) })
    : []
  const postExtras = await enrichUsers(postUsers)
  const postUserMap = Object.fromEntries(postUsers.map(u => [u.id, publicUser(u, postExtras[u.id])]))

  const attachments = await db.query.postAttachments.findMany({
    where: inArray(schema.postAttachments.postId, postIds),
    orderBy: [schema.postAttachments.position],
  })
  const attachMap: Record<string, any[]> = {}
  for (const a of attachments) {
    if (!attachMap[a.postId]) attachMap[a.postId] = []
    attachMap[a.postId].push(a)
  }

  let userLikes = new Set<string>()
  let userReposts = new Set<string>()
  let userBookmarks = new Set<string>()
  if (currentUser) {
    const likes = await db.query.likes.findMany({
      where: and(eq(schema.likes.userId, currentUser.id), inArray(schema.likes.postId, postIds)),
    })
    likes.forEach(l => userLikes.add(l.postId))
    const repsts = await db.query.reposts.findMany({
      where: and(eq(schema.reposts.userId, currentUser.id), inArray(schema.reposts.postId, postIds)),
    })
    repsts.forEach(r => userReposts.add(r.postId))
    const bms = await db.query.bookmarks.findMany({
      where: and(eq(schema.bookmarks.userId, currentUser.id), inArray(schema.bookmarks.postId, postIds)),
    })
    bms.forEach(b => userBookmarks.add(b.postId))
  }

  const comments = await db.query.postComments.findMany({
    where: inArray(schema.postComments.postId, postIds),
    columns: { postId: true },
  })
  const commentCount = new Map<string, number>()
  for (const c of comments) commentCount.set(c.postId, (commentCount.get(c.postId) || 0) + 1)

  const reactions = await db.query.postReactions.findMany({
    where: inArray(schema.postReactions.postId, postIds),
  })
  const reactionUserIds = [...new Set(reactions.map(r => r.userId))]
  const reactionUsers = reactionUserIds.length
    ? await db.query.users.findMany({ where: inArray(schema.users.id, reactionUserIds) })
    : []
  const reactionUserMap = Object.fromEntries(reactionUsers.map(u => [u.id, u]))

  const reactionMap: Record<string, Map<string, ReactionSummary>> = {}
  for (const r of reactions) {
    if (!reactionMap[r.postId]) reactionMap[r.postId] = new Map()
    const group = reactionMap[r.postId]
    const existing = group.get(r.emoji) || {
      emoji: r.emoji, count: 0, mine: false,
      users: [] as Array<{ id: string; username: string; displayName: string }>,
    }
    existing.count++
    if (currentUser && r.userId === currentUser.id) existing.mine = true
    const u = reactionUserMap[r.userId]
    if (u) existing.users.push({ id: u.id, username: u.username, displayName: u.displayName })
    group.set(r.emoji, existing)
  }

  return posts.map(p => ({
    ...p,
    user: postUserMap[p.userId] || null,
    attachments: attachMap[p.id] || [],
    liked: userLikes.has(p.id),
    reposted: userReposts.has(p.id),
    bookmarked: userBookmarks.has(p.id),
    commentCount: commentCount.get(p.id) || 0,
    reactions: reactionMap[p.id] ? [...reactionMap[p.id].values()] : [],
  }))
}
