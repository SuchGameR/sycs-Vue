import { d as defineEventHandler, i as getRouterParam, ak as requireServerPermission, _ as readMultipartFormData, h as createError, aq as validateFile, au as saveCover, a as db, a5 as servers, L as broadcast, al as PERMISSIONS } from '../../../../../nitro/nitro.mjs';
import { eq } from 'drizzle-orm';
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

const banner_post = defineEventHandler(async (event) => {
  var _a;
  const serverId = getRouterParam(event, "id");
  await requireServerPermission(event, serverId, PERMISSIONS.MANAGE_SERVER, "\u30B5\u30FC\u30D0\u30FC\u3092\u7BA1\u7406\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093");
  const body = await readMultipartFormData(event);
  if (!(body == null ? void 0 : body.length)) throw createError({ statusCode: 400, message: "\u30D5\u30A1\u30A4\u30EB\u304C\u3042\u308A\u307E\u305B\u3093" });
  const file = body.find((p) => p.filename && p.data);
  if (!file) throw createError({ statusCode: 400 });
  if (!((_a = file.type) == null ? void 0 : _a.startsWith("image/"))) {
    throw createError({ statusCode: 400, message: "\u753B\u50CF\u30D5\u30A1\u30A4\u30EB\u306E\u307F\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u53EF\u80FD\u3067\u3059" });
  }
  if (file.data.length > 8 * 1024 * 1024) {
    throw createError({ statusCode: 400, message: "\u30D0\u30CA\u30FC\u306F8MB\u4EE5\u4E0B\u306B\u3057\u3066\u304F\u3060\u3055\u3044" });
  }
  validateFile(file.filename, file.type, file.data);
  const url = await saveCover(file.data, file.filename, 1600, 450);
  await db.update(servers).set({ bannerUrl: url, updatedAt: /* @__PURE__ */ new Date() }).where(eq(servers.id, serverId));
  broadcast({ type: "server.updated", serverId });
  return { url };
});

export { banner_post as default };
//# sourceMappingURL=banner.post.mjs.map
