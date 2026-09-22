import { d as defineEventHandler, r as requireAuth, i as getRouterParam, a as db, ag as closeFriends, u as users } from '../../../../nitro/nitro.mjs';
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
