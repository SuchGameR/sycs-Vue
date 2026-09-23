import { randomUUID } from 'crypto'
import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { broadcast } from '../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const postId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const emoji = String(body.emoji || '').trim().slice(0, 16)
  if (!emoji) throw createError({ statusCode: 400, message: '絵文字を指定してください' })

  const post = await db.query.posts.findFirst({ where: eq(schema.posts.id, postId!) })
  if (!post) throw createError({ statusCode: 404, message: '投稿が見つかりません' })

  const existing = await db.query.postReactions.findFirst({
    where: and(
      eq(schema.postReactions.postId, postId!),
      eq(schema.postReactions.userId, user.id),
      eq(schema.postReactions.emoji, emoji)
    ),
  })

  let active: boolean
  if (existing) {
    await db.delete(schema.postReactions).where(eq(schema.postReactions.id, existing.id))
    active = false
  } else {
    await db.insert(schema.postReactions).values({
      id: randomUUID(),
      postId: postId!,
      userId: user.id,
      emoji,
    })
    active = true
  }

  broadcast({
    type: 'reaction.update',
    postId,
    emoji,
    userId: user.id,
    active,
    postOwnerId: post.userId,
    actor: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  })

  return { active }
})
