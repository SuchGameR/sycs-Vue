import { d as defineEventHandler, r as requireAuth, j as readBody, h as createError, a as db, aa as playlists } from '../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
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
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';

const index_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  const name = String((body == null ? void 0 : body.name) || "").trim();
  const description = (body == null ? void 0 : body.description) ? String(body.description).trim() : null;
  if (!name || name.length > 60) {
    throw createError({ statusCode: 400, message: "\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u540D\u306F1\u301C60\u6587\u5B57\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  const [playlist] = await db.insert(playlists).values({
    id: randomUUID(),
    userId: user.id,
    name,
    description
  }).returning();
  return { playlist: { ...playlist, count: 0, coverUrl: null } };
});

export { index_post as default };
//# sourceMappingURL=index2.post.mjs.map
