import { d as defineEventHandler, i as getRouterParam, a as db, u as users, h as createError, x as getCurrentUser, a8 as follows, a9 as friends, b as posts, z as enrichUsers, Q as publicUser } from '../../../../nitro/nitro.mjs';
import { eq, and, or, count } from 'drizzle-orm';
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

const profile_get = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) throw createError({ statusCode: 404 });
  const viewer = await getCurrentUser(event);
  const isSelf = !!viewer && viewer.id === id;
  let isFollowing = false;
  if (viewer && !isSelf) {
    const f = await db.query.follows.findFirst({
      where: and(eq(follows.followerId, viewer.id), eq(follows.followingId, id))
    });
    isFollowing = !!f;
  }
  const locked = !!user.isPrivate && !isSelf && !isFollowing;
  let friendStatus = "none";
  if (viewer && !isSelf) {
    const fr = await db.query.friends.findFirst({
      where: or(
        and(eq(friends.userId, viewer.id), eq(friends.friendId, id)),
        and(eq(friends.userId, id), eq(friends.friendId, viewer.id))
      )
    });
    if (fr) {
      if (fr.status === "accepted") friendStatus = "accepted";
      else friendStatus = fr.userId === viewer.id ? "sent" : "received";
    }
  }
  const [followers] = await db.select({ count: count() }).from(follows).where(eq(follows.followingId, id));
  const [following] = await db.select({ count: count() }).from(follows).where(eq(follows.followerId, id));
  const [postsCount] = await db.select({ count: count() }).from(posts).where(eq(posts.userId, id));
  const extras = await enrichUsers([user]);
  return {
    user: publicUser(user, extras[user.id]),
    stats: { followers: followers.count, following: following.count, posts: postsCount.count },
    locked,
    isPrivate: !!user.isPrivate,
    isFollowing,
    isSelf,
    friendStatus
  };
});

export { profile_get as default };
//# sourceMappingURL=profile.get.mjs.map
