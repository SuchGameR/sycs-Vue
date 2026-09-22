import { d as defineEventHandler, i as getRouterParam, ak as requireServerPermission, a as db, ah as serverChannels, h as createError, L as broadcast, al as PERMISSIONS } from '../../../../../nitro/nitro.mjs';
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
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';

const _channelId__delete = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  const channelId = getRouterParam(event, "channelId");
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_CHANNELS, "\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u7BA1\u7406\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const channel = await db.query.serverChannels.findFirst({
    where: and(
      eq(serverChannels.id, channelId),
      eq(serverChannels.serverId, serverId)
    )
  });
  if (!channel) throw createError({ statusCode: 404, message: "\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const remaining = await db.query.serverChannels.findMany({
    where: eq(serverChannels.serverId, serverId)
  });
  if (remaining.length <= 1) {
    throw createError({ statusCode: 400, message: "\u6700\u5F8C\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u306F\u524A\u9664\u3067\u304D\u307E\u305B\u3093" });
  }
  await db.delete(serverChannels).where(
    and(eq(serverChannels.id, channelId), eq(serverChannels.serverId, serverId))
  );
  broadcast({ type: "server.updated", serverId, deletedChannelId: channelId });
  return { success: true };
});

export { _channelId__delete as default };
//# sourceMappingURL=_channelId_.delete.mjs.map
