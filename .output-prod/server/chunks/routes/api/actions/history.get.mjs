import { d as defineEventHandler, r as requireAuth, g as getQuery, a as db, p as postViews, b as posts, s as serializePosts } from '../../../nitro/nitro.mjs';
import { desc, eq, inArray } from 'drizzle-orm';
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

const history_get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const offset = Math.max(Number(query.offset) || 0, 0);
  const rows = await db.query.postViews.findMany({
    where: eq(postViews.userId, user.id),
    orderBy: [desc(postViews.createdAt)],
    limit: (offset + limit) * 3
  });
  const ids = [];
  for (const r of rows) {
    if (!ids.includes(r.postId)) ids.push(r.postId);
  }
  const pageIds = ids.slice(offset, offset + limit);
  if (!pageIds.length) return { posts: [], nextOffset: offset, hasMore: false };
  const posts$1 = await db.query.posts.findMany({ where: inArray(posts.id, pageIds) });
  const map = Object.fromEntries(posts$1.map((p) => [p.id, p]));
  const ordered = pageIds.map((id) => map[id]).filter(Boolean);
  return { posts: await serializePosts(ordered, user), nextOffset: offset + pageIds.length, hasMore: ids.length > offset + pageIds.length };
});

export { history_get as default };
//# sourceMappingURL=history.get.mjs.map
