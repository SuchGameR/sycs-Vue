import { d as defineEventHandler, j as readBody, L as broadcast } from '../../../nitro/nitro.mjs';
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

const relay_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const type = typeof body.type === "string" ? body.type : "bridge.event";
  const payload = body.payload && typeof body.payload === "object" && !Array.isArray(body.payload) ? body.payload : { synchronized: true };
  const source = typeof body.source === "string" ? body.source : "bridge";
  broadcast({ type, source, payload, ts: Date.now() });
  return { ok: true };
});

export { relay_post as default };
//# sourceMappingURL=relay.post.mjs.map
