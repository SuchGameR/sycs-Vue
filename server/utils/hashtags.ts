import { and, eq, inArray, notInArray, or, sql } from 'drizzle-orm'
import { db } from '../db'
import * as schema from '../db/schema'

/* ==========================================================================
   Hashtag grammar
   --------------------------------------------------------------------------
   A tag body is 1-30 characters from:
     - A-Z a-z 0-9 _
     - U+3040..U+30FF  (hiragana, katakana, and U+30FC prolonged sound mark)

   The FIRST character may be anything in that set. The LAST character may be
   anything EXCEPT U+30FC (ー). Rationale: ー is a *continuation* mark
   (ラーメン, コーヒー), it is never the first meaningful syllable of a word, so
   a trailing ー almost always means the author is mid-word and has not finished
   typing (#ラーメン is a tag, #ラーメンー is not). Allowing it internally keeps
   Japanese loanwords usable.

   A preceding-character guard (lookbehind) rejects:
     - ##foo        (previous char is '#')
     - a#b          (previous char is a word char)
     - /a#b         (previous char is '/' -> URL fragments like https://x.com/a#b)
   `#` at end of string, `#` followed by space/newline, and `#` followed by any
   character outside the class simply fail to match.

   Casing: storage/lookup key is lowercased (`sycsdev`), the original casing is
   preserved in `hashtags.display_tag` for display. Lookup is therefore
   case-insensitive-tolerant.
   ========================================================================== */
const TAG_CHARS = 'A-Za-z0-9_\\u3040-\\u30FF'
// Same set minus U+30FC, for the final character of a tag.
const TAG_LAST_CHARS = 'A-Za-z0-9_\\u3040-\\u30FB\\u30FD-\\u30FF'
// A hashtag may not start right after one of these.
const TAG_NOT_PRECEDED_BY = 'A-Za-z0-9_\\u3040-\\u30FF/#'

const MAX_TAG_LENGTH = 30
const PROLONGED = '\u30FC'

export const HASHTAG_RE = new RegExp(
  `(?<![${TAG_NOT_PRECEDED_BY}])#([${TAG_CHARS}]{0,${MAX_TAG_LENGTH - 1}}[${TAG_LAST_CHARS}])`,
  'g',
)

const ANCHORED_RE = new RegExp(`^[${TAG_CHARS}]{1,${MAX_TAG_LENGTH}}$`)

export interface HashtagEntry {
  /** lowercased key used for storage + lookup */
  tag: string
  /** original casing, used for display */
  display: string
}

/**
 * Normalize a raw tag (with or without a leading `#`) to its storage key.
 * Returns null when the value is not a legal tag.
 */
export function normalizeTag(raw: string): string | null {
  let s = String(raw ?? '').trim()
  s = s.replace(/^#+/, '')
  if (!s) return null
  s = s.normalize('NFC')
  if (!ANCHORED_RE.test(s)) return null
  // ー is valid inside a tag but never as its first or last character.
  if (s.startsWith(PROLONGED) || s.endsWith(PROLONGED)) return null
  return s.toLowerCase()
}

/** All tags in `content`, unique, in order of first appearance (lowercased). */
export function extractHashtags(content: string): string[] {
  return extractHashtagEntries(content).map(e => e.tag)
}

/** Like `extractHashtags` but also returns the original casing for each tag. */
export function extractHashtagEntries(content: string): HashtagEntry[] {
  const text = String(content ?? '')
  const out: HashtagEntry[] = []
  const seen = new Set<string>()
  HASHTAG_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = HASHTAG_RE.exec(text)) !== null) {
    const display = m[1]
    const tag = normalizeTag(display)
    if (!tag || seen.has(tag)) continue
    seen.add(tag)
    out.push({ tag, display })
  }
  return out
}

/**
 * Recompute `hashtags.post_count` for the given tags FROM the link table.
 *
 * Idempotency: the count is derived with a `count(*)` over post_hashtags rather
 * than incremented/decremented, so running it any number of times (or running it
 * after a partially-applied re-index) always converges to the same number. The
 * unique (post_id, tag) index guarantees one link row per (post, tag).
 */
export async function recountHashtags(tags: string[]): Promise<void> {
  const unique = [...new Set(tags)]
  if (!unique.length) return
  // Built with the query builder rather than a raw `= ANY($1::text[])`: the
  // drizzle sql`` tag expands a JS array into a comma-separated tuple, which
  // Postgres rejects as `ANY(($1, $2)...)`.
  await db
    .update(schema.hashtags)
    .set({
      postCount: sql`(SELECT count(*)::int FROM post_hashtags ph WHERE ph.tag = ${schema.hashtags.tag})`,
    })
    .where(inArray(schema.hashtags.tag, unique))
}

/**
 * Make `post_hashtags` match the tags currently present in `content`.
 *
 * Idempotent by construction:
 *  1. links for tags that are no longer in the content are deleted,
 *  2. new links are inserted with ON CONFLICT DO NOTHING (so re-saving the same
 *     post inserts nothing),
 *  3. counts are recomputed from the link table for every tag that was added OR
 *     removed.
 * Returns the tag keys the post now has.
 */
export async function syncPostHashtags(postId: string, content: string): Promise<string[]> {
  const entries = extractHashtagEntries(content)
  const tags = entries.map(e => e.tag)

  const prevRows = await db
    .select({ tag: schema.postHashtags.tag })
    .from(schema.postHashtags)
    .where(eq(schema.postHashtags.postId, postId))
  const prev = prevRows.map(r => r.tag)

  if (tags.length) {
    await db.insert(schema.hashtags)
      .values(entries.map(e => ({ tag: e.tag, displayTag: e.display })))
      // Existing rows keep the display casing they were first created with.
      .onConflictDoNothing({ target: schema.hashtags.tag })
    await db.insert(schema.postHashtags)
      .values(tags.map(tag => ({ postId, tag })))
      .onConflictDoNothing()
  }

  if (prev.length) {
    await db.delete(schema.postHashtags).where(
      tags.length
        ? and(eq(schema.postHashtags.postId, postId), notInArray(schema.postHashtags.tag, tags))
        : eq(schema.postHashtags.postId, postId),
    )
  }

  await recountHashtags([...prev, ...tags])
  return tags
}

/* ==========================================================================
   Visibility
   --------------------------------------------------------------------------
   Hashtag pages are a SECOND way to reach a post's content, so they must apply
   exactly the same rules the feed applies (server/api/posts/index.get.ts) plus
   block filtering. Everything below is deliberately a strict superset of the
   feed filter: anything the feed hides is hidden here too.
   ========================================================================== */

export interface PostVisibilityContext {
  currentUser: any | null
  followers: Set<string>
  closeFriends: Set<string>
  /** users blocked BY the viewer or who blocked the viewer */
  blocked: Set<string>
}

export async function loadPostVisibility(currentUser: any | null): Promise<PostVisibilityContext> {
  const ctx: PostVisibilityContext = {
    currentUser,
    followers: new Set<string>(),
    closeFriends: new Set<string>(),
    blocked: new Set<string>(),
  }
  if (!currentUser) return ctx
  const fls = await db.query.follows.findMany({
    where: eq(schema.follows.followerId, currentUser.id),
    columns: { followingId: true },
  })
  fls.forEach(f => ctx.followers.add(f.followingId))
  const cfs = await db.query.closeFriends.findMany({
    where: eq(schema.closeFriends.userId, currentUser.id),
    columns: { friendId: true },
  })
  cfs.forEach(f => ctx.closeFriends.add(f.friendId))
  const bs = await db.query.userBlocks.findMany({
    where: or(
      eq(schema.userBlocks.userId, currentUser.id),
      eq(schema.userBlocks.blockedId, currentUser.id),
    ),
  })
  bs.forEach(b => ctx.blocked.add(b.userId === currentUser.id ? b.blockedId : b.userId))
  return ctx
}

export function isPostVisibleToViewer(ctx: PostVisibilityContext, p: any): boolean {
  const { currentUser } = ctx
  if (!p) return false
  // Blocks win over everything, in both directions.
  if (currentUser && ctx.blocked.has(p.userId)) return false

  // Post audience
  if (p.visibility !== 'public') {
    if (!currentUser) return false
    if (p.userId !== currentUser.id) {
      if (p.visibility === 'followers') {
        if (!ctx.followers.has(p.userId)) return false
      } else if (p.visibility === 'close_friends') {
        if (!ctx.closeFriends.has(p.userId)) return false
      } else if (p.visibility === 'specific') {
        let list: unknown = []
        try { list = JSON.parse(p.visibleTo || '[]') } catch { list = [] }
        if (!Array.isArray(list) || !list.includes(currentUser.id)) return false
      } else {
        return false
      }
    }
  }

  // Private ("鍵") author: self + followers only.
  if (p.authorIsPrivate) {
    if (!currentUser) return false
    if (p.userId !== currentUser.id && !ctx.followers.has(p.userId)) return false
  }

  return true
}

export interface TagCursor { createdAt: number; id: string }

/**
 * Newest-first posts for one tag with visibility/block filtering applied.
 * Over-fetches so that a page of `limit` VISIBLE posts can usually be filled
 * even when some candidates are filtered out.
 */
export async function fetchTaggedPosts(opts: {
  tag: string
  ctx: PostVisibilityContext
  limit: number
  cursor?: TagCursor | null
  overscan?: number
}) {
  const { tag, ctx, limit } = opts
  const take = Math.min(limit + (opts.overscan ?? 0), 60)
  const cursor = opts.cursor ?? null

  const keyCond = cursor
    ? sql`AND ((EXTRACT(EPOCH FROM p.created_at) * 1000) < ${cursor.createdAt}
             OR (EXTRACT(EPOCH FROM p.created_at) * 1000) = ${cursor.createdAt} AND p.id < ${cursor.id})`
    : sql``

  const res = await db.execute(sql`
    SELECT p.id, p.content, p.image_url AS "imageUrl", p.visibility, p.visible_to AS "visibleTo",
      p.server_id AS "serverId", p.channel_id AS "channelId", p.quoted_post_id AS "quotedPostId",
      p.like_count AS "likeCount", p.repost_count AS "repostCount", p.view_count AS "viewCount",
      p.created_at AS "createdAt", p.updated_at AS "updatedAt", p.user_id AS "userId",
      u.is_private AS "authorIsPrivate"
    FROM post_hashtags ph
    JOIN posts p ON p.id = ph.post_id
    JOIN users u ON u.id = p.user_id
    WHERE ph.tag = ${tag} ${keyCond}
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ${take}
  `)

  const candidates: any[] = (res as any).rows
  const visible = candidates.filter(p => isPostVisibleToViewer(ctx, p))
  const rows = visible.slice(0, limit)
  const hasMore = visible.length > limit || candidates.length === take
  const last = rows[rows.length - 1]
  const nextCursor: TagCursor | null = last
    ? { createdAt: new Date(last.createdAt).getTime(), id: last.id }
    : null

  return { rows, hasMore, nextCursor }
}