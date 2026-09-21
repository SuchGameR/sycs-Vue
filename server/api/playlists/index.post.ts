import { randomUUID } from 'crypto'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const name = String(body?.name || '').trim()
  const description = body?.description ? String(body.description).trim() : null

  if (!name || name.length > 60) {
    throw createError({ statusCode: 400, message: 'プレイリスト名は1〜60文字で入力してください' })
  }

  const [playlist] = await db.insert(schema.playlists).values({
    id: randomUUID(),
    userId: user.id,
    name,
    description,
  }).returning()

  return { playlist: { ...playlist, count: 0, coverUrl: null } }
})
