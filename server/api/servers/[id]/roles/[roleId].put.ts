import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS, ALL_PERMISSIONS_MASK } from '../../../../utils/permissions'
import { broadcast } from '../../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const roleId = getRouterParam(event, 'roleId')
  const body = await readBody(event)
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_ROLES, 'ロールを管理する権限がありません')

  const role = await db.query.serverRoles.findFirst({
    where: and(
      eq(schema.serverRoles.id, roleId),
      eq(schema.serverRoles.serverId, serverId)
    ),
  })
  if (!role) throw createError({ statusCode: 404, message: 'ロールが見つかりません' })

  if (body.name !== undefined && !body.name?.trim()) {
    throw createError({ statusCode: 400, message: 'ロール名を入力してください' })
  }

  const updates: Record<string, any> = {}
  if (body.name !== undefined) updates.name = body.name.trim()
  if (body.color !== undefined) updates.color = body.color
  if (body.position !== undefined) updates.position = body.position
  if (body.permissions !== undefined) updates.permissions = body.permissions
  if (body.permissionsMask !== undefined) {
    const mask = Number(body.permissionsMask) || 0
    updates.permissionsMask = mask
    updates.isAdmin = false
    updates.permissions = ''
  }
  if (body.isAdmin !== undefined) {
    if (role.isAdmin && body.isAdmin === false) {
      throw createError({ statusCode: 400, message: '管理者ロールの管理者権限は解除できません' })
    }
    updates.isAdmin = !!body.isAdmin
    if (body.isAdmin) {
      updates.permissionsMask = ALL_PERMISSIONS_MASK
      updates.permissions = 'all'
    }
  }

  const [updated] = await db.update(schema.serverRoles)
    .set(updates)
    .where(and(eq(schema.serverRoles.id, roleId), eq(schema.serverRoles.serverId, serverId)))
    .returning()

  broadcast({ type: 'server.updated', serverId })
  return { role: updated }
})
