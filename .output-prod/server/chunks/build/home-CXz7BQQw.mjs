import { _ as _plugin_vue_export_helper_default, c as components_default, $ as $fetch$1 } from '../virtual/entry.mjs';
import { u as useFetch } from './fetch-Cq4So9M_.mjs';
import { u as useCustomTimelines } from './useCustomTimelines-B55Xm7bh.mjs';
import { u as useMediaPane } from './useMediaPane-CJDvgIq6.mjs';
import { u as useInfiniteScroll } from './useInfiniteScroll-pgXZQZjZ.mjs';
import { P as PostItem_default } from './PostItem-B40v-dca.mjs';
import { P as PostComposer_default } from './PostComposer-L8NEzlos.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
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
import './ssr-kk-nDyoa.mjs';
import '@vue/shared';
import './nuxt-link-DHTgvg7C.mjs';
import './UserTitle-CTUBxh5l.mjs';
import './avatar-BGDIRQ_Q.mjs';
import './richText-C23QsgTl.mjs';
import './useQuoteComposer-aC9wgnjC.mjs';
import './usePlaylists-B3RYj2Xy.mjs';
import './ModelViewer-Ciluudu5.mjs';
import './richEditor-sKEqCQC9.mjs';
import '@tiptap/core';
import '@tiptap/vue-3';
import '@tiptap/extension-document';
import '@tiptap/extension-paragraph';
import '@tiptap/extension-text';
import '@tiptap/extension-hard-break';

var home_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "home",
  __ssrInlineRender: true,
  setup(__props) {
    var _a, _b;
    const posts = ref([]);
    const loading = ref(true);
    const manualRefreshing = ref(false);
    const postError = ref("");
    const composerOpen = ref(false);
    const timelines = useCustomTimelines();
    const mediaPane = useMediaPane();
    const { data: me } = useFetch("/api/auth/me", { key: "home-me" }, "$XFz1YkTkdq");
    const userSettings = ref(JSON.parse(((_b = (_a = me.value) == null ? void 0 : _a.user) == null ? void 0 : _b.settings) || "{}"));
    const refreshMode = computed(() => userSettings.value.refreshMode || "auto");
    let pollTimer = null;
    const offset = ref(0);
    const cursor = ref("");
    const hasMore = ref(true);
    const { loading: loadingMore, reset: resetScroll } = useInfiniteScroll(async () => {
      return await loadPosts(false);
    });
    async function loadPosts(reset = true, silent = false) {
      var _a2, _b2, _c;
      if (reset && !silent) loading.value = true;
      if (reset) {
        offset.value = 0;
        cursor.value = "";
        hasMore.value = true;
        resetScroll();
      }
      if (!hasMore.value) return { hasMore: false };
      try {
        const pageSize = reset ? 10 : 5;
        const data = await $fetch$1("/api/posts", { params: {
          ...timelines.buildQuery(),
          limit: pageSize,
          offset: offset.value,
          cursor: cursor.value
        } });
        const incoming = data.posts || [];
        offset.value = (_a2 = data.nextOffset) != null ? _a2 : offset.value + incoming.length;
        if (typeof data.nextCursor === "string" && data.nextCursor) cursor.value = data.nextCursor;
        hasMore.value = (_b2 = data.hasMore) != null ? _b2 : incoming.length === pageSize;
        if (reset) posts.value = incoming;
        else {
          const seen = new Set(posts.value.map((x) => x.id));
          posts.value = [...posts.value, ...incoming.filter((p) => !seen.has(p.id))];
        }
        return { hasMore: hasMore.value };
      } catch (e) {
        postError.value = ((_c = e.data) == null ? void 0 : _c.message) || "\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3\u306E\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
        if (reset) posts.value = [];
      } finally {
        if (!silent) loading.value = false;
      }
    }
    const pending = ref([]);
    const atTop = ref(true);
    async function pollTop() {
      const incoming = (await $fetch$1("/api/posts", { params: {
        ...timelines.buildQuery(),
        limit: 10,
        offset: 0
      } })).posts || [];
      const existing = new Map(posts.value.map((p) => [p.id, p]));
      const fresh = [];
      for (const p of incoming) {
        const cur = existing.get(p.id);
        if (cur) Object.assign(cur, p);
        else if (!pending.value.some((x) => x.id === p.id)) fresh.push(p);
      }
      if (!fresh.length) return;
      if (atTop.value) {
        posts.value = [...fresh, ...posts.value];
        pending.value = [];
      } else pending.value = [...fresh, ...pending.value];
    }
    function startPolling() {
      stopPolling();
      if (refreshMode.value !== "auto") return;
      pollTimer = setTimeout(async function tick() {
        try {
          await pollTop();
        } catch {
        }
        if (refreshMode.value === "auto") pollTimer = setTimeout(tick, 5e3);
      }, 5e3);
    }
    function stopPolling() {
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    }
    watch(() => timelines.activeId.value, () => {
      stopPolling();
      posts.value = [];
      pending.value = [];
      loadPosts(true).then(startPolling);
    });
    async function createPost(content, attachments, visibility, visibleTo) {
      var _a2;
      postError.value = "";
      try {
        await $fetch$1("/api/posts", {
          method: "POST",
          body: {
            content,
            attachments,
            visibility,
            visibleTo
          }
        });
        await loadPosts(true, true);
        startPolling();
      } catch (e) {
        postError.value = ((_a2 = e.data) == null ? void 0 : _a2.message) || "\u6295\u7A3F\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
      }
    }
    function createFromSheet(content, attachments, visibility, visibleTo) {
      composerOpen.value = false;
      createPost(content, attachments, visibility, visibleTo);
    }
    function openMedia(post) {
      const label = timelines.activeTab.value.label;
      mediaPane.openSmart(post, label);
    }
    async function toggleRepost(postId) {
      const p = posts.value.find((x) => x.id === postId);
      if (!p) return;
      try {
        if (p.reposted) {
          await $fetch$1(`/api/posts/${postId}/unrepost`, { method: "POST" });
          p.reposted = false;
          p.repostCount = Math.max(0, (p.repostCount || 0) - 1);
        } else {
          await $fetch$1(`/api/posts/${postId}/repost`, { method: "POST" });
          p.reposted = true;
          p.repostCount = (p.repostCount || 0) + 1;
        }
      } catch {
      }
    }
    async function toggleBookmark(postId) {
      const p = posts.value.find((x) => x.id === postId);
      if (!p) return;
      try {
        p.bookmarked = (await $fetch$1("/api/bookmarks/toggle", {
          method: "POST",
          body: { postId }
        })).bookmarked;
      } catch {
      }
    }
    async function deletePost(postId) {
      await $fetch$1(`/api/posts/${postId}`, { method: "DELETE" });
      posts.value = posts.value.filter((p) => p.id !== postId);
    }
    function reportPost(postId) {
      alert("\u5831\u544A\u3057\u307E\u3057\u305F");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_PostComposer = PostComposer_default;
      const _component_PostItem = PostItem_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl mx-auto pb-24 min-[681px]:pb-6" }, _attrs))} data-v-81c65450><div class="p-0 space-y-4" data-v-81c65450>`);
      if (unref(postError)) _push(`<div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400" data-v-81c65450>${ssrInterpolate(unref(postError))}</div>`);
      else _push(`<!---->`);
      if (unref(refreshMode) === "manual") {
        _push(`<button${ssrIncludeBooleanAttr(unref(manualRefreshing)) ? " disabled" : ""} class="mx-auto flex items-center gap-2 px-6 py-2 rounded-full bg-slate-800 text-sm text-slate-300 hover:bg-slate-700 transition disabled:opacity-50" data-v-81c65450>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:refresh-ccw",
          class: ["w-4 h-4", { "animate-spin": unref(manualRefreshing) }]
        }, null, _parent));
        _push(` \u66F4\u65B0 </button>`);
      } else _push(`<!---->`);
      if (unref(pending).length) {
        _push(`<button class="fixed top-16 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition" data-v-81c65450>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:arrow-up",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` \u65B0\u7740 ${ssrInterpolate(unref(pending).length)} \u4EF6 </button>`);
      } else _push(`<!---->`);
      _push(`<div class="bg-slate-800/50 rounded-xl p-4 mt-4" data-v-81c65450>`);
      _push(ssrRenderComponent(_component_PostComposer, { onSubmit: createPost }, null, _parent));
      _push(`</div>`);
      if (unref(loading)) _push(`<div class="text-center text-slate-500 py-8" data-v-81c65450>\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
      else {
        _push(`<!--[--><div class="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/20" data-v-81c65450><!--[-->`);
        ssrRenderList(unref(posts), (post) => {
          var _a2, _b2, _c;
          _push(ssrRenderComponent(_component_PostItem, {
            key: post.id,
            post,
            "show-view-count": (_a2 = unref(userSettings).showViewCount) != null ? _a2 : true,
            "current-user-id": (_c = (_b2 = unref(me)) == null ? void 0 : _b2.user) == null ? void 0 : _c.id,
            onToggleRepost: toggleRepost,
            onToggleBookmark: toggleBookmark,
            onDelete: deletePost,
            onReport: reportPost,
            onOpenMedia: openMedia
          }, null, _parent));
        });
        _push(`<!--]-->`);
        if (!unref(posts).length) _push(`<p class="text-center text-slate-500 py-8" data-v-81c65450>\u307E\u3060\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093</p>`);
        else _push(`<!---->`);
        _push(`</div><div class="h-1" aria-hidden="true" data-v-81c65450></div>`);
        if (unref(loadingMore)) _push(`<div class="text-center text-slate-500 py-4 text-sm" data-v-81c65450>\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
        else if (unref(posts).length && !unref(hasMore)) _push(`<p class="text-center text-slate-600 py-4 text-xs" data-v-81c65450>\u3059\u3079\u3066\u8868\u793A\u3057\u307E\u3057\u305F</p>`);
        else _push(`<!---->`);
        _push(`<!--]-->`);
      }
      _push(`</div>`);
      if (!unref(composerOpen)) {
        _push(`<button class="min-[681px]:hidden fixed right-4 bottom-20 z-[90] w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 flex items-center justify-center active:scale-95 transition" title="\u6295\u7A3F\u3059\u308B" data-v-81c65450>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:plus",
          class: "w-6 h-6"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      if (unref(composerOpen)) {
        _push(`<div class="min-[681px]:hidden fixed inset-0 z-[200] flex flex-col justify-end" data-v-81c65450><div class="absolute inset-0 bg-black/60" data-v-81c65450></div><div class="relative bg-[#0f1420] border-t border-slate-800 rounded-t-2xl p-4 pb-6 max-h-[85vh] overflow-y-auto" data-v-81c65450><div class="flex items-center justify-between mb-3" data-v-81c65450><span class="font-bold text-white" data-v-81c65450>\u65B0\u898F\u6295\u7A3F</span><button class="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition" data-v-81c65450>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button></div>`);
        _push(ssrRenderComponent(_component_PostComposer, { onSubmit: createFromSheet }, null, _parent));
        _push(`</div></div>`);
      } else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup = home_vue_vue_type_script_setup_true_lang_default.setup;
home_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/home.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var home_default = /* @__PURE__ */ _plugin_vue_export_helper_default(home_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-81c65450"]]);

export { home_default as default };
//# sourceMappingURL=home-CXz7BQQw.mjs.map
