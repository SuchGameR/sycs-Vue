import { d as defineEventHandler, i as getRouterParam, a as db, a6 as serverMembers, u as users, ao as serverRoles } from '../../../../nitro/nitro.mjs';
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
  const serverId = getRouterParam(event, "id");
  const members = await db.query.serverMembers.findMany({
    where: eq(serverMembers.serverId, serverId)
  });
  const userIds = [...new Set(members.map((m) => m.userId))];
  const users$1 = userIds.length ? await db.query.users.findMany({ where: inArray(users.id, userIds) }) : [];
  const userMap = Object.fromEntries(users$1.map((u) => [u.id, u]));
  const roleIds = [...new Set(members.map((m) => m.roleId).filter(Boolean))];
  const roles = roleIds.length ? await db.query.serverRoles.findMany({ where: inArray(serverRoles.id, roleIds) }) : [];
  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r]));
  const membersWithRelations = members.map((m) => ({
    ...m,
    user: userMap[m.userId] || null,
    role: m.roleId ? roleMap[m.roleId] || null : null
  }));
  return { members: membersWithRelations };
});

export { index_get as default };
//# sourceMappingURL=index3.get.mjs.map
