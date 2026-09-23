import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, ak as follows } from '../../../../_/nitro.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

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
