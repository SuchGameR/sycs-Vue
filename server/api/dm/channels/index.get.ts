import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, inArray, sql } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const memberships = await db.query.dmChannelMembers.findMany({
    where: eq(schema.dmChannelMembers.userId, user.id),
    columns: { channelId: true },
  })

  if (!memberships.length) return { channels: [] }

  const channelIds = memberships.map(m => m.channelId)

  const allMembers = await db.query.dmChannelMembers.findMany({
    where: inArray(schema.dmChannelMembers.channelId, channelIds),
  })

  const memberUserIds = [...new Set(allMembers.map(m => m.userId))]
  const memberUsers = memberUserIds.length
    ? await db.query.users.findMany({ where: inArray(schema.users.id, memberUserIds) })
    : []
  const memberUserMap = Object.fromEntries(memberUsers.map(u => [u.id, u]))

  const channels = await db.query.dmChannels.findMany({
    where: inArray(schema.dmChannels.id, channelIds),
    orderBy: (c, { desc }) => [desc(c.updatedAt)],
  })

  const lastMessages = await db.execute<{ channelId: string; content: string; createdAt: Date; senderId: string }>(sql`
    SELECT DISTINCT ON (channel_id) channel_id AS "channelId", content, created_at AS "createdAt", sender_id AS "senderId"
    FROM dm_messages
    WHERE channel_id = ANY(${channelIds})
    ORDER BY channel_id, created_at DESC
  `)
  const lastMessageMap = new Map(lastMessages.rows.map(r => [r.channelId, r]))
  const lastSenderIds = [...new Set(lastMessages.rows.map(r => r.senderId))]
  const lastSenders = lastSenderIds.length
    ? await db.query.users.findMany({ where: inArray(schema.users.id, lastSenderIds) })
    : []
  const lastSenderMap = Object.fromEntries(lastSenders.map(u => [u.id, u]))

  const result = channels.map(ch => {
    const last = lastMessageMap.get(ch.id)
    return {
      ...ch,
      members: allMembers.filter(m => m.channelId === ch.id).map(m => memberUserMap[m.userId]).filter(Boolean),
      lastMessage: last
        ? { content: last.content, createdAt: last.createdAt, sender: lastSenderMap[last.senderId] || null }
        : null,
    }
  })

  return { channels: result }
})
