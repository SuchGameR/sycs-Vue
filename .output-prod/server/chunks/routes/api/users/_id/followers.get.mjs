import { c as defineEventHandler, n as getRouterParam, e as db, ak as follows, o as users } from '../../../../_/nitro.mjs';
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

const followers_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const follows$1 = await db.query.follows.findMany({
    where: eq(follows.followingId, id),
    columns: { followerId: true }
  });
  const followerIds = follows$1.map((f) => f.followerId);
  const followers = followerIds.length ? await db.query.users.findMany({ where: inArray(users.id, followerIds) }) : [];
  return { followers };
});

export { followers_get as default };
//# sourceMappingURL=followers.get.mjs.map
