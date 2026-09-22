import { d as defineEventHandler, r as requireAuth, i as getRouterParam, a as db, M as dmChannelMembers, h as createError, N as dmMessages, u as users, Q as publicUser } from '../../../../../nitro/nitro.mjs';
import { and, eq, desc, inArray } from 'drizzle-orm';
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

const index_get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const channelId = getRouterParam(event, "id");
  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(eq(dmChannelMembers.channelId, channelId), eq(dmChannelMembers.userId, user.id))
  });
  if (!membership) throw createError({ statusCode: 403, message: "\u3053\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093" });
  const messages = await db.query.dmMessages.findMany({
    where: eq(dmMessages.channelId, channelId),
    orderBy: [desc(dmMessages.createdAt)],
    limit: 100
  });
  const senderIds = [...new Set(messages.map((m) => m.senderId))];
  const senders = senderIds.length ? await db.query.users.findMany({ where: inArray(users.id, senderIds) }) : [];
  const senderMap = Object.fromEntries(senders.map((s) => [s.id, publicUser(s)]));
  const messagesWithSenders = messages.map((m) => ({ ...m, sender: senderMap[m.senderId] || null }));
  return { messages: messagesWithSenders.reverse() };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
