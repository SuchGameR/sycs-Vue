import { c as defineEventHandler, r as requireAuth, n as getRouterParam, e as db, V as dmChannelMembers, m as createError, W as dmChannels, X as dmMessages, o as users, Y as pickPublicSummary, Z as getBlockRelation } from '../../../../_/nitro.mjs';
import { and, eq, desc, inArray } from 'drizzle-orm';
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
  const channelId = getRouterParam(event, "id");
  const membership = await db.query.dmChannelMembers.findFirst({
    where: and(eq(dmChannelMembers.channelId, channelId), eq(dmChannelMembers.userId, user.id))
  });
  if (!membership) throw createError({ statusCode: 403, message: "\u3053\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u306B\u30A2\u30AF\u30BB\u30B9\u3067\u304D\u307E\u305B\u3093" });
  const [channel, members, lastMessage] = await Promise.all([
    db.query.dmChannels.findFirst({ where: eq(dmChannels.id, channelId) }),
    db.query.dmChannelMembers.findMany({ where: eq(dmChannelMembers.channelId, channelId) }),
    db.query.dmMessages.findFirst({
      where: eq(dmMessages.channelId, channelId),
      orderBy: [desc(dmMessages.createdAt)]
    })
  ]);
  if (!channel) throw createError({ statusCode: 404, message: "\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093" });
  const memberUserIds = members.map((m) => m.userId);
  const memberUsers = memberUserIds.length ? await db.query.users.findMany({ where: inArray(users.id, memberUserIds) }) : [];
  const memberUserMap = Object.fromEntries(memberUsers.map((u) => [u.id, pickPublicSummary(u)]));
  const otherUser = members.map((m) => memberUserMap[m.userId]).filter(Boolean).find((u) => u.id !== user.id) || null;
  const block = otherUser ? await getBlockRelation(user.id, otherUser.id) : { blocked: false, blockedBy: false };
  let last = null;
  if (lastMessage) {
    const sender = await db.query.users.findFirst({ where: eq(users.id, lastMessage.senderId) });
    last = {
      content: lastMessage.content,
      createdAt: lastMessage.createdAt,
      edited: !!lastMessage.edited,
      sender: pickPublicSummary(sender)
    };
  }
  return {
    channel: {
      id: channel.id,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
      members: memberUserMap,
      otherUser,
      lastMessage: last,
      blocked: block.blocked,
      blockedBy: block.blockedBy
    }
  };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
