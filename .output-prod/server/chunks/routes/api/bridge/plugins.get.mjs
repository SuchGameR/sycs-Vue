import { d as defineEventHandler, G as registerNuxtSelf, H as nuxtPluginInfo, I as getPlugins } from '../../../nitro/nitro.mjs';
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

const plugins_get = defineEventHandler(async () => {
  registerNuxtSelf();
  return { plugins: getPlugins(), self: nuxtPluginInfo() };
});

export { plugins_get as default };
//# sourceMappingURL=plugins.get.mjs.map
