import { randomUUID } from 'crypto'
import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const targetId = getRouterParam(event, 'id')
  if (!targetId || targetId === user.id) throw createError({ statusCode: 400, message: '自分自身をブロックできません' })

  const target = await db.query.users.findFirst({
    where: eq(schema.users.id, targetId),
    columns: { id: true },
  })
  if (!target) throw createError({ statusCode: 404, message: 'ユーザーが見つかりません' })

  await db.insert(schema.userBlocks)
    .values({ id: randomUUID(), userId: user.id, blockedId: targetId })
    .onConflictDoNothing({ target: [schema.userBlocks.userId, schema.userBlocks.blockedId] })

  return { blocked: true }
})