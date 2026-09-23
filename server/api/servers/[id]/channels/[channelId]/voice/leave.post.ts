import { requireServerMember } from '../../../../../../utils/serverAuth'
import { leaveRoom } from '../../../../../../utils/voice'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const channelId = getRouterParam(event, 'channelId')
  const ctx = await requireServerMember(event, serverId)

  const body = await readBody(event).catch(() => ({}))
  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : undefined

  leaveRoom(`server:${serverId}:${channelId}`, ctx.user.id, sessionId)

  return { success: true }
})
