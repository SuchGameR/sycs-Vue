import { c as defineEventHandler, n as getRouterParam, ay as requireServerMember, q as readBody, m as createError, a6 as isInRoom, a7 as relaySignal } from '../../../../../../../_/nitro.mjs';
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

const signal_post = defineEventHandler(async (event) => {
  var _a;
  const serverId = getRouterParam(event, "id");
  const channelId = getRouterParam(event, "channelId");
  const ctx = await requireServerMember(event, serverId);
  const roomKey = `server:${serverId}:${channelId}`;
  const body = await readBody(event);
  if (!body.to || !body.signal) throw createError({ statusCode: 400, message: "\u30B7\u30B0\u30CA\u30EA\u30F3\u30B0\u30C7\u30FC\u30BF\u304C\u4E0D\u6B63\u3067\u3059" });
  const isDecline = ((_a = body.signal) == null ? void 0 : _a.type) === "decline";
  if (!isInRoom(roomKey, ctx.user.id) && !isDecline) {
    throw createError({ statusCode: 403, message: "\u97F3\u58F0\u30C1\u30E3\u30F3\u30CD\u30EB\u306B\u53C2\u52A0\u3057\u3066\u3044\u307E\u305B\u3093" });
  }
  relaySignal(roomKey, {
    userId: ctx.user.id,
    username: ctx.user.username,
    displayName: ctx.user.displayName,
    avatarUrl: ctx.user.avatarUrl
  }, body.to, body.signal);
  return { success: true };
});

export { signal_post as default };
//# sourceMappingURL=signal.post.mjs.map
