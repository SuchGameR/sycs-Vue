import { d as defineEventHandler, h as createError, g as getQuery, v as getRequestProtocol, w as getRequestHost, t as sendRedirect } from '../../../nitro/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw createError({ statusCode: 500, message: "Google OAuth not configured" });
  }
  const query = getQuery(event);
  const redirect = typeof query.redirect === "string" && query.redirect.startsWith("/") && !query.redirect.startsWith("//") ? query.redirect : "/home";
  const redirectUri = `${getRequestProtocol(event)}://${getRequestHost(event)}/api/auth/google/callback`;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid+email+profile&state=${encodeURIComponent(redirect)}`;
  return sendRedirect(event, url);
});

export { index_get as default };
//# sourceMappingURL=index2.get.mjs.map
