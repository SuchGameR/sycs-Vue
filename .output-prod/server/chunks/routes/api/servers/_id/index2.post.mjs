import { d as defineEventHandler, i as getRouterParam, j as readBody, ak as requireServerPermission, a as db, a4 as serverInvites, h as createError, L as broadcast, al as PERMISSIONS } from '../../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  var _a, _b;
  const serverId = getRouterParam(event, "id");
  const body = await readBody(event);
  const ctx = await requireServerPermission(event, serverId, PERMISSIONS.CREATE_INVITE, "\u62DB\u5F85\u3092\u4F5C\u6210\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const code = ((_a = body.code) == null ? void 0 : _a.trim()) && String(body.code).trim().slice(0, 32) || randomUUID().replace(/-/g, "").slice(0, 8);
  const existing = await db.query.serverInvites.findFirst({ where: eq(serverInvites.code, code) });
  if (existing) throw createError({ statusCode: 409, message: "\u305D\u306E\u62DB\u5F85\u30B3\u30FC\u30C9\u306F\u65E2\u306B\u4F7F\u7528\u3055\u308C\u3066\u3044\u307E\u3059" });
  let expiresAt = null;
  if (body.expiresInHours && Number(body.expiresInHours) > 0) {
    expiresAt = new Date(Date.now() + Number(body.expiresInHours) * 60 * 60 * 1e3);
  } else if (body.expiresAt) {
    expiresAt = new Date(body.expiresAt);
  }
  const [invite] = await db.insert(serverInvites).values({
    id: randomUUID(),
    serverId,
    code,
    createdBy: ctx.isOwner ? ctx.server.ownerId : (_b = ctx.member) == null ? void 0 : _b.userId,
    maxUses: Math.max(0, Number(body.maxUses) || 0),
    useCount: 0,
    expiresAt
  }).returning();
  broadcast({ type: "server.updated", serverId });
  return { invite };
});

export { index_post as default };
//# sourceMappingURL=index2.post.mjs.map
