import { c as defineEventHandler, n as getRouterParam, q as readBody, aw as requireServerPermission, e as db, aA as serverRoles, m as createError, U as broadcast, aB as ALL_PERMISSIONS_MASK, ax as PERMISSIONS } from '../../../../../_/nitro.mjs';
import { and, eq } from 'drizzle-orm';
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

const _roleId__put = defineEventHandler(async (event) => {
  var _a;
  const serverId = getRouterParam(event, "id");
  const roleId = getRouterParam(event, "roleId");
  const body = await readBody(event);
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_ROLES, "\u30ED\u30FC\u30EB\u3092\u7BA1\u7406\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const role = await db.query.serverRoles.findFirst({
    where: and(
      eq(serverRoles.id, roleId),
      eq(serverRoles.serverId, serverId)
    )
  });
  if (!role) throw createError({ statusCode: 404, message: "\u30ED\u30FC\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (body.name !== void 0 && !((_a = body.name) == null ? void 0 : _a.trim())) {
    throw createError({ statusCode: 400, message: "\u30ED\u30FC\u30EB\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  const updates = {};
  if (body.name !== void 0) updates.name = body.name.trim();
  if (body.color !== void 0) updates.color = body.color;
  if (body.position !== void 0) updates.position = body.position;
  if (body.permissions !== void 0) updates.permissions = body.permissions;
  if (body.permissionsMask !== void 0) {
    const mask = Number(body.permissionsMask) || 0;
    updates.permissionsMask = mask;
    updates.isAdmin = false;
    updates.permissions = "";
  }
  if (body.isAdmin !== void 0) {
    if (role.isAdmin && body.isAdmin === false) {
      throw createError({ statusCode: 400, message: "\u7BA1\u7406\u8005\u30ED\u30FC\u30EB\u306E\u7BA1\u7406\u8005\u6A29\u9650\u306F\u89E3\u9664\u3067\u304D\u307E\u305B\u3093" });
    }
    updates.isAdmin = !!body.isAdmin;
    if (body.isAdmin) {
      updates.permissionsMask = ALL_PERMISSIONS_MASK;
      updates.permissions = "all";
    }
  }
  const [updated] = await db.update(serverRoles).set(updates).where(and(eq(serverRoles.id, roleId), eq(serverRoles.serverId, serverId))).returning();
  broadcast({ type: "server.updated", serverId });
  return { role: updated };
});

export { _roleId__put as default };
//# sourceMappingURL=_roleId_.put.mjs.map
