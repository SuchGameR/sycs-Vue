import { a as useRoute, i as useRouter, c as components_default } from '../virtual/entry.mjs';
import { u as useMediaPane } from './useMediaPane-BrRmAswF.mjs';
import { u as usePlaylists } from './usePlaylists-B4pGRAuh.mjs';
import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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

var _id__vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    route.params.id;
    useMediaPane();
    usePlaylists();
    const playlist = ref(null);
    const posts = ref([]);
    const loading = ref(true);
    const notFound = ref(false);
    function coverOf(post) {
      var _a, _b;
      return ((_b = (_a = post.attachments) == null ? void 0 : _a.find((a) => a.type === "image" || a.type === "video")) == null ? void 0 : _b.url) || null;
    }
    function isVideo(post) {
      var _a, _b;
      return ((_b = (_a = post.attachments) == null ? void 0 : _a[0]) == null ? void 0 : _b.type) === "video";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-3xl mx-auto pb-24 min-[681px]:pb-8" }, _attrs))}>`);
      if (unref(loading)) _push(`<div class="text-center text-slate-500 py-12">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
      else if (unref(notFound)) _push(`<div class="text-center text-slate-500 py-12">\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093</div>`);
      else {
        _push(`<!--[--><div class="relative p-4 min-[681px]:p-6"><div class="flex items-start gap-4"><div class="w-24 h-24 rounded-xl bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">`);
        if (coverOf(unref(posts)[0])) _push(`<img${ssrRenderAttr("src", coverOf(unref(posts)[0]))} class="w-full h-full object-cover">`);
        else _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:list-video",
          class: "w-8 h-8 text-slate-500"
        }, null, _parent));
        _push(`</div><div class="flex-1 min-w-0"><p class="text-xs font-bold text-indigo-400 uppercase tracking-wider">\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8</p><h1 class="text-2xl font-bold text-white truncate">${ssrInterpolate((_a = unref(playlist)) == null ? void 0 : _a.name)}</h1>`);
        if ((_b = unref(playlist)) == null ? void 0 : _b.description) _push(`<p class="text-sm text-slate-400 mt-1">${ssrInterpolate(unref(playlist).description)}</p>`);
        else _push(`<!---->`);
        _push(`<p class="text-sm text-slate-500 mt-1">${ssrInterpolate(unref(posts).length)} \u4EF6\u306E\u6295\u7A3F</p><button class="mt-2 text-xs text-red-400 hover:text-red-300 transition">\u524A\u9664</button></div></div></div><div class="px-4 min-[681px]:px-6">`);
        if (!unref(posts).length) _push(`<p class="text-center text-slate-500 py-8">\u307E\u3060\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u6295\u7A3F\u306E\u300C\u2026\u300D\u30E1\u30CB\u30E5\u30FC\u304B\u3089\u8FFD\u52A0\u3067\u304D\u307E\u3059\u3002</p>`);
        else {
          _push(`<div class="grid grid-cols-2 min-[681px]:grid-cols-3 gap-3"><!--[-->`);
          ssrRenderList(unref(posts), (post) => {
            _push(`<button class="group relative aspect-video rounded-xl overflow-hidden bg-slate-800 border border-slate-800 hover:border-indigo-500/60 transition text-left">`);
            if (coverOf(post)) _push(`<img${ssrRenderAttr("src", coverOf(post))} class="w-full h-full object-cover group-hover:scale-105 transition duration-300">`);
            else _push(`<div class="w-full h-full p-2 text-xs text-slate-300 line-clamp-4">${ssrInterpolate(post.content)}</div>`);
            if (isVideo(post)) {
              _push(`<span class="absolute inset-0 flex items-center justify-center pointer-events-none"><span class="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">`);
              _push(ssrRenderComponent(_component_Icon, {
                name: "lucide:play",
                class: "w-5 h-5 text-white"
              }, null, _parent));
              _push(`</span></span>`);
            } else _push(`<!---->`);
            _push(`<span class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 text-[11px] text-white line-clamp-2">${ssrInterpolate(post.content || "\u30E1\u30C7\u30A3\u30A2")}</span><span class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white items-center justify-center hidden group-hover:flex" title="\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u304B\u3089\u524A\u9664">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:x",
              class: "w-3.5 h-3.5"
            }, null, _parent));
            _push(`</span></button>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
var _sfc_setup = _id__vue_vue_type_script_setup_true_lang_default.setup;
_id__vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/playlists/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _id__default = _id__vue_vue_type_script_setup_true_lang_default;

export { _id__default as default };
//# sourceMappingURL=_id_-BANLWcLy.mjs.map
