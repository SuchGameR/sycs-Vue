import { randomUUID } from 'crypto'
import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'
import { broadcast } from '../../../../utils/realtime'
import { normalizeAttachments } from '../../../../utils/attachments'
import { enrichUsers, publicUser } from '../../../../utils/userExtras'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const postId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const content = String(body.content || '').trim()
  const attachments = normalizeAttachments(body.attachments)
  if (!content && !attachments.length) throw createError({ statusCode: 400, message: 'コメントを入力してください' })
  if (content.length > 2000) throw createError({ statusCode: 400, message: 'コメントが長すぎます' })

  const post = await db.query.posts.findFirst({ where: eq(schema.posts.id, postId!) })
  if (!post) throw createError({ statusCode: 404, message: '投稿が見つかりません' })

  const [comment] = await db.insert(schema.postComments).values({
    id: randomUUID(),
    postId: postId!,
    userId: user.id,
    content,
    attachments: JSON.stringify(attachments),
  }).returning()

  const extras = await enrichUsers([user])
  const commentWithUser = {
    ...comment,
    attachments,
    user: publicUser({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    }, extras[user.id]),
  }

  broadcast({ type: 'comment.new', postId, postOwnerId: post.userId, comment: commentWithUser })

  return { comment: commentWithUser }
})
