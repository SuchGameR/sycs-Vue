import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'
import { broadcastToUsers } from '../../../../utils/realtime'

// Coarse server-side throttle so typing does not hammer the SSE stream.
const lastTyping = new Map<string, number>()
const TYPING_THROTTLE_MS = 1600

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const channelId = getRouterParam(event, 'id')

  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(eq(schema.dmChannelMembers.channelId, channelId!), eq(schema.dmChannelMembers.userId, user.id)),
  })
  if (!membership) throw createError({ statusCode: 403, message: 'このチャンネルにアクセスできません' })

  const key = `${user.id}:${channelId}`
  const now = Date.now()
  if (now - (lastTyping.get(key) || 0) < TYPING_THROTTLE_MS) {
    return { echoed: false }
  }
  lastTyping.set(key, now)

  const memberRows = await db.query.dmChannelMembers.findMany({
    where: eq(schema.dmChannelMembers.channelId, channelId!),
    columns: { userId: true },
  })
  broadcastToUsers(
    { type: 'dm.typing', channelId: channelId!, userId: user.id },
    memberRows.map(m => m.userId).filter(id => id !== user.id),
  )

  return { echoed: true }
})