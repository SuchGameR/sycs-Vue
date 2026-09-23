import { c as defineEventHandler, n as getRouterParam, ay as requireServerMember, e as db, au as serverChannels, m as createError, a4 as joinRoom } from '../../../../../../../_/nitro.mjs';
import { and, eq } from 'drizzle-orm';
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

const join_post = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  const channelId = getRouterParam(event, "channelId");
  const ctx = await requireServerMember(event, serverId);
  const channel = await db.query.serverChannels.findFirst({
    where: and(
      eq(serverChannels.id, channelId),
      eq(serverChannels.serverId, serverId)
    )
  });
  if (!channel) throw createError({ statusCode: 404, message: "\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (channel.type !== "voice") throw createError({ statusCode: 400, message: "\u3053\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u306F\u97F3\u58F0\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F\u3042\u308A\u307E\u305B\u3093" });
  const existing = joinRoom(`server:${serverId}:${channelId}`, {
    userId: ctx.user.id,
    username: ctx.user.username,
    displayName: ctx.user.displayName,
    avatarUrl: ctx.user.avatarUrl
  });
  return { roomKey: `server:${serverId}:${channelId}`, members: existing };
});

export { join_post as default };
//# sourceMappingURL=join.post.mjs.map
