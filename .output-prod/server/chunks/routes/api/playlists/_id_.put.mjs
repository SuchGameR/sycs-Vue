import { d as defineEventHandler, r as requireAuth, i as getRouterParam, j as readBody, a as db, aa as playlists, h as createError } from '../../../nitro/nitro.mjs';
import { eq, and } from 'drizzle-orm';
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

const _id__put = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const playlist = await db.query.playlists.findFirst({ where: eq(playlists.id, id) });
  if (!playlist) throw createError({ statusCode: 404, message: "\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (playlist.userId !== user.id) throw createError({ statusCode: 403, message: "\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093" });
  const patch = { updatedAt: /* @__PURE__ */ new Date() };
  if ((body == null ? void 0 : body.name) !== void 0) {
    const name = String(body.name).trim();
    if (!name || name.length > 60) throw createError({ statusCode: 400, message: "\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u540D\u306F1\u301C60\u6587\u5B57\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
    patch.name = name;
  }
  if ((body == null ? void 0 : body.description) !== void 0) patch.description = body.description ? String(body.description).trim() : null;
  const [updated] = await db.update(playlists).set(patch).where(and(eq(playlists.id, id), eq(playlists.userId, user.id))).returning();
  return { playlist: updated };
});

export { _id__put as default };
//# sourceMappingURL=_id_.put.mjs.map
