import { d as defineEventHandler, i as getRouterParam, am as requireServerMember, a as db, ah as serverChannels, a6 as serverMembers, ao as serverRoles, u as users } from '../../../nitro/nitro.mjs';
import { eq, inArray } from 'drizzle-orm';
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

const index_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const ctx = await requireServerMember(event, id);
  const [channels, members, roles] = await Promise.all([
    db.query.serverChannels.findMany({ where: eq(serverChannels.serverId, id) }),
    db.query.serverMembers.findMany({ where: eq(serverMembers.serverId, id) }),
    db.query.serverRoles.findMany({ where: eq(serverRoles.serverId, id) })
  ]);
  const userIds = members.map((m) => m.userId);
  const users$1 = userIds.length ? await db.query.users.findMany({ where: inArray(users.id, userIds) }) : [];
  const userMap = Object.fromEntries(users$1.map((u) => [u.id, u]));
  [...new Set(roles.map((r) => r.id))];
  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r]));
  const membersWithUser = members.map((m) => ({ ...m, user: userMap[m.userId] || null, role: m.roleId ? roleMap[m.roleId] || null : null }));
  return {
    server: ctx.server,
    channels,
    members: membersWithUser,
    roles,
    myMember: ctx.member ? { ...ctx.member, role: ctx.role } : null,
    myPermissions: ctx.permissions,
    isOwner: ctx.isOwner
  };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
