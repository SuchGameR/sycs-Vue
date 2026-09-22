import { d as defineEventHandler, i as getRouterParam, ak as requireServerPermission, a as db, a4 as serverInvites, h as createError, L as broadcast, al as PERMISSIONS } from '../../../../../nitro/nitro.mjs';
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

const _inviteId__delete = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  const inviteId = getRouterParam(event, "inviteId");
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_INVITES, "\u62DB\u5F85\u3092\u7BA1\u7406\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const invite = await db.query.serverInvites.findFirst({
    where: and(
      eq(serverInvites.id, inviteId),
      eq(serverInvites.serverId, serverId)
    )
  });
  if (!invite) throw createError({ statusCode: 404, message: "\u62DB\u5F85\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  await db.delete(serverInvites).where(
    and(eq(serverInvites.id, inviteId), eq(serverInvites.serverId, serverId))
  );
  broadcast({ type: "server.updated", serverId });
  return { success: true };
});

export { _inviteId__delete as default };
//# sourceMappingURL=_inviteId_.delete.mjs.map
