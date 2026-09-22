import { d as defineEventHandler, i as getRouterParam, j as readBody, ak as requireServerPermission, h as createError, a as db, a5 as servers, L as broadcast, al as PERMISSIONS } from '../../../nitro/nitro.mjs';
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

const index_put = defineEventHandler(async (event) => {
  var _a;
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  await requireServerPermission(event, id, PERMISSIONS.MANAGE_SERVER, "\u30B5\u30FC\u30D0\u30FC\u8A2D\u5B9A\u3092\u5909\u66F4\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  if (body.name !== void 0 && !((_a = body.name) == null ? void 0 : _a.trim())) {
    throw createError({ statusCode: 400, message: "\u30B5\u30FC\u30D0\u30FC\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  const updates = {};
  if (body.name !== void 0) updates.name = body.name.trim();
  if (body.description !== void 0) updates.description = body.description;
  if (body.iconUrl !== void 0) updates.iconUrl = body.iconUrl || null;
  if (body.bannerUrl !== void 0) updates.bannerUrl = body.bannerUrl || null;
  if (body.isPublic !== void 0) updates.isPublic = !!body.isPublic;
  updates.updatedAt = /* @__PURE__ */ new Date();
  const [updated] = await db.update(servers).set(updates).where(eq(servers.id, id)).returning();
  broadcast({ type: "server.updated", serverId: id });
  return { server: updated };
});

export { index_put as default };
//# sourceMappingURL=index.put.mjs.map
