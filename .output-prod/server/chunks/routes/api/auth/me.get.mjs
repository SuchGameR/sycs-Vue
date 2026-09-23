import { c as defineEventHandler, E as getCurrentUser, m as createError, F as renewAuthCookie, G as enrichUsers } from '../../../_/nitro.mjs';
import 'crypto';
import 'drizzle-orm';
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

const me_get = defineEventHandler(async (event) => {
  var _a, _b;
  const user = await getCurrentUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: "\u8A8D\u8A3C\u304C\u5FC5\u8981\u3067\u3059" });
  }
  renewAuthCookie(event);
  const extras = await enrichUsers([user]);
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      bio: user.bio,
      settings: user.settings || "{}",
      isPrivate: !!user.isPrivate,
      statusMessage: user.statusMessage || "",
      badges: ((_a = extras[user.id]) == null ? void 0 : _a.badges) || [],
      title: ((_b = extras[user.id]) == null ? void 0 : _b.title) || null,
      createdAt: user.createdAt
    }
  };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
