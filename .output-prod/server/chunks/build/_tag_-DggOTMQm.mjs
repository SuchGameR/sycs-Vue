import { a as useRoute, c as components_default, $ as $fetch$1 } from '../virtual/entry.mjs';
import { U as UserBadges_default } from './UserBadges-BDdpg7rV.mjs';
import { a as avatarSrc } from './avatar-Dl3G3V3K.mjs';
import { u as useCustomEmojis, r as renderRichText } from './richText-ohg8QsVE.mjs';
import { u as useMediaPane } from './useMediaPane-Dnqhkp4f.mjs';
import { u as useInfiniteScroll } from './useInfiniteScroll-BXxYHd5b.mjs';
import { defineComponent, computed, ref, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
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

var _tag__vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "[tag]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useMediaPane();
    const { map: customEmojiMap } = useCustomEmojis();
    const rawTag = computed(() => {
      var _a;
      const p = route.params.tag;
      return decodeURIComponent(Array.isArray(p) ? String((_a = p[0]) != null ? _a : "") : String(p != null ? p : ""));
    });
    const tag = computed(() => rawTag.value.replace(/^#+/, "").toLowerCase());
    const posts = ref([]);
    const meta = ref(null);
    const loading = ref(true);
    const loadingMore = ref(false);
    const error = ref("");
    const hasMore = ref(false);
    const cursor = ref(null);
    const offset = ref(0);
    const { reset: resetScroll } = useInfiniteScroll(async () => {
      await loadMore();
    });
    async function load(reset = true) {
      var _a;
      if (reset) {
        offset.value = 0;
        cursor.value = null;
        posts.value = [];
        loading.value = true;
        resetScroll();
      }
      error.value = "";
      try {
        const data = await $fetch$1(`/api/hashtags/${encodeURIComponent(tag.value)}`, { params: reset ? { limit: 20 } : {
          limit: 20,
          cursor: cursor.value || void 0
        } });
        meta.value = {
          displayTag: data.displayTag,
          postCount: data.postCount,
          recentPosts: data.recentPosts
        };
        if (reset) posts.value = data.posts || [];
        else {
          const seen = new Set(posts.value.map((p) => p.id));
          posts.value = [...posts.value, ...(data.posts || []).filter((p) => !seen.has(p.id))];
        }
        cursor.value = data.nextCursor || null;
        hasMore.value = !!data.hasMore && !!cursor.value;
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u30CF\u30C3\u30B7\u30E5\u30BF\u30B0\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F";
        if (reset) posts.value = [];
        hasMore.value = false;
      } finally {
        loading.value = false;
        loadingMore.value = false;
      }
    }
    async function loadMore() {
      if (loading.value || loadingMore.value || !hasMore.value || !cursor.value) return;
      loadingMore.value = true;
      await load(false);
    }
    watch(tag, () => {
      load(true);
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_Icon = components_default;
      const _component_UserBadges = UserBadges_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl mx-auto pb-24 min-[681px]:pb-6 min-h-full" }, _attrs))}><div class="sticky top-14 z-20 bg-surface/95 backdrop-blur border-b border-outline-variant"><div class="px-4 pt-4 pb-3"><div class="flex items-center gap-3"><div class="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:hash",
        class: "h-6 w-6 text-indigo-400"
      }, null, _parent));
      _push(`</div><div class="min-w-0"><h1 class="text-lg font-bold text-on-surface truncate">#${ssrInterpolate(((_a = unref(meta)) == null ? void 0 : _a.displayTag) || unref(tag))}</h1><p class="text-xs text-on-surface-variant">`);
      if ((_b = unref(meta)) == null ? void 0 : _b.postCount) {
        _push(`<!--[--> \u6295\u7A3F ${ssrInterpolate(unref(meta).postCount)} \u4EF6 `);
        if (unref(meta).recentPosts > 0) _push(`<!--[--> \xB7 \u904E\u53BB24\u6642\u9593\u3067 ${ssrInterpolate(unref(meta).recentPosts)} \u4EF6<!--]-->`);
        else _push(`<!---->`);
        _push(`<!--]-->`);
      } else _push(`<!--[-->\u30CF\u30C3\u30B7\u30E5\u30BF\u30B0<!--]-->`);
      _push(`</p></div></div></div><form class="px-4 pb-3"><button type="submit" class="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant text-sm text-on-surface-variant hover:text-on-surface hover:border-outline transition text-left">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:search",
        class: "w-4 h-4 shrink-0"
      }, null, _parent));
      _push(`<span class="truncate">#${ssrInterpolate(((_c = unref(meta)) == null ? void 0 : _c.displayTag) || unref(tag))} \u3067\u6295\u7A3F\u3092\u691C\u7D22</span></button></form></div>`);
      if (unref(error)) _push(`<p class="m-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">${ssrInterpolate(unref(error))}</p>`);
      else _push(`<!---->`);
      if (unref(loading)) _push(`<p class="text-center text-on-surface-variant py-10">\u8AAD\u307F\u8FBC\u307F\u4E2D...</p>`);
      else if (unref(posts).length) {
        _push(`<!--[--><div class="divide-y divide-outline-variant"><!--[-->`);
        ssrRenderList(unref(posts), (p) => {
          var _a2, _b2, _c2, _d2, _e, _f, _g;
          _push(`<button class="w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-container/30 transition">`);
          if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = p.user) == null ? void 0 : _a2.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(p.user.avatarUrl))} class="w-9 h-9 rounded-full object-cover shrink-0" alt="">`);
          else _push(`<div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">${ssrInterpolate(((_c2 = (_b2 = p.user) == null ? void 0 : _b2.displayName) == null ? void 0 : _c2.charAt(0)) || "?")}</div>`);
          _push(`<div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="font-bold text-on-surface text-sm truncate">${ssrInterpolate(((_d2 = p.user) == null ? void 0 : _d2.displayName) || "\u4E0D\u660E")}</span>`);
          _push(ssrRenderComponent(_component_UserBadges, { badges: (_e = p.user) == null ? void 0 : _e.badges }, null, _parent));
          _push(`<span class="text-on-surface-variant text-xs shrink-0">@${ssrInterpolate((_f = p.user) == null ? void 0 : _f.username)}</span></div><p class="text-on-surface text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-4">${(_g = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(p.content, { custom: unref(customEmojiMap) })) != null ? _g : ""}</p></div></button>`);
        });
        _push(`<!--]--></div><div class="h-1" aria-hidden="true"></div>`);
        if (unref(loadingMore)) _push(`<p class="text-center text-on-surface-variant py-4 text-sm">\u8AAD\u307F\u8FBC\u307F\u4E2D...</p>`);
        else if (!unref(hasMore)) _push(`<p class="text-center text-slate-600 py-4 text-xs">\u3059\u3079\u3066\u8868\u793A\u3057\u307E\u3057\u305F</p>`);
        else _push(`<!---->`);
        _push(`<!--]-->`);
      } else _push(`<p class="text-center text-on-surface-variant py-16"> #${ssrInterpolate(((_d = unref(meta)) == null ? void 0 : _d.displayTag) || unref(tag))} \u306E\u6295\u7A3F\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093 </p>`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup = _tag__vue_vue_type_script_setup_true_lang_default.setup;
_tag__vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/hashtag/[tag].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _tag__default = _tag__vue_vue_type_script_setup_true_lang_default;

export { _tag__default as default };
//# sourceMappingURL=_tag_-DggOTMQm.mjs.map
