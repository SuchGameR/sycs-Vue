import { d as defineNuxtRouteMiddleware, e as executeAsync, $ as $fetch$1, n as navigateTo } from '../virtual/entry.mjs';
import { u as useRequestHeaders } from './ssr-kk-nDyoa.mjs';
import 'nostics';
import 'nostics/formatters/ansi';
import 'vue';
import '../_/nitro.mjs';
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
import 'vue-router';
import 'unhead/utils';
import '../routes/renderer.mjs';
import 'unhead/server';
import 'unhead/legacy';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'devalue';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';

var auth_default = defineNuxtRouteMiddleware(async (to) => {
  let __temp, __restore;
  try {
    const headers = useRequestHeaders(["cookie"]);
    if (!([__temp, __restore] = executeAsync(() => $fetch$1("/api/auth/me", { headers })), __temp = await __temp, __restore(), __temp).user) throw new Error();
  } catch {
    const redirect = to.fullPath;
    return navigateTo(`/signin?redirect=${encodeURIComponent(redirect)}`);
  }
});

export { auth_default as default };
//# sourceMappingURL=auth-DtAW0ZK5.mjs.map
