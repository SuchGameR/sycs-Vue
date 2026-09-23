import { c as defineEventHandler, n as getRouterParam, e as db, o as users, m as createError, ak as follows, f as posts, G as enrichUsers, a0 as publicUser } from '../../../../_/nitro.mjs';
import { eq, count } from 'drizzle-orm';
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

const _username__get = defineEventHandler(async (event) => {
  const username = getRouterParam(event, "username");
  const user = await db.query.users.findFirst({ where: eq(users.username, username) });
  if (!user) throw createError({ statusCode: 404, message: "\u30E6\u30FC\u30B6\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const [followers] = await db.select({ count: count() }).from(follows).where(eq(follows.followingId, user.id));
  const [following] = await db.select({ count: count() }).from(follows).where(eq(follows.followerId, user.id));
  const [postsCount] = await db.select({ count: count() }).from(posts).where(eq(posts.userId, user.id));
  const extras = await enrichUsers([user]);
  return { user: publicUser(user, extras[user.id]), stats: { followers: followers.count, following: following.count, posts: postsCount.count } };
});

export { _username__get as default };
//# sourceMappingURL=_username_.get.mjs.map
