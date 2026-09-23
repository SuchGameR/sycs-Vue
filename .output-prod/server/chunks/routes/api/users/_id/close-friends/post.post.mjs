import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, at as closeFriends, m as createError } from '../../../../../_/nitro.mjs';
import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
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

const post_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const friendId = getRouterParam(event, "id");
  const existing = await db.query.closeFriends.findFirst({
    where: and(eq(closeFriends.userId, user.id), eq(closeFriends.friendId, friendId))
  });
  if (existing) throw createError({ statusCode: 409, message: "\u65E2\u306B\u89AA\u3057\u3044\u53CB\u9054\u3067\u3059" });
  await db.insert(closeFriends).values({
    id: randomUUID(),
    userId: user.id,
    friendId
  });
  return { success: true };
});

export { post_post as default };
//# sourceMappingURL=post.post.mjs.map
