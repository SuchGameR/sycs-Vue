import { d as defineEventHandler, r as requireAuth, i as getRouterParam, j as readBody, h as createError, a as db, aa as playlists, b as posts, ab as playlistItems } from '../../../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
import { eq, max } from 'drizzle-orm';
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

const items_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const postId = String((body == null ? void 0 : body.postId) || "");
  if (!postId) throw createError({ statusCode: 400, message: "postId \u304C\u5FC5\u8981\u3067\u3059" });
  const playlist = await db.query.playlists.findFirst({ where: eq(playlists.id, id) });
  if (!playlist) throw createError({ statusCode: 404, message: "\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (playlist.userId !== user.id) throw createError({ statusCode: 403, message: "\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093" });
  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId), columns: { id: true } });
  if (!post) throw createError({ statusCode: 404, message: "\u6295\u7A3F\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const [{ value: lastPos }] = await db.select({ value: max(playlistItems.position) }).from(playlistItems).where(eq(playlistItems.playlistId, id));
  await db.insert(playlistItems).values({
    id: randomUUID(),
    playlistId: id,
    postId,
    position: (lastPos != null ? lastPos : -1) + 1
  }).onConflictDoNothing();
  await db.update(playlists).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(playlists.id, id));
  return { success: true };
});

export { items_post as default };
//# sourceMappingURL=items.post.mjs.map
