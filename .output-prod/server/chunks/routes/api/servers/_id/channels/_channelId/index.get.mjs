import { c as defineEventHandler, n as getRouterParam, g as getQuery, ay as requireServerMember, e as db, au as serverChannels, m as createError, az as channelMessages, o as users } from '../../../../../../_/nitro.mjs';
import { and, eq, asc, inArray } from 'drizzle-orm';
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

const index_get = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  const channelId = getRouterParam(event, "channelId");
  const query = getQuery(event);
  const limit = Math.min(Number(query.limit) || 50, 100);
  const offset = Number(query.offset) || 0;
  await requireServerMember(event, serverId);
  const channel = await db.query.serverChannels.findFirst({
    where: and(
      eq(serverChannels.id, channelId),
      eq(serverChannels.serverId, serverId)
    )
  });
  if (!channel) throw createError({ statusCode: 404, message: "\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const messages = await db.query.channelMessages.findMany({
    where: eq(channelMessages.channelId, channelId),
    limit,
    offset,
    orderBy: [asc(channelMessages.createdAt)]
  });
  const userIds = [...new Set(messages.map((m) => m.userId))];
  const users$1 = userIds.length ? await db.query.users.findMany({ where: inArray(users.id, userIds) }) : [];
  const userMap = Object.fromEntries(users$1.map((u) => [u.id, u]));
  const messagesWithUser = messages.map((m) => ({ ...m, user: userMap[m.userId] || null }));
  return { messages: messagesWithUser };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
