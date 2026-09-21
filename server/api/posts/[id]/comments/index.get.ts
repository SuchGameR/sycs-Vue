import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, inArray } from 'drizzle-orm'
import { getCurrentUser } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'id')
  await getCurrentUser(event)

  const comments = await db.query.postComments.findMany({
    where: eq(schema.postComments.postId, postId!),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  })

  const userIds = [...new Set(comments.map(c => c.userId))]
  const users = userIds.length
    ? await db.query.users.findMany({ where: inArray(schema.users.id, userIds) })
    : []
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))

  return { comments: comments.map(c => ({ ...c, user: userMap[c.userId] || null })) }
})
