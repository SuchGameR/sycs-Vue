import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const postId = getRouterParam(event, 'postId')

  const playlist = await db.query.playlists.findFirst({ where: eq(schema.playlists.id, id) })
  if (!playlist) throw createError({ statusCode: 404, message: 'プレイリストが見つかりません' })
  if (playlist.userId !== user.id) throw createError({ statusCode: 403, message: '権限がありません' })

  await db.delete(schema.playlistItems)
    .where(and(eq(schema.playlistItems.playlistId, id), eq(schema.playlistItems.postId, postId)))

  await db.update(schema.playlists).set({ updatedAt: new Date() }).where(eq(schema.playlists.id, id))

  return { success: true }
})
