import { c as defineEventHandler, n as getRouterParam, g as getQuery, E as getCurrentUser, e as db, o as users, ak as follows, f as posts, j as reposts, G as enrichUsers, a0 as publicUser, h as serializePosts } from '../../../../_/nitro.mjs';
import { eq, and, desc, inArray } from 'drizzle-orm';
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

const posts_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const offset = Number(query.offset) || 0;
  const currentUser = await getCurrentUser(event);
  const target = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { id: true, isPrivate: true }
  });
  if ((target == null ? void 0 : target.isPrivate) && (currentUser == null ? void 0 : currentUser.id) !== id) {
    let isFollowing = false;
    if (currentUser) {
      const f = await db.query.follows.findFirst({
        where: and(eq(follows.followerId, currentUser.id), eq(follows.followingId, id))
      });
      isFollowing = !!f;
    }
    if (!isFollowing) {
      return { posts: [], nextOffset: offset, hasMore: false, locked: true };
    }
  }
  const posts$1 = await db.query.posts.findMany({
    where: eq(posts.userId, id),
    limit,
    offset,
    orderBy: [desc(posts.createdAt)]
  });
  const reposts$1 = await db.query.reposts.findMany({
    where: eq(reposts.userId, id),
    limit,
    offset,
    orderBy: [desc(reposts.createdAt)]
  });
  const repostedIds = [...new Set(reposts$1.map((r) => r.postId))];
  const repostedRows = repostedIds.length ? await db.query.posts.findMany({ where: inArray(posts.id, repostedIds) }) : [];
  const repostedMap = new Map(repostedRows.map((p) => [p.id, p]));
  const targetUser = await db.query.users.findFirst({ where: eq(users.id, id) });
  const extras = targetUser ? await enrichUsers([targetUser]) : {};
  const reposterPublic = targetUser ? publicUser(targetUser, extras[targetUser.id]) : null;
  const postItems = posts$1.map((p) => ({ createdAt: p.createdAt, row: p }));
  const boostItems = reposts$1.filter((r) => repostedMap.has(r.postId)).map((r) => ({
    createdAt: r.createdAt,
    row: {
      ...repostedMap.get(r.postId),
      boostedBy: { user: reposterPublic, repostedAt: r.createdAt }
    }
  }));
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < postItems.length || j < boostItems.length) {
    if (j >= boostItems.length || i < postItems.length && +postItems[i].createdAt >= +boostItems[j].createdAt) {
      merged.push(postItems[i]);
      i++;
    } else {
      merged.push(boostItems[j]);
      j++;
    }
  }
  const rows = merged.slice(0, limit);
  const result = await serializePosts(rows.map((r) => r.row), currentUser);
  return { posts: result, nextOffset: offset + rows.length, hasMore: rows.length === limit };
});

export { posts_get as default };
//# sourceMappingURL=posts.get.mjs.map
