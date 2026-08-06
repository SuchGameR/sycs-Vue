import { requireServerMember } from '../../../../../../utils/serverAuth'
import { leaveRoom } from '../../../../../../utils/voice'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const channelId = getRouterParam(event, 'channelId')
  const ctx = await requireServerMember(event, serverId)

  leaveRoom(`server:${serverId}:${channelId}`, ctx.user.id)

  return { success: true }
})
