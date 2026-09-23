import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, al as friends, m as createError } from '../../../../../_/nitro.mjs';
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

const accept_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const friendId = getRouterParam(event, "id");
  const req = await db.query.friends.findFirst({
    where: and(eq(friends.userId, friendId), eq(friends.friendId, user.id), eq(friends.status, "pending"))
  });
  if (!req) throw createError({ statusCode: 404, message: "\u30D5\u30EC\u30F3\u30C9\u30EA\u30AF\u30A8\u30B9\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  await db.update(friends).set({ status: "accepted", updatedAt: /* @__PURE__ */ new Date() }).where(eq(friends.id, req.id));
  return { success: true };
});

export { accept_post as default };
//# sourceMappingURL=accept.post.mjs.map
