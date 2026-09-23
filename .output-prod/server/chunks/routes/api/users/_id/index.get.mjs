import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, at as closeFriends, o as users } from '../../../../_/nitro.mjs';
import { eq, inArray } from 'drizzle-orm';
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
  const list = await db.query.closeFriends.findMany({
    where: eq(closeFriends.userId, userId),
    columns: { friendId: true }
  });
  const friendIds = list.map((cf) => cf.friendId);
  const closeFriends$1 = friendIds.length ? await db.query.users.findMany({ where: inArray(users.id, friendIds) }) : [];
  return { closeFriends: closeFriends$1 };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
