import { d as defineEventHandler, B as clearAuthCookie } from '../../../nitro/nitro.mjs';
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
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';

const signout_post = defineEventHandler(async (event) => {
  clearAuthCookie(event);
  return { success: true };
});

export { signout_post as default };
//# sourceMappingURL=signout.post.mjs.map
