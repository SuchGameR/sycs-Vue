import { c as defineEventHandler, n as getRouterParam, aE as requireServerPermission, e as db, an as serverInvites, aF as PERMISSIONS } from '../../../../_/nitro.mjs';
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
import 'node:fs/promises';
import 'node:path';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';

const index_get = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_INVITES, "\u62DB\u5F85\u3092\u7BA1\u7406\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const invites = await db.query.serverInvites.findMany({
    where: eq(serverInvites.serverId, serverId),
    orderBy: (t, { desc }) => [desc(t.createdAt)]
  });
  return { invites };
});

export { index_get as default };
//# sourceMappingURL=index2.get.mjs.map
