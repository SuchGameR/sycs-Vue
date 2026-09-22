import { d as defineEventHandler, r as requireAuth, j as readBody, a as db, u as users } from '../../../nitro/nitro.mjs';
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

const settings_put = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  const existing = JSON.parse(user.settings || "{}");
  const merged = { ...existing, ...body };
  await db.update(users).set({ settings: JSON.stringify(merged) }).where(eq(users.id, user.id));
  return { settings: merged };
});

export { settings_put as default };
//# sourceMappingURL=settings.put.mjs.map
