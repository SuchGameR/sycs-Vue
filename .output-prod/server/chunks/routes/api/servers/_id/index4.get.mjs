import { c as defineEventHandler, n as getRouterParam, e as db, aA as serverRoles } from '../../../../_/nitro.mjs';
import { desc, eq } from 'drizzle-orm';
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

const index_get = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  const roles = await db.query.serverRoles.findMany({
    where: eq(serverRoles.serverId, serverId),
    orderBy: [desc(serverRoles.position)]
  });
  return { roles };
});

export { index_get as default };
//# sourceMappingURL=index4.get.mjs.map
