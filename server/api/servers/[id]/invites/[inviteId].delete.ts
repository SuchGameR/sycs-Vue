import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../utils/permissions'
import { broadcast } from '../../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const inviteId = getRouterParam(event, 'inviteId')
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_INVITES, '招待を管理する権限がありません')

  const invite = await db.query.serverInvites.findFirst({
    where: and(
      eq(schema.serverInvites.id, inviteId),
      eq(schema.serverInvites.serverId, serverId)
    ),
  })
  if (!invite) throw createError({ statusCode: 404, message: '招待が見つかりません' })

  await db.delete(schema.serverInvites).where(
    and(eq(schema.serverInvites.id, inviteId), eq(schema.serverInvites.serverId, serverId))
  )

  broadcast({ type: 'server.updated', serverId })
  return { success: true }
})
