import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, j as reposts } from '../../../../_/nitro.mjs';
import { and, eq, sql } from 'drizzle-orm';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const unrepost_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const postId = getRouterParam(event, "id");
  const existing = await db.query.reposts.findFirst({
    where: and(eq(reposts.userId, user.id), eq(reposts.postId, postId))
  });
  if (!existing) return { success: true };
  await db.delete(reposts).where(and(eq(reposts.userId, user.id), eq(reposts.postId, postId)));
  await db.execute(sql`UPDATE posts SET repost_count = GREATEST(repost_count - 1, 0) WHERE id = ${postId}`);
  return { success: true };
});

export { unrepost_post as default };
//# sourceMappingURL=unrepost.post.mjs.map
