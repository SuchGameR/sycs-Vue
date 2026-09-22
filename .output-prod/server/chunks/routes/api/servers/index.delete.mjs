import { d as defineEventHandler, r as requireAuth, i as getRouterParam, a as db, a5 as servers, h as createError, L as broadcast } from '../../../nitro/nitro.mjs';
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
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';

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
