import { c as defineEventHandler, n as getRouterParam, q as readBody, m as createError, aw as requireServerPermission, e as db, aA as serverRoles, U as broadcast, ax as PERMISSIONS } from '../../../../_/nitro.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const DEFAULT_ROLE_MASK = PERMISSIONS.VIEW_CHANNEL | PERMISSIONS.SEND_MESSAGES;
const index_post = defineEventHandler(async (event) => {
  var _a, _b;
  const serverId = getRouterParam(event, "id");
  const body = await readBody(event);
  if (!((_a = body.name) == null ? void 0 : _a.trim())) throw createError({ statusCode: 400, message: "\u30ED\u30FC\u30EB\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_ROLES, "\u30ED\u30FC\u30EB\u3092\u7BA1\u7406\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const existing = await db.query.serverRoles.findMany({ where: eq(serverRoles.serverId, serverId) });
  const [role] = await db.insert(serverRoles).values({
    id: randomUUID(),
    serverId,
    name: body.name.trim(),
    color: body.color || "#99aab5",
    position: (_b = body.position) != null ? _b : existing.length,
    permissions: body.permissions || "",
    permissionsMask: typeof body.permissionsMask === "number" ? body.permissionsMask : DEFAULT_ROLE_MASK,
    isAdmin: !!body.isAdmin
  }).returning();
  broadcast({ type: "server.updated", serverId });
  return { role };
});

export { index_post as default };
//# sourceMappingURL=index3.post.mjs.map
