import { d as defineEventHandler, i as getRouterParam, x as getCurrentUser, a as db, b as posts, h as createError, s as serializePosts, a7 as postComments } from '../../../nitro/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const postId = getRouterParam(event, "id");
  const currentUser = await getCurrentUser(event);
  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post) throw createError({ statusCode: 404, message: "\u6295\u7A3F\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const [result] = await serializePosts([post], currentUser);
  const comments = await db.query.postComments.findMany({
    where: eq(postComments.postId, postId),
    orderBy: (t, { asc }) => [asc(t.createdAt)]
  });
  const userIds = [...new Set(comments.map((c) => c.userId))];
  const users = userIds.length ? await db.query.users.findMany({ where: (u, { inArray }) => inArray(u.id, userIds) }) : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const commentsWithUser = comments.map((c) => ({ ...c, user: userMap[c.userId] || null }));
  return { post: result, comments: commentsWithUser };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
