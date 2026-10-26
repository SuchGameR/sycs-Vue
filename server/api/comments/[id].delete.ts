import { eq } from 'drizzle-orm'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const commentId = getRouterParam(event, 'id')
  const comment = await db.query.postComments.findFirst({ where: eq(schema.postComments.id, commentId!) })
  if (!comment) throw createError({ statusCode: 404, message: '返信が見つかりません' })
  if (comment.userId !== user.id) throw createError({ statusCode: 403, message: 'この返信を削除する権限がありません' })

  await db.delete(schema.postComments).where(eq(schema.postComments.id, commentId!))
  return { success: true }
})
