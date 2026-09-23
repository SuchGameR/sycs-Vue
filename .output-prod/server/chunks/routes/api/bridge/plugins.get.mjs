import { c as defineEventHandler, P as registerNuxtSelf, Q as nuxtPluginInfo, R as getPlugins } from '../../../_/nitro.mjs';
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

const plugins_get = defineEventHandler(async () => {
  registerNuxtSelf();
  return { plugins: getPlugins(), self: nuxtPluginInfo() };
});

export { plugins_get as default };
//# sourceMappingURL=plugins.get.mjs.map
