import { d as defineEventHandler, i as getRouterParam, a as db, ah as serverChannels } from '../../../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  const channels = await db.query.serverChannels.findMany({
    where: eq(serverChannels.serverId, serverId),
    orderBy: (channels2, { asc }) => [asc(channels2.position)]
  });
  return { channels };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
