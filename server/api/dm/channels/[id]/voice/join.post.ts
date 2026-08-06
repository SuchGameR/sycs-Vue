import { db } from '../../../../../db'
import * as schema from '../../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../../../utils/auth'
import { joinRoom } from '../../../../../utils/voice'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const channelId = getRouterParam(event, 'id')

  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(
      eq(schema.dmChannelMembers.channelId, channelId!),
      eq(schema.dmChannelMembers.userId, user.id)
    ),
  })
  if (!membership) throw createError({ statusCode: 403, message: 'このチャンネルにアクセスできません' })

  const existing = joinRoom(`dm:${channelId}`, {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  })

  return { roomKey: `dm:${channelId}`, members: existing }
})
