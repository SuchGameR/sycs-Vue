import { randomUUID } from 'crypto'
import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, max } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const postId = String(body?.postId || '')
  if (!postId) throw createError({ statusCode: 400, message: 'postId が必要です' })

  const playlist = await db.query.playlists.findFirst({ where: eq(schema.playlists.id, id) })
  if (!playlist) throw createError({ statusCode: 404, message: 'プレイリストが見つかりません' })
  if (playlist.userId !== user.id) throw createError({ statusCode: 403, message: '権限がありません' })

  const post = await db.query.posts.findFirst({ where: eq(schema.posts.id, postId), columns: { id: true } })
  if (!post) throw createError({ statusCode: 404, message: '投稿が見つかりません' })

  const [{ value: lastPos }] = await db
    .select({ value: max(schema.playlistItems.position) })
    .from(schema.playlistItems)
    .where(eq(schema.playlistItems.playlistId, id))

  await db.insert(schema.playlistItems).values({
    id: randomUUID(),
    playlistId: id,
    postId,
    position: (lastPos ?? -1) + 1,
  }).onConflictDoNothing()

  await db.update(schema.playlists).set({ updatedAt: new Date() }).where(eq(schema.playlists.id, id))

  return { success: true }
})
