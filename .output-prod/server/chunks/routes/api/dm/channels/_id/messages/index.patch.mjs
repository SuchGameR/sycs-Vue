import { d as defineEventHandler, r as requireAuth, i as getRouterParam, a as db, M as dmChannelMembers, h as createError, N as dmMessages, j as readBody, P as validateMessageContent, O as dmMessageEdits, u as users, Q as publicUser, R as broadcastToUsers } from '../../../../../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
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

const index_patch = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const channelId = getRouterParam(event, "id");
  const msgId = getRouterParam(event, "msgId");
  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(eq(dmChannelMembers.channelId, channelId), eq(dmChannelMembers.userId, user.id))
  });
  if (!membership) throw createError({ statusCode: 403, message: "\u3053\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093" });
  const message = await db.query.dmMessages.findFirst({ where: eq(dmMessages.id, msgId) });
  if (!message || message.channelId !== channelId || message.senderId !== user.id) {
    throw createError({ statusCode: 404, message: "\u30E1\u30C3\u30BB\u30FC\u30B8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  }
  const { content } = await readBody(event);
  const contentTrimmed = validateMessageContent(content);
  await db.insert(dmMessageEdits).values({
    id: randomUUID(),
    messageId: message.id,
    content: message.content
  });
  const updatedAt = /* @__PURE__ */ new Date();
  await db.update(dmMessages).set({ content: contentTrimmed, edited: true, updatedAt }).where(eq(dmMessages.id, message.id));
  const updated = await db.query.dmMessages.findFirst({ where: eq(dmMessages.id, message.id) });
  const sender = updated ? await db.query.users.findFirst({ where: eq(users.id, updated.senderId) }) : null;
  const result = updated ? { ...updated, sender: publicUser(sender) } : null;
  if (result) {
    const memberRows = await db.query.dmChannelMembers.findMany({
      where: eq(dmChannelMembers.channelId, channelId),
      columns: { userId: true }
    });
    broadcastToUsers(
      { type: "dm.message.edited", channelId, message: result },
      memberRows.map((m) => m.userId)
    );
  }
  return { message: result };
});

export { index_patch as default };
//# sourceMappingURL=index.patch.mjs.map
