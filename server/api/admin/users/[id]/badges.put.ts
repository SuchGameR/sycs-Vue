import { randomUUID } from 'crypto'
import { db } from '../../../../db'
import * as schema from '../../../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * Server-side badge assignment by user id.
 * Requires the `x-admin-secret` header to match `SYCS_ADMIN_SECRET`.
 *
 * Body: { badges: Array<{ kind: 'icon'|'image', value: string, label?: string }> }
 * Replaces all badges for the user. Send an empty array to clear.
 */
export default defineEventHandler(async (event) => {
  const secret = process.env.SYCS_ADMIN_SECRET
  if (!secret || getHeader(event, 'x-admin-secret') !== secret) {
    throw createError({ statusCode: 403, message: '管理者権限が必要です' })
  }

  const userId = getRouterParam(event, 'id')
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId!), columns: { id: true } })
  if (!user) throw createError({ statusCode: 404, message: 'ユーザーが見つかりません' })

  const body = await readBody(event)
  const badges = Array.isArray(body?.badges) ? body.badges : []
  const values = badges
    .filter((b: any) => b && typeof b.value === 'string' && b.value)
    .map((b: any, i: number) => ({
      id: randomUUID(),
      userId: userId!,
      kind: b.kind === 'image' ? 'image' : 'icon',
      value: b.value,
      label: b.label || null,
      position: i,
    }))

  await db.delete(schema.userBadges).where(eq(schema.userBadges.userId, userId!))
  if (values.length) await db.insert(schema.userBadges).values(values)

  return { badges: values }
})
