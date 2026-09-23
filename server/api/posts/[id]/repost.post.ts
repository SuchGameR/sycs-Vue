import { randomUUID } from 'crypto'
import { db, initDb } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { broadcast } from '../../../utils/realtime'
import { emit } from '../../../utils/eventBus'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const postId = getRouterParam(event, 'id')
  const body = await readBody(event).catch(() => ({}))

  const target = await db.query.posts.findFirst({ where: eq(schema.posts.id, postId!) })
  if (!target) throw createError({ statusCode: 404, message: '投稿が見つかりません' })

  // Quote repost: creates a new post embedding the original one.
  const quote = body?.quote && typeof body.quote === 'string' ? body.quote.trim() : ''
  const actor = { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl }
  if (quote || body?.quotePost) {
    if (!quote && !body?.quotePost) throw createError({ statusCode: 400, message: '引用の本文が必要です' })
    const [quotePost] = await db.insert(schema.posts).values({
      id: randomUUID(),
      userId: user.id,
      content: quote,
      visibility: body?.visibility || 'public',
      visibleTo: body?.visibleTo ? JSON.stringify(body.visibleTo) : '[]',
      quotedPostId: postId,
    }).returning()
    const postWithUser = { ...quotePost, user, attachments: [], liked: false, reposted: false, bookmarked: false }
    emit('post:created', { post: postWithUser })
    try { broadcast({ type: 'activity.new', kind: 'quote', actorId: user.id, actor, postId, postOwnerId: target.userId }) } catch {}
    return { success: true, quote: { id: quotePost.id, post: postWithUser } }
  }

  const existing = await db.query.reposts.findFirst({
    where: and(eq(schema.reposts.userId, user.id), eq(schema.reposts.postId, postId))
  })
  if (existing) return { success: true }

  await db.insert(schema.reposts).values({ id: randomUUID(), userId: user.id, postId })
  await db.execute(sql`UPDATE posts SET repost_count = repost_count + 1 WHERE id = ${postId}`)

  broadcast({ type: 'activity.new', kind: 'repost', actorId: user.id, actor, postId, postOwnerId: target.userId })
  return { success: true }
})
