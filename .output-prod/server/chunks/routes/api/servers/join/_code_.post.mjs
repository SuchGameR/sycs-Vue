import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, ag as serverInvites, m as createError, ah as servers, ai as serverMembers, U as broadcast } from '../../../../_/nitro.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const _code__post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const code = getRouterParam(event, "code");
  const invite = await db.query.serverInvites.findFirst({ where: eq(serverInvites.code, code) });
  if (!invite) throw createError({ statusCode: 404, message: "\u62DB\u5F85\u30B3\u30FC\u30C9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const server = await db.query.servers.findFirst({ where: eq(servers.id, invite.serverId) });
  if (!server) throw createError({ statusCode: 410, message: "\u30B5\u30FC\u30D0\u30FC\u304C\u5B58\u5728\u3057\u307E\u305B\u3093" });
  if (invite.expiresAt && /* @__PURE__ */ new Date() > invite.expiresAt) {
    throw createError({ statusCode: 410, message: "\u62DB\u5F85\u30B3\u30FC\u30C9\u306E\u6709\u52B9\u671F\u9650\u304C\u5207\u308C\u3066\u3044\u307E\u3059" });
  }
  if (invite.maxUses > 0 && invite.useCount >= invite.maxUses) {
    throw createError({ statusCode: 410, message: "\u62DB\u5F85\u30B3\u30FC\u30C9\u306E\u4F7F\u7528\u56DE\u6570\u304C\u4E0A\u9650\u306B\u9054\u3057\u307E\u3057\u305F" });
  }
  const existing = await db.query.serverMembers.findFirst({
    where: (members, { and }) => and(
      eq(members.serverId, invite.serverId),
      eq(members.userId, user.id)
    )
  });
  if (existing) throw createError({ statusCode: 409, message: "\u65E2\u306B\u3053\u306E\u30B5\u30FC\u30D0\u30FC\u306B\u53C2\u52A0\u3057\u3066\u3044\u307E\u3059" });
  await db.insert(serverMembers).values({
    id: randomUUID(),
    serverId: invite.serverId,
    userId: user.id,
    joinedAt: /* @__PURE__ */ new Date()
  });
  await db.update(serverInvites).set({ useCount: invite.useCount + 1 }).where(eq(serverInvites.id, invite.id));
  broadcast({ type: "server.updated", serverId: invite.serverId });
  broadcast({ type: "server.joined", serverId: invite.serverId });
  return {
    success: true,
    serverId: invite.serverId,
    server: { id: server.id, name: server.name }
  };
});

export { _code__post as default };
//# sourceMappingURL=_code_.post.mjs.map
