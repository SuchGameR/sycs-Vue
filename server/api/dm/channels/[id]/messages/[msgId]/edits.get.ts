import { db } from '../../../../../../db'
import * as schema from '../../../../../../db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { requireAuth } from '../../../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const channelId = getRouterParam(event, 'id')
  const msgId = getRouterParam(event, 'msgId')

  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(eq(schema.dmChannelMembers.channelId, channelId!), eq(schema.dmChannelMembers.userId, user.id)),
  })
  if (!membership) throw createError({ statusCode: 403, message: 'このチャンネルにアクセスできません' })

  const message = await db.query.dmMessages.findFirst({ where: eq(schema.dmMessages.id, msgId!) })
  if (!message || message.channelId !== channelId) {
    throw createError({ statusCode: 404, message: 'メッセージが見つかりません' })
  }

  const edits = await db.query.dmMessageEdits.findMany({
    where: eq(schema.dmMessageEdits.messageId, message.id),
    orderBy: [asc(schema.dmMessageEdits.editedAt)],
  })

  return {
    message: { id: message.id, content: message.content, edited: message.edited, updatedAt: message.updatedAt },
    edits,
  }
})