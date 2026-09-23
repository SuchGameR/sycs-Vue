import { c as defineEventHandler, q as readBody, U as broadcast } from '../../../_/nitro.mjs';
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
