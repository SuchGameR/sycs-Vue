import { d as defineEventHandler, m as initDb, g as getQuery, h as createError, a as db, n as accounts, o as createSession, q as setAuthCookie, t as sendRedirect, u as users } from '../../../../nitro/nitro.mjs';
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
  await initDb();
  const query = getQuery(event);
  const { code, state } = query;
  if (!code || !state) {
    throw createError({ statusCode: 400, message: "Invalid OAuth callback" });
  }
  const target = typeof state === "string" && state.startsWith("/") && !state.startsWith("//") ? state : "/home";
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw createError({ statusCode: 500, message: "GitHub OAuth not configured" });
  }
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
  });
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw createError({ statusCode: 401, message: "Failed to get access token" });
  }
  const userResponse = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const githubUser = await userResponse.json();
  const existingAccount = await db.query.accounts.findFirst({
    where: eq(accounts.providerAccountId, String(githubUser.id))
  });
  if (existingAccount) {
    const { token: token2 } = await createSession(existingAccount.userId);
    setAuthCookie(event, token2);
    return sendRedirect(event, target);
  }
  const existingUser = githubUser.email ? await db.query.users.findFirst({ where: eq(users.email, githubUser.email) }) : null;
  let userId;
  if (existingUser) {
    userId = existingUser.id;
  } else {
    userId = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const baseUsername = (githubUser.login || `user_${randomUUID().slice(0, 8)}`).toLowerCase();
    let username = baseUsername;
    let counter = 1;
    while (await db.query.users.findFirst({ where: eq(users.username, username) })) {
      username = `${baseUsername}${counter++}`;
    }
    await db.insert(users).values({
      id: userId,
      email: githubUser.email || `${username}@github.placeholder`,
      username,
      displayName: githubUser.name || githubUser.login,
      passwordHash: null,
      avatarUrl: githubUser.avatar_url,
      bio: githubUser.bio || "",
      createdAt: now,
      updatedAt: now
    });
  }
  await db.insert(accounts).values({
    id: randomUUID(),
    userId,
    provider: "github",
    providerAccountId: String(githubUser.id),
    providerAccessToken: tokenData.access_token,
    createdAt: /* @__PURE__ */ new Date()
  });
  const { token } = await createSession(userId);
  setAuthCookie(event, token);
  return sendRedirect(event, target);
});

export { callback_get as default };
//# sourceMappingURL=callback.get.mjs.map
