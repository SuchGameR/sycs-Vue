import { d as defineEventHandler, r as requireAuth, g as getQuery, a as db, l as likes, b as posts, s as serializePosts } from '../../../nitro/nitro.mjs';
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

const likes_get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const offset = Math.max(Number(query.offset) || 0, 0);
  const rows = await db.query.likes.findMany({
    where: eq(likes.userId, user.id),
    orderBy: [desc(likes.createdAt)],
    limit,
    offset
  });
  const ids = rows.map((r) => r.postId);
  if (!ids.length) return { posts: [], nextOffset: offset, hasMore: false };
  const posts$1 = await db.query.posts.findMany({ where: inArray(posts.id, ids) });
  const map = Object.fromEntries(posts$1.map((p) => [p.id, p]));
  const ordered = ids.map((id) => map[id]).filter(Boolean);
  return { posts: await serializePosts(ordered, user), nextOffset: offset + rows.length, hasMore: rows.length === limit };
});

export { likes_get as default };
//# sourceMappingURL=likes.get.mjs.map
