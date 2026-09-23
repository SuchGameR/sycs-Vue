import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'
import { publicUser } from '../../../../utils/userExtras'
import { getBlockRelation } from '../../../../utils/blocks'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const channelId = getRouterParam(event, 'id')

  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(eq(schema.dmChannelMembers.channelId, channelId!), eq(schema.dmChannelMembers.userId, user.id)),
  })
  if (!membership) throw createError({ statusCode: 403, message: 'このチャンネルにアクセスできません' })

  const [channel, members, lastMessage] = await Promise.all([
    db.query.dmChannels.findFirst({ where: eq(schema.dmChannels.id, channelId!) }),
    db.query.dmChannelMembers.findMany({ where: eq(schema.dmChannelMembers.channelId, channelId!) }),
    db.query.dmMessages.findFirst({
      where: eq(schema.dmMessages.channelId, channelId!),
      orderBy: [desc(schema.dmMessages.createdAt)],
    }),
  ])

  if (!channel) throw createError({ statusCode: 404, message: 'チャンネルが見つかりません' })

  const memberUserIds = members.map(m => m.userId)
  const memberUsers = await db.query.users.findMany({ where: (schema.users as any).id.in?.(memberUserIds) || { in: memberUserIds } } as any)
    .catch(async () => {
      const { inArray } = await import('drizzle-orm')
      return db.query.users.findMany({
        where: inArray(schema.users.id, memberUserIds),
      })
    })
  const memberUserMap = Object.fromEntries(memberUsers.map(u => [u.id, u]))

  const otherUser = members
    .map(m => memberUserMap[m.userId])
    .filter(Boolean)
    .find(u => u.id !== user.id) || null
  const block = otherUser ? await getBlockRelation(user.id, otherUser.id) : { blocked: false, blockedBy: false }

  let last = null
  if (lastMessage) {
    const sender = await db.query.users.findFirst({ where: eq(schema.users.id, lastMessage.senderId) })
    last = {
      content: lastMessage.content,
      createdAt: lastMessage.createdAt,
      edited: !!lastMessage.edited,
      sender: publicUser(sender),
    }
  }

  return {
    channel: {
      id: channel.id,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
      members: memberUserMap,
      otherUser: otherUser ? publicUser(otherUser) : null,
      lastMessage: last,
      blocked: block.blocked,
      blockedBy: block.blockedBy,
    },
  }
})