import { db } from '../../db'
import * as schema from '../../db/schema'
import { desc, eq, inArray } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { serializePosts } from '../../utils/postQuery'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const rows = await db.query.reposts.findMany({
    where: eq(schema.reposts.userId, user.id),
    orderBy: [desc(schema.reposts.createdAt)],
    limit,
    offset,
  })
  const ids = rows.map(r => r.postId)
  if (!ids.length) return { posts: [], nextOffset: offset, hasMore: false }

  const posts = await db.query.posts.findMany({ where: inArray(schema.posts.id, ids) })
  const map = Object.fromEntries(posts.map(p => [p.id, p]))
  const ordered = ids.map(id => map[id]).filter(Boolean)

  return { posts: await serializePosts(ordered, user), nextOffset: offset + rows.length, hasMore: rows.length === limit }
})
