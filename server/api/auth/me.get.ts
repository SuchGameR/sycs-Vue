import { getCurrentUser, renewAuthCookie } from '../../utils/auth'
import { enrichUsers } from '../../utils/userExtras'

export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: '認証が必要です' })
  }
  renewAuthCookie(event)
  const extras = await enrichUsers([user])
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      bio: user.bio,
      settings: user.settings || '{}',
      isPrivate: !!user.isPrivate,
      badges: extras[user.id]?.badges || [],
      title: extras[user.id]?.title || null,
      createdAt: user.createdAt,
    },
  }
})
