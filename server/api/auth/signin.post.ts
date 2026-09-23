import { db, initDb } from '../../db'
import * as schema from '../../db/schema'
import { eq, or } from 'drizzle-orm'
import { verifyPassword, createSession, setAuthCookie, setClientTokenCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await initDb()

  const body = await readBody(event)
  const { email, password, rememberMe } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'ユーザーIDまたはメールアドレスとパスワードを入力してください' })
  }

  const login = String(email).trim().toLowerCase()
  const user = await db.query.users.findFirst({
    where: or(
      eq(schema.users.email, email),
      eq(schema.users.username, login),
    ),
  })
  if (!user || !user.passwordHash) {
    throw createError({ statusCode: 401, message: 'ユーザーIDまたはメールアドレス、パスワードが正しくありません' })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'ユーザーIDまたはメールアドレス、パスワードが正しくありません' })
  }

  const { token } = await createSession(user.id, rememberMe)
  setAuthCookie(event, token, rememberMe)
  setClientTokenCookie(event, token, rememberMe)

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    },
    token,
  }
})
