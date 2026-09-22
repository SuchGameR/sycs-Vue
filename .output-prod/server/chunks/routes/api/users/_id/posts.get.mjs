import { d as defineEventHandler, i as getRouterParam, g as getQuery, x as getCurrentUser, a as db, u as users, a8 as follows, b as posts, z as enrichUsers, Q as publicUser, ac as postAttachments, l as likes, e as reposts, D as bookmarks } from '../../../../nitro/nitro.mjs';
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
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';

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
  const userIds = [...new Set(posts$1.map((p) => p.userId))];
  const users$1 = userIds.length ? await db.query.users.findMany({ where: inArray(users.id, userIds) }) : [];
  const extras = await enrichUsers(users$1);
  const userMap = Object.fromEntries(users$1.map((u) => [u.id, publicUser(u, extras[u.id])]));
  const postIds = posts$1.map((p) => p.id);
  const attachments = postIds.length ? await db.query.postAttachments.findMany({
    where: inArray(postAttachments.postId, postIds),
    orderBy: [postAttachments.position]
  }) : [];
  const attachMap = {};
  for (const a of attachments) {
    if (!attachMap[a.postId]) attachMap[a.postId] = [];
    attachMap[a.postId].push(a);
  }
  let userLikes = /* @__PURE__ */ new Set();
  let userReposts = /* @__PURE__ */ new Set();
  let userBookmarks = /* @__PURE__ */ new Set();
  if (currentUser && postIds.length) {
    const likes$1 = await db.query.likes.findMany({
      where: and(eq(likes.userId, currentUser.id), inArray(likes.postId, postIds))
    });
    likes$1.forEach((l) => userLikes.add(l.postId));
    const repsts = await db.query.reposts.findMany({
      where: and(eq(reposts.userId, currentUser.id), inArray(reposts.postId, postIds))
    });
    repsts.forEach((r) => userReposts.add(r.postId));
    const bms = await db.query.bookmarks.findMany({
      where: and(eq(bookmarks.userId, currentUser.id), inArray(bookmarks.postId, postIds))
    });
    bms.forEach((b) => userBookmarks.add(b.postId));
  }
  const result = posts$1.map((p) => {
    var _a, _b;
    return {
      ...p,
      likeCount: (_a = p.likeCount) != null ? _a : 0,
      repostCount: (_b = p.repostCount) != null ? _b : 0,
      user: userMap[p.userId] || null,
      attachments: attachMap[p.id] || [],
      liked: userLikes.has(p.id),
      reposted: userReposts.has(p.id),
      bookmarked: userBookmarks.has(p.id)
    };
  });
  return { posts: result, nextOffset: offset + posts$1.length, hasMore: posts$1.length === limit };
});

export { posts_get as default };
//# sourceMappingURL=posts.get.mjs.map
