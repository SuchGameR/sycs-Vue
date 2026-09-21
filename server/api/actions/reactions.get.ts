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

  const rows = await db.query.postReactions.findMany({
    where: eq(schema.postReactions.userId, user.id),
    orderBy: [desc(schema.postReactions.createdAt)],
    limit: (offset + limit) * 3,
  })

  const ids: string[] = []
  for (const r of rows) if (!ids.includes(r.postId)) ids.push(r.postId)
  const pageIds = ids.slice(offset, offset + limit)
  if (!pageIds.length) return { posts: [], nextOffset: offset, hasMore: false }

  const posts = await db.query.posts.findMany({ where: inArray(schema.posts.id, pageIds) })
  const map = Object.fromEntries(posts.map(p => [p.id, p]))
  const ordered = pageIds.map(id => map[id]).filter(Boolean)

  return {
    posts: await serializePosts(ordered, user),
    nextOffset: offset + pageIds.length,
    hasMore: ids.length > offset + pageIds.length,
  }
})
