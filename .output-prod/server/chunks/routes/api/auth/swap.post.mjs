import { c as defineEventHandler, q as readBody, m as createError, K as verifyToken, e as db, o as users, z as setAuthCookie, L as clearClientTokenCookie } from '../../../_/nitro.mjs';
import { eq } from 'drizzle-orm';
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

const swap_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { token } = body;
  if (!token || typeof token !== "string") {
    throw createError({ statusCode: 400, message: "\u30C8\u30FC\u30AF\u30F3\u304C\u5FC5\u8981\u3067\u3059" });
  }
  const payload = await verifyToken(token);
  if (!(payload == null ? void 0 : payload.userId)) {
    throw createError({ statusCode: 401, message: "\u3053\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u306E\u30BB\u30C3\u30B7\u30E7\u30F3\u306F\u671F\u9650\u5207\u308C\u3067\u3059\u3002\u518D\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  const user = await db.query.users.findFirst({ where: eq(users.id, payload.userId) });
  if (!user) {
    throw createError({ statusCode: 401, message: "\u30A2\u30AB\u30A6\u30F3\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3067\u3057\u305F" });
  }
  const remember = !!payload.remember;
  setAuthCookie(event, token, remember);
  clearClientTokenCookie(event);
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      bio: user.bio,
      settings: user.settings || "{}"
    }
  };
});

export { swap_post as default };
//# sourceMappingURL=swap.post.mjs.map
