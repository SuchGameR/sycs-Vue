import { d as defineEventHandler, r as requireAuth, i as getRouterParam, a as db, ag as closeFriends } from '../../../../../nitro/nitro.mjs';
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

const delete_delete = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const friendId = getRouterParam(event, "id");
  await db.delete(closeFriends).where(
    and(eq(closeFriends.userId, user.id), eq(closeFriends.friendId, friendId))
  );
  return { success: true };
});

export { delete_delete as default };
//# sourceMappingURL=delete.delete.mjs.map
