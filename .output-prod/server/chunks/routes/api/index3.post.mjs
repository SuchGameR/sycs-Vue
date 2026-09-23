import { c as defineEventHandler, r as requireAuth, q as readBody, m as createError, as as isServerMember, e as db, au as serverChannels, f as posts, a9 as urlToFilePath, av as saveFileWithWatermark, ao as postAttachments, ar as emit } from '../../_/nitro.mjs';
import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import { and, eq } from 'drizzle-orm';
import 'jose';
import 'bcryptjs';
import 'fs';
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

const IMAGE_EXTENSIONS = [".png", ".jpeg", ".jpg", ".gif", ".webp"];
const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const user = await requireAuth(event);
  const body = await readBody(event);
  if (!((_a = body.content) == null ? void 0 : _a.trim()) && !((_b = body.attachments) == null ? void 0 : _b.length) && !body.quotedPostId) {
    throw createError({ statusCode: 400, message: "\u672C\u6587\u307E\u305F\u306F\u30D5\u30A1\u30A4\u30EB\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  const postId = randomUUID();
  let serverId = null;
  let channelId = null;
  if (body.serverId) {
    serverId = String(body.serverId);
    const member = await isServerMember(user.id, serverId);
    if (!member) throw createError({ statusCode: 403, message: "\u3053\u306E\u30B5\u30FC\u30D0\u30FC\u306E\u30E1\u30F3\u30D0\u30FC\u3067\u306F\u3042\u308A\u307E\u305B\u3093" });
    if (body.channelId) {
      channelId = String(body.channelId);
      const channel = await db.query.serverChannels.findFirst({
        where: and(eq(serverChannels.id, channelId), eq(serverChannels.serverId, serverId))
      });
      if (!channel) throw createError({ statusCode: 404, message: "\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
    }
  }
  const [post] = await db.insert(posts).values({
    id: postId,
    userId: user.id,
    content: body.content || "",
    imageUrl: body.imageUrl || null,
    visibility: body.visibility || "public",
    visibleTo: body.visibleTo ? JSON.stringify(body.visibleTo) : "[]",
    quotedPostId: body.quotedPostId ? String(body.quotedPostId) : null,
    serverId,
    channelId
  }).returning();
  const values = [];
  if ((_c = body.attachments) == null ? void 0 : _c.length) {
    for (const [i, a] of body.attachments.entries()) {
      const ext = extname(a.url).toLowerCase();
      let url = a.url;
      let blurUrl = a.blur && a.blurUrl || null;
      let originalUrl = a.originalUrl || null;
      let originalName = a.originalName || null;
      if (a.watermark && IMAGE_EXTENSIONS.includes(ext)) {
        try {
          const srcUrl = a.originalUrl && !a.originalUrl.endsWith("/uploads/") && a.originalUrl.startsWith("/uploads/") ? a.originalUrl : a.url;
          const filePath = urlToFilePath(srcUrl);
          const buffer = await readFile(filePath);
          const { url: newUrl, blurUrl: newBlur } = await saveFileWithWatermark(
            buffer,
            `wm_${srcUrl.replace("/uploads/", "")}`,
            user.username
          );
          url = newUrl;
          originalUrl = null;
          originalName = null;
          if (a.blur) {
            blurUrl = newBlur;
          }
        } catch (e) {
          console.error("[Watermark] Application failed for", a.url, ":", e);
        }
      }
      values.push({
        id: randomUUID(),
        postId,
        url,
        blurUrl,
        originalUrl,
        originalName,
        type: a.type || "image",
        mime: a.mime || a.type || "image/png",
        position: i
      });
    }
    await db.insert(postAttachments).values(values);
  }
  const postWithUser = { ...post, user, attachments: values, liked: false, reposted: false, bookmarked: false };
  emit("post:created", { post: postWithUser });
  return { post: postWithUser };
});

export { index_post as default };
//# sourceMappingURL=index3.post.mjs.map
