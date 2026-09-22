import { d as defineEventHandler, r as requireAuth, _ as readMultipartFormData, h as createError, aq as validateFile, as as saveAvatar, a as db, u as users } from '../../../nitro/nitro.mjs';
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
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';

const avatar_post = defineEventHandler(async (event) => {
  var _a;
  const user = await requireAuth(event);
  const body = await readMultipartFormData(event);
  if (!(body == null ? void 0 : body.length)) throw createError({ statusCode: 400, message: "\u30D5\u30A1\u30A4\u30EB\u304C\u3042\u308A\u307E\u305B\u3093" });
  const file = body.find((p) => p.filename && p.data);
  if (!file) throw createError({ statusCode: 400 });
  validateFile(file.filename, file.type || "", file.data);
  if (!((_a = file.type) == null ? void 0 : _a.startsWith("image/"))) {
    throw createError({ statusCode: 400, message: "\u753B\u50CF\u30D5\u30A1\u30A4\u30EB\u306E\u307F\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u53EF\u80FD\u3067\u3059" });
  }
  if (file.data.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, message: "\u30A2\u30D0\u30BF\u30FC\u306F5MB\u4EE5\u4E0B\u306B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  const url = await saveAvatar(file.data, file.filename);
  await db.update(users).set({ avatarUrl: url }).where(eq(users.id, user.id));
  return { url };
});

export { avatar_post as default };
//# sourceMappingURL=avatar.post.mjs.map
