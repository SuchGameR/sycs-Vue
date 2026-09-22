import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, inArray, desc } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { publicUser } from '../../../utils/userExtras'

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

  const lastMessages = await db.query.dmMessages.findMany({
    where: inArray(schema.dmMessages.channelId, channelIds),
    orderBy: [desc(schema.dmMessages.createdAt)],
    limit: 500,
  })
  const lastMessageMap = new Map<string, { content: string; createdAt: Date; senderId: string; edited: boolean }>()
  for (const m of lastMessages) {
    if (!lastMessageMap.has(m.channelId)) lastMessageMap.set(m.channelId, { content: m.content, createdAt: m.createdAt, senderId: m.senderId, edited: !!m.edited })
  }
  const lastSenders = [...new Set(lastMessages.map(m => m.senderId))]
  const lastSenderUsers = lastSenders.length
    ? await db.query.users.findMany({ where: inArray(schema.users.id, lastSenders) })
    : []
  const lastSenderMap = Object.fromEntries(lastSenderUsers.map(u => [u.id, u]))

  const result = channels.map(ch => {
    const last = lastMessageMap.get(ch.id)
    return {
      ...ch,
      members: allMembers.filter(m => m.channelId === ch.id).map(m => memberUserMap[m.userId]).filter(Boolean).map(publicUser),
      lastMessage: last
        ? { content: last.content, createdAt: last.createdAt, edited: last.edited, sender: publicUser(lastSenderMap[last.senderId]) }
        : null,
    }
  })

  return { channels: result }
})
