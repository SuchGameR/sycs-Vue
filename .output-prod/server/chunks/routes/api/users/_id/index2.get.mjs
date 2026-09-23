import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, al as friends, o as users } from '../../../../_/nitro.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const index_get = defineEventHandler(async (event) => {
  await requireAuth(event);
  const userId = getRouterParam(event, "id");
  const friendList = await db.query.friends.findMany({
    where: and(
      or(eq(friends.userId, userId), eq(friends.friendId, userId)),
      eq(friends.status, "accepted")
    )
  });
  const userIds = friendList.map((f) => f.userId === userId ? f.friendId : f.userId);
  const users$1 = await db.query.users.findMany({
    where: inArray(users.id, userIds)
  });
  return { friends: users$1 };
});

export { index_get as default };
//# sourceMappingURL=index2.get.mjs.map
