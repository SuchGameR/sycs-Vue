import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, f as posts, m as createError } from '../../../_/nitro.mjs';
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

const _id__delete = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, "id");
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!post) throw createError({ statusCode: 404, message: "\u6295\u7A3F\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (post.userId !== user.id) throw createError({ statusCode: 403 });
  await db.delete(posts).where(eq(posts.id, id));
  return { success: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
