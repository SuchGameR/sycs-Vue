import { randomUUID } from 'crypto'
import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'
import { broadcast } from '../../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const postId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const content = String(body.content || '').trim()
  if (!content) throw createError({ statusCode: 400, message: 'コメントを入力してください' })
  if (content.length > 2000) throw createError({ statusCode: 400, message: 'コメントが長すぎます' })

  const post = await db.query.posts.findFirst({ where: eq(schema.posts.id, postId!) })
  if (!post) throw createError({ statusCode: 404, message: '投稿が見つかりません' })

  const [comment] = await db.insert(schema.postComments).values({
    id: randomUUID(),
    postId: postId!,
    userId: user.id,
    content,
  }).returning()

  const commentWithUser = {
    ...comment,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  }

  broadcast({ type: 'comment.new', postId, comment: commentWithUser })

  return { comment: commentWithUser }
})
