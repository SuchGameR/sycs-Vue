import { f as useState, c as components_default, $ as $fetch$1 } from '../virtual/entry.mjs';
import { u as useFetch } from './fetch-C2pjxSar.mjs';
import { B as BottomSheet_default } from './BottomSheet-lvIleqFE.mjs';
import { u as useCustomTimelines } from './useCustomTimelines-BNJgq7ZW.mjs';
import { u as useMediaPane } from './useMediaPane-Dnqhkp4f.mjs';
import { u as useInfiniteScroll } from './useInfiniteScroll-BXxYHd5b.mjs';
import { P as PostItem_default } from './PostItem-D-q__o2O.mjs';
import { P as PostComposer_default } from './PostComposer-Dff3WYeI.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrRenderClass } from 'vue/server-renderer';
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
import './ssr-Brom9_bF.mjs';
import '@vue/shared';
import 'fnv1a-64';
import 'object-identity';
import './nuxt-link-1Qo3YrhL.mjs';
import './UserBadges-BDdpg7rV.mjs';
import './avatar-Dl3G3V3K.mjs';
import './UserTitle-CX959JWB.mjs';
import './richText-ohg8QsVE.mjs';
import './useQuoteComposer-JMdDuHrs.mjs';
import './PostAttachments-6klIUBIU.mjs';
import './usePlaylists-Df_etHuW.mjs';
import './useAccounts-SBXochGK.mjs';
import './ModelViewer-BBNO74Y8.mjs';
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
    const { data: me } = useFetch("/api/auth/me", { key: "home-me" }, "$E9BYfL6CUQ");
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
    const scrollMemory = useState("home-scroll-memory", () => null);
    watch(() => timelines.activeId.value, () => {
      stopPolling();
      scrollMemory.value = null;
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
      const _component_BottomSheet = BottomSheet_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl mx-auto pb-24 min-[681px]:pb-6" }, _attrs))}><div class="p-0 space-y-4">`);
      if (unref(postError)) _push(`<div class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">${ssrInterpolate(unref(postError))}</div>`);
      else _push(`<!---->`);
      if (unref(refreshMode) === "manual") {
        _push(`<button${ssrIncludeBooleanAttr(unref(manualRefreshing)) ? " disabled" : ""} class="mx-auto flex items-center gap-2 px-6 py-2 rounded-full bg-surface-container text-sm text-on-surface hover:bg-surface-container-high transition disabled:opacity-50">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:refresh-ccw",
          class: ["w-4 h-4", { "animate-spin": unref(manualRefreshing) }]
        }, null, _parent));
        _push(` \u66F4\u65B0 </button>`);
      } else _push(`<!---->`);
      if (unref(pending).length) {
        _push(`<button class="fixed top-16 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:arrow-up",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` \u65B0\u7740 ${ssrInterpolate(unref(pending).length)} \u4EF6 </button>`);
      } else _push(`<!---->`);
      _push(`<div class="hidden min-[681px]:block bg-surface-container/50 rounded-xl p-4 mt-4 border border-outline-variant overflow-hidden">`);
      _push(ssrRenderComponent(_component_PostComposer, { onSubmit: createPost }, null, _parent));
      _push(`</div>`);
      if (unref(loading)) _push(`<div class="text-center text-on-surface-variant py-8">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
      else {
        _push(`<!--[--><div class="min-[681px]:rounded-xl min-[681px]:border min-[681px]:border-outline-variant overflow-hidden bg-surface/20"><!--[-->`);
        ssrRenderList(unref(posts), (post, idx) => {
          var _a2, _b2, _c;
          _push(`<div${ssrRenderAttr("data-post-id", post.id)} class="${ssrRenderClass([idx === unref(posts).length - 1 ? "border-b-0" : "", "border-b border-outline-variant/40 min-[681px]:border-b-0"])}">`);
          _push(ssrRenderComponent(_component_PostItem, {
            post,
            "show-view-count": (_a2 = unref(userSettings).showViewCount) != null ? _a2 : true,
            "current-user-id": (_c = (_b2 = unref(me)) == null ? void 0 : _b2.user) == null ? void 0 : _c.id,
            onToggleRepost: toggleRepost,
            onToggleBookmark: toggleBookmark,
            onDelete: deletePost,
            onReport: reportPost,
            onOpenMedia: openMedia
          }, null, _parent));
          _push(`</div>`);
        });
        _push(`<!--]-->`);
        if (!unref(posts).length) _push(`<p class="text-center text-on-surface-variant py-8">\u307E\u3060\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093</p>`);
        else _push(`<!---->`);
        _push(`</div><div class="h-1" aria-hidden="true"></div>`);
        if (unref(loadingMore)) _push(`<div class="text-center text-on-surface-variant py-4 text-sm">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
        else if (unref(posts).length && !unref(hasMore)) _push(`<p class="text-center text-slate-600 py-4 text-xs">\u3059\u3079\u3066\u8868\u793A\u3057\u307E\u3057\u305F</p>`);
        else _push(`<!---->`);
        _push(`<!--]-->`);
      }
      _push(`</div>`);
      if (!unref(composerOpen)) {
        _push(`<button class="min-[681px]:hidden fixed right-4 bottom-20 z-[90] w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 flex items-center justify-center active:scale-95 transition" title="\u6295\u7A3F\u3059\u308B">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:plus",
          class: "w-6 h-6"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      _push(ssrRenderComponent(_component_BottomSheet, {
        open: unref(composerOpen),
        height: "min(85dvh, 40rem)",
        "dismiss-on-backdrop": true,
        onClose: ($event) => composerOpen.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-4"${_scopeId}><div class="flex items-center justify-between mb-3"${_scopeId}><span class="font-bold text-white"${_scopeId}>\u65B0\u898F\u6295\u7A3F</span><button class="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:x",
              class: "w-5 h-5"
            }, null, _parent2, _scopeId));
            _push2(`</button></div>`);
            _push2(ssrRenderComponent(_component_PostComposer, { onSubmit: createFromSheet }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else return [createVNode("div", { class: "p-4" }, [createVNode("div", { class: "flex items-center justify-between mb-3" }, [createVNode("span", { class: "font-bold text-white" }, "\u65B0\u898F\u6295\u7A3F"), createVNode("button", {
            onClick: ($event) => composerOpen.value = false,
            class: "p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition"
          }, [createVNode(_component_Icon, {
            name: "lucide:x",
            class: "w-5 h-5"
          })], 8, ["onClick"])]), createVNode(_component_PostComposer, { onSubmit: createFromSheet })])];
        }),
        _: 1
      }, _parent));
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
var home_default = home_vue_vue_type_script_setup_true_lang_default;

export { home_default as default };
//# sourceMappingURL=home-Db8Vj4z0.mjs.map
