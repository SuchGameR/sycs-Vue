import { db } from '../../db'
import * as schema from '../../db/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const playlist = await db.query.playlists.findFirst({ where: eq(schema.playlists.id, id) })
  if (!playlist) throw createError({ statusCode: 404, message: 'プレイリストが見つかりません' })
  if (playlist.userId !== user.id) throw createError({ statusCode: 403, message: '権限がありません' })

  const patch: Record<string, any> = { updatedAt: new Date() }
  if (body?.name !== undefined) {
    const name = String(body.name).trim()
    if (!name || name.length > 60) throw createError({ statusCode: 400, message: 'プレイリスト名は1〜60文字で入力してください' })
    patch.name = name
  }
  if (body?.description !== undefined) patch.description = body.description ? String(body.description).trim() : null

  const [updated] = await db.update(schema.playlists).set(patch)
    .where(and(eq(schema.playlists.id, id), eq(schema.playlists.userId, user.id)))
    .returning()

  return { playlist: updated }
})
