import { c as defineEventHandler, r as requireAuth, n as getRouterParam, q as readBody, $ as validateMessageContent, a2 as checkMessageFlood, m as createError, e as db, V as dmChannelMembers, a3 as hasBlockEitherWay, X as dmMessages, W as dmChannels, o as users, a0 as publicUser, a1 as broadcastToUsers } from '../../../../../_/nitro.mjs';
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
  const channelId = getRouterParam(event, "id");
  const { content } = await readBody(event);
  const contentTrimmed = validateMessageContent(content);
  const wait = checkMessageFlood(user.id);
  if (wait) {
    throw createError({
      statusCode: 429,
      message: `\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3059\u308B\u901F\u5EA6\u304C\u901F\u3059\u304E\u307E\u3059\u3002${wait}\u79D2\u5F8C\u306B\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044`
    });
  }
  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(eq(dmChannelMembers.channelId, channelId), eq(dmChannelMembers.userId, user.id))
  });
  if (!membership) throw createError({ statusCode: 403, message: "\u3053\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093" });
  const memberRows = await db.query.dmChannelMembers.findMany({
    where: eq(dmChannelMembers.channelId, channelId),
    columns: { userId: true }
  });
  const otherIds = memberRows.map((m) => m.userId).filter((id) => id !== user.id);
  for (const otherId of otherIds) {
    if (await hasBlockEitherWay(user.id, otherId)) {
      throw createError({ statusCode: 403, message: "\u30D6\u30ED\u30C3\u30AF\u4E2D\u306E\u30E6\u30FC\u30B6\u30FC\u306B\u306F\u9001\u4FE1\u3067\u304D\u307E\u305B\u3093" });
    }
  }
  const msgId = randomUUID();
  await db.insert(dmMessages).values({
    id: msgId,
    channelId,
    senderId: user.id,
    content: contentTrimmed
  });
  await db.update(dmChannels).set({ updatedAt: /* @__PURE__ */ new Date() }).where(eq(dmChannels.id, channelId));
  const message = await db.query.dmMessages.findFirst({
    where: eq(dmMessages.id, msgId)
  });
  const sender = message ? await db.query.users.findFirst({ where: eq(users.id, message.senderId) }) : null;
  const result = message ? { ...message, sender: publicUser(sender) } : null;
  if (result) {
    broadcastToUsers(
      { type: "dm.message", channelId, message: result },
      memberRows.map((m) => m.userId)
    );
  }
  return { message: result };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
