import { c as defineEventHandler, r as requireAuth, ad as createEventStream, ae as subscribeRealtime, af as unsubscribeRealtime } from '../../_/nitro.mjs';
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

const events_get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const stream = createEventStream(event);
  stream.push({ event: "message", data: JSON.stringify({ type: "connected" }) }).catch(() => {
  });
  const sub = {
    userId: user.id,
    push: (data) => stream.push({ event: "message", data })
  };
  subscribeRealtime(sub);
  const hb = setInterval(() => {
    stream.push({ event: "heartbeat", data: "ping" }).catch(() => {
    });
  }, 25e3);
  event.node.req.on("close", () => {
    clearInterval(hb);
    unsubscribeRealtime(sub);
    stream.close();
  });
  return stream.send();
});

export { events_get as default };
//# sourceMappingURL=events.get.mjs.map
