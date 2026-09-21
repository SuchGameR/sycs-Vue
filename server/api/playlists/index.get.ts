import { db } from '../../db'
import * as schema from '../../db/schema'
import { desc, eq, inArray } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { postId } = getQuery(event)
  const lists = await db.query.playlists.findMany({
    where: eq(schema.playlists.userId, user.id),
    orderBy: [desc(schema.playlists.updatedAt)],
  })
  if (!lists.length) return { playlists: [] }

  const listIds = lists.map(l => l.id)
  const items = await db.query.playlistItems.findMany({
    where: inArray(schema.playlistItems.playlistId, listIds),
    orderBy: [schema.playlistItems.position],
  })

  const countByList = new Map<string, number>()
  const firstPostByList = new Map<string, string>()
  const contains = new Set<string>()
  for (const item of items) {
    countByList.set(item.playlistId, (countByList.get(item.playlistId) || 0) + 1)
    if (!firstPostByList.has(item.playlistId)) firstPostByList.set(item.playlistId, item.postId)
    if (postId && item.postId === postId) contains.add(item.playlistId)
  }

  const firstPostIds = [...firstPostByList.values()]
  const coverByPost = new Map<string, string>()
  if (firstPostIds.length) {
    const attachments = await db.query.postAttachments.findMany({
      where: inArray(schema.postAttachments.postId, firstPostIds),
      orderBy: [schema.postAttachments.position],
    })
    for (const a of attachments) {
      if (!coverByPost.has(a.postId)) coverByPost.set(a.postId, a.url)
    }
  }

  return {
    playlists: lists.map(l => ({
      ...l,
      count: countByList.get(l.id) || 0,
      coverUrl: coverByPost.get(firstPostByList.get(l.id) || '') || null,
      contains: contains.has(l.id),
    })),
  }
})
