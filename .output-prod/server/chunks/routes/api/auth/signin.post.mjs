import { c as defineEventHandler, w as initDb, q as readBody, m as createError, e as db, o as users, H as verifyPassword, y as createSession, z as setAuthCookie, A as setClientTokenCookie } from '../../../_/nitro.mjs';
import { or, eq } from 'drizzle-orm';
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

const signin_post = defineEventHandler(async (event) => {
  await initDb();
  const body = await readBody(event);
  const { email, password, rememberMe } = body;
  if (!email || !password) {
    throw createError({ statusCode: 400, message: "\u30E6\u30FC\u30B6\u30FCID\u307E\u305F\u306F\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3068\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  const login = String(email).trim().toLowerCase();
  const user = await db.query.users.findFirst({
    where: or(
      eq(users.email, email),
      eq(users.username, login)
    )
  });
  if (!user || !user.passwordHash) {
    throw createError({ statusCode: 401, message: "\u30E6\u30FC\u30B6\u30FCID\u307E\u305F\u306F\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3001\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093" });
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw createError({ statusCode: 401, message: "\u30E6\u30FC\u30B6\u30FCID\u307E\u305F\u306F\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3001\u30D1\u30B9\u30EF\u30FC\u30C9\u304C\u6B63\u3057\u304F\u3042\u308A\u307E\u305B\u3093" });
  }
  const { token } = await createSession(user.id, rememberMe);
  setAuthCookie(event, token, rememberMe);
  setClientTokenCookie(event, token, rememberMe);
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio
    },
    token
  };
});

export { signin_post as default };
//# sourceMappingURL=signin.post.mjs.map
