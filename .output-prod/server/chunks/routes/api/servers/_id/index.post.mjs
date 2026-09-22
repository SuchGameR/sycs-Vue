import { d as defineEventHandler, i as getRouterParam, j as readBody, h as createError, ak as requireServerPermission, a as db, ah as serverChannels, L as broadcast, al as PERMISSIONS } from '../../../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
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
  var _a, _b, _c;
  const serverId = getRouterParam(event, "id");
  const body = await readBody(event);
  if (!((_a = body.name) == null ? void 0 : _a.trim())) throw createError({ statusCode: 400, message: "\u30C1\u30E3\u30F3\u30CD\u30EB\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_CHANNELS, "\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u7BA1\u7406\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const existing = await db.query.serverChannels.findMany({ where: eq(serverChannels.serverId, serverId) });
  const [channel] = await db.insert(serverChannels).values({
    id: randomUUID(),
    serverId,
    name: body.name.trim(),
    type: body.type || "text",
    position: (_b = body.position) != null ? _b : existing.length,
    description: body.description || "",
    slowModeSeconds: (_c = body.slowModeSeconds) != null ? _c : 0,
    nsfw: !!body.nsfw
  }).returning();
  broadcast({ type: "server.updated", serverId });
  return { channel };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
