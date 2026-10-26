import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, inArray } from 'drizzle-orm'
import { getCurrentUser } from '../../../../utils/auth'
import { parseAttachments } from '../../../../utils/attachments'
import { enrichUsers, publicUser } from '../../../../utils/userExtras'

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'id')
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50)
  const offset = Number(query.offset) || 0
  const currentUser = await getCurrentUser(event)

  const comments = await db.query.postComments.findMany({
    where: eq(schema.postComments.postId, postId!),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
    limit,
    offset,
  })

  const commentIds = comments.map(comment => comment.id)
  const reactions = commentIds.length
    ? await db.query.postCommentReactions.findMany({ where: inArray(schema.postCommentReactions.commentId, commentIds) })
    : []
  const reposts = commentIds.length
    ? await db.query.postCommentReposts.findMany({ where: inArray(schema.postCommentReposts.commentId, commentIds) })
    : []
  const userIds = [...new Set([
    ...comments.map(comment => comment.userId),
    ...reactions.map(reaction => reaction.userId),
  ])]
  const users = userIds.length
    ? await db.query.users.findMany({ where: inArray(schema.users.id, userIds) })
    : []
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))
  const extras = await enrichUsers(users)

  return {
    comments: comments.map(c => ({
      ...c,
      attachments: parseAttachments(c.attachments),
      user: userMap[c.userId] ? publicUser(userMap[c.userId], extras[c.userId]) : null,
      reactions: [...new Set(reactions.filter(reaction => reaction.commentId === c.id).map(reaction => reaction.emoji))]
        .map(emoji => {
          const group = reactions.filter(reaction => reaction.commentId === c.id && reaction.emoji === emoji)
          return {
            emoji,
            count: group.length,
            mine: group.some(reaction => reaction.userId === currentUser?.id),
            users: group.map(reaction => ({
              id: reaction.userId,
              username: userMap[reaction.userId]?.username,
              displayName: userMap[reaction.userId]?.displayName,
            })),
          }
        }),
      repostCount: reposts.filter(repost => repost.commentId === c.id).length,
      reposted: reposts.some(repost => repost.commentId === c.id && repost.userId === currentUser?.id),
    })),
    nextOffset: offset + comments.length,
    hasMore: comments.length === limit,
  }
})
