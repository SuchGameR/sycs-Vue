import { d as defineNuxtRouteMiddleware, e as executeAsync, $ as $fetch$1, n as navigateTo } from '../virtual/entry.mjs';
import 'nostics';
import 'nostics/formatters/ansi';
import 'vue';
import '../nitro/nitro.mjs';
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
import 'vue-router';
import 'unhead/utils';
import '../routes/renderer.mjs';
import 'unhead/server';
import 'unhead/legacy';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'devalue';
import 'perfect-debounce';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';

var guest_default = defineNuxtRouteMiddleware(async (to) => {
  let __temp, __restore;
  if (to.path === "/") try {
    [__temp, __restore] = executeAsync(() => $fetch$1("/api/auth/me")), await __temp, __restore();
    return navigateTo("/home");
  } catch {
  }
});

export { guest_default as default };
//# sourceMappingURL=guest-GfyNMhEn.mjs.map
