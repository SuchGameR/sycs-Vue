import { sql } from 'drizzle-orm'
import { db } from '../../db'
import { requireAuth } from '../../utils/auth'

/**
 * GET /api/hashtags — trending tags.
 *
 * Raw `post_count` is NOT used for ranking: it only ever reflects all-time
 * popularity, so it looks frozen a year after a tag spiked. Instead every tag
 * is scored from its individual recent posts with a time decay.
 *
 *   ageHours   = hours since the post was created
 *   decay      = POWER(ageHours + 2, 1.5)
 *                (+2 keeps brand-new posts from dividing by ~0; the 1.5 exponent
 *                 means a post loses ~half its weight in roughly the first
 *                 couple of hours and ~90% after a day)
 *   engagement = reactions
 *              + 2 x comments        (a comment costs more effort than a tap)
 *              + 3 x reposts          (the strongest distribution signal)
 *              + 0.25 x views         (cheap reach, heavily damped)
 *   postWeight = (1 + engagement) / decay
 *   score      = SUM(postWeight) over the tag's posts in the last 30 days
 *
 * The `1 +` means a post with zero engagement still contributes a little, so a
 * brand-new tag with one post is discoverable instead of invisible.
 *
 * Only PUBLIC, non-server-channel posts the viewer is allowed to see are scored,
 * so a tag can never be trending because of leaked private content, and posts
 * to/from blocked users are excluded on both sides.
 *
 * `sort=popular` switches to plain post_count ordering for a "most used" view.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50)
  const sort = String(query.sort || 'trending') === 'popular' ? 'popular' : 'trending'
  const windowHours = Math.min(Math.max(Number(query.window) || 24, 1), 24 * 30)

  if (sort === 'popular') {
    const res = await db.execute(sql`
      SELECT h.tag, h.display_tag AS "displayTag", h.post_count AS "postCount",
        (SELECT count(*)::int FROM post_hashtags ph2
           JOIN posts p2 ON p2.id = ph2.post_id
          WHERE ph2.tag = h.tag AND p2.created_at > NOW() - make_interval(hours => ${windowHours})
        ) AS "recentPosts"
      FROM hashtags h
      WHERE h.post_count > 0
      ORDER BY h.post_count DESC, h.tag ASC
      LIMIT ${limit}
    `)
    const rows = (res as any).rows.map((r: any) => ({
      tag: r.tag,
      displayTag: r.displayTag,
      postCount: r.postCount,
      recentPosts: r.recentPosts,
      score: r.postCount,
    }))
    return { hashtags: rows, sort }
  }

  const res = await db.execute(sql`
    WITH scored AS (
      SELECT ph.tag,
        SUM(
          (1 + (
            (SELECT count(*)::int FROM post_reactions r WHERE r.post_id = p.id)
            + 2 * (SELECT count(*)::int FROM post_comments c WHERE c.post_id = p.id)
            + 3 * (SELECT count(*)::int FROM reposts rp WHERE rp.post_id = p.id)
            + 0.25 * COALESCE(p.view_count, 0)
          ))
          / POWER(
              GREATEST(EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600.0, 0) + 2,
              1.5
            )
        ) AS score,
        (COUNT(*) FILTER (WHERE p.created_at > NOW() - make_interval(hours => ${windowHours})))::int AS "recentPosts",
        COUNT(*)::int AS "scoredPosts"
      FROM post_hashtags ph
      JOIN posts p ON p.id = ph.post_id
      WHERE p.created_at > NOW() - INTERVAL '30 days'
        AND p.visibility = 'public'
        AND p.server_id IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM user_blocks b
          WHERE (b.user_id = ${user.id} AND b.blocked_id = p.user_id)
             OR (b.blocked_id = ${user.id} AND b.user_id = p.user_id)
        )
      GROUP BY ph.tag
    )
    SELECT s.tag, h.display_tag AS "displayTag", h.post_count AS "postCount",
      s.score, s."recentPosts", s."scoredPosts"
    FROM scored s
    JOIN hashtags h ON h.tag = s.tag
    ORDER BY s.score DESC, s."recentPosts" DESC, h.post_count DESC
    LIMIT ${limit}
  `)

  const hashtags = ((res as any).rows as any[]).map(r => ({
    tag: r.tag,
    displayTag: r.displayTag || r.tag,
    postCount: r.postCount,
    score: Math.round(Number(r.score) * 1000) / 1000,
    recentPosts: r.recentPosts,
    scoredPosts: r.scoredPosts,
  }))

  return { hashtags, sort }
})