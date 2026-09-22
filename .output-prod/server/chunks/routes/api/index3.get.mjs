import { d as defineEventHandler, r as requireAuth, g as getQuery, a as db, aa as playlists, ab as playlistItems, ac as postAttachments } from '../../nitro/nitro.mjs';
import { desc, eq, inArray } from 'drizzle-orm';
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
  const { postId } = getQuery(event);
  const lists = await db.query.playlists.findMany({
    where: eq(playlists.userId, user.id),
    orderBy: [desc(playlists.updatedAt)]
  });
  if (!lists.length) return { playlists: [] };
  const listIds = lists.map((l) => l.id);
  const items = await db.query.playlistItems.findMany({
    where: inArray(playlistItems.playlistId, listIds),
    orderBy: [playlistItems.position]
  });
  const countByList = /* @__PURE__ */ new Map();
  const firstPostByList = /* @__PURE__ */ new Map();
  const contains = /* @__PURE__ */ new Set();
  for (const item of items) {
    countByList.set(item.playlistId, (countByList.get(item.playlistId) || 0) + 1);
    if (!firstPostByList.has(item.playlistId)) firstPostByList.set(item.playlistId, item.postId);
    if (postId && item.postId === postId) contains.add(item.playlistId);
  }
  const firstPostIds = [...firstPostByList.values()];
  const coverByPost = /* @__PURE__ */ new Map();
  if (firstPostIds.length) {
    const attachments = await db.query.postAttachments.findMany({
      where: inArray(postAttachments.postId, firstPostIds),
      orderBy: [postAttachments.position]
    });
    for (const a of attachments) {
      if (!coverByPost.has(a.postId)) coverByPost.set(a.postId, a.url);
    }
  }
  return {
    playlists: lists.map((l) => ({
      ...l,
      count: countByList.get(l.id) || 0,
      coverUrl: coverByPost.get(firstPostByList.get(l.id) || "") || null,
      contains: contains.has(l.id)
    }))
  };
});

export { index_get as default };
//# sourceMappingURL=index3.get.mjs.map
