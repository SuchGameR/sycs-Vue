import { d as defineEventHandler, r as requireAuth, i as getRouterParam, j as readBody, h as createError, a as db, b as posts, c as postReactions, L as broadcast } from '../../../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
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

const reactions_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const postId = getRouterParam(event, "id");
  const body = await readBody(event);
  const emoji = String(body.emoji || "").trim().slice(0, 16);
  if (!emoji) throw createError({ statusCode: 400, message: "\u7D75\u6587\u5B57\u3092\u6307\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044" });
  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post) throw createError({ statusCode: 404, message: "\u6295\u7A3F\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const existing = await db.query.postReactions.findFirst({
    where: and(
      eq(postReactions.postId, postId),
      eq(postReactions.userId, user.id),
      eq(postReactions.emoji, emoji)
    )
  });
  let active;
  if (existing) {
    await db.delete(postReactions).where(eq(postReactions.id, existing.id));
    active = false;
  } else {
    await db.insert(postReactions).values({
      id: randomUUID(),
      postId,
      userId: user.id,
      emoji
    });
    active = true;
  }
  broadcast({
    type: "reaction.update",
    postId,
    emoji,
    userId: user.id,
    active
  });
  return { active };
});

export { reactions_post as default };
//# sourceMappingURL=reactions.post.mjs.map
