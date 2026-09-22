import { d as defineEventHandler, r as requireAuth, j as readBody, h as createError, a as db, a5 as servers, ao as serverRoles, ap as ALL_PERMISSIONS_MASK, ah as serverChannels, a6 as serverMembers } from '../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
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
  var _a;
  const user = await requireAuth(event);
  const body = await readBody(event);
  if (!((_a = body.name) == null ? void 0 : _a.trim())) throw createError({ statusCode: 400, message: "\u30B5\u30FC\u30D0\u30FC\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044" });
  const serverId = randomUUID();
  const now = /* @__PURE__ */ new Date();
  const [server] = await db.insert(servers).values({
    id: serverId,
    name: body.name,
    description: body.description || "",
    iconUrl: body.iconUrl || null,
    bannerUrl: body.bannerUrl || null,
    ownerId: user.id,
    isPublic: body.isPublic !== false,
    createdAt: now,
    updatedAt: now
  }).returning();
  const roleId = randomUUID();
  await db.insert(serverRoles).values({
    id: roleId,
    serverId,
    name: "Admin",
    color: "#ff0000",
    position: 999,
    permissions: "all",
    permissionsMask: ALL_PERMISSIONS_MASK,
    isAdmin: true
  });
  await db.insert(serverChannels).values({
    id: randomUUID(),
    serverId,
    name: "general",
    type: "text",
    position: 0
  });
  await db.insert(serverMembers).values({
    id: randomUUID(),
    serverId,
    userId: user.id,
    roleId,
    nickname: null,
    joinedAt: now
  });
  return { server };
});

export { index_post as default };
//# sourceMappingURL=index4.post.mjs.map
