import { randomUUID } from 'crypto'
import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { participantId } = await readBody(event)
  if (!participantId) throw createError({ statusCode: 400, message: '参加者IDが必要です' })
  if (participantId === user.id) throw createError({ statusCode: 400, message: '自分自身とはDMを作成できません' })

  const participant = await db.query.users.findFirst({
    where: eq(schema.users.id, participantId),
    columns: { id: true },
  })
  if (!participant) throw createError({ statusCode: 404, message: 'ユーザーが見つかりません' })

  const pairKey = [user.id, participantId].sort().join(':')

  const existing = await db.query.dmChannels.findFirst({
    where: eq(schema.dmChannels.pairKey, pairKey),
    columns: { id: true },
  })
  if (existing) return { channel: { id: existing.id } }

  const channelId = randomUUID()
  try {
    await db.insert(schema.dmChannels).values({ id: channelId, pairKey })
  } catch {
    const dup = await db.query.dmChannels.findFirst({
      where: eq(schema.dmChannels.pairKey, pairKey),
      columns: { id: true },
    })
    if (dup) return { channel: { id: dup.id } }
    throw createError({ statusCode: 500, message: 'DMを作成できませんでした' })
  }

  await db.insert(schema.dmChannelMembers).values([
    { id: randomUUID(), channelId, userId: user.id },
    { id: randomUUID(), channelId, userId: participantId },
  ])

  return { channel: { id: channelId } }
})