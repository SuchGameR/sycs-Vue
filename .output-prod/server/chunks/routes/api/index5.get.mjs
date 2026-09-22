import { d as defineEventHandler, r as requireAuth, a as db, a6 as serverMembers, a5 as servers } from '../../nitro/nitro.mjs';
import { eq, inArray } from 'drizzle-orm';
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

const index_get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const memberships = await db.query.serverMembers.findMany({
    where: eq(serverMembers.userId, user.id),
    columns: { serverId: true }
  });
  if (!memberships.length) return { servers: [] };
  const serverIds = memberships.map((m) => m.serverId);
  const servers$1 = await db.query.servers.findMany({
    where: inArray(servers.id, serverIds)
  });
  return { servers: servers$1 };
});

export { index_get as default };
//# sourceMappingURL=index5.get.mjs.map
