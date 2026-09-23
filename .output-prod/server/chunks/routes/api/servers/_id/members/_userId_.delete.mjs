import { c as defineEventHandler, n as getRouterParam, aw as requireServerPermission, m as createError, e as db, ai as serverMembers, U as broadcast, ax as PERMISSIONS } from '../../../../../_/nitro.mjs';
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

const _userId__delete = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  const memberUserId = getRouterParam(event, "userId");
  const ctx = await requireServerPermission(event, serverId, PERMISSIONS.KICK_MEMBERS, "\u30E1\u30F3\u30D0\u30FC\u3092\u30AD\u30C3\u30AF\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  if (memberUserId === ctx.server.ownerId) {
    throw createError({ statusCode: 400, message: "\u30B5\u30FC\u30D0\u30FC\u6240\u6709\u8005\u3092\u30AD\u30C3\u30AF\u3067\u304D\u307E\u305B\u3093" });
  }
  await db.delete(serverMembers).where(
    and(eq(serverMembers.serverId, serverId), eq(serverMembers.userId, memberUserId))
  );
  broadcast({ type: "server.updated", serverId, kickedUserId: memberUserId });
  return { success: true };
});

export { _userId__delete as default };
//# sourceMappingURL=_userId_.delete.mjs.map
