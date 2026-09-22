import { randomUUID } from 'crypto'
import { db } from '../../../../../../db'
import * as schema from '../../../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../../../../utils/auth'
import { validateMessageContent } from '../../../../../../utils/rateLimit'
import { broadcastToUsers } from '../../../../../../utils/realtime'
import { publicUser } from '../../../../../../utils/userExtras'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const channelId = getRouterParam(event, 'id')
  const msgId = getRouterParam(event, 'msgId')

  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(eq(schema.dmChannelMembers.channelId, channelId!), eq(schema.dmChannelMembers.userId, user.id)),
  })
  if (!membership) throw createError({ statusCode: 403, message: 'このチャンネルにアクセスできません' })

  const message = await db.query.dmMessages.findFirst({ where: eq(schema.dmMessages.id, msgId!) })
  if (!message || message.channelId !== channelId || message.senderId !== user.id) {
    throw createError({ statusCode: 404, message: 'メッセージが見つかりません' })
  }

  const { content } = await readBody(event)
  const contentTrimmed = validateMessageContent(content)

  await db.insert(schema.dmMessageEdits).values({
    id: randomUUID(), messageId: message.id, content: message.content,
  })
  const updatedAt = new Date()
  await db.update(schema.dmMessages)
    .set({ content: contentTrimmed, edited: true, updatedAt })
    .where(eq(schema.dmMessages.id, message.id))

  const updated = await db.query.dmMessages.findFirst({ where: eq(schema.dmMessages.id, message.id) })
  const sender = updated
    ? await db.query.users.findFirst({ where: eq(schema.users.id, updated.senderId) })
    : null

  const result = updated ? { ...updated, sender: publicUser(sender) } : null
  if (result) {
    const memberRows = await db.query.dmChannelMembers.findMany({
      where: eq(schema.dmChannelMembers.channelId, channelId!),
      columns: { userId: true },
    })
    broadcastToUsers(
      { type: 'dm.message.edited', channelId: channelId!, message: result },
      memberRows.map(m => m.userId),
    )
  }

  return { message: result }
})