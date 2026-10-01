import { c as defineEventHandler, n as getRouterParam, aG as requireServerMember, q as readBody, a5 as leaveRoom } from '../../../../../../../_/nitro.mjs';
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
import 'node:fs';
import 'node:fs/promises';
import 'node:path';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';

const leave_post = defineEventHandler(async (event) => {
  const serverId = getRouterParam(event, "id");
  const channelId = getRouterParam(event, "channelId");
  const ctx = await requireServerMember(event, serverId);
  const body = await readBody(event).catch(() => ({}));
  const sessionId = typeof (body == null ? void 0 : body.sessionId) === "string" ? body.sessionId : void 0;
  leaveRoom(`server:${serverId}:${channelId}`, ctx.user.id, sessionId);
  return { success: true };
});

export { leave_post as default };
//# sourceMappingURL=leave.post.mjs.map
