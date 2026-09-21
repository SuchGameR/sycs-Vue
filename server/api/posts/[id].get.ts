import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '../../utils/auth'
import { serializePosts } from '../../utils/postQuery'

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'id')
  const currentUser = await getCurrentUser(event)

  const post = await db.query.posts.findFirst({ where: eq(schema.posts.id, postId!) })
  if (!post) throw createError({ statusCode: 404, message: '投稿が見つかりません' })

  const [result] = await serializePosts([post], currentUser)

  const comments = await db.query.postComments.findMany({
    where: eq(schema.postComments.postId, postId!),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  })
  const userIds = [...new Set(comments.map(c => c.userId))]
  const users = userIds.length
    ? await db.query.users.findMany({ where: (u, { inArray }) => inArray(u.id, userIds) })
    : []
  const userMap = Object.fromEntries(users.map(u => [u.id, u]))
  const commentsWithUser = comments.map(c => ({ ...c, user: userMap[c.userId] || null }))

  return { post: result, comments: commentsWithUser }
})
