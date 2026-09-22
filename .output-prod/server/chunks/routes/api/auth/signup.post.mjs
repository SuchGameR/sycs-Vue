import { d as defineEventHandler, m as initDb, j as readBody, h as createError, a as db, u as users, C as hashPassword, o as createSession, q as setAuthCookie } from '../../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
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

const signup_post = defineEventHandler(async (event) => {
  await initDb();
  const body = await readBody(event);
  const { email, username, displayName, password } = body;
  if (!email || !username || !displayName || !password) {
    throw createError({ statusCode: 400, message: "\u5168\u3066\u306E\u5FC5\u9808\u9805\u76EE\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, message: "\u30D1\u30B9\u30EF\u30FC\u30C9\u306F8\u6587\u5B57\u4EE5\u4E0A\u5FC5\u8981\u3067\u3059" });
  }
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });
  if (existingUser) {
    throw createError({ statusCode: 409, message: "\u3053\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u306F\u65E2\u306B\u767B\u9332\u3055\u308C\u3066\u3044\u307E\u3059" });
  }
  const existingUsername = await db.query.users.findFirst({
    where: eq(users.username, username)
  });
  if (existingUsername) {
    throw createError({ statusCode: 409, message: "\u3053\u306E\u30E6\u30FC\u30B6\u30FC\u540D\u306F\u65E2\u306B\u4F7F\u7528\u3055\u308C\u3066\u3044\u307E\u3059" });
  }
  const now = /* @__PURE__ */ new Date();
  const userId = randomUUID();
  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    id: userId,
    email,
    username,
    displayName,
    passwordHash,
    avatarUrl: null,
    bio: "",
    createdAt: now,
    updatedAt: now
  });
  const { token } = await createSession(userId, true);
  setAuthCookie(event, token, true);
  return { user: { id: userId, email, username, displayName } };
});

export { signup_post as default };
//# sourceMappingURL=signup.post.mjs.map
