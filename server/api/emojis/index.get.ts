import { db } from '../../db'
import * as schema from '../../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const rows = await db.select().from(schema.customEmojis).orderBy(desc(schema.customEmojis.createdAt))
  return {
    emojis: rows.map(e => ({
      id: e.id,
      name: e.name,
      url: e.url,
      mime: e.mime,
      animated: !!e.animated,
      creatorId: e.creatorId,
      createdAt: e.createdAt,
    })),
  }
})
