import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, inArray } from 'drizzle-orm'
import { pickPublicSummary, enrichUsers } from '../../../utils/userExtras'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const follows = await db.query.follows.findMany({
    where: eq(schema.follows.followerId, id),
    columns: { followingId: true },
    orderBy: (f, { desc }) => [desc(f.createdAt)],
  })

  const ids = follows.map(f => f.followingId)
  if (!ids.length) return { following: [] }

  const users = await db.query.users.findMany({ where: inArray(schema.users.id, ids) })
  const byId = new Map(users.map(u => [u.id, u]))
  const extras = await enrichUsers(users)

  const following = ids
    .map(uid => byId.get(uid))
    .filter(Boolean)
    .map(u => {
      const e = extras[u!.id]
      return { ...pickPublicSummary(u), badges: e?.badges || [], title: e?.title || null }
    })

  return { following }
})