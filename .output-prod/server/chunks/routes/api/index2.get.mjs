import { c as defineEventHandler, E as getCurrentUser, m as createError, g as getQuery, e as db, f as posts, j as reposts, aj as postComments, i as postReactions, ak as follows, al as friends, o as users, h as serializePosts } from '../../_/nitro.mjs';
import { eq, desc, and, inArray, ne } from 'drizzle-orm';
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
  const currentUser = await getCurrentUser(event);
  if (!currentUser) throw createError({ statusCode: 401, message: "\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059" });
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 50);
  const offset = Math.max(Number(query.offset) || 0, 0);
  const cap = offset + limit;
  const myPosts = await db.query.posts.findMany({
    where: eq(posts.userId, currentUser.id),
    columns: { id: true }
  });
  const myPostIds = myPosts.map((p) => p.id);
  const items = [];
  const [repostRows, commentRows, reactionRows] = myPostIds.length ? await Promise.all([
    db.query.reposts.findMany({
      where: and(inArray(reposts.postId, myPostIds), ne(reposts.userId, currentUser.id)),
      orderBy: [desc(reposts.createdAt)],
      limit: cap
    }),
    db.query.postComments.findMany({
      where: and(inArray(postComments.postId, myPostIds), ne(postComments.userId, currentUser.id)),
      orderBy: [desc(postComments.createdAt)],
      limit: cap
    }),
    db.query.postReactions.findMany({
      where: and(inArray(postReactions.postId, myPostIds), ne(postReactions.userId, currentUser.id)),
      orderBy: [desc(postReactions.createdAt)],
      limit: cap
    })
  ]) : [[], [], []];
  const [fls, frs] = await Promise.all([
    db.query.follows.findMany({
      where: eq(follows.followingId, currentUser.id),
      orderBy: [desc(follows.createdAt)],
      limit: cap
    }),
    db.query.friends.findMany({
      where: and(eq(friends.friendId, currentUser.id), eq(friends.status, "pending")),
      orderBy: [desc(friends.createdAt)],
      limit: cap
    })
  ]);
  for (const r of repostRows) items.push({ id: "repost-" + r.id, type: "repost", actorId: r.userId, postId: r.postId, createdAt: r.createdAt });
  for (const r of commentRows) items.push({ id: "comment-" + r.id, type: "comment", actorId: r.userId, postId: r.postId, content: r.content, createdAt: r.createdAt });
  for (const r of reactionRows) items.push({ id: "reaction-" + r.id, type: "reaction", actorId: r.userId, postId: r.postId, emoji: r.emoji, createdAt: r.createdAt });
  for (const r of fls) items.push({ id: "follow-" + r.id, type: "follow", actorId: r.followerId, createdAt: r.createdAt });
  for (const r of frs) items.push({ id: "friend-" + r.id, type: "friend_request", actorId: r.userId, createdAt: r.createdAt });
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const page = items.slice(offset, offset + limit);
  const hasMore = items.length > offset + page.length;
  const [actors, authorities] = await Promise.all([
    (async () => {
      const actorIds = [...new Set(page.map((i) => i.actorId))];
      return actorIds.length ? db.query.users.findMany({ where: inArray(users.id, actorIds) }) : [];
    })(),
    (async () => {
      const postIds = [...new Set(page.map((i) => i.postId).filter(Boolean))];
      if (!postIds.length) return [];
      return db.query.posts.findMany({ where: inArray(posts.id, postIds) });
    })()
  ]);
  const actorMap = Object.fromEntries(actors.map((u) => [u.id, u]));
  const serializedPosts = await serializePosts(authorities, currentUser);
  const postMap = Object.fromEntries(serializedPosts.map((p) => [p.id, p]));
  const result = page.map((i) => ({
    id: i.id,
    type: i.type,
    emoji: i.emoji || null,
    content: i.content || null,
    createdAt: i.createdAt,
    post: i.postId ? postMap[i.postId] || null : null,
    actor: actorMap[i.actorId] ? {
      id: actorMap[i.actorId].id,
      username: actorMap[i.actorId].username,
      displayName: actorMap[i.actorId].displayName,
      avatarUrl: actorMap[i.actorId].avatarUrl
    } : null
  }));
  return { items: result, nextOffset: offset + page.length, hasMore };
});

export { index_get as default };
//# sourceMappingURL=index2.get.mjs.map
