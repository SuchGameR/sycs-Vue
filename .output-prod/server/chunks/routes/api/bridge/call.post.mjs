import { d as defineEventHandler, E as phpBridgeConfig, h as createError, j as readBody, f as getHeader, F as phpCall } from '../../../nitro/nitro.mjs';
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
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';

const call_post = defineEventHandler(async (event) => {
  var _a;
  const cfg = phpBridgeConfig();
  if (!cfg.enabled) {
    throw createError({ statusCode: 503, message: "PHP bridge is not configured (set PHP_API_BASE)" });
  }
  const body = await readBody(event);
  const action = typeof body.action === "string" ? body.action.trim() : "";
  if (!action) {
    throw createError({ statusCode: 400, message: "action is required" });
  }
  const params = body.params && typeof body.params === "object" && !Array.isArray(body.params) ? body.params : {};
  const csrfToken = typeof body.csrfToken === "string" ? body.csrfToken : null;
  const clientCookie = cfg.forwardCookie ? (_a = getHeader(event, "cookie")) != null ? _a : null : null;
  return await phpCall(action, params, { csrfToken, cookie: clientCookie });
});

export { call_post as default };
//# sourceMappingURL=call.post.mjs.map
