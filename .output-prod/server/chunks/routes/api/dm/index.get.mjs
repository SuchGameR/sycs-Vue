import { d as defineEventHandler, r as requireAuth, a as db, M as dmChannelMembers, u as users, T as dmChannels, N as dmMessages, Q as publicUser } from '../../../nitro/nitro.mjs';
import { eq, inArray, desc } from 'drizzle-orm';
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
    orderBy: (c, { desc: desc2 }) => [desc2(c.updatedAt)]
  });
  const lastMessages = await db.query.dmMessages.findMany({
    where: inArray(dmMessages.channelId, channelIds),
    orderBy: [desc(dmMessages.createdAt)],
    limit: 500
  });
  const lastMessageMap = /* @__PURE__ */ new Map();
  for (const m of lastMessages) {
    if (!lastMessageMap.has(m.channelId)) lastMessageMap.set(m.channelId, { content: m.content, createdAt: m.createdAt, senderId: m.senderId, edited: !!m.edited });
  }
  const lastSenders = [...new Set(lastMessages.map((m) => m.senderId))];
  const lastSenderUsers = lastSenders.length ? await db.query.users.findMany({ where: inArray(users.id, lastSenders) }) : [];
  const lastSenderMap = Object.fromEntries(lastSenderUsers.map((u) => [u.id, u]));
  const result = channels.map((ch) => {
    const last = lastMessageMap.get(ch.id);
    return {
      ...ch,
      members: allMembers.filter((m) => m.channelId === ch.id).map((m) => memberUserMap[m.userId]).filter(Boolean).map(publicUser),
      lastMessage: last ? { content: last.content, createdAt: last.createdAt, edited: last.edited, sender: publicUser(lastSenderMap[last.senderId]) } : null
    };
  });
  return { channels: result };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
