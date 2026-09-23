import { c as defineEventHandler, g as getQuery, E as getCurrentUser, as as isServerMember, m as createError, f as posts, e as db, ai as serverMembers, at as closeFriends, ak as follows, i as postReactions, j as reposts, h as serializePosts, o as users, G as enrichUsers, a0 as publicUser } from '../../_/nitro.mjs';
import { eq, desc, inArray, sql, and, or, lt } from 'drizzle-orm';
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

function decodeCursor(raw) {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s) return null;
  const [ts, id] = String(s).split("|");
  const n = Number(ts);
  if (!id || !Number.isFinite(n)) return null;
  return { createdAt: n, id };
}
function decodeCursorPair(raw) {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s) return { posts: null, boosts: null };
  try {
    const o = JSON.parse(Buffer.from(String(s), "base64url").toString("utf8"));
    return {
      posts: o && Array.isArray(o.p) && o.p.length === 2 ? { createdAt: Number(o.p[0]), id: String(o.p[1]) } : null,
      boosts: o && Array.isArray(o.b) && o.b.length === 2 ? { createdAt: Number(o.b[0]), id: String(o.b[1]) } : null
    };
  } catch {
    const legacy = decodeCursor(s);
    return { posts: legacy, boosts: legacy };
  }
}
const index_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 50);
  const offset = Number(query.offset) || 0;
  const initialCursor = decodeCursorPair(query.cursor);
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
  let boostPool = null;
  if (serverId) {
    if (!currentUser || !await isServerMember(currentUser.id, serverId)) {
      throw createError({ statusCode: 403, message: "\u3053\u306E\u30B5\u30FC\u30D0\u30FC\u306E\u6295\u7A3F\u3092\u95B2\u89A7\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093" });
    }
    conditions.push(eq(posts.serverId, serverId));
    if (channelId) conditions.push(eq(posts.channelId, channelId));
    const members = await db.query.serverMembers.findMany({
      where: eq(serverMembers.serverId, serverId),
      columns: { userId: true }
    });
    boostPool = members.map((m) => m.userId);
  }
  if (targetUserId) {
    conditions.push(eq(posts.userId, targetUserId));
    boostPool = [targetUserId];
  }
  let orderBy = sort === "popular" ? [desc(posts.viewCount), desc(posts.repostCount), desc(posts.createdAt)] : [desc(posts.createdAt)];
  if (!serverId && !targetUserId && currentUser) {
    if (scope === "local") {
      const close = await db.query.closeFriends.findMany({
        where: eq(closeFriends.userId, currentUser.id),
        columns: { friendId: true }
      });
      conditions.push(inArray(posts.userId, [currentUser.id, ...close.map((c) => c.friendId)]));
      boostPool = [currentUser.id, ...close.map((c) => c.friendId)];
    } else if (scope === "following") {
      const follows$1 = await db.query.follows.findMany({
        where: eq(follows.followerId, currentUser.id),
        columns: { followingId: true }
      });
      conditions.push(inArray(posts.userId, [currentUser.id, ...follows$1.map((f) => f.followingId)]));
      boostPool = [currentUser.id, ...follows$1.map((f) => f.followingId)];
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
      boostPool = recommendedIds.length ? recommendedIds : null;
      if (scope === "recommended" || scope === "trending") {
        orderBy = [desc(posts.viewCount), desc(posts.repostCount), desc(posts.createdAt)];
      }
    }
  }
  if (mediaType === "text") {
    conditions.push(sql`NOT EXISTS (SELECT 1 FROM post_attachments pa WHERE pa.post_id = posts.id)`);
  } else if (mediaType) {
    conditions.push(sql`EXISTS (SELECT 1 FROM post_attachments pa WHERE pa.post_id = posts.id AND pa.type = ${mediaType})`);
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
  const includeBoosts = sort === "latest" && !mediaType && !related;
  const boostWhere = includeBoosts ? boostPool && boostPool.length ? and(inArray(reposts.userId, boostPool)) : void 0 : void 0;
  async function fetchBoosts(cursor2) {
    const reposts$1 = await db.query.reposts.findMany({
      where: boostWhere,
      limit,
      offset: cursor2,
      orderBy: [desc(reposts.createdAt)]
    });
    if (!reposts$1.length) return [];
    const ids = [...new Set(reposts$1.map((r) => r.postId))];
    const rows = await db.query.posts.findMany({ where: inArray(posts.id, ids) });
    const map = new Map(rows.map((p) => [p.id, p]));
    return reposts$1.filter((r) => map.has(r.postId)).map((r) => ({ createdAt: r.createdAt, reposterId: r.userId, post: map.get(r.postId) }));
  }
  const reposterCache = /* @__PURE__ */ new Map();
  async function ensureReposters(ids) {
    const missing = [...new Set(ids)].filter((id) => !reposterCache.has(id));
    if (!missing.length) return;
    const us = await db.query.users.findMany({ where: inArray(users.id, missing) });
    const extras = await enrichUsers(us);
    for (const u of us) reposterCache.set(u.id, publicUser(u, extras[u.id]));
  }
  const useKeyset = sort === "latest";
  function encodeCursorPair(postsCur, boostsCur) {
    return Buffer.from(JSON.stringify({
      p: postsCur ? [postsCur.createdAt, postsCur.id] : null,
      b: boostsCur ? [boostsCur.createdAt, boostsCur.id] : null
    })).toString("base64url");
  }
  async function fetchPostsWindow(prev, take) {
    const keyCond = prev ? or(
      lt(posts.createdAt, new Date(prev.createdAt)),
      and(eq(posts.createdAt, new Date(prev.createdAt)), lt(posts.id, prev.id))
    ) : void 0;
    return db.query.posts.findMany({
      where: and(...conditions, keyCond),
      orderBy: [desc(posts.createdAt), desc(posts.id)],
      limit: take
    });
  }
  async function fetchBoostsKeyset(prev, take) {
    const keyCond = prev ? or(
      lt(reposts.createdAt, new Date(prev.createdAt)),
      and(eq(reposts.createdAt, new Date(prev.createdAt)), lt(reposts.id, prev.id))
    ) : void 0;
    const reposts$1 = await db.query.reposts.findMany({
      where: and(boostWhere, keyCond),
      orderBy: [desc(reposts.createdAt), desc(reposts.id)],
      limit: take
    });
    if (!reposts$1.length) return [];
    const ids = [...new Set(reposts$1.map((r) => r.postId))];
    const rows = await db.query.posts.findMany({ where: inArray(posts.id, ids) });
    const map = new Map(rows.map((p) => [p.id, p]));
    return reposts$1.filter((r) => map.has(r.postId)).map((r) => ({ createdAt: r.createdAt, reposterId: r.userId, post: map.get(r.postId), repostId: r.id }));
  }
  const collected = [];
  const boostShown = /* @__PURE__ */ new Set();
  let cursor = offset;
  let postCursor = initialCursor.posts;
  let boostCursor = initialCursor.boosts;
  let postExhausted = false;
  let boostExhausted = false;
  const boostActive = includeBoosts && (boostPool ? boostPool.length > 0 : true);
  let reachedEnd = false;
  let pageFull = false;
  while (collected.length < limit && !reachedEnd && !pageFull) {
    let postsBatch;
    let boostsBatch;
    if (useKeyset) {
      postsBatch = postExhausted ? [] : await fetchPostsWindow(postCursor, limit);
      if (!postsBatch.length) postExhausted = true;
      boostsBatch = boostActive && !boostExhausted ? await fetchBoostsKeyset(boostCursor, limit) : [];
      if (boostActive && !boostsBatch.length) boostExhausted = true;
    } else {
      postsBatch = await db.query.posts.findMany({ limit, offset: cursor, where, orderBy });
      boostsBatch = boostActive ? await fetchBoosts(cursor) : [];
    }
    if (!postsBatch.length && !boostsBatch.length) {
      reachedEnd = true;
      break;
    }
    await ensurePrivacy([...postsBatch, ...boostsBatch.map((b) => b.post)]);
    await ensureReposters(boostsBatch.map((b) => b.reposterId));
    const postsItems = postsBatch.map((p) => ({ kind: "post", createdAt: p.createdAt, row: p }));
    const boostItems = boostsBatch.map((b) => ({ kind: "boost", createdAt: b.createdAt, row: b }));
    const merged = [];
    let i = 0;
    let j = 0;
    while (i < postsItems.length || j < boostItems.length) {
      if (j >= boostItems.length || i < postsItems.length && +postsItems[i].createdAt >= +boostItems[j].createdAt) {
        merged.push(postsItems[i]);
        i++;
      } else {
        merged.push(boostItems[j]);
        j++;
      }
    }
    for (const item of merged) {
      if (collected.length >= limit) {
        pageFull = true;
        break;
      }
      if (useKeyset) {
        if (item.kind === "post") postCursor = { createdAt: +item.createdAt, id: item.row.id };
        else boostCursor = { createdAt: +item.createdAt, id: item.row.repostId };
      } else {
        cursor++;
      }
      if (item.kind === "post") {
        if (isVisible(item.row) && authorVisible(item.row)) collected.push(item.row);
      } else {
        const p = item.row.post;
        if (boostShown.has(p.id)) continue;
        if (isVisible(p) && authorVisible(p)) {
          collected.push({
            ...p,
            boostedBy: { user: reposterCache.get(item.row.reposterId) || null, repostedAt: item.row.createdAt }
          });
          boostShown.add(p.id);
        }
      }
    }
    if (useKeyset) {
      if (postExhausted && (!boostActive || boostExhausted)) {
        reachedEnd = true;
        break;
      }
    } else if (postsBatch.length < limit && boostsBatch.length < limit) {
      reachedEnd = true;
    }
  }
  const result = await serializePosts(collected, currentUser);
  if (useKeyset) {
    return { posts: result, nextOffset: cursor, nextCursor: encodeCursorPair(postCursor, boostCursor), hasMore: !reachedEnd };
  }
  return { posts: result, nextOffset: cursor, hasMore: !reachedEnd };
});

export { index_get as default };
//# sourceMappingURL=index4.get.mjs.map
