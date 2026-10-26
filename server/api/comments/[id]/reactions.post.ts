import { randomUUID } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const commentId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const emoji = String(body?.emoji || '').trim().slice(0, 16)
  if (!emoji) throw createError({ statusCode: 400, message: '絵文字を指定してください' })

  const comment = await db.query.postComments.findFirst({ where: eq(schema.postComments.id, commentId!) })
  if (!comment) throw createError({ statusCode: 404, message: '返信が見つかりません' })

  const existing = await db.query.postCommentReactions.findFirst({
    where: and(
      eq(schema.postCommentReactions.commentId, commentId!),
      eq(schema.postCommentReactions.userId, user.id),
      eq(schema.postCommentReactions.emoji, emoji),
    ),
  })

  if (existing) {
    await db.delete(schema.postCommentReactions).where(eq(schema.postCommentReactions.id, existing.id))
    return { active: false }
  }

  await db.insert(schema.postCommentReactions).values({
    id: randomUUID(),
    commentId: commentId!,
    userId: user.id,
    emoji,
  }).onConflictDoNothing()
  return { active: true }
})
