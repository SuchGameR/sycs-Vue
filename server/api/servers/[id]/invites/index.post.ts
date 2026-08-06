import { randomUUID } from 'crypto'
import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireServerPermission } from '../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../utils/permissions'
import { broadcast } from '../../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const ctx = await requireServerPermission(event, serverId, PERMISSIONS.CREATE_INVITE, '招待を作成する権限がありません')

  const code = (body.code?.trim() && String(body.code).trim().slice(0, 32))
    || randomUUID().replace(/-/g, '').slice(0, 8)

  const existing = await db.query.serverInvites.findFirst({ where: eq(schema.serverInvites.code, code) })
  if (existing) throw createError({ statusCode: 409, message: 'その招待コードは既に使用されています' })

  let expiresAt: Date | null = null
  if (body.expiresInHours && Number(body.expiresInHours) > 0) {
    expiresAt = new Date(Date.now() + Number(body.expiresInHours) * 60 * 60 * 1000)
  } else if (body.expiresAt) {
    expiresAt = new Date(body.expiresAt)
  }

  const [invite] = await db.insert(schema.serverInvites).values({
    id: randomUUID(),
    serverId,
    code,
    createdBy: ctx.isOwner ? ctx.server.ownerId : ctx.member?.userId,
    maxUses: Math.max(0, Number(body.maxUses) || 0),
    useCount: 0,
    expiresAt,
  }).returning()

  broadcast({ type: 'server.updated', serverId })
  return { invite }
})
