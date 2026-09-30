import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../utils/auth'
import { recountHashtags } from '../../utils/hashtags'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const post = await db.query.posts.findFirst({ where: eq(schema.posts.id, id) })
  if (!post) throw createError({ statusCode: 404, message: '投稿が見つかりません' })
  if (post.userId !== user.id) throw createError({ statusCode: 403 })

  // Capture the tag keys first: the ON DELETE CASCADE removes the post_hashtags
  // rows, so after the delete they are gone and the counts would stay stale.
  const links = await db
    .select({ tag: schema.postHashtags.tag })
    .from(schema.postHashtags)
    .where(eq(schema.postHashtags.postId, id))

  await db.delete(schema.posts).where(eq(schema.posts.id, id))
  await recountHashtags(links.map(l => l.tag))
  return { success: true }
})
