import { c as defineEventHandler, r as requireAuth, n as getRouterParam, m as createError, e as db, o as users, aH as userBlocks } from '../../../../_/nitro.mjs';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
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

const block_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const targetId = getRouterParam(event, "id");
  if (!targetId || targetId === user.id) throw createError({ statusCode: 400, message: "\u81EA\u5206\u81EA\u8EAB\u3092\u30D6\u30ED\u30C3\u30AF\u3067\u304D\u307E\u305B\u3093" });
  const target = await db.query.users.findFirst({
    where: eq(users.id, targetId),
    columns: { id: true }
  });
  if (!target) throw createError({ statusCode: 404, message: "\u30E6\u30FC\u30B6\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  await db.insert(userBlocks).values({ id: randomUUID(), userId: user.id, blockedId: targetId }).onConflictDoNothing({ target: [userBlocks.userId, userBlocks.blockedId] });
  return { blocked: true };
});

export { block_post as default };
//# sourceMappingURL=block.post.mjs.map
