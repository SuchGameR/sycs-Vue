import { db } from '../../db'
import { whiteboardStates } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const roomKey = getRouterParam(event, 'roomKey') || ''

  if (!roomKey.startsWith('dm:') && !roomKey.startsWith('server:')) {
    throw createError({ statusCode: 400, message: 'roomKeyが不正です' })
  }

  const row = await db.query.whiteboardStates.findFirst({
    where: eq(whiteboardStates.roomKey, roomKey),
  })

  return { roomKey, strokes: row?.strokes || [] }
})