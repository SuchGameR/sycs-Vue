import { unlink } from 'fs/promises'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { urlToFilePath } from '../../utils/upload'
import { broadcast } from '../../utils/realtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'IDが必要です' })

  const row = await db.query.customEmojis.findFirst({
    where: eq(schema.customEmojis.id, id),
  })
  if (!row) throw createError({ statusCode: 404, message: '絵文字が見つかりません' })

  if (row.creatorId !== user.id) {
    throw createError({ statusCode: 403, message: 'この絵文字を削除する権限がありません' })
  }

  await db.delete(schema.customEmojis).where(eq(schema.customEmojis.id, id))
  try { await unlink(urlToFilePath(row.url)) } catch { /* ignore */ }

  broadcast({ type: 'emoji.deleted', id })

  return { ok: true }
})
