import { db } from '../../../db'
import * as schema from '../../../db/schema'
import { eq, and, count, or } from 'drizzle-orm'
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

  let friendStatus: 'none' | 'sent' | 'received' | 'accepted' = 'none'
  if (viewer && !isSelf) {
    const fr = await db.query.friends.findFirst({
      where: or(
        and(eq(schema.friends.userId, viewer.id), eq(schema.friends.friendId, id!)),
        and(eq(schema.friends.userId, id!), eq(schema.friends.friendId, viewer.id)),
      ),
    })
    if (fr) {
      if (fr.status === 'accepted') friendStatus = 'accepted'
      else friendStatus = fr.userId === viewer.id ? 'sent' : 'received'
    }
  }

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
    friendStatus,
  }
})
