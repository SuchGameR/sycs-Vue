import { randomUUID } from 'crypto'
import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, and, isNull, gt, sql } from 'drizzle-orm'
import { getCurrentUser } from '../../../utils/auth'

const COOLDOWN_MS = 60_000

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'id')
  const user = await getCurrentUser(event)

  const post = await db.query.posts.findFirst({
    where: eq(schema.posts.id, postId),
    columns: { id: true, viewCount: true },
  })
  if (!post) throw createError({ statusCode: 404, message: '投稿が見つかりません' })

  const cutoff = new Date(Date.now() - COOLDOWN_MS)
  const viewerMatch = user?.id
    ? eq(schema.postViews.userId, user.id)
    : isNull(schema.postViews.userId)

  const recent = await db.query.postViews.findFirst({
    where: and(eq(schema.postViews.postId, postId), viewerMatch, gt(schema.postViews.createdAt, cutoff)),
    columns: { id: true },
  })

  if (recent) return { counted: false, viewCount: post.viewCount ?? 0 }

  await db.insert(schema.postViews).values({
    id: randomUUID(),
    postId,
    userId: user?.id || null,
  })

  const [updated] = await db
    .update(schema.posts)
    .set({ viewCount: sql`COALESCE(${schema.posts.viewCount}, 0) + 1` })
    .where(eq(schema.posts.id, postId))
    .returning({ viewCount: schema.posts.viewCount })

  return { counted: true, viewCount: updated?.viewCount ?? (post.viewCount ?? 0) + 1 }
})
