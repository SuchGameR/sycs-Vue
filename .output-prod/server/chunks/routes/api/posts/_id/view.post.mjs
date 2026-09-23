import { c as defineEventHandler, n as getRouterParam, E as getCurrentUser, e as db, f as posts, m as createError, p as postViews } from '../../../../_/nitro.mjs';
import { randomUUID } from 'crypto';
import { eq, isNull, and, gt, sql } from 'drizzle-orm';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const COOLDOWN_MS = 6e4;
const view_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const postId = getRouterParam(event, "id");
  const user = await getCurrentUser(event);
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    columns: { id: true, viewCount: true }
  });
  if (!post) throw createError({ statusCode: 404, message: "\u6295\u7A3F\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const cutoff = new Date(Date.now() - COOLDOWN_MS);
  const viewerMatch = (user == null ? void 0 : user.id) ? eq(postViews.userId, user.id) : isNull(postViews.userId);
  const recent = await db.query.postViews.findFirst({
    where: and(eq(postViews.postId, postId), viewerMatch, gt(postViews.createdAt, cutoff)),
    columns: { id: true }
  });
  if (recent) return { counted: false, viewCount: (_a = post.viewCount) != null ? _a : 0 };
  await db.insert(postViews).values({
    id: randomUUID(),
    postId,
    userId: (user == null ? void 0 : user.id) || null
  });
  const [updated] = await db.update(posts).set({ viewCount: sql`COALESCE(${posts.viewCount}, 0) + 1` }).where(eq(posts.id, postId)).returning({ viewCount: posts.viewCount });
  return { counted: true, viewCount: (_c = updated == null ? void 0 : updated.viewCount) != null ? _c : ((_b = post.viewCount) != null ? _b : 0) + 1 };
});

export { view_post as default };
//# sourceMappingURL=view.post.mjs.map
