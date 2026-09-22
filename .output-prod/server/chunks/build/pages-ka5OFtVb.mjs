import { u as useFetch } from './fetch-CdHJIb6H.mjs';
import { N as NuxtLink } from './nuxt-link-Z61FlDbB.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import '../virtual/entry.mjs';
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
import './ssr-8ixC2dth.mjs';
import '@vue/shared';
import 'fnv1a-64';
import 'object-identity';

var index_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: me } = useFetch("/api/auth/me", {
      key: "landing-auth",
      lazy: true
    }, "$CVlYSUTFth");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = NuxtLink;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6" }, _attrs))}><div class="max-w-xl text-center space-y-8"><h1 class="text-6xl font-extrabold tracking-tighter">SYCS<span class="text-indigo-500">.</span></h1><p class="text-xl text-slate-400">\u6B21\u4E16\u4EE3\u306E\u5206\u6563\u578B\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u4F53\u9A13\u3092\u3001\u3053\u3053\u304B\u3089\u3002</p><div class="flex gap-4 justify-center">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/signup",
        class: "px-8 py-3 bg-indigo-600 rounded-full font-bold hover:bg-indigo-700 transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) _push2(`\u65B0\u898F\u767B\u9332`);
          else return [createTextVNode("\u65B0\u898F\u767B\u9332")];
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/signin",
        class: "px-8 py-3 bg-slate-800 rounded-full font-bold hover:bg-slate-700 transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) _push2(`\u30ED\u30B0\u30A4\u30F3`);
          else return [createTextVNode("\u30ED\u30B0\u30A4\u30F3")];
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
});
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var pages_default = index_vue_vue_type_script_setup_true_lang_default;

export { pages_default as default };
//# sourceMappingURL=pages-ka5OFtVb.mjs.map
