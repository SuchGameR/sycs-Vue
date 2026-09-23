import { c as defineEventHandler, n as getRouterParam, ay as requireServerMember, e as db, au as serverChannels, ai as serverMembers, aA as serverRoles, o as users } from '../../../_/nitro.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

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
