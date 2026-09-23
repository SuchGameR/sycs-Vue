import { c as defineEventHandler, r as requireAuth, n as getRouterParam, m as createError, e as db, aI as whiteboardStates } from '../../../_/nitro.mjs';
import { eq } from 'drizzle-orm';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const _roomKey__get = defineEventHandler(async (event) => {
  await requireAuth(event);
  const roomKey = getRouterParam(event, "roomKey") || "";
  if (!roomKey.startsWith("dm:") && !roomKey.startsWith("server:")) {
    throw createError({ statusCode: 400, message: "roomKey\u304C\u4E0D\u6B63\u3067\u3059" });
  }
  const row = await db.query.whiteboardStates.findFirst({
    where: eq(whiteboardStates.roomKey, roomKey)
  });
  return { roomKey, strokes: (row == null ? void 0 : row.strokes) || [] };
});

export { _roomKey__get as default };
//# sourceMappingURL=_roomKey_.get.mjs.map
