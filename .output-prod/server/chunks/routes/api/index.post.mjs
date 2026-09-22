import { d as defineEventHandler, r as requireAuth, _ as readMultipartFormData, h as createError, a as db, Y as customEmojis, $ as validateEmojiFile, a0 as saveEmoji, L as broadcast } from '../../nitro/nitro.mjs';
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

const NAME_RE = /^[a-z0-9_]{2,32}$/;
const index_post = defineEventHandler(async (event) => {
  var _a;
  const user = await requireAuth(event);
  const body = await readMultipartFormData(event);
  if (!(body == null ? void 0 : body.length)) throw createError({ statusCode: 400, message: "\u30C7\u30FC\u30BF\u304C\u3042\u308A\u307E\u305B\u3093" });
  const namePart = body.find((p) => p.name === "name" && !p.filename);
  const filePart = body.find((p) => p.filename && p.data);
  const rawName = (((_a = namePart == null ? void 0 : namePart.data) == null ? void 0 : _a.toString()) || "").trim().toLowerCase().replace(/^:|:$/g, "");
  if (!NAME_RE.test(rawName)) {
    throw createError({ statusCode: 400, message: "\u7D75\u6587\u5B57\u540D\u306F\u82F1\u6570\u5B57\u3068\u30A2\u30F3\u30C0\u30FC\u30B9\u30B3\u30A22\u301C32\u6587\u5B57\u306B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  if (!filePart) throw createError({ statusCode: 400, message: "\u753B\u50CF\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044" });
  const existing = await db.query.customEmojis.findFirst({
    where: eq(customEmojis.name, rawName)
  });
  if (existing) throw createError({ statusCode: 409, message: "\u3053\u306E\u7D75\u6587\u5B57\u540D\u306F\u65E2\u306B\u4F7F\u308F\u308C\u3066\u3044\u307E\u3059" });
  validateEmojiFile(filePart.filename, filePart.data);
  const { url, mime, animated } = await saveEmoji(filePart.data, filePart.filename);
  const id = randomUUID();
  const [row] = await db.insert(customEmojis).values({
    id,
    name: rawName,
    url,
    mime,
    animated,
    creatorId: user.id
  }).returning();
  const emoji = { id, name: rawName, url, mime, animated, creatorId: user.id, createdAt: row.createdAt };
  broadcast({ type: "emoji.new", emoji });
  return { emoji };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
