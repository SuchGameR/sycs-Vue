import { randomUUID } from 'crypto'
import { db } from '../../../../../../db'
import * as schema from '../../../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireServerPermission } from '../../../../../../utils/serverAuth'
import { PERMISSIONS } from '../../../../../../utils/permissions'
import { broadcast } from '../../../../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, 'id')
  const channelId = getRouterParam(event, 'channelId')
  const body = await readBody(event)
  if (!body.content?.trim()) throw createError({ statusCode: 400, message: 'メッセージを入力してください' })

  const ctx = await requireServerPermission(event, serverId, PERMISSIONS.SEND_MESSAGES, 'メッセージを送信する権限がありません')

  const channel = await db.query.serverChannels.findFirst({
    where: and(
      eq(schema.serverChannels.id, channelId),
      eq(schema.serverChannels.serverId, serverId)
    ),
  })
  if (!channel) throw createError({ statusCode: 404, message: 'チャンネルが見つかりません' })

  if (channel.slowModeSeconds > 0 && !ctx.isOwner) {
    const last = await db.query.channelMessages.findFirst({
      where: and(
        eq(schema.channelMessages.channelId, channelId),
        eq(schema.channelMessages.userId, ctx.member.userId)
      ),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    })
    if (last) {
      const elapsed = (Date.now() - new Date(last.createdAt).getTime()) / 1000
      if (elapsed < channel.slowModeSeconds) {
        const wait = Math.ceil(channel.slowModeSeconds - elapsed)
        throw createError({
          statusCode: 429,
          message: `スローモード中です。${wait}秒後にもう一度お試しください`,
        })
      }
    }
  }

  const [message] = await db.insert(schema.channelMessages).values({
    id: randomUUID(),
    channelId,
    userId: ctx.isOwner ? ctx.server.ownerId : ctx.member.userId,
    content: body.content.trim(),
  }).returning()

  broadcast({
    type: 'message.new',
    serverId,
    channelId,
    message: {
      ...message,
      user: {
        id: ctx.user?.id || message.userId,
        username: ctx.user?.username || null,
        displayName: ctx.user?.displayName || null,
        avatarUrl: ctx.user?.avatarUrl || null,
      },
    },
  })

  return { message }
})
