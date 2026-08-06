import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireServerPermission } from '../../../utils/serverAuth'
import { PERMISSIONS } from '../../../utils/permissions'
import { broadcast } from '../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  await requireServerPermission(event, id, PERMISSIONS.MANAGE_SERVER, 'サーバー設定を変更する権限がありません')

  if (body.name !== undefined && !body.name?.trim()) {
    throw createError({ statusCode: 400, message: 'サーバー名を入力してください' })
  }

  const updates: Record<string, any> = {}
  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.description !== undefined) updates.description = body.description
  if (body.iconUrl !== undefined) updates.iconUrl = body.iconUrl || null
  if (body.bannerUrl !== undefined) updates.bannerUrl = body.bannerUrl || null
  if (body.isPublic !== undefined) updates.isPublic = !!body.isPublic
  updates.updatedAt = new Date()

  const [updated] = await db.update(schema.servers)
    .set(updates)
    .where(eq(schema.servers.id, id))
    .returning()

  broadcast({ type: 'server.updated', serverId: id })
  return { server: updated }
})
