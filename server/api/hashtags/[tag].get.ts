import { sql } from 'drizzle-orm'
import { db } from '../../db'
import { requireAuth } from '../../utils/auth'
import { serializePosts } from '../../utils/postQuery'
import {
  fetchTaggedPosts,
  loadPostVisibility,
  normalizeTag,
  type TagCursor,
} from '../../utils/hashtags'

function decodeParam(raw: unknown): string {
  let s = String(raw ?? '')
  try { s = decodeURIComponent(s) } catch { /* keep raw */ }
  return s
}

function decodeCursor(raw: unknown): TagCursor | null {
  const s = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
  if (!s) return null
  const [ts, id] = s.split('|')
  const n = Number(ts)
  if (!id || !Number.isFinite(n)) return null
  return { createdAt: n, id }
}

/**
 * GET /api/hashtags/:tag — newest-first posts carrying one tag.
 *
 * Visibility: candidate rows are joined with `users` and then filtered in JS by
 * the SAME rules as the feed (public / followers / close_friends / specific,
 * private-author gate) plus block filtering in both directions — see
 * `loadPostVisibility` / `isPostVisibleToViewer` in utils/hashtags. Tag pages are
 * a second path to post content, so leaking private posts here would be a real
 * disclosure bug.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50)

  const tag = normalizeTag(decodeParam(getRouterParam(event, 'tag')))
  if (!tag) throw createError({ statusCode: 400, message: '無効なハッシュタグです' })

  const ctx = await loadPostVisibility(user)
  const { rows, hasMore, nextCursor } = await fetchTaggedPosts({
    tag,
    ctx,
    limit,
    cursor: decodeCursor(query.cursor),
  })

  const meta = await db.execute(sql`
    SELECT h.tag, h.display_tag AS "displayTag", h.post_count AS "postCount",
      (SELECT count(*)::int FROM post_hashtags ph2
         JOIN posts p2 ON p2.id = ph2.post_id
        WHERE ph2.tag = h.tag AND p2.created_at > NOW() - INTERVAL '24 hours') AS "recentPosts"
    FROM hashtags h
    WHERE h.tag = ${tag}
  `)
  const metaRow: any = ((meta as any).rows as any[])[0] || null

  const posts = rows.length ? await serializePosts(rows, user) : []

  return {
    tag,
    displayTag: metaRow?.displayTag || metaRow?.tag || tag,
    // post_count is the all-time total; posts.length is what this viewer can see.
    postCount: metaRow?.postCount ?? 0,
    recentPosts: metaRow?.recentPosts ?? 0,
    posts,
    nextCursor: nextCursor ? `${nextCursor.createdAt}|${nextCursor.id}` : null,
    hasMore,
  }
})