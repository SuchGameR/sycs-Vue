import { db } from '../../db'
import * as schema from '../../db/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const playlist = await db.query.playlists.findFirst({ where: eq(schema.playlists.id, id) })
  if (!playlist) throw createError({ statusCode: 404, message: 'プレイリストが見つかりません' })
  if (playlist.userId !== user.id) throw createError({ statusCode: 403, message: '権限がありません' })

  await db.delete(schema.playlists).where(and(eq(schema.playlists.id, id), eq(schema.playlists.userId, user.id)))
  return { success: true }
})
