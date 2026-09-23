import { randomUUID } from 'crypto'
import { db, initDb } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'
import { broadcast } from '../../../utils/realtime'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const followingId = getRouterParam(event, 'id')

  if (user.id === followingId) throw createError({ statusCode: 400, message: '自分自身をフォローできません' })

  const target = await db.query.users.findFirst({ where: eq(schema.users.id, followingId) })
  if (!target) throw createError({ statusCode: 404, message: 'ユーザーが見つかりません' })

  const existing = await db.query.follows.findFirst({
    where: and(eq(schema.follows.followerId, user.id), eq(schema.follows.followingId, followingId))
  })
  if (existing) return { success: true }

  await db.insert(schema.follows).values({ id: randomUUID(), followerId: user.id, followingId })

  broadcast({
    type: 'activity.new',
    kind: 'follow',
    actorId: user.id,
    actor: { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl },
    targetUserId: followingId,
  })
  return { success: true }
})
