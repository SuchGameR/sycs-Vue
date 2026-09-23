import { c as defineEventHandler, n as getRouterParam, g as getQuery, E as getCurrentUser, e as db, aj as postComments, o as users, G as enrichUsers, a0 as publicUser, ap as parseAttachments } from '../../../../_/nitro.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const index_get = defineEventHandler(async (event) => {
  const postId = getRouterParam(event, "id");
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const offset = Number(query.offset) || 0;
  await getCurrentUser(event);
  const comments = await db.query.postComments.findMany({
    where: eq(postComments.postId, postId),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
    limit,
    offset
  });
  const userIds = [...new Set(comments.map((c) => c.userId))];
  const users$1 = userIds.length ? await db.query.users.findMany({ where: inArray(users.id, userIds) }) : [];
  const userMap = Object.fromEntries(users$1.map((u) => [u.id, u]));
  const extras = await enrichUsers(users$1);
  return {
    comments: comments.map((c) => ({
      ...c,
      attachments: parseAttachments(c.attachments),
      user: userMap[c.userId] ? publicUser(userMap[c.userId], extras[c.userId]) : null
    })),
    nextOffset: offset + comments.length,
    hasMore: comments.length === limit
  };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
