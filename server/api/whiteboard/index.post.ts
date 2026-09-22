import { db } from '../../db'
import { whiteboardStates } from '../../db/schema'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{ roomKey?: string; strokes?: any[] }>(event)
  const roomKey = body?.roomKey
  const strokes = Array.isArray(body?.strokes) ? body.strokes : []
  if (!roomKey || typeof roomKey !== 'string' || roomKey.length > 200) {
    throw createError({ statusCode: 400, message: 'roomKeyが不正です' })
  }
  if (!roomKey.startsWith('dm:') && !roomKey.startsWith('server:')) {
    throw createError({ statusCode: 400, message: 'roomKeyが不正です' })
  }

  await db
    .insert(whiteboardStates)
    .values({ roomKey, strokes, updatedById: user.id })
    .onConflictDoUpdate({
      target: whiteboardStates.roomKey,
      set: { strokes, updatedById: user.id, updatedAt: new Date() },
    })

  return { success: true }
})