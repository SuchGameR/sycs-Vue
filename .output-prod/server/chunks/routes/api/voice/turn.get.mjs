import { c as defineEventHandler } from '../../../_/nitro.mjs';
import 'crypto';
import 'drizzle-orm';
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

const turn_get = defineEventHandler(() => {
  const urls = process.env.TURN_URLS;
  if (!urls) return { urls: [] };
  return {
    urls: urls.split(",").map((u) => u.trim()).filter(Boolean),
    username: process.env.TURN_USERNAME,
    credential: process.env.TURN_PASSWORD
  };
});

export { turn_get as default };
//# sourceMappingURL=turn.get.mjs.map
