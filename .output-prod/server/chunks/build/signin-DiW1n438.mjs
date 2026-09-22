import { a as useRoute, c as components_default } from '../virtual/entry.mjs';
import { N as NuxtLink } from './nuxt-link-Z61FlDbB.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderComponent } from 'vue/server-renderer';
import 'nostics';
import 'nostics/formatters/ansi';
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
import 'devalue';
import 'perfect-debounce';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';

var signin_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "signin",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const login = ref("");
    const password = ref("");
    const rememberMe = ref(true);
    const error = ref("");
    const loading = ref(false);
    const redirectTarget = computed(() => {
      const r = route.query.redirect;
      if (typeof r !== "string" || !r.startsWith("/") || r.startsWith("//")) return "/home";
      return r;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_NuxtLink = NuxtLink;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#0b0f19] text-white flex items-center justify-center p-6" }, _attrs))}><div class="w-full max-w-sm space-y-8"><div class="text-center"><h1 class="text-4xl font-extrabold">SYCS<span class="text-indigo-500">.</span></h1><p class="text-slate-400 mt-2">\u30ED\u30B0\u30A4\u30F3</p></div><form class="space-y-4">`);
      if (unref(error)) _push(`<div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">${ssrInterpolate(unref(error))}</div>`);
      else _push(`<!---->`);
      _push(`<div><label class="block text-sm text-slate-400 mb-1">\u30E6\u30FC\u30B6\u30FCID \u307E\u305F\u306F \u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9</label><input${ssrRenderAttr("value", unref(login))} required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="username or you@example.com" autocomplete="username"></div><div><label class="block text-sm text-slate-400 mb-1">\u30D1\u30B9\u30EF\u30FC\u30C9</label><input${ssrRenderAttr("value", unref(password))} type="password" required class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="********"></div><label class="flex items-center gap-2 cursor-pointer"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(rememberMe)) ? ssrLooseContain(unref(rememberMe), null) : unref(rememberMe)) ? " checked" : ""} class="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800"><span class="text-sm text-slate-400">\u30ED\u30B0\u30A4\u30F3\u3092\u4FDD\u6301\u3059\u308B</span></label><button type="submit"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="w-full py-2.5 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50">${ssrInterpolate(unref(loading) ? "\u30ED\u30B0\u30A4\u30F3\u4E2D..." : "\u30ED\u30B0\u30A4\u30F3")}</button></form><div class="relative"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-700"></div></div><div class="relative flex justify-center text-sm"><span class="bg-[#0b0f19] px-2 text-slate-500">\u307E\u305F\u306F</span></div></div><div class="space-y-3"><a${ssrRenderAttr("href", `/api/auth/github?redirect=${encodeURIComponent(unref(redirectTarget))}`)} class="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 border border-slate-700 rounded-lg font-medium hover:bg-slate-700 transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "mdi:github",
        class: "text-xl"
      }, null, _parent));
      _push(` GitHub \u3067\u30ED\u30B0\u30A4\u30F3 </a><a${ssrRenderAttr("href", `/api/auth/google?redirect=${encodeURIComponent(unref(redirectTarget))}`)} class="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 border border-slate-700 rounded-lg font-medium hover:bg-slate-700 transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "mdi:google",
        class: "text-xl"
      }, null, _parent));
      _push(` Google \u3067\u30ED\u30B0\u30A4\u30F3 </a></div><p class="text-center text-sm text-slate-500"> \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u304A\u6301\u3061\u3067\u306A\u3044\u65B9\u306F `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/signup",
        class: "text-indigo-400 hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) _push2(`\u65B0\u898F\u767B\u9332`);
          else return [createTextVNode("\u65B0\u898F\u767B\u9332")];
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div>`);
    };
  }
});
var _sfc_setup = signin_vue_vue_type_script_setup_true_lang_default.setup;
signin_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/signin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var signin_default = signin_vue_vue_type_script_setup_true_lang_default;

export { signin_default as default };
//# sourceMappingURL=signin-DiW1n438.mjs.map
