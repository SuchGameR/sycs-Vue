import { db } from '../db'
import * as schema from '../db/schema'
import { count, inArray } from 'drizzle-orm'

export interface PublicBadge {
  kind: 'icon' | 'image'
  value: string
  label?: string | null
}

/**
 * Server-side badge assignments.
 * Key by user id, or by `@username`. Example:
 *   '@suchgamer': [{ kind: 'icon', value: 'lucide:crown', label: '創設者' }]
 *   'user-uuid': [{ kind: 'image', value: '/uploads/badge.png', label: '公式' }]
 */
export const BADGE_ASSIGNMENTS: Record<string, PublicBadge[]> = {
  // '@suchgamer': [{ kind: 'icon', value: 'lucide:crown', label: '創設者' }],
}

export function configBadges(user: { id: string; username?: string | null }): PublicBadge[] {
  const badges: PublicBadge[] = []
  if (user.username && BADGE_ASSIGNMENTS[`@${user.username}`]) {
    badges.push(...BADGE_ASSIGNMENTS[`@${user.username}`])
  }
  if (BADGE_ASSIGNMENTS[user.id]) badges.push(...BADGE_ASSIGNMENTS[user.id])
  return badges
}

export function pickTitle(actions: number, ageDays: number): string | null {
  if (actions >= 500 || (ageDays >= 365 && actions >= 200)) return '伝説'
  if (actions >= 200) return '達人'
  if (actions >= 80) return '熟練'
  if (actions >= 25) return '常連'
  if (actions >= 5) return '見習い'
  return null
}

export async function computeTitles(users: any[]): Promise<Record<string, string | null>> {
  const ids = [...new Set(users.map(u => u.id))].filter(Boolean)
  const out: Record<string, string | null> = {}
  if (!ids.length) return out

  const [postRows, commentRows, reactionRows] = await Promise.all([
    db.select({ userId: schema.posts.userId, c: count() }).from(schema.posts).where(inArray(schema.posts.userId, ids)).groupBy(schema.posts.userId),
    db.select({ userId: schema.postComments.userId, c: count() }).from(schema.postComments).where(inArray(schema.postComments.userId, ids)).groupBy(schema.postComments.userId),
    db.select({ userId: schema.postReactions.userId, c: count() }).from(schema.postReactions).where(inArray(schema.postReactions.userId, ids)).groupBy(schema.postReactions.userId),
  ])

  const toMap = (rows: Array<{ userId: string; c: number }>) =>
    Object.fromEntries(rows.map(r => [r.userId, Number(r.c)]))

  const posts = toMap(postRows as any)
  const comments = toMap(commentRows as any)
  const reactions = toMap(reactionRows as any)

  const now = Date.now()
  for (const u of users) {
    const actions = (posts[u.id] || 0) * 5 + (comments[u.id] || 0) * 3 + (reactions[u.id] || 0)
    const ageDays = u.createdAt ? (now - new Date(u.createdAt).getTime()) / 86400000 : 0
    out[u.id] = pickTitle(actions, ageDays)
  }
  return out
}

export interface UserExtras {
  badges: PublicBadge[]
  title: string | null
}

export async function enrichUsers(users: any[]): Promise<Record<string, UserExtras>> {
  const ids = [...new Set(users.map(u => u.id))].filter(Boolean)
  const out: Record<string, UserExtras> = {}
  if (!ids.length) return out

  const [dbBadges, titles] = await Promise.all([
    db.query.userBadges.findMany({
      where: inArray(schema.userBadges.userId, ids),
      orderBy: [schema.userBadges.position],
    }),
    computeTitles(users),
  ])

  const dbBadgeMap: Record<string, PublicBadge[]> = {}
  for (const b of dbBadges) {
    if (!dbBadgeMap[b.userId]) dbBadgeMap[b.userId] = []
    dbBadgeMap[b.userId].push({ kind: b.kind as 'icon' | 'image', value: b.value, label: b.label })
  }

  for (const u of users) {
    out[u.id] = {
      badges: [...(dbBadgeMap[u.id] || []), ...configBadges(u)],
      title: titles[u.id] || null,
    }
  }
  return out
}

export function publicUser(u: any, extras?: UserExtras) {
  if (!u) return null
  const { passwordHash, email, settings, ...rest } = u
  return {
    ...rest,
    badges: extras?.badges || [],
    title: extras?.title || null,
  }
}

/** DM など相手が目にする場面向けに、email 等の機微情報を除いたユーザー概要。 */
export function pickPublicSummary(u: any) {
  if (!u) return null
  const { id, username, displayName, avatarUrl, bannerUrl, bio, statusMessage, isPrivate, createdAt, updatedAt } = u
  return { id, username, displayName, avatarUrl, bannerUrl, bio, statusMessage, isPrivate, createdAt, updatedAt }
}
