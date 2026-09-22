import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, and, count } from 'drizzle-orm'
import { getCurrentUser } from '../../../utils/auth'
import { enrichUsers, publicUser } from '../../../utils/userExtras'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, id) })
  if (!user) throw createError({ statusCode: 404 })

  const viewer = await getCurrentUser(event)
  const isSelf = !!viewer && viewer.id === id
  let isFollowing = false
  if (viewer && !isSelf) {
    const f = await db.query.follows.findFirst({
      where: and(eq(schema.follows.followerId, viewer.id), eq(schema.follows.followingId, id!)),
    })
    isFollowing = !!f
  }
  const locked = !!user.isPrivate && !isSelf && !isFollowing

  const [followers] = await db.select({ count: count() }).from(schema.follows).where(eq(schema.follows.followingId, id))
  const [following] = await db.select({ count: count() }).from(schema.follows).where(eq(schema.follows.followerId, id))
  const [postsCount] = await db.select({ count: count() }).from(schema.posts).where(eq(schema.posts.userId, id))

  const extras = await enrichUsers([user])

  return {
    user: publicUser(user, extras[user.id]),
    stats: { followers: followers.count, following: following.count, posts: postsCount.count },
    locked,
    isPrivate: !!user.isPrivate,
    isFollowing,
    isSelf,
  }
})
