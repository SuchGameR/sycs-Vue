import { c as defineEventHandler, r as requireAuth, e as db, V as dmChannelMembers, o as users, W as dmChannels, Y as pickPublicSummary } from '../../../_/nitro.mjs';
import { eq, inArray, sql } from 'drizzle-orm';
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

const index_get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const memberships = await db.query.dmChannelMembers.findMany({
    where: eq(dmChannelMembers.userId, user.id),
    columns: { channelId: true }
  });
  if (!memberships.length) return { channels: [] };
  const channelIds = memberships.map((m) => m.channelId);
  const allMembers = await db.query.dmChannelMembers.findMany({
    where: inArray(dmChannelMembers.channelId, channelIds)
  });
  const memberUserIds = [...new Set(allMembers.map((m) => m.userId))];
  const memberUsers = memberUserIds.length ? await db.query.users.findMany({ where: inArray(users.id, memberUserIds) }) : [];
  const memberUserMap = Object.fromEntries(memberUsers.map((u) => [u.id, u]));
  const channels = await db.query.dmChannels.findMany({
    where: inArray(dmChannels.id, channelIds),
    orderBy: (c, { desc }) => [desc(c.updatedAt)]
  });
  const lastRows = await db.execute(sql`
    SELECT DISTINCT ON (channel_id) channel_id, id, sender_id, content, created_at, edited
    FROM dm_messages
    WHERE channel_id IN (${sql.join(channelIds.map((id) => sql`${id}`), ",")})
    ORDER BY channel_id, created_at DESC
  `);
  const lastMessageMap = /* @__PURE__ */ new Map();
  for (const r of lastRows.rows) {
    lastMessageMap.set(r.channel_id, {
      content: r.content,
      createdAt: r.created_at,
      senderId: r.sender_id,
      edited: !!r.edited
    });
  }
  const lastSenders = [...lastMessageMap.values()].map((m) => m.senderId);
  const lastSenderUsers = lastSenders.length ? await db.query.users.findMany({ where: inArray(users.id, lastSenders) }) : [];
  const lastSenderMap = Object.fromEntries(lastSenderUsers.map((u) => [u.id, u]));
  const result = channels.map((ch) => {
    const last = lastMessageMap.get(ch.id);
    return {
      ...ch,
      members: allMembers.filter((m) => m.channelId === ch.id).map((m) => memberUserMap[m.userId]).filter(Boolean).map(pickPublicSummary),
      lastMessage: last ? { content: last.content, createdAt: last.createdAt, edited: last.edited, sender: pickPublicSummary(lastSenderMap[last.senderId]) } : null
    };
  });
  return { channels: result };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
