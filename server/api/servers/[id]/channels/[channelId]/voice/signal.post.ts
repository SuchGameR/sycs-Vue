import { requireServerMember } from '../../../../../../utils/serverAuth'
import { relaySignal, isInRoom } from '../../../../../../utils/voice'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const channelId = getRouterParam(event, 'channelId')
  const ctx = await requireServerMember(event, serverId)
  const roomKey = `server:${serverId}:${channelId}`

  const body = await readBody(event)
  if (!body.to || !body.signal) throw createError({ statusCode: 400, message: 'シグナリングデータが不正です' })

  const isDecline = body.signal?.type === 'decline'
  if (!isInRoom(roomKey, ctx.user.id) && !isDecline) {
    throw createError({ statusCode: 403, message: '音声チャンネルに参加していません' })
  }

  relaySignal(roomKey, {
    userId: ctx.user.id,
    username: ctx.user.username,
    displayName: ctx.user.displayName,
    avatarUrl: ctx.user.avatarUrl,
  }, body.to, body.signal)

  return { success: true }
})
