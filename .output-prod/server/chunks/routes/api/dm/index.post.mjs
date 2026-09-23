import { c as defineEventHandler, r as requireAuth, q as readBody, m as createError, e as db, o as users, a3 as hasBlockEitherWay, W as dmChannels, V as dmChannelMembers } from '../../../_/nitro.mjs';
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
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:fs';
import 'node:url';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:path';

const index_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const { participantId } = await readBody(event);
  if (!participantId) throw createError({ statusCode: 400, message: "\u53C2\u52A0\u8005ID\u304C\u5FC5\u8981\u3067\u3059" });
  if (participantId === user.id) throw createError({ statusCode: 400, message: "\u81EA\u5206\u81EA\u8EAB\u3068\u306FDM\u3092\u4F5C\u6210\u3067\u304D\u307E\u305B\u3093" });
  const participant = await db.query.users.findFirst({
    where: eq(users.id, participantId),
    columns: { id: true }
  });
  if (!participant) throw createError({ statusCode: 404, message: "\u30E6\u30FC\u30B6\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  if (await hasBlockEitherWay(user.id, participantId)) {
    throw createError({ statusCode: 403, message: "\u30D6\u30ED\u30C3\u30AF\u4E2D\u306E\u30E6\u30FC\u30B6\u30FC\u3068\u306FDM\u3092\u4F5C\u6210\u3067\u304D\u307E\u305B\u3093" });
  }
  const pairKey = [user.id, participantId].sort().join(":");
  const existing = await db.query.dmChannels.findFirst({
    where: eq(dmChannels.pairKey, pairKey),
    columns: { id: true }
  });
  if (existing) return { channel: { id: existing.id } };
  const channelId = randomUUID();
  try {
    await db.insert(dmChannels).values({ id: channelId, pairKey });
  } catch {
    const dup = await db.query.dmChannels.findFirst({
      where: eq(dmChannels.pairKey, pairKey),
      columns: { id: true }
    });
    if (dup) return { channel: { id: dup.id } };
    throw createError({ statusCode: 500, message: "DM\u3092\u4F5C\u6210\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F" });
  }
  await db.insert(dmChannelMembers).values([
    { id: randomUUID(), channelId, userId: user.id },
    { id: randomUUID(), channelId, userId: participantId }
  ]);
  return { channel: { id: channelId } };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
