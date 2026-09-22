import { d as defineEventHandler, r as requireAuth, j as readBody, h as createError, a as db, D as bookmarks } from '../../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
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

const toggle_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const { postId } = await readBody(event);
  if (!postId) throw createError({ statusCode: 400 });
  const existing = await db.query.bookmarks.findFirst({
    where: and(eq(bookmarks.userId, user.id), eq(bookmarks.postId, postId))
  });
  if (existing) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing.id));
    return { bookmarked: false };
  }
  await db.insert(bookmarks).values({ id: randomUUID(), userId: user.id, postId });
  return { bookmarked: true };
});

export { toggle_post as default };
//# sourceMappingURL=toggle.post.mjs.map
