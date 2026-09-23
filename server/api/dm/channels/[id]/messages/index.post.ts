import { randomUUID } from 'crypto'
import { db } from '../../../../../db'
import * as schema from '../../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../../../utils/auth'
import { checkMessageFlood, validateMessageContent } from '../../../../../utils/rateLimit'
import { broadcastToUsers } from '../../../../../utils/realtime'
import { publicUser } from '../../../../../utils/userExtras'
import { hasBlockEitherWay } from '../../../../../utils/blocks'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const channelId = getRouterParam(event, 'id')
  const { content } = await readBody(event)
  const contentTrimmed = validateMessageContent(content)

  const wait = checkMessageFlood(user.id)
  if (wait) {
    throw createError({
      statusCode: 429,
      message: `メッセージを送信する速度が速すぎます。${wait}秒後にもう一度お試しください`,
    })
  }

  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(eq(schema.dmChannelMembers.channelId, channelId!), eq(schema.dmChannelMembers.userId, user.id)),
  })
  if (!membership) throw createError({ statusCode: 403, message: 'このチャンネルにアクセスできません' })

  const memberRows = await db.query.dmChannelMembers.findMany({
    where: eq(schema.dmChannelMembers.channelId, channelId!),
    columns: { userId: true },
  })
  const otherIds = memberRows.map(m => m.userId).filter(id => id !== user.id)
  for (const otherId of otherIds) {
    if (await hasBlockEitherWay(user.id, otherId)) {
      throw createError({ statusCode: 403, message: 'ブロック中のユーザーには送信できません' })
    }
  }

  const msgId = randomUUID()
  await db.insert(schema.dmMessages).values({
    id: msgId, channelId: channelId!, senderId: user.id, content: contentTrimmed,
  })
  await db.update(schema.dmChannels).set({ updatedAt: new Date() }).where(eq(schema.dmChannels.id, channelId!))

  const message = await db.query.dmMessages.findFirst({
    where: eq(schema.dmMessages.id, msgId),
  })

  const sender = message
    ? await db.query.users.findFirst({ where: eq(schema.users.id, message.senderId) })
    : null

  const result = message ? { ...message, sender: publicUser(sender) } : null
  if (result) {
    broadcastToUsers(
      { type: 'dm.message', channelId: channelId!, message: result },
      memberRows.map(m => m.userId),
    )
  }

  return { message: result }
})
