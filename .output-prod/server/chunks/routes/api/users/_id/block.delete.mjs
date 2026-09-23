import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, aH as userBlocks } from '../../../../_/nitro.mjs';
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

const block_delete = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const targetId = getRouterParam(event, "id");
  await db.delete(userBlocks).where(and(eq(userBlocks.userId, user.id), eq(userBlocks.blockedId, targetId)));
  return { blocked: false };
});

export { block_delete as default };
//# sourceMappingURL=block.delete.mjs.map
