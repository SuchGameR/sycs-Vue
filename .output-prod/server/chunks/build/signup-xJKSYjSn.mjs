import { c as components_default } from '../virtual/entry.mjs';
import { N as NuxtLink } from './nuxt-link-DHTgvg7C.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
import 'nostics';
import 'nostics/formatters/ansi';
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
import 'devalue';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';

var signup_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "signup",
  __ssrInlineRender: true,
  setup(__props) {
    const email = ref("");
    const username = ref("");
    const displayName = ref("");
    const password = ref("");
    const error = ref("");
    const loading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_NuxtLink = NuxtLink;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-6" }, _attrs))}><div class="w-full max-w-sm space-y-8"><div class="text-center"><h1 class="text-4xl font-extrabold">SYCS<span class="text-indigo-500">.</span></h1><p class="text-slate-400 mt-2">\u65B0\u898F\u30A2\u30AB\u30A6\u30F3\u30C8\u4F5C\u6210</p></div><form class="space-y-4">`);
      if (unref(error)) _push(`<div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">${ssrInterpolate(unref(error))}</div>`);
      else _push(`<!---->`);
      _push(`<div><label class="block text-sm text-slate-400 mb-1">\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9</label><input${ssrRenderAttr("value", unref(email))} type="email" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="you@example.com"></div><div><label class="block text-sm text-slate-400 mb-1">\u30E6\u30FC\u30B6\u30FC\u540D</label><input${ssrRenderAttr("value", unref(username))} type="text" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="your_username"></div><div><label class="block text-sm text-slate-400 mb-1">\u8868\u793A\u540D</label><input${ssrRenderAttr("value", unref(displayName))} type="text" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="Your Name"></div><div><label class="block text-sm text-slate-400 mb-1">\u30D1\u30B9\u30EF\u30FC\u30C9</label><input${ssrRenderAttr("value", unref(password))} type="password" required minlength="8" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="8\u6587\u5B57\u4EE5\u4E0A"></div><button type="submit"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="w-full py-2.5 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50">${ssrInterpolate(unref(loading) ? "\u767B\u9332\u4E2D..." : "\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u4F5C\u6210")}</button></form><div class="relative"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-700"></div></div><div class="relative flex justify-center text-sm"><span class="bg-[#0b0f19] px-2 text-slate-500">\u307E\u305F\u306F</span></div></div><div class="space-y-3"><a href="/api/auth/github" class="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 border border-slate-700 rounded-lg font-medium hover:bg-slate-700 transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "mdi:github",
        class: "text-xl"
      }, null, _parent));
      _push(` GitHub \u3067\u767B\u9332 </a><a href="/api/auth/google" class="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 border border-slate-700 rounded-lg font-medium hover:bg-slate-700 transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "mdi:google",
        class: "text-xl"
      }, null, _parent));
      _push(` Google \u3067\u767B\u9332 </a></div><p class="text-center text-sm text-slate-500"> \u65E2\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u304A\u6301\u3061\u306E\u65B9\u306F `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/signin",
        class: "text-indigo-400 hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) _push2(`\u30ED\u30B0\u30A4\u30F3`);
          else return [createTextVNode("\u30ED\u30B0\u30A4\u30F3")];
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div>`);
    };
  }
});
var _sfc_setup = signup_vue_vue_type_script_setup_true_lang_default.setup;
signup_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/signup.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var signup_default = signup_vue_vue_type_script_setup_true_lang_default;

export { signup_default as default };
//# sourceMappingURL=signup-xJKSYjSn.mjs.map
