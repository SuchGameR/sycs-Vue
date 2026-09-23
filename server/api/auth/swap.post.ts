import { db } from '../../db'
import * as schema from '../../db/schema'
import { eq } from 'drizzle-orm'
import { verifyToken, setAuthCookie, setClientTokenCookie, clearClientTokenCookie } from '../../utils/auth'

/**
 * Account switching: client supplies a previously saved token; if it is still
 * valid, it becomes the active session (cookie swap). No password required.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token } = body
  if (!token || typeof token !== 'string') {
    throw createError({ statusCode: 400, message: 'トークンが必要です' })
  }

  const payload = await verifyToken(token)
  if (!payload?.userId) {
    throw createError({ statusCode: 401, message: 'このアカウントのセッションは期限切れです。再ログインしてください' })
  }

  const user = await db.query.users.findFirst({ where: eq(schema.users.id, payload.userId) })
  if (!user) {
    throw createError({ statusCode: 401, message: 'アカウントが見つかりませんでした' })
  }

  const remember = !!payload.remember
  setAuthCookie(event, token, remember)
  clearClientTokenCookie(event)

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
    },
  }
})