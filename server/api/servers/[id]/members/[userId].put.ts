import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../utils/permissions'
import { broadcast } from '../../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const memberUserId = getRouterParam(event, 'userId')
  const body = await readBody(event)
  const ctx = await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_MEMBERS, 'メンバーを管理する権限がありません')

  const member = await db.query.serverMembers.findFirst({
    where: and(
      eq(schema.serverMembers.serverId, serverId),
      eq(schema.serverMembers.userId, memberUserId)
    ),
  })
  if (!member) throw createError({ statusCode: 404, message: 'メンバーが見つかりません' })

  const updates: Record<string, any> = {}

  if (body.nickname !== undefined) {
    updates.nickname = body.nickname?.trim() ? body.nickname.trim() : null
  }

  if (body.roleId !== undefined) {
    if (ctx.server.ownerId === memberUserId) {
      throw createError({ statusCode: 400, message: 'サーバー所有者のロールは変更できません' })
    }
    if (body.roleId) {
      const role = await db.query.serverRoles.findFirst({
        where: and(
          eq(schema.serverRoles.id, body.roleId),
          eq(schema.serverRoles.serverId, serverId)
        ),
      })
      if (!role) throw createError({ statusCode: 400, message: 'ロールが見つかりません' })
      if (role.isAdmin) throw createError({ statusCode: 400, message: '管理者ロールは付与できません' })
      updates.roleId = body.roleId
    } else {
      updates.roleId = null
    }
  }

  await db.update(schema.serverMembers)
    .set(updates)
    .where(and(
      eq(schema.serverMembers.serverId, serverId),
      eq(schema.serverMembers.userId, memberUserId)
    ))

  broadcast({ type: 'server.updated', serverId })
  return { success: true }
})
