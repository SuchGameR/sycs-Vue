import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../utils/permissions'
import { broadcast } from '../../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const roleId = getRouterParam(event, 'roleId')
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_ROLES, 'ロールを管理する権限がありません')

  const role = await db.query.serverRoles.findFirst({
    where: and(
      eq(schema.serverRoles.id, roleId),
      eq(schema.serverRoles.serverId, serverId)
    ),
  })
  if (!role) throw createError({ statusCode: 404, message: 'ロールが見つかりません' })
  if (role.isAdmin) throw createError({ statusCode: 400, message: '管理者ロールは削除できません' })

  await db.update(schema.serverMembers)
    .set({ roleId: null })
    .where(eq(schema.serverMembers.roleId, roleId))

  await db.delete(schema.serverRoles).where(
    and(eq(schema.serverRoles.id, roleId), eq(schema.serverRoles.serverId, serverId))
  )

  broadcast({ type: 'server.updated', serverId })
  return { success: true }
})
