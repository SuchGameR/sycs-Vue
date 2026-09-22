import { a as useRoute, c as components_default } from '../virtual/entry.mjs';
import { N as NuxtLink } from './nuxt-link-Z61FlDbB.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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

var _code__vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "[code]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    computed(() => route.params.code);
    const data = ref(null);
    const error = ref(null);
    const loading = ref(true);
    const joining = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_Icon = components_default;
      const _component_NuxtLink = NuxtLink;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-full flex items-center justify-center p-4" }, _attrs))}>`);
      if (unref(loading)) _push(`<div class="text-slate-500">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
      else if (unref(error) && !unref(data)) {
        _push(`<div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 text-center">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:link-off",
          class: "w-10 h-10 text-slate-600 mx-auto mb-3"
        }, null, _parent));
        _push(`<h1 class="text-lg font-bold text-white">\u62DB\u5F85\u304C\u7121\u52B9\u3067\u3059</h1><p class="text-sm text-slate-500 mt-1">${ssrInterpolate(unref(error))}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/servers",
          class: "mt-6 inline-block px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) _push2(` \u30B5\u30FC\u30D0\u30FC\u4E00\u89A7\u3078 `);
            else return [createTextVNode(" \u30B5\u30FC\u30D0\u30FC\u4E00\u89A7\u3078 ")];
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (unref(data)) {
        _push(`<div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-8 text-center"><div class="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white mx-auto overflow-hidden">`);
        if (unref(data).server.iconUrl) _push(`<img${ssrRenderAttr("src", unref(data).server.iconUrl)} class="w-full h-full object-cover">`);
        else _push(`<!--[-->${ssrInterpolate((_a = unref(data).server.name) == null ? void 0 : _a.charAt(0))}<!--]-->`);
        _push(`</div><h1 class="text-xl font-bold text-white mt-4">${ssrInterpolate(unref(data).server.name)}</h1><p class="text-sm text-slate-500 mt-1">${ssrInterpolate(unref(data).server.description || "\u3053\u306E\u30B5\u30FC\u30D0\u30FC\u306B\u53C2\u52A0\u3057\u307E\u305B\u3093\u304B\uFF1F")}</p><p class="text-xs text-slate-600 mt-2 flex items-center justify-center gap-1">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:users",
          class: "w-3.5 h-3.5"
        }, null, _parent));
        _push(` ${ssrInterpolate(unref(data).server.memberCount)} \u4EBA\u306E\u30E1\u30F3\u30D0\u30FC\u304C\u3044\u307E\u3059 </p>`);
        if (unref(error)) _push(`<p class="text-xs text-red-400 mt-3">${ssrInterpolate(unref(error))}</p>`);
        else _push(`<!---->`);
        _push(`<button${ssrIncludeBooleanAttr(unref(joining)) ? " disabled" : ""} class="mt-6 w-full py-3 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">`);
        if (unref(joining)) _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:loader-2",
          class: "w-4 h-4 animate-spin"
        }, null, _parent));
        else _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:log-in",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` \u3053\u306E\u30B5\u30FC\u30D0\u30FC\u306B\u53C2\u52A0 </button></div>`);
      } else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup = _code__vue_vue_type_script_setup_true_lang_default.setup;
_code__vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/invite/[code].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _code__default = _code__vue_vue_type_script_setup_true_lang_default;

export { _code__default as default };
//# sourceMappingURL=_code_-BUdsNBJg.mjs.map
