import { d as defineEventHandler, r as requireAuth, g as getQuery, ae as normalizeTag, i as getRouterParam, h as createError, af as loadPostVisibility, ag as fetchTaggedPosts, a as db, s as serializePosts } from '../../../nitro/nitro.mjs';
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

function decodeParam(raw) {
  let s = String(raw != null ? raw : "");
  try {
    s = decodeURIComponent(s);
  } catch {
  }
  return s;
}
function decodeCursor(raw) {
  var _a;
  const s = Array.isArray(raw) ? String((_a = raw[0]) != null ? _a : "") : String(raw != null ? raw : "");
  if (!s) return null;
  const [ts, id] = s.split("|");
  const n = Number(ts);
  if (!id || !Number.isFinite(n)) return null;
  return { createdAt: n, id };
}
const _tag__get = defineEventHandler(async (event) => {
  var _a, _b;
  const user = await requireAuth(event);
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);
  const tag = normalizeTag(decodeParam(getRouterParam(event, "tag")));
  if (!tag) throw createError({ statusCode: 400, message: "\u7121\u52B9\u306A\u30CF\u30C3\u30B7\u30E5\u30BF\u30B0\u3067\u3059" });
  const ctx = await loadPostVisibility(user);
  const { rows, hasMore, nextCursor } = await fetchTaggedPosts({
    tag,
    ctx,
    limit,
    cursor: decodeCursor(query.cursor)
  });
  const meta = await db.execute(sql`
    SELECT h.tag, h.display_tag AS "displayTag", h.post_count AS "postCount",
      (SELECT count(*)::int FROM post_hashtags ph2
         JOIN posts p2 ON p2.id = ph2.post_id
        WHERE ph2.tag = h.tag AND p2.created_at > NOW() - INTERVAL '24 hours') AS "recentPosts"
    FROM hashtags h
    WHERE h.tag = ${tag}
  `);
  const metaRow = meta.rows[0] || null;
  const posts = rows.length ? await serializePosts(rows, user) : [];
  return {
    tag,
    displayTag: (metaRow == null ? void 0 : metaRow.displayTag) || (metaRow == null ? void 0 : metaRow.tag) || tag,
    // post_count is the all-time total; posts.length is what this viewer can see.
    postCount: (_a = metaRow == null ? void 0 : metaRow.postCount) != null ? _a : 0,
    recentPosts: (_b = metaRow == null ? void 0 : metaRow.recentPosts) != null ? _b : 0,
    posts,
    nextCursor: nextCursor ? `${nextCursor.createdAt}|${nextCursor.id}` : null,
    hasMore
  };
});

export { _tag__get as default };
//# sourceMappingURL=_tag_.get.mjs.map
