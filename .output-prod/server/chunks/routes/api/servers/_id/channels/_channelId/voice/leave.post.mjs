import { c as defineEventHandler, n as getRouterParam, ay as requireServerMember, a5 as leaveRoom } from '../../../../../../../_/nitro.mjs';
import 'crypto';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const leave_post = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  const channelId = getRouterParam(event, "channelId");
  const ctx = await requireServerMember(event, serverId);
  leaveRoom(`server:${serverId}:${channelId}`, ctx.user.id);
  return { success: true };
});

export { leave_post as default };
//# sourceMappingURL=leave.post.mjs.map
