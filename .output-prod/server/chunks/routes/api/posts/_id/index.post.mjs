import { d as defineEventHandler, r as requireAuth, i as getRouterParam, j as readBody, ae as normalizeAttachments, h as createError, a as db, b as posts, a7 as postComments, z as enrichUsers, Q as publicUser, L as broadcast } from '../../../../nitro/nitro.mjs';
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
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';

const index_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const postId = getRouterParam(event, "id");
  const body = await readBody(event);
  const content = String(body.content || "").trim();
  const attachments = normalizeAttachments(body.attachments);
  if (!content && !attachments.length) throw createError({ statusCode: 400, message: "\u30B3\u30E1\u30F3\u30C8\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  if (content.length > 2e3) throw createError({ statusCode: 400, message: "\u30B3\u30E1\u30F3\u30C8\u304C\u9577\u3059\u304E\u307E\u3059" });
  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post) throw createError({ statusCode: 404, message: "\u6295\u7A3F\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const [comment] = await db.insert(postComments).values({
    id: randomUUID(),
    postId,
    userId: user.id,
    content,
    attachments: JSON.stringify(attachments)
  }).returning();
  const extras = await enrichUsers([user]);
  const commentWithUser = {
    ...comment,
    attachments,
    user: publicUser({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    }, extras[user.id])
  };
  broadcast({ type: "comment.new", postId, comment: commentWithUser });
  return { comment: commentWithUser };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
