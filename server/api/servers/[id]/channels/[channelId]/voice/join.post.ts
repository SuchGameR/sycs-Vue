import { db } from '../../../../../../db'
import * as schema from '../../../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireServerMember } from '../../../../../../utils/serverAuth'
import { joinRoom } from '../../../../../../utils/voice'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const channelId = getRouterParam(event, 'channelId')
  const ctx = await requireServerMember(event, serverId)

  const channel = await db.query.serverChannels.findFirst({
    where: and(
      eq(schema.serverChannels.id, channelId),
      eq(schema.serverChannels.serverId, serverId)
    ),
  })
  if (!channel) throw createError({ statusCode: 404, message: 'チャンネルが見つかりません' })
  if (channel.type !== 'voice') throw createError({ statusCode: 400, message: 'このチャンネルは音声チャンネルではありません' })

  const body = await readBody(event).catch(() => ({}))
  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : undefined

  const existing = joinRoom(`server:${serverId}:${channelId}`, {
    userId: ctx.user.id,
    username: ctx.user.username,
    displayName: ctx.user.displayName,
    avatarUrl: ctx.user.avatarUrl,
  }, sessionId)

  return { roomKey: `server:${serverId}:${channelId}`, members: existing }
})
