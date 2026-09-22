import { d as defineEventHandler, r as requireAuth, i as getRouterParam, a as db, e as reposts, L as broadcast } from '../../../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
import { and, eq, sql } from 'drizzle-orm';
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

const repost_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const postId = getRouterParam(event, "id");
  const existing = await db.query.reposts.findFirst({
    where: and(eq(reposts.userId, user.id), eq(reposts.postId, postId))
  });
  if (existing) return { success: true };
  await db.insert(reposts).values({ id: randomUUID(), userId: user.id, postId });
  await db.execute(sql`UPDATE posts SET repost_count = repost_count + 1 WHERE id = ${postId}`);
  broadcast({ type: "activity.new", kind: "repost", actorId: user.id, postId });
  return { success: true };
});

export { repost_post as default };
//# sourceMappingURL=repost.post.mjs.map
