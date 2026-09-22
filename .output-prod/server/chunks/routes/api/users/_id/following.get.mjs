import { d as defineEventHandler, i as getRouterParam, a as db, a8 as follows, u as users } from '../../../../nitro/nitro.mjs';
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

const following_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const follows$1 = await db.query.follows.findMany({
    where: eq(follows.followerId, id),
    columns: { followingId: true }
  });
  const followingIds = follows$1.map((f) => f.followingId);
  const following = followingIds.length ? await db.query.users.findMany({ where: inArray(users.id, followingIds) }) : [];
  return { following };
});

export { following_get as default };
//# sourceMappingURL=following.get.mjs.map
