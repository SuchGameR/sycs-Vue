import { c as defineEventHandler, r as requireAuth, n as getRouterParam, m as createError, e as db, a8 as customEmojis, a9 as urlToFilePath, U as broadcast } from '../../../_/nitro.mjs';
import { unlink } from 'fs/promises';
import { eq } from 'drizzle-orm';
import 'crypto';
import 'jose';
import 'bcryptjs';
import 'fs';
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

const _id__delete = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "ID\u304C\u5FC5\u8981\u3067\u3059" });
  const row = await db.query.customEmojis.findFirst({
    where: eq(customEmojis.id, id)
  });
  if (!row) throw createError({ statusCode: 404, message: "\u7D75\u6587\u5B57\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (row.creatorId !== user.id) {
    throw createError({ statusCode: 403, message: "\u3053\u306E\u7D75\u6587\u5B57\u3092\u524A\u9664\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093" });
  }
  await db.delete(customEmojis).where(eq(customEmojis.id, id));
  try {
    await unlink(urlToFilePath(row.url));
  } catch {
  }
  broadcast({ type: "emoji.deleted", id });
  return { ok: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
