import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../utils/permissions'
import { broadcast } from '../../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const memberUserId = getRouterParam(event, 'userId')
  const ctx = await requireServerPermission(event, serverId, PERMISSIONS.KICK_MEMBERS, 'メンバーをキックする権限がありません')

  if (memberUserId === ctx.server.ownerId) {
    throw createError({ statusCode: 400, message: 'サーバー所有者をキックできません' })
  }

  await db.delete(schema.serverMembers).where(
    and(eq(schema.serverMembers.serverId, serverId), eq(schema.serverMembers.userId, memberUserId))
  )

  broadcast({ type: 'server.updated', serverId, kickedUserId: memberUserId })
  return { success: true }
})
