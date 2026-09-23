import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, ah as servers, m as createError, U as broadcast } from '../../../_/nitro.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const index_delete = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, "id");
  const server = await db.query.servers.findFirst({ where: eq(servers.id, id) });
  if (!server) throw createError({ statusCode: 404, message: "\u30B5\u30FC\u30D0\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (server.ownerId !== user.id) throw createError({ statusCode: 403 });
  await db.delete(servers).where(eq(servers.id, id));
  broadcast({ type: "server.deleted", serverId: id });
  return { success: true };
});

export { index_delete as default };
//# sourceMappingURL=index.delete.mjs.map
