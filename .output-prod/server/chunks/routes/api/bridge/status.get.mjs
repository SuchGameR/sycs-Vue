import { d as defineEventHandler, E as phpBridgeConfig, I as getPlugins } from '../../../nitro/nitro.mjs';
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

let probeCache = null;
const status_get = defineEventHandler(async () => {
  const cfg = phpBridgeConfig();
  if (!cfg.enabled) {
    return { enabled: false, phpBase: cfg.base, reachable: false, plugins: getPlugins() };
  }
  if (!probeCache || Date.now() - probeCache.at > 15e3) {
    let ok = false;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3e3);
      const url = new URL(cfg.base);
      url.searchParams.set(cfg.paramName, "get_threads");
      await fetch(url.toString(), { method: "GET", signal: ctrl.signal });
      clearTimeout(timer);
      ok = true;
    } catch {
      ok = false;
    }
    probeCache = { at: Date.now(), reachable: ok };
  }
  return { enabled: true, phpBase: cfg.base, reachable: probeCache.reachable, plugins: getPlugins() };
});

export { status_get as default };
//# sourceMappingURL=status.get.mjs.map
