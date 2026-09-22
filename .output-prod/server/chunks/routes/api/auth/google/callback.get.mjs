import { d as defineEventHandler, m as initDb, g as getQuery, h as createError, v as getRequestProtocol, w as getRequestHost, a as db, n as accounts, o as createSession, q as setAuthCookie, t as sendRedirect, u as users } from '../../../../nitro/nitro.mjs';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
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

const callback_get = defineEventHandler(async (event) => {
  var _a;
  await initDb();
  const query = getQuery(event);
  const { code, state } = query;
  if (!code) {
    throw createError({ statusCode: 400, message: "Invalid OAuth callback" });
  }
  const target = typeof state === "string" && state.startsWith("/") && !state.startsWith("//") ? state : "/home";
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw createError({ statusCode: 500, message: "Google OAuth not configured" });
  }
  const redirectUri = `${getRequestProtocol(event)}://${getRequestHost(event)}/api/auth/google/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw createError({ statusCode: 401, message: "Failed to get access token" });
  }
  const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const googleUser = await userResponse.json();
  const existingAccount = await db.query.accounts.findFirst({
    where: eq(accounts.providerAccountId, googleUser.id)
  });
  if (existingAccount) {
    const { token: token2 } = await createSession(existingAccount.userId);
    setAuthCookie(event, token2);
    return sendRedirect(event, target);
  }
  const existingUser = googleUser.email ? await db.query.users.findFirst({ where: eq(users.email, googleUser.email) }) : null;
  let userId;
  if (existingUser) {
    userId = existingUser.id;
  } else {
    userId = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const baseUsername = (((_a = googleUser.email) == null ? void 0 : _a.split("@")[0]) || `user_${randomUUID().slice(0, 8)}`).toLowerCase();
    let username = baseUsername;
    let counter = 1;
    while (await db.query.users.findFirst({ where: eq(users.username, username) })) {
      username = `${baseUsername}${counter++}`;
    }
    await db.insert(users).values({
      id: userId,
      email: googleUser.email,
      username,
      displayName: googleUser.name || googleUser.given_name || username,
      passwordHash: null,
      avatarUrl: googleUser.picture,
      bio: "",
      createdAt: now,
      updatedAt: now
    });
  }
  await db.insert(accounts).values({
    id: randomUUID(),
    userId,
    provider: "google",
    providerAccountId: googleUser.id,
    providerAccessToken: tokenData.access_token,
    providerRefreshToken: tokenData.refresh_token,
    createdAt: /* @__PURE__ */ new Date()
  });
  const { token } = await createSession(userId);
  setAuthCookie(event, token);
  return sendRedirect(event, target);
});

export { callback_get as default };
//# sourceMappingURL=callback.get.mjs.map
