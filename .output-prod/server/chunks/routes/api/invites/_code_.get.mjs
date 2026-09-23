import { c as defineEventHandler, n as getRouterParam, e as db, ag as serverInvites, m as createError, ah as servers, ai as serverMembers } from '../../../_/nitro.mjs';
import { eq, count } from 'drizzle-orm';
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

const _code__get = defineEventHandler(async (event) => {
  const code = getRouterParam(event, "code");
  const invite = await db.query.serverInvites.findFirst({ where: eq(serverInvites.code, code) });
  if (!invite) throw createError({ statusCode: 404, message: "\u62DB\u5F85\u30B3\u30FC\u30C9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const server = await db.query.servers.findFirst({ where: eq(servers.id, invite.serverId) });
  if (!server) throw createError({ statusCode: 410, message: "\u30B5\u30FC\u30D0\u30FC\u304C\u5B58\u5728\u3057\u307E\u305B\u3093" });
  if (invite.expiresAt && /* @__PURE__ */ new Date() > invite.expiresAt) {
    throw createError({ statusCode: 410, message: "\u62DB\u5F85\u30B3\u30FC\u30C9\u306E\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u3066\u3044\u307E\u3059" });
  }
  const [row] = await db.select({ value: count() }).from(serverMembers).where(eq(serverMembers.serverId, server.id));
  return {
    invite: {
      id: invite.id,
      code: invite.code,
      maxUses: invite.maxUses,
      useCount: invite.useCount,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt
    },
    server: {
      id: server.id,
      name: server.name,
      description: server.description,
      iconUrl: server.iconUrl,
      memberCount: (row == null ? void 0 : row.value) || 0
    }
  };
});

export { _code__get as default };
//# sourceMappingURL=_code_.get.mjs.map
