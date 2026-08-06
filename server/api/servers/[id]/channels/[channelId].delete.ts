import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../utils/permissions'
import { broadcast } from '../../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const channelId = getRouterParam(event, 'channelId')
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_CHANNELS, 'チャンネルを管理する権限がありません')

  const channel = await db.query.serverChannels.findFirst({
    where: and(
      eq(schema.serverChannels.id, channelId),
      eq(schema.serverChannels.serverId, serverId)
    ),
  })
  if (!channel) throw createError({ statusCode: 404, message: 'チャンネルが見つかりません' })

  const remaining = await db.query.serverChannels.findMany({
    where: eq(schema.serverChannels.serverId, serverId),
  })
  if (remaining.length <= 1) {
    throw createError({ statusCode: 400, message: '最後のチャンネルは削除できません' })
  }

  await db.delete(schema.serverChannels).where(
    and(eq(schema.serverChannels.id, channelId), eq(schema.serverChannels.serverId, serverId))
  )

  broadcast({ type: 'server.updated', serverId, deletedChannelId: channelId })
  return { success: true }
})
