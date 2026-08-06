import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../utils/permissions'
import { broadcast } from '../../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const channelId = getRouterParam(event, 'channelId')
  const body = await readBody(event)
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_CHANNELS, 'チャンネルを管理する権限がありません')

  const channel = await db.query.serverChannels.findFirst({
    where: and(
      eq(schema.serverChannels.id, channelId),
      eq(schema.serverChannels.serverId, serverId)
    ),
  })
  if (!channel) throw createError({ statusCode: 404, message: 'チャンネルが見つかりません' })

  if (body.name !== undefined && !body.name?.trim()) {
    throw createError({ statusCode: 400, message: 'チャンネル名を入力してください' })
  }

  const updates: Record<string, any> = {}
  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.type !== undefined) updates.type = body.type
  if (body.description !== undefined) updates.description = body.description
  if (body.position !== undefined) updates.position = body.position
  if (body.slowModeSeconds !== undefined) {
    updates.slowModeSeconds = Math.max(0, Math.min(21600, Number(body.slowModeSeconds) || 0))
  }
  if (body.nsfw !== undefined) updates.nsfw = !!body.nsfw
  updates.updatedAt = new Date()

  const [updated] = await db.update(schema.serverChannels)
    .set(updates)
    .where(and(eq(schema.serverChannels.id, channelId), eq(schema.serverChannels.serverId, serverId)))
    .returning()

  broadcast({ type: 'server.updated', serverId })
  return { channel: updated }
})
