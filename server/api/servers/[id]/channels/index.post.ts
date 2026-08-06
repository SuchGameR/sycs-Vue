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
  if (!body.name?.trim()) throw createError({ statusCode: 400, message: 'チャンネル名を入力してください' })
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_CHANNELS, 'チャンネルを管理する権限がありません')

  const existing = await db.query.serverChannels.findMany({ where: eq(schema.serverChannels.serverId, serverId) })

  const [channel] = await db.insert(schema.serverChannels).values({
    id: randomUUID(),
    serverId,
    name: body.name.trim(),
    type: body.type || 'text',
    position: body.position ?? existing.length,
    description: body.description || '',
    slowModeSeconds: body.slowModeSeconds ?? 0,
    nsfw: !!body.nsfw,
  }).returning()

  broadcast({ type: 'server.updated', serverId })
  return { channel }
})
