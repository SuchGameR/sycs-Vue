import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, V as dmChannelMembers, m as createError, a5 as leaveRoom } from '../../../../../../_/nitro.mjs';
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

const leave_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const channelId = getRouterParam(event, "id");
  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(
      eq(dmChannelMembers.channelId, channelId),
      eq(dmChannelMembers.userId, user.id)
    )
  });
  if (!membership) throw createError({ statusCode: 403, message: "\u3053\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093" });
  leaveRoom(`dm:${channelId}`, user.id);
  return { success: true };
});

export { leave_post as default };
//# sourceMappingURL=leave.post.mjs.map
