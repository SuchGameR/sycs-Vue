import { db } from '../../../../../db'
import * as schema from '../../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../../../utils/auth'
import { relaySignal, isInRoom } from '../../../../../utils/voice'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const channelId = getRouterParam(event, 'id')
  const roomKey = `dm:${channelId}`

  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(
      eq(schema.dmChannelMembers.channelId, channelId!),
      eq(schema.dmChannelMembers.userId, user.id)
    ),
  })
  if (!membership) throw createError({ statusCode: 403, message: 'このチャンネルにアクセスできません' })

  const body = await readBody(event)
  if (!body.to || !body.signal) throw createError({ statusCode: 400, message: 'シグナリングデータが不正です' })

  const isDecline = body.signal?.type === 'decline'
  if (!isInRoom(roomKey, user.id) && !isDecline) {
    throw createError({ statusCode: 403, message: '通話に参加していません' })
  }

  relaySignal(roomKey, {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  }, body.to, body.signal)

  return { success: true }
})
