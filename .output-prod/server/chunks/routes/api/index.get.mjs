import { c as defineEventHandler, e as db, a8 as customEmojis } from '../../_/nitro.mjs';
import { desc } from 'drizzle-orm';
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

const index_get = defineEventHandler(async () => {
  const rows = await db.select().from(customEmojis).orderBy(desc(customEmojis.createdAt));
  return {
    emojis: rows.map((e) => ({
      id: e.id,
      name: e.name,
      url: e.url,
      mime: e.mime,
      animated: !!e.animated,
      creatorId: e.creatorId,
      createdAt: e.createdAt
    }))
  };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
