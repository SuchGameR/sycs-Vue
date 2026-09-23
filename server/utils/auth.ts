import { SignJWT, jwtVerify } from 'jose'
import { db } from '../db'
import * as schema from '../db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { setCookie, getCookie, deleteCookie } from 'h3'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'sycs-dev-secret-change-in-production-please')

export interface JwtPayload {
  userId: string
  sessionId: string
  remember?: boolean
}

const SHORT_SESSION_SECONDS = 7 * 24 * 60 * 60
const LONG_SESSION_SECONDS = 30 * 24 * 60 * 60

export async function createToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(payload.remember ? '30d' : '7d')
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JwtPayload
  } catch { return null }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string, rememberMe = false): Promise<{ token: string }> {
  const sessionId = randomUUID()
  const token = await createToken({ userId, sessionId, remember: rememberMe })
  return { token }
}

function cookieSecure(): boolean {
  const override = process.env.SYCS_COOKIE_SECURE
  if (override === 'true') return true
  if (override === 'false') return false
  return process.env.NODE_ENV === 'production'
}

export function setAuthCookie(event: any, token: string, rememberMe = false) {
  setCookie(event, 'sycs_token', token, {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: 'lax',
    path: '/',
    maxAge: rememberMe ? LONG_SESSION_SECONDS : SHORT_SESSION_SECONDS,
  })
}

/**
 * Mirror of the httpOnly token in a cookie that client JS can read, used only
 * to capture new logins for the account switcher. Short-lived & non-httpOnly.
 */
export function setClientTokenCookie(event: any, token: string, rememberMe = false) {
  setCookie(event, 'sycs_client_token', token, {
    httpOnly: false,
    secure: cookieSecure(),
    sameSite: 'lax',
    path: '/',
    maxAge: Math.min(LONG_SESSION_SECONDS, 60 * 60), // 1 hour: plenty to capture
  })
}

export function clearClientTokenCookie(event: any) {
  deleteCookie(event, 'sycs_client_token')
}

export function renewAuthCookie(event: any) {
  const token = getCookie(event, 'sycs_token')
  if (!token) return
  verifyToken(token).then((payload) => {
    if (!payload) return
    const remember = !!payload.remember
    createToken({ userId: payload.userId, sessionId: payload.sessionId, remember }).then((fresh) => {
      setAuthCookie(event, fresh, remember)
    }).catch(() => {})
  }).catch(() => {})
}

export function clearAuthCookie(event: any) {
  deleteCookie(event, 'sycs_token')
}

export async function getCurrentUser(event: any) {
  const token = getCookie(event, 'sycs_token')
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  return db.query.users.findFirst({ where: eq(schema.users.id, payload.userId) }) || null
}

export async function requireAuth(event: any) {
  const user = await getCurrentUser(event)
  if (!user) throw createError({ statusCode: 401, message: '認証が必要です' })
  return user
}
