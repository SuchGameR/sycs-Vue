import { db } from '../../../../../db'
import * as schema from '../../../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../../../utils/auth'
import { touchRoom, joinRoom } from '../../../../../utils/voice'

/**
 * Presence keep-alive for an active call.
 *
 * Deliberately does NOT broadcast on the happy path -- a heartbeat is not a
 * membership change, and broadcasting it made every call churn peer connections
 * and re-ring the other side.
 *
 * `known: false` means the server has no record of this member (expired, or the
 * room never existed), so the client re-joins for real and gets the member list
 * back.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const channelId = getRouterParam(event, 'id')

  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(
      eq(schema.dmChannelMembers.channelId, channelId!),
      eq(schema.dmChannelMembers.userId, user.id)
    ),
  })
  if (!membership) throw createError({ statusCode: 403, message: 'このチャンネルにアクセスできません' })

  const body = await readBody(event).catch(() => ({}))
  const sessionId = typeof body?.sessionId === 'string' ? body.sessionId : undefined

  const roomKey = `dm:${channelId}`
  if (touchRoom(roomKey, user.id, sessionId)) return { known: true }

  const members = joinRoom(roomKey, {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  }, sessionId)

  return { known: false, roomKey, members }
})
