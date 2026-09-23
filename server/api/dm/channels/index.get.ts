import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, inArray } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
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

  // Last message per channel in a single DISTINCT ON query. The previous
  // implementation fetched a big recent slice of every channel and deduped in
  // JS, which slowed the DM list down as histories grew.
  const lastRows = await db.execute(sql`
    SELECT DISTINCT ON (channel_id) channel_id, id, sender_id, content, created_at, edited
    FROM dm_messages
    WHERE channel_id = ANY(${channelIds})
    ORDER BY channel_id, created_at DESC
  `)
  const lastMessageMap = new Map<string, { content: string; createdAt: Date; senderId: string; edited: boolean }>()
  for (const r of lastRows.rows) {
    lastMessageMap.set(r.channel_id, {
      content: r.content,
      createdAt: r.created_at,
      senderId: r.sender_id,
      edited: !!r.edited,
    })
  }
  const lastSenders = [...lastMessageMap.values()].map(m => m.senderId)
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