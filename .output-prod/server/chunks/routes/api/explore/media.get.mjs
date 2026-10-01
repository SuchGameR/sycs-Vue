import { d as defineEventHandler, g as getQuery, aa as isMediaKind, y as getCurrentUser, a as db, ab as follows, ac as closeFriends, ad as attachmentKindFilter, b as posts, u as users, s as serializePosts } from '../../../nitro/nitro.mjs';
import { eq, sql, notInArray, and, inArray } from 'drizzle-orm';
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

const media_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 24);
  const media = isMediaKind(query.media) ? query.media : "";
  const sort = ["random", "new", "old", "popular"].includes(String(query.sort)) ? String(query.sort) : "random";
  const exclude = String(query.exclude || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 300);
  const currentUser = await getCurrentUser(event);
  const followers = /* @__PURE__ */ new Set();
  const closeFriends$1 = /* @__PURE__ */ new Set();
  if (currentUser) {
    const fls = await db.query.follows.findMany({ where: eq(follows.followerId, currentUser.id) });
    fls.forEach((f) => followers.add(f.followingId));
    const cfs = await db.query.closeFriends.findMany({ where: eq(closeFriends.userId, currentUser.id) });
    cfs.forEach((c) => closeFriends$1.add(c.friendId));
  }
  const anyKind = media ? attachmentKindFilter(media, sql`pa.mime`, sql`pa.url`) : null;
  const conditions = [
    media ? sql`EXISTS (SELECT 1 FROM post_attachments pa WHERE pa.post_id = posts.id AND ${anyKind})` : sql`EXISTS (
            SELECT 1 FROM post_attachments pa
            WHERE pa.post_id = posts.id
              AND (${attachmentKindFilter("image", sql`pa.mime`, sql`pa.url`)}
                OR ${attachmentKindFilter("video", sql`pa.mime`, sql`pa.url`)}
                OR ${attachmentKindFilter("audio", sql`pa.mime`, sql`pa.url`)}
                OR ${attachmentKindFilter("model", sql`pa.mime`, sql`pa.url`)})
          )`
  ];
  if (exclude.length) conditions.push(notInArray(posts.id, exclude));
  const ORDER = {
    random: sql`RANDOM()`,
    new: sql`posts.created_at DESC`,
    old: sql`posts.created_at ASC`,
    popular: sql`(posts.like_count * 3 + posts.repost_count * 5 + posts.view_count) DESC NULLS LAST`
  };
  const candidates = await db.query.posts.findMany({
    where: and(...conditions),
    orderBy: ORDER[sort],
    limit: limit * 6
  });
  if (!candidates.length) return { posts: [] };
  const authors = await db.query.users.findMany({
    where: inArray(users.id, [...new Set(candidates.map((p) => p.userId))]),
    columns: { id: true, isPrivate: true }
  });
  const isPrivate = new Map(authors.map((u) => [u.id, !!u.isPrivate]));
  const visible = candidates.filter((p) => {
    const isSelf = !!currentUser && p.userId === currentUser.id;
    if (isPrivate.get(p.userId) && !isSelf && !(currentUser && followers.has(p.userId))) return false;
    if (p.visibility === "public") return true;
    if (!currentUser) return false;
    if (isSelf) return true;
    if (p.visibility === "followers") return followers.has(p.userId);
    if (p.visibility === "close_friends") return closeFriends$1.has(p.userId);
    if (p.visibility === "specific") {
      try {
        return JSON.parse(p.visibleTo || "[]").includes(currentUser.id);
      } catch {
        return false;
      }
    }
    return false;
  }).slice(0, limit);
  return { posts: await serializePosts(visible, currentUser) };
});

export { media_get as default };
//# sourceMappingURL=media.get.mjs.map
