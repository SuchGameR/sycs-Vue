import { d as defineEventHandler, r as requireAuth, g as getQuery, a as db } from '../../nitro/nitro.mjs';
import { sql } from 'drizzle-orm';
import 'crypto';
import 'jose';
import 'bcryptjs';
import 'fs';
import 'fs/promises';
import 'path';
import 'sharp';
import 'opentype.js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';

const index_get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);
  const sort = String(query.sort || "trending") === "popular" ? "popular" : "trending";
  const windowHours = Math.min(Math.max(Number(query.window) || 24, 1), 24 * 30);
  if (sort === "popular") {
    const res2 = await db.execute(sql`
      SELECT h.tag, h.display_tag AS "displayTag", h.post_count AS "postCount",
        (SELECT count(*)::int FROM post_hashtags ph2
           JOIN posts p2 ON p2.id = ph2.post_id
          WHERE ph2.tag = h.tag AND p2.created_at > NOW() - make_interval(hours => ${windowHours})
        ) AS "recentPosts"
      FROM hashtags h
      WHERE h.post_count > 0
      ORDER BY h.post_count DESC, h.tag ASC
      LIMIT ${limit}
    `);
    const rows = res2.rows.map((r) => ({
      tag: r.tag,
      displayTag: r.displayTag,
      postCount: r.postCount,
      recentPosts: r.recentPosts,
      score: r.postCount
    }));
    return { hashtags: rows, sort };
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
  `);
  const hashtags = res.rows.map((r) => ({
    tag: r.tag,
    displayTag: r.displayTag || r.tag,
    postCount: r.postCount,
    score: Math.round(Number(r.score) * 1e3) / 1e3,
    recentPosts: r.recentPosts,
    scoredPosts: r.scoredPosts
  }));
  return { hashtags, sort };
});

export { index_get as default };
//# sourceMappingURL=index2.get.mjs.map
