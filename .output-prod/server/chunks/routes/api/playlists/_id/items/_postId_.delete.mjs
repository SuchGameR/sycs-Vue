import { d as defineEventHandler, r as requireAuth, i as getRouterParam, a as db, aa as playlists, h as createError, ab as playlistItems } from '../../../../../nitro/nitro.mjs';
import { eq, and } from 'drizzle-orm';
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

const _postId__delete = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, "id");
  const postId = getRouterParam(event, "postId");
  const playlist = await db.query.playlists.findFirst({ where: eq(playlists.id, id) });
  if (!playlist) throw createError({ statusCode: 404, message: "\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (playlist.userId !== user.id) throw createError({ statusCode: 403, message: "\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093" });
  await db.delete(playlistItems).where(and(eq(playlistItems.playlistId, id), eq(playlistItems.postId, postId)));
  await db.update(playlists).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(playlists.id, id));
  return { success: true };
});

export { _postId__delete as default };
//# sourceMappingURL=_postId_.delete.mjs.map
