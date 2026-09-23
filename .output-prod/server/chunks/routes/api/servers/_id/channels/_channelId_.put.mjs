import { c as defineEventHandler, n as getRouterParam, q as readBody, aw as requireServerPermission, e as db, au as serverChannels, m as createError, U as broadcast, ax as PERMISSIONS } from '../../../../../_/nitro.mjs';
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

const _channelId__put = defineEventHandler(async (event) => {
  var _a;
  const serverId = getRouterParam(event, "id");
  const channelId = getRouterParam(event, "channelId");
  const body = await readBody(event);
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_CHANNELS, "\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u7BA1\u7406\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const channel = await db.query.serverChannels.findFirst({
    where: and(
      eq(serverChannels.id, channelId),
      eq(serverChannels.serverId, serverId)
    )
  });
  if (!channel) throw createError({ statusCode: 404, message: "\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (body.name !== void 0 && !((_a = body.name) == null ? void 0 : _a.trim())) {
    throw createError({ statusCode: 400, message: "\u30C1\u30E3\u30F3\u30CD\u30EB\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  const updates = {};
  if (body.name !== void 0) updates.name = body.name.trim();
  if (body.type !== void 0) updates.type = body.type;
  if (body.description !== void 0) updates.description = body.description;
  if (body.position !== void 0) updates.position = body.position;
  if (body.slowModeSeconds !== void 0) {
    updates.slowModeSeconds = Math.max(0, Math.min(21600, Number(body.slowModeSeconds) || 0));
  }
  if (body.nsfw !== void 0) updates.nsfw = !!body.nsfw;
  updates.updatedAt = /* @__PURE__ */ new Date();
  const [updated] = await db.update(serverChannels).set(updates).where(and(eq(serverChannels.id, channelId), eq(serverChannels.serverId, serverId))).returning();
  broadcast({ type: "server.updated", serverId });
  return { channel: updated };
});

export { _channelId__put as default };
//# sourceMappingURL=_channelId_.put.mjs.map
