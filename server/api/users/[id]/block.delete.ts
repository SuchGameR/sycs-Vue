import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { and, eq } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const targetId = getRouterParam(event, 'id')

  await db.delete(schema.userBlocks)
    .where(and(eq(schema.userBlocks.userId, user.id), eq(schema.userBlocks.blockedId, targetId!)))

  return { blocked: false }
})