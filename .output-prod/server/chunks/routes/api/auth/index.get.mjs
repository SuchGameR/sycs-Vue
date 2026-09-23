import { c as defineEventHandler, m as createError, g as getQuery, C as getRequestProtocol, D as getRequestHost, B as sendRedirect } from '../../../_/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    throw createError({ statusCode: 500, message: "GitHub OAuth not configured" });
  }
  const query = getQuery(event);
  const redirect = typeof query.redirect === "string" && query.redirect.startsWith("/") && !query.redirect.startsWith("//") ? query.redirect : "/home";
  const redirectUri = `${getRequestProtocol(event)}://${getRequestHost(event)}/api/auth/github/callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email&state=${encodeURIComponent(redirect)}`;
  return sendRedirect(event, url);
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
