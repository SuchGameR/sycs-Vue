import { d as defineEventHandler, r as requireAuth, i as getRouterParam, h as createError, a as db, a9 as friends } from '../../../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
import { or, and, eq } from 'drizzle-orm';
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

const index_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const friendId = getRouterParam(event, "id");
  if (friendId === user.id) throw createError({ statusCode: 400, message: "\u81EA\u5206\u81EA\u8EAB\u3068\u30D5\u30EC\u30F3\u30C9\u306B\u306F\u306A\u308C\u307E\u305B\u3093" });
  const existing = await db.query.friends.findFirst({
    where: or(
      and(eq(friends.userId, user.id), eq(friends.friendId, friendId)),
      and(eq(friends.userId, friendId), eq(friends.friendId, user.id))
    )
  });
  if (existing) {
    if (existing.status === "accepted") {
      throw createError({ statusCode: 409, data: { code: "ALREADY_FRIENDS" }, message: "\u65E2\u306B\u30D5\u30EC\u30F3\u30C9\u95A2\u4FC2\u306B\u3042\u308A\u307E\u3059" });
    }
    const isInbound = existing.userId === friendId;
    if (isInbound) {
      throw createError({ statusCode: 409, data: { code: "INBOUND_PENDING" }, message: "\u76F8\u624B\u304B\u3089\u30D5\u30EC\u30F3\u30C9\u7533\u8ACB\u304C\u5C4A\u3044\u3066\u3044\u307E\u3059" });
    }
    await db.update(friends).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(friends.id, existing.id));
    return { success: true, reSent: true };
  }
  await db.insert(friends).values({
    id: randomUUID(),
    userId: user.id,
    friendId,
    status: "pending"
  });
  return { success: true, reSent: false };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
