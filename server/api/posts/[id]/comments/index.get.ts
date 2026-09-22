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
  await getCurrentUser(event)

  const comments = await db.query.postComments.findMany({
    where: eq(schema.postComments.postId, postId!),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
    limit,
    offset,
  })

  const userIds = [...new Set(comments.map(c => c.userId))]
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
    })),
    nextOffset: offset + comments.length,
    hasMore: comments.length === limit,
  }
})
