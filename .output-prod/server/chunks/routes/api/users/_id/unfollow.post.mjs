import { d as defineEventHandler, r as requireAuth, i as getRouterParam, a as db, a8 as follows } from '../../../../nitro/nitro.mjs';
import { and, eq } from 'drizzle-orm';
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

const unfollow_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const followingId = getRouterParam(event, "id");
  await db.delete(follows).where(
    and(eq(follows.followerId, user.id), eq(follows.followingId, followingId))
  );
  return { success: true };
});

export { unfollow_post as default };
//# sourceMappingURL=unfollow.post.mjs.map
