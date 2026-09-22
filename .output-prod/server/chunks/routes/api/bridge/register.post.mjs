import { d as defineEventHandler, E as phpBridgeConfig, j as readBody, h as createError, J as registerPlugin, K as hasPlugin, G as registerNuxtSelf, H as nuxtPluginInfo } from '../../../nitro/nitro.mjs';
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

const register_post = defineEventHandler(async (event) => {
  const cfg = phpBridgeConfig();
  const body = await readBody(event);
  const id = typeof body.id === "string" ? body.id : "";
  const name = typeof body.name === "string" ? body.name : "";
  if (!id || !name) {
    throw createError({ statusCode: 400, message: "id and name are required" });
  }
  const info = registerPlugin({
    id,
    name,
    version: typeof body.version === "string" ? body.version : "1.0.0",
    source: typeof body.source === "string" && body.source || "php",
    apiBase: typeof body.apiBase === "string" ? body.apiBase : void 0,
    capabilities: Array.isArray(body.capabilities) ? body.capabilities.filter((c) => typeof c === "string") : [],
    events: Array.isArray(body.events) ? body.events.filter((e) => typeof e === "string") : []
  });
  if (cfg.enabled && !hasPlugin("nuxt-brandnew")) {
    registerNuxtSelf();
  }
  return { ok: true, plugin: info, self: nuxtPluginInfo() };
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
