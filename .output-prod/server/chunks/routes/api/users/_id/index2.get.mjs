import { d as defineEventHandler, r as requireAuth, i as getRouterParam, h as createError, a as db, al as friends, u as users, A as enrichUsers, S as pickPublicSummary } from '../../../../nitro/nitro.mjs';
import { and, or, eq, inArray } from 'drizzle-orm';
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

const index_get = defineEventHandler(async (event) => {
  const me = await requireAuth(event);
  const userId = getRouterParam(event, "id");
  if (userId !== me.id) {
    throw createError({ statusCode: 403, statusMessage: "Cannot view another user's friends" });
  }
  const friendList = await db.query.friends.findMany({
    where: and(
      or(eq(friends.userId, userId), eq(friends.friendId, userId)),
      eq(friends.status, "accepted")
    )
  });
  const userIds = [...new Set(friendList.map((f) => f.userId === userId ? f.friendId : f.userId))];
  const users$1 = await db.query.users.findMany({
    where: inArray(users.id, userIds)
  });
  const extras = await enrichUsers(users$1);
  return {
    friends: users$1.map((u) => {
      var _a, _b;
      return {
        ...pickPublicSummary(u),
        badges: ((_a = extras[u.id]) == null ? void 0 : _a.badges) || [],
        title: ((_b = extras[u.id]) == null ? void 0 : _b.title) || null
      };
    })
  };
});

export { index_get as default };
//# sourceMappingURL=index2.get.mjs.map
