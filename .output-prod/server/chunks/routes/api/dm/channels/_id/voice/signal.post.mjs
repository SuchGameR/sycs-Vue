import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, V as dmChannelMembers, m as createError, q as readBody, a6 as isInRoom, a7 as relaySignal } from '../../../../../../_/nitro.mjs';
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

const signal_post = defineEventHandler(async (event) => {
  var _a;
  const user = await requireAuth(event);
  const channelId = getRouterParam(event, "id");
  const roomKey = `dm:${channelId}`;
  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(
      eq(dmChannelMembers.channelId, channelId),
      eq(dmChannelMembers.userId, user.id)
    )
  });
  if (!membership) throw createError({ statusCode: 403, message: "\u3053\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093" });
  const body = await readBody(event);
  if (!body.to || !body.signal) throw createError({ statusCode: 400, message: "\u30B7\u30B0\u30CA\u30EA\u30F3\u30B0\u30C7\u30FC\u30BF\u304C\u4E0D\u6B63\u3067\u3059" });
  const isDecline = ((_a = body.signal) == null ? void 0 : _a.type) === "decline";
  if (!isInRoom(roomKey, user.id) && !isDecline) {
    throw createError({ statusCode: 403, message: "\u901A\u8A71\u306B\u53C2\u52A0\u3057\u3066\u3044\u307E\u305B\u3093" });
  }
  relaySignal(roomKey, {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl
  }, body.to, body.signal);
  return { success: true };
});

export { signal_post as default };
//# sourceMappingURL=signal.post.mjs.map
