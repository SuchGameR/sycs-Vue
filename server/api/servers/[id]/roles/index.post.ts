import { randomUUID } from 'crypto'
import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../utils/permissions'
import { broadcast } from '../../../../utils/realtime'

const DEFAULT_ROLE_MASK = PERMISSIONS.VIEW_CHANNEL | PERMISSIONS.SEND_MESSAGES

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const body = await readBody(event)
  if (!body.name?.trim()) throw createError({ statusCode: 400, message: 'ロール名を入力してください' })
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_ROLES, 'ロールを管理する権限がありません')

  const existing = await db.query.serverRoles.findMany({ where: eq(schema.serverRoles.serverId, serverId) })

  const [role] = await db.insert(schema.serverRoles).values({
    id: randomUUID(),
    serverId,
    name: body.name.trim(),
    color: body.color || '#99aab5',
    position: body.position ?? existing.length,
    permissions: body.permissions || '',
    permissionsMask: typeof body.permissionsMask === 'number' ? body.permissionsMask : DEFAULT_ROLE_MASK,
    isAdmin: !!body.isAdmin,
  }).returning()

  broadcast({ type: 'server.updated', serverId })
  return { role }
})
