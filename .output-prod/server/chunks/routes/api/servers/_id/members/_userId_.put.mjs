import { d as defineEventHandler, i as getRouterParam, j as readBody, ak as requireServerPermission, a as db, a6 as serverMembers, h as createError, ao as serverRoles, L as broadcast, al as PERMISSIONS } from '../../../../../nitro/nitro.mjs';
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

const _userId__put = defineEventHandler(async (event) => {
  var _a;
  const serverId = getRouterParam(event, "id");
  const memberUserId = getRouterParam(event, "userId");
  const body = await readBody(event);
  const ctx = await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_MEMBERS, "\u30E1\u30F3\u30D0\u30FC\u3092\u7BA1\u7406\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const member = await db.query.serverMembers.findFirst({
    where: and(
      eq(serverMembers.serverId, serverId),
      eq(serverMembers.userId, memberUserId)
    )
  });
  if (!member) throw createError({ statusCode: 404, message: "\u30E1\u30F3\u30D0\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const updates = {};
  if (body.nickname !== void 0) {
    updates.nickname = ((_a = body.nickname) == null ? void 0 : _a.trim()) ? body.nickname.trim() : null;
  }
  if (body.roleId !== void 0) {
    if (ctx.server.ownerId === memberUserId) {
      throw createError({ statusCode: 400, message: "\u30B5\u30FC\u30D0\u30FC\u6240\u6709\u8005\u306E\u30ED\u30FC\u30EB\u306F\u5909\u66F4\u3067\u304D\u307E\u305B\u3093" });
    }
    if (body.roleId) {
      const role = await db.query.serverRoles.findFirst({
        where: and(
          eq(serverRoles.id, body.roleId),
          eq(serverRoles.serverId, serverId)
        )
      });
      if (!role) throw createError({ statusCode: 400, message: "\u30ED\u30FC\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
      if (role.isAdmin) throw createError({ statusCode: 400, message: "\u7BA1\u7406\u8005\u30ED\u30FC\u30EB\u306F\u4ED8\u4E0E\u3067\u304D\u307E\u305B\u3093" });
      updates.roleId = body.roleId;
    } else {
      updates.roleId = null;
    }
  }
  await db.update(serverMembers).set(updates).where(and(
    eq(serverMembers.serverId, serverId),
    eq(serverMembers.userId, memberUserId)
  ));
  broadcast({ type: "server.updated", serverId });
  return { success: true };
});

export { _userId__put as default };
//# sourceMappingURL=_userId_.put.mjs.map
