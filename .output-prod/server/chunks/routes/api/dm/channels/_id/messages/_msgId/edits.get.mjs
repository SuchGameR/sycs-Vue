import { d as defineEventHandler, r as requireAuth, i as getRouterParam, a as db, M as dmChannelMembers, h as createError, N as dmMessages, O as dmMessageEdits } from '../../../../../../../nitro/nitro.mjs';
import { and, eq, asc } from 'drizzle-orm';
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

const edits_get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const channelId = getRouterParam(event, "id");
  const msgId = getRouterParam(event, "msgId");
  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(eq(dmChannelMembers.channelId, channelId), eq(dmChannelMembers.userId, user.id))
  });
  if (!membership) throw createError({ statusCode: 403, message: "\u3053\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093" });
  const message = await db.query.dmMessages.findFirst({ where: eq(dmMessages.id, msgId) });
  if (!message || message.channelId !== channelId) {
    throw createError({ statusCode: 404, message: "\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  }
  const edits = await db.query.dmMessageEdits.findMany({
    where: eq(dmMessageEdits.messageId, message.id),
    orderBy: [asc(dmMessageEdits.editedAt)]
  });
  return {
    message: { id: message.id, content: message.content, edited: message.edited, updatedAt: message.updatedAt },
    edits
  };
});

export { edits_get as default };
//# sourceMappingURL=edits.get.mjs.map
