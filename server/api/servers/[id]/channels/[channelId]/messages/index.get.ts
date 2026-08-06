import { db } from '../../../../../../db'
import * as schema from '../../../../../../db/schema'
import { eq, and, asc, inArray } from 'drizzle-orm'
import { requireServerMember } from '../../../../../../utils/serverAuth'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const channelId = getRouterParam(event, 'channelId')
  const query = getQuery(event)
  const limit = Math.min(Number(query.limit) || 50, 100)
  const offset = Number(query.offset) || 0

  await requireServerMember(event, serverId)

  const channel = await db.query.serverChannels.findFirst({
    where: and(
      eq(schema.serverChannels.id, channelId),
      eq(schema.serverChannels.serverId, serverId)
    ),
  })
  if (!channel) throw createError({ statusCode: 404, message: 'チャンネルが見つかりません' })

  const messages = await db.query.channelMessages.findMany({
    where: eq(schema.channelMessages.channelId, channelId),
    limit, offset,
    orderBy: [asc(schema.channelMessages.createdAt)],
  })

  const userIds = [...new Set(messages.map(m => m.userId))]
  const users = userIds.length
    ? await db.query.users.findMany({ where: inArray(schema.users.id, userIds) })
    : []
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))
  const messagesWithUser = messages.map(m => ({ ...m, user: userMap[m.userId] || null }))

  return { messages: messagesWithUser }
})
