import { db } from '../../db'
import * as schema from '../../db/schema'
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm'
import { getCurrentUser } from '../../utils/auth'
import { serializePosts } from '../../utils/postQuery'
import { attachmentKindFilter, isMediaKind, type MediaKind } from '../../utils/mediaFilter'

/**
 * Random media posts for the Reels-style feed shown on /search when the query
 * box is empty.
 *
 * Stateless by design: the client sends back the ids it has already seen and we
 * sample randomly from what is left. There is no cursor and no offset to keep in
 * sync, so a slide can never repeat or skip because a new post landed
 * mid-scroll -- which is exactly what happens with offset paging over a
 * `RANDOM()` ordering.
 *
 * Sampling is deliberately oversampled: visibility filtering happens in JS (it
 * depends on the viewer's follow graph, same as every other feed here), so a
 * plain LIMIT would often yield fewer visible posts than requested and the reel
 * would stall early.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 24)

  /** Only the four kinds a Reel slide can actually render. */
  const media: MediaKind | '' = isMediaKind(query.media) ? query.media : ''
  const sort = ['random', 'new', 'old', 'popular'].includes(String(query.sort))
    ? String(query.sort)
    : 'random'

  const exclude = String(query.exclude || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 300)

  const currentUser = await getCurrentUser(event)

  const followers = new Set<string>()
  const closeFriends = new Set<string>()
  if (currentUser) {
    const fls = await db.query.follows.findMany({ where: eq(schema.follows.followerId, currentUser.id) })
    fls.forEach(f => followers.add(f.followingId))
    const cfs = await db.query.closeFriends.findMany({ where: eq(schema.closeFriends.userId, currentUser.id) })
    cfs.forEach(c => closeFriends.add(c.friendId))
  }

  // An unfiltered `EXISTS (SELECT 1 FROM post_attachments ...)` would also pull
  // in .pdf / .zip / .txt / .json uploads, which render as an empty reel slide.
  // The kind filter is therefore always applied -- narrowed to "any of the four"
  // when no specific genre was chosen -- rather than only when filtering.
  const anyKind = media
    ? attachmentKindFilter(media, sql`pa.mime`, sql`pa.url`)
    : null

  const conditions: any[] = [
    media
      ? sql`EXISTS (SELECT 1 FROM post_attachments pa WHERE pa.post_id = posts.id AND ${anyKind})`
      : sql`EXISTS (
            SELECT 1 FROM post_attachments pa
            WHERE pa.post_id = posts.id
              AND (${attachmentKindFilter('image', sql`pa.mime`, sql`pa.url`)}
                OR ${attachmentKindFilter('video', sql`pa.mime`, sql`pa.url`)}
                OR ${attachmentKindFilter('audio', sql`pa.mime`, sql`pa.url`)}
                OR ${attachmentKindFilter('model', sql`pa.mime`, sql`pa.url`)})
          )`,
  ]

  // Built with the query builder, not a raw `= ANY($1::text[])`: drizzle expands
  // a JS array into a comma-separated tuple, which Postgres rejects.
  if (exclude.length) conditions.push(notInArray(schema.posts.id, exclude))

  // Fixed map, never interpolated from the request.
  const ORDER: Record<string, any> = {
    random: sql`RANDOM()`,
    new: sql`posts.created_at DESC`,
    old: sql`posts.created_at ASC`,
    popular: sql`(posts.like_count * 3 + posts.repost_count * 5 + posts.view_count) DESC NULLS LAST`,
  }

  const candidates = await db.query.posts.findMany({
    where: and(...conditions),
    orderBy: ORDER[sort],
    limit: limit * 6,
  })

  if (!candidates.length) return { posts: [] }

  const authors = await db.query.users.findMany({
    where: inArray(schema.users.id, [...new Set(candidates.map(p => p.userId))]),
    columns: { id: true, isPrivate: true },
  })
  const isPrivate = new Map(authors.map(u => [u.id, !!u.isPrivate]))

  const visible = candidates.filter((p) => {
    const isSelf = !!currentUser && p.userId === currentUser.id
    // A private ("鍵") author hides their posts from non-followers regardless of
    // the post's own visibility setting.
    if (isPrivate.get(p.userId) && !isSelf && !(currentUser && followers.has(p.userId))) return false

    if (p.visibility === 'public') return true
    if (!currentUser) return false
    if (isSelf) return true
    if (p.visibility === 'followers') return followers.has(p.userId)
    if (p.visibility === 'close_friends') return closeFriends.has(p.userId)
    if (p.visibility === 'specific') {
      try {
        return JSON.parse(p.visibleTo || '[]').includes(currentUser.id)
      } catch {
        return false
      }
    }
    return false
  }).slice(0, limit)

  return { posts: await serializePosts(visible, currentUser) }
})