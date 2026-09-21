import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq, inArray } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { serializePosts } from '../../utils/postQuery'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const playlist = await db.query.playlists.findFirst({ where: eq(schema.playlists.id, id) })
  if (!playlist) throw createError({ statusCode: 404, message: 'プレイリストが見つかりません' })
  if (playlist.userId !== user.id) throw createError({ statusCode: 403, message: '権限がありません' })

  const items = await db.query.playlistItems.findMany({
    where: eq(schema.playlistItems.playlistId, id),
    orderBy: [schema.playlistItems.position],
  })

  const postIds = items.map(i => i.postId)
  let posts: any[] = []
  if (postIds.length) {
    const rows = await db.query.posts.findMany({ where: inArray(schema.posts.id, postIds) })
    const map = Object.fromEntries(rows.map(p => [p.id, p]))
    const ordered = postIds.map(pid => map[pid]).filter(Boolean)
    posts = await serializePosts(ordered, user)
  }

  return { playlist: { ...playlist, count: posts.length }, posts }
})
