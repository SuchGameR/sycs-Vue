import { c as defineEventHandler, r as requireAuth, q as readBody, e as db, o as users } from '../../../_/nitro.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const profile_put = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  const updates = {};
  if (body.displayName !== void 0) updates.displayName = body.displayName;
  if (body.bio !== void 0) updates.bio = body.bio;
  if (body.avatarUrl !== void 0) updates.avatarUrl = body.avatarUrl;
  if (body.bannerUrl !== void 0) updates.bannerUrl = body.bannerUrl;
  if (body.isPrivate !== void 0) updates.isPrivate = !!body.isPrivate;
  if (body.statusMessage !== void 0) updates.statusMessage = body.statusMessage;
  updates.updatedAt = /* @__PURE__ */ new Date();
  const [updated] = await db.update(users).set(updates).where(eq(users.id, user.id)).returning();
  return { user: updated };
});

export { profile_put as default };
//# sourceMappingURL=profile.put.mjs.map
