import { c as defineEventHandler, r as requireAuth, n as getRouterParam, m as createError, e as db, o as users, ak as follows, U as broadcast } from '../../../../_/nitro.mjs';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
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

const follow_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const followingId = getRouterParam(event, "id");
  if (user.id === followingId) throw createError({ statusCode: 400, message: "\u81EA\u5206\u81EA\u8EAB\u3092\u30D5\u30A9\u30ED\u30FC\u3067\u304D\u307E\u305B\u3093" });
  const target = await db.query.users.findFirst({ where: eq(users.id, followingId) });
  if (!target) throw createError({ statusCode: 404, message: "\u30E6\u30FC\u30B6\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const existing = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, user.id), eq(follows.followingId, followingId))
  });
  if (existing) return { success: true };
  await db.insert(follows).values({ id: randomUUID(), followerId: user.id, followingId });
  broadcast({
    type: "activity.new",
    kind: "follow",
    actorId: user.id,
    actor: { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl },
    targetUserId: followingId
  });
  return { success: true };
});

export { follow_post as default };
//# sourceMappingURL=follow.post.mjs.map
