import { d as defineEventHandler, r as requireAuth, i as getRouterParam, a as db, aa as playlists, h as createError, ab as playlistItems, b as posts, s as serializePosts } from '../../../nitro/nitro.mjs';
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
  const user = await requireAuth(event);
  const id = getRouterParam(event, "id");
  const playlist = await db.query.playlists.findFirst({ where: eq(playlists.id, id) });
  if (!playlist) throw createError({ statusCode: 404, message: "\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (playlist.userId !== user.id) throw createError({ statusCode: 403, message: "\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093" });
  const items = await db.query.playlistItems.findMany({
    where: eq(playlistItems.playlistId, id),
    orderBy: [playlistItems.position]
  });
  const postIds = items.map((i) => i.postId);
  let posts$1 = [];
  if (postIds.length) {
    const rows = await db.query.posts.findMany({ where: inArray(posts.id, postIds) });
    const map = Object.fromEntries(rows.map((p) => [p.id, p]));
    const ordered = postIds.map((pid) => map[pid]).filter(Boolean);
    posts$1 = await serializePosts(ordered, user);
  }
  return { playlist: { ...playlist, count: posts$1.length }, posts: posts$1 };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
