import { d as defineEventHandler, f as getHeader, h as createError, i as getRouterParam, a as db, u as users, j as readBody, k as userBadges } from '../../../../../nitro/nitro.mjs';
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

const badges_put = defineEventHandler(async (event) => {
  const secret = process.env.SYCS_ADMIN_SECRET;
  if (!secret || getHeader(event, "x-admin-secret") !== secret) {
    throw createError({ statusCode: 403, message: "\u7BA1\u7406\u8005\u6A29\u9650\u304C\u5FC5\u8981\u3067\u3059" });
  }
  const userId = getRouterParam(event, "id");
  const user = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { id: true } });
  if (!user) throw createError({ statusCode: 404, message: "\u30E6\u30FC\u30B6\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const body = await readBody(event);
  const badges = Array.isArray(body == null ? void 0 : body.badges) ? body.badges : [];
  const values = badges.filter((b) => b && typeof b.value === "string" && b.value).map((b, i) => ({
    id: randomUUID(),
    userId,
    kind: b.kind === "image" ? "image" : "icon",
    value: b.value,
    label: b.label || null,
    position: i
  }));
  await db.delete(userBadges).where(eq(userBadges.userId, userId));
  if (values.length) await db.insert(userBadges).values(values);
  return { badges: values };
});

export { badges_put as default };
//# sourceMappingURL=badges.put.mjs.map
