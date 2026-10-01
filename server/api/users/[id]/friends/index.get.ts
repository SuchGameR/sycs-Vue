import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq, or, and, inArray } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'
import { pickPublicSummary, enrichUsers } from '../../../../utils/userExtras'

export default defineEventHandler(async (event) => {
  const me = await requireAuth(event)
  const userId = getRouterParam(event, 'id')

  // A friend list is private to its owner. Reading someone else's would turn
  // this into a "who is this user friends with" oracle.
  if (userId !== me.id) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot view another user\'s friends' })
  }

  const friendList = await db.query.friends.findMany({
    where: and(
      or(eq(schema.friends.userId, userId!), eq(schema.friends.friendId, userId!)),
      eq(schema.friends.status, 'accepted')
    ),
  })

  const userIds = [...new Set(friendList.map(f => f.userId === userId ? f.friendId : f.userId))]

  const users = await db.query.users.findMany({
    where: inArray(schema.users.id, userIds),
  })

  // The row shape is narrowed by pickPublicSummary below; never spread a raw
  // user row into a response, or passwordHash / email / settings ship with it.
  const extras = await enrichUsers(users)

  return {
    friends: users.map(u => ({
      ...pickPublicSummary(u),
      badges: extras[u.id]?.badges || [],
      title: extras[u.id]?.title || null,
    })),
  }
})