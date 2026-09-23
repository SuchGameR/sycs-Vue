import { c as defineEventHandler, r as requireAuth, q as readBody, m as createError, e as db, aI as whiteboardStates } from '../../_/nitro.mjs';
import 'crypto';
import 'drizzle-orm';
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

const index_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  const roomKey = body == null ? void 0 : body.roomKey;
  const strokes = Array.isArray(body == null ? void 0 : body.strokes) ? body.strokes : [];
  if (!roomKey || typeof roomKey !== "string" || roomKey.length > 200) {
    throw createError({ statusCode: 400, message: "roomKey\u304C\u4E0D\u6B63\u3067\u3059" });
  }
  if (!roomKey.startsWith("dm:") && !roomKey.startsWith("server:")) {
    throw createError({ statusCode: 400, message: "roomKey\u304C\u4E0D\u6B63\u3067\u3059" });
  }
  await db.insert(whiteboardStates).values({ roomKey, strokes, updatedById: user.id }).onConflictDoUpdate({
    target: whiteboardStates.roomKey,
    set: { strokes, updatedById: user.id, updatedAt: /* @__PURE__ */ new Date() }
  });
  return { success: true };
});

export { index_post as default };
//# sourceMappingURL=index5.post.mjs.map
