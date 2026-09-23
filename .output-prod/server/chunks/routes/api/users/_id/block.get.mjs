import { c as defineEventHandler, r as requireAuth, n as getRouterParam, Z as getBlockRelation } from '../../../../_/nitro.mjs';
import 'crypto';
import 'drizzle-orm';
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

const block_get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const targetId = getRouterParam(event, "id");
  const rel = await getBlockRelation(user.id, targetId);
  return rel;
});

export { block_get as default };
//# sourceMappingURL=block.get.mjs.map
