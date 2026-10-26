import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const commentId = getRouterParam(event, 'id')
  const comment = await db.query.postComments.findFirst({ where: eq(schema.postComments.id, commentId!) })
  if (!comment) throw createError({ statusCode: 404, message: '返信が見つかりません' })

  await db.insert(schema.postCommentReposts).values({
    id: randomUUID(),
    commentId: commentId!,
    userId: user.id,
  }).onConflictDoNothing()

  const reposts = await db.query.postCommentReposts.findMany({
    where: eq(schema.postCommentReposts.commentId, commentId!),
  })
  return { reposted: true, repostCount: reposts.length }
})
