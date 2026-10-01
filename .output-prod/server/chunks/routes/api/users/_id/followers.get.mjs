import { d as defineEventHandler, i as getRouterParam, a as db, ab as follows, u as users, A as enrichUsers, S as pickPublicSummary } from '../../../../nitro/nitro.mjs';
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

const followers_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const follows$1 = await db.query.follows.findMany({
    where: eq(follows.followingId, id),
    columns: { followerId: true },
    orderBy: (f, { desc }) => [desc(f.createdAt)]
  });
  const ids = follows$1.map((f) => f.followerId);
  if (!ids.length) return { followers: [] };
  const users$1 = await db.query.users.findMany({ where: inArray(users.id, ids) });
  const byId = new Map(users$1.map((u) => [u.id, u]));
  const extras = await enrichUsers(users$1);
  const followers = ids.map((uid) => byId.get(uid)).filter(Boolean).map((u) => {
    const e = extras[u.id];
    return { ...pickPublicSummary(u), badges: (e == null ? void 0 : e.badges) || [], title: (e == null ? void 0 : e.title) || null };
  });
  return { followers };
});

export { followers_get as default };
//# sourceMappingURL=followers.get.mjs.map
