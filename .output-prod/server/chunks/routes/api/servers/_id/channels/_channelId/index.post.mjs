import { d as defineEventHandler, i as getRouterParam, j as readBody, P as validateMessageContent, ak as requireServerPermission, S as checkMessageFlood, h as createError, a as db, ah as serverChannels, an as channelMessages, L as broadcast, al as PERMISSIONS } from '../../../../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const serverId = getRouterParam(event, "id");
  const channelId = getRouterParam(event, "channelId");
  const body = await readBody(event);
  const content = validateMessageContent(body.content);
  const ctx = await requireServerPermission(event, serverId, PERMISSIONS.SEND_MESSAGES, "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  if (!ctx.isOwner) {
    const wait = checkMessageFlood(((_a = ctx.user) == null ? void 0 : _a.id) || ((_b = ctx.member) == null ? void 0 : _b.userId));
    if (wait) {
      throw createError({
        statusCode: 429,
        message: `\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3059\u308B\u901F\u5EA6\u304C\u901F\u3059\u304E\u307E\u3059\u3002${wait}\u79D2\u5F8C\u306B\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044`
      });
    }
  }
  const channel = await db.query.serverChannels.findFirst({
    where: and(
      eq(serverChannels.id, channelId),
      eq(serverChannels.serverId, serverId)
    )
  });
  if (!channel) throw createError({ statusCode: 404, message: "\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (channel.slowModeSeconds > 0 && !ctx.isOwner) {
    const last = await db.query.channelMessages.findFirst({
      where: and(
        eq(channelMessages.channelId, channelId),
        eq(channelMessages.userId, ctx.member.userId)
      ),
      orderBy: (t, { desc }) => [desc(t.createdAt)]
    });
    if (last) {
      const elapsed = (Date.now() - new Date(last.createdAt).getTime()) / 1e3;
      if (elapsed < channel.slowModeSeconds) {
        const wait = Math.ceil(channel.slowModeSeconds - elapsed);
        throw createError({
          statusCode: 429,
          message: `\u30B9\u30ED\u30FC\u30E2\u30FC\u30C9\u4E2D\u3067\u3059\u3002${wait}\u79D2\u5F8C\u306B\u3082\u3046\u4E00\u5EA6\u304A\u8A66\u3057\u304F\u3060\u3055\u3044`
        });
      }
    }
  }
  const [message] = await db.insert(channelMessages).values({
    id: randomUUID(),
    channelId,
    userId: ctx.isOwner ? ctx.server.ownerId : ctx.member.userId,
    content
  }).returning();
  broadcast({
    type: "message.new",
    serverId,
    channelId,
    message: {
      ...message,
      user: {
        id: ((_c = ctx.user) == null ? void 0 : _c.id) || message.userId,
        username: ((_d = ctx.user) == null ? void 0 : _d.username) || null,
        displayName: ((_e = ctx.user) == null ? void 0 : _e.displayName) || null,
        avatarUrl: ((_f = ctx.user) == null ? void 0 : _f.avatarUrl) || null
      }
    }
  });
  return { message };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
