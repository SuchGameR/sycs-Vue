import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq, count } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  const invite = await db.query.serverInvites.findFirst({ where: eq(schema.serverInvites.code, code) })
  if (!invite) throw createError({ statusCode: 404, message: '招待コードが見つかりません' })

  const server = await db.query.servers.findFirst({ where: eq(schema.servers.id, invite.serverId) })
  if (!server) throw createError({ statusCode: 410, message: 'サーバーが存在しません' })

  if (invite.expiresAt && new Date() > invite.expiresAt) {
    throw createError({ statusCode: 410, message: '招待コードの有効期限が切れています' })
  }

  const [row] = await db.select({ value: count() })
    .from(schema.serverMembers)
    .where(eq(schema.serverMembers.serverId, server.id))

  return {
    invite: {
      id: invite.id,
      code: invite.code,
      maxUses: invite.maxUses,
      useCount: invite.useCount,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
    },
    server: {
      id: server.id,
      name: server.name,
      description: server.description,
      iconUrl: server.iconUrl,
      memberCount: row?.value || 0,
    },
  }
})
