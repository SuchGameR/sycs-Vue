import { d as defineEventHandler, g as getQuery, x as getCurrentUser, af as isServerMember, h as createError, b as posts, a as db, ag as closeFriends, a8 as follows, c as postReactions, ac as postAttachments, s as serializePosts, u as users } from '../../nitro/nitro.mjs';
import { eq, desc, inArray, notInArray, and } from 'drizzle-orm';
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
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const offset = Number(query.offset) || 0;
  let scope = String(query.scope || "");
  const legacy = String(query.timeline || "");
  if (!scope && legacy) scope = legacy;
  if (!scope) scope = "global";
  const sort = String(query.sort || (scope === "recommended" || scope === "trending" ? "popular" : "latest"));
  const mediaType = query.mediaType ? String(query.mediaType) : "";
  const targetUserId = query.userId ? String(query.userId) : "";
  const related = String(query.related || "") === "true";
  const serverId = query.serverId ? String(query.serverId) : "";
  const channelId = query.channelId ? String(query.channelId) : "";
  const currentUser = await getCurrentUser(event);
  const conditions = [];
  if (serverId) {
    if (!currentUser || !await isServerMember(currentUser.id, serverId)) {
      throw createError({ statusCode: 403, message: "\u3053\u306E\u30B5\u30FC\u30D0\u30FC\u306E\u6295\u7A3F\u3092\u95B2\u89A7\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093" });
    }
    conditions.push(eq(posts.serverId, serverId));
    if (channelId) conditions.push(eq(posts.channelId, channelId));
  }
  if (targetUserId) {
    conditions.push(eq(posts.userId, targetUserId));
  }
  let orderBy = sort === "popular" ? [desc(posts.viewCount), desc(posts.repostCount), desc(posts.createdAt)] : [desc(posts.createdAt)];
  if (!serverId && !targetUserId && currentUser) {
    if (scope === "local") {
      const close = await db.query.closeFriends.findMany({
        where: eq(closeFriends.userId, currentUser.id),
        columns: { friendId: true }
      });
      conditions.push(inArray(posts.userId, [currentUser.id, ...close.map((c) => c.friendId)]));
    } else if (scope === "following") {
      const follows$1 = await db.query.follows.findMany({
        where: eq(follows.followerId, currentUser.id),
        columns: { followingId: true }
      });
      conditions.push(inArray(posts.userId, [currentUser.id, ...follows$1.map((f) => f.followingId)]));
    } else if (scope === "recommended" || scope === "trending" || related) {
      const follows$1 = await db.query.follows.findMany({
        where: eq(follows.followerId, currentUser.id),
        columns: { followingId: true }
      });
      const followedIds = follows$1.map((f) => f.followingId);
      let recommendedIds = [currentUser.id, ...followedIds];
      if (scope === "recommended" || related) {
        const reactedPosts = await db.query.postReactions.findMany({
          where: eq(postReactions.userId, currentUser.id),
          columns: { postId: true },
          limit: 50,
          orderBy: [desc(postReactions.createdAt)]
        });
        if (reactedPosts.length) {
          const reactedPosters = await db.query.posts.findMany({
            where: inArray(posts.id, reactedPosts.map((l) => l.postId)),
            columns: { userId: true }
          });
          recommendedIds = [.../* @__PURE__ */ new Set([...recommendedIds, ...reactedPosters.map((p) => p.userId)])];
        }
      }
      if (recommendedIds.length) {
        conditions.push(inArray(posts.userId, recommendedIds));
      }
      if (scope === "recommended" || scope === "trending") {
        orderBy = [desc(posts.viewCount), desc(posts.repostCount), desc(posts.createdAt)];
      }
    }
  }
  if (mediaType === "text") {
    const withAttachments = await db.query.postAttachments.findMany({
      columns: { postId: true }
    });
    const ids = [...new Set(withAttachments.map((a) => a.postId))];
    if (ids.length) conditions.push(notInArray(posts.id, ids));
  } else if (mediaType) {
    const matching = await db.query.postAttachments.findMany({
      where: eq(postAttachments.type, mediaType),
      columns: { postId: true }
    });
    const ids = [...new Set(matching.map((a) => a.postId))];
    if (!ids.length) return { posts: [] };
    conditions.push(inArray(posts.id, ids));
  }
  const where = conditions.length ? and(...conditions) : void 0;
  const followers = /* @__PURE__ */ new Set();
  const closeFriends$1 = /* @__PURE__ */ new Set();
  if (currentUser) {
    const fls = await db.query.follows.findMany({ where: eq(follows.followerId, currentUser.id) });
    fls.forEach((f) => followers.add(f.followingId));
    const cfs = await db.query.closeFriends.findMany({ where: eq(closeFriends.userId, currentUser.id) });
    cfs.forEach((f) => closeFriends$1.add(f.friendId));
  }
  const isVisible = (p) => {
    if (p.visibility === "public") return true;
    if (!currentUser) return false;
    if (p.userId === currentUser.id) return true;
    if (p.visibility === "followers" && followers.has(p.userId)) return true;
    if (p.visibility === "close_friends" && closeFriends$1.has(p.userId)) return true;
    if (p.visibility === "specific") {
      const visibleTo = JSON.parse(p.visibleTo || "[]");
      if (visibleTo.includes(currentUser.id)) return true;
    }
    return false;
  };
  const privacyCache = /* @__PURE__ */ new Map();
  async function ensurePrivacy(rows) {
    const missing = [...new Set(rows.map((r) => r.userId))].filter((uid) => !privacyCache.has(uid));
    if (!missing.length) return;
    const us = await db.query.users.findMany({
      where: inArray(users.id, missing),
      columns: { id: true, isPrivate: true }
    });
    for (const u of us) privacyCache.set(u.id, !!u.isPrivate);
  }
  const authorVisible = (p) => {
    if (serverId) return true;
    if (!privacyCache.get(p.userId)) return true;
    if (!currentUser) return false;
    if (p.userId === currentUser.id) return true;
    return followers.has(p.userId);
  };
  const collected = [];
  let cursor = offset;
  let reachedEnd = false;
  let pageFull = false;
  while (collected.length < limit && !reachedEnd && !pageFull) {
    const batch = await db.query.posts.findMany({ limit, offset: cursor, where, orderBy });
    if (!batch.length) {
      reachedEnd = true;
      break;
    }
    await ensurePrivacy(batch);
    for (const row of batch) {
      if (isVisible(row) && authorVisible(row)) {
        if (collected.length >= limit) {
          pageFull = true;
          break;
        }
        collected.push(row);
      }
      cursor++;
    }
    if (batch.length < limit) reachedEnd = true;
  }
  const result = await serializePosts(collected, currentUser);
  return { posts: result, nextOffset: cursor, hasMore: !reachedEnd };
});

export { index_get as default };
//# sourceMappingURL=index4.get.mjs.map
