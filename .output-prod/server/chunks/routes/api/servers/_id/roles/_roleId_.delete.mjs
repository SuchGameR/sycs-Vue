import { d as defineEventHandler, i as getRouterParam, ak as requireServerPermission, a as db, ao as serverRoles, h as createError, a6 as serverMembers, L as broadcast, al as PERMISSIONS } from '../../../../../nitro/nitro.mjs';
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
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';

const _roleId__delete = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  const roleId = getRouterParam(event, "roleId");
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_ROLES, "\u30ED\u30FC\u30EB\u3092\u7BA1\u7406\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const role = await db.query.serverRoles.findFirst({
    where: and(
      eq(serverRoles.id, roleId),
      eq(serverRoles.serverId, serverId)
    )
  });
  if (!role) throw createError({ statusCode: 404, message: "\u30ED\u30FC\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (role.isAdmin) throw createError({ statusCode: 400, message: "\u7BA1\u7406\u8005\u30ED\u30FC\u30EB\u306F\u524A\u9664\u3067\u304D\u307E\u305B\u3093" });
  await db.update(serverMembers).set({ roleId: null }).where(eq(serverMembers.roleId, roleId));
  await db.delete(serverRoles).where(
    and(eq(serverRoles.id, roleId), eq(serverRoles.serverId, serverId))
  );
  broadcast({ type: "server.updated", serverId });
  return { success: true };
});

export { _roleId__delete as default };
//# sourceMappingURL=_roleId_.delete.mjs.map
