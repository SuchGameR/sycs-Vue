import { c as defineEventHandler, r as requireAuth, n as getRouterParam, q as readBody, e as db, f as posts, m as createError, ar as emit, U as broadcast, j as reposts } from '../../../../_/nitro.mjs';
import { randomUUID } from 'crypto';
import { eq, and, sql } from 'drizzle-orm';
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

const repost_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const postId = getRouterParam(event, "id");
  const body = await readBody(event).catch(() => ({}));
  const target = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!target) throw createError({ statusCode: 404, message: "\u6295\u7A3F\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const quote = (body == null ? void 0 : body.quote) && typeof body.quote === "string" ? body.quote.trim() : "";
  const actor = { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl };
  if (quote || (body == null ? void 0 : body.quotePost)) {
    if (!quote && !(body == null ? void 0 : body.quotePost)) throw createError({ statusCode: 400, message: "\u5F15\u7528\u306E\u672C\u6587\u304C\u5FC5\u8981\u3067\u3059" });
    const [quotePost] = await db.insert(posts).values({
      id: randomUUID(),
      userId: user.id,
      content: quote,
      visibility: (body == null ? void 0 : body.visibility) || "public",
      visibleTo: (body == null ? void 0 : body.visibleTo) ? JSON.stringify(body.visibleTo) : "[]",
      quotedPostId: postId
    }).returning();
    const postWithUser = { ...quotePost, user, attachments: [], liked: false, reposted: false, bookmarked: false };
    emit("post:created", { post: postWithUser });
    try {
      broadcast({ type: "activity.new", kind: "quote", actorId: user.id, actor, postId, postOwnerId: target.userId });
    } catch {
    }
    return { success: true, quote: { id: quotePost.id, post: postWithUser } };
  }
  const existing = await db.query.reposts.findFirst({
    where: and(eq(reposts.userId, user.id), eq(reposts.postId, postId))
  });
  if (existing) return { success: true };
  await db.insert(reposts).values({ id: randomUUID(), userId: user.id, postId });
  await db.execute(sql`UPDATE posts SET repost_count = repost_count + 1 WHERE id = ${postId}`);
  broadcast({ type: "activity.new", kind: "repost", actorId: user.id, actor, postId, postOwnerId: target.userId });
  return { success: true };
});

export { repost_post as default };
//# sourceMappingURL=repost.post.mjs.map
