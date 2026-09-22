import { a as useRoute, i as useRouter, c as components_default, $ as $fetch$1 } from '../virtual/entry.mjs';
import { u as useFetch } from './fetch-CdHJIb6H.mjs';
import { N as NuxtLink } from './nuxt-link-Z61FlDbB.mjs';
import { u as useInfiniteScroll } from './useInfiniteScroll-Bd156WHj.mjs';
import { u as useCustomEmojis } from './richText-BaJfyDxJ.mjs';
import { E as EmojiIcon_default } from './ReactionPicker-De1k2HFy.mjs';
import { u as useMediaPane } from './useMediaPane-BrRmAswF.mjs';
import { u as usePlaylists } from './usePlaylists-B4pGRAuh.mjs';
import { P as PostItem_default } from './PostItem-B_aRjl-h.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
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

var actions_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "actions",
  __ssrInlineRender: true,
  setup(__props) {
    useCustomEmojis();
    const route = useRoute();
    useRouter();
    const categories = [
      {
        key: "reactions",
        label: "\u30EA\u30A2\u30AF\u30B7\u30E7\u30F3",
        icon: "lucide:smile-plus"
      },
      {
        key: "bookmarks",
        label: "\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF",
        icon: "lucide:bookmark"
      },
      {
        key: "reposts",
        label: "\u30EA\u30DD\u30B9\u30C8",
        icon: "lucide:repeat-2"
      },
      {
        key: "history",
        label: "\u95B2\u89A7\u5C65\u6B74",
        icon: "lucide:eye"
      }
    ];
    const activeTab = ref(categories.map((c) => c.key).includes(String(route.query.tab)) ? String(route.query.tab) : "notifications");
    const endpoints = {
      reactions: "/api/actions/reactions",
      bookmarks: "/api/bookmarks",
      reposts: "/api/actions/reposts",
      history: "/api/actions/history"
    };
    const mediaPane = useMediaPane();
    const { data: me } = useFetch("/api/auth/me", { key: "activity-me" }, "$q5TNhSYEHg");
    const items = ref([]);
    const loading = ref(true);
    const offset = ref(0);
    const hasMore = ref(true);
    const { loading: loadingMore, reset: resetScroll } = useInfiniteScroll(async () => await load(false));
    async function load(resetPage = true) {
      var _a, _b, _c, _d;
      if (resetPage) {
        offset.value = 0;
        hasMore.value = true;
        items.value = [];
        resetScroll();
        loading.value = true;
      } else if (!hasMore.value) return { hasMore: false };
      try {
        let incoming = [];
        if (activeTab.value === "notifications") {
          const data = await $fetch$1("/api/notifications", { params: {
            limit: 10,
            offset: offset.value
          } });
          incoming = data.items || [];
          offset.value = (_a = data.nextOffset) != null ? _a : offset.value + incoming.length;
          hasMore.value = (_b = data.hasMore) != null ? _b : incoming.length === 10;
        } else {
          const data = await $fetch$1(endpoints[activeTab.value], { params: {
            limit: 10,
            offset: offset.value
          } });
          incoming = data.posts || [];
          offset.value = (_c = data.nextOffset) != null ? _c : offset.value + incoming.length;
          hasMore.value = (_d = data.hasMore) != null ? _d : incoming.length === 10;
        }
        if (resetPage) items.value = incoming;
        else {
          const seen = new Set(items.value.map((x) => x.id));
          items.value = [...items.value, ...incoming.filter((x) => !seen.has(x.id))];
        }
        return { hasMore: hasMore.value };
      } catch {
        if (resetPage) items.value = [];
        return { hasMore: false };
      } finally {
        if (resetPage) loading.value = false;
      }
    }
    function openPost(post) {
      if (!post) return;
      mediaPane.openPost(post, "\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3");
    }
    function findPost(id) {
      return items.value.find((x) => x.id === id);
    }
    async function toggleRepost(postId) {
      const p = findPost(postId);
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
      const p = findPost(postId);
      if (!p) return;
      try {
        p.bookmarked = (await $fetch$1("/api/bookmarks/toggle", {
          method: "POST",
          body: { postId }
        })).bookmarked;
      } catch {
      }
    }
    const { playlists, loading: playlistsLoading} = usePlaylists();
    const notifMeta = {
      like: {
        icon: "lucide:heart",
        color: "text-indigo-400",
        text: "\u304C\u3044\u3044\u306D\u3057\u307E\u3057\u305F"
      },
      repost: {
        icon: "lucide:repeat-2",
        color: "text-green-400",
        text: "\u304C\u30EA\u30DD\u30B9\u30C8\u3057\u307E\u3057\u305F"
      },
      comment: {
        icon: "lucide:message-circle",
        color: "text-sky-400",
        text: "\u304C\u30B3\u30E1\u30F3\u30C8\u3057\u307E\u3057\u305F"
      },
      reaction: {
        icon: "lucide:smile-plus",
        color: "text-amber-400",
        text: "\u304C\u30EA\u30A2\u30AF\u30B7\u30E7\u30F3\u3057\u307E\u3057\u305F"
      },
      follow: {
        icon: "lucide:user-plus",
        color: "text-fuchsia-400",
        text: "\u304C\u30D5\u30A9\u30ED\u30FC\u3057\u307E\u3057\u305F"
      },
      friend_request: {
        icon: "lucide:users",
        color: "text-emerald-400",
        text: "\u304C\u53CB\u9054\u30EA\u30AF\u30A8\u30B9\u30C8\u3092\u9001\u308A\u307E\u3057\u305F"
      }
    };
    function timeAgo(date) {
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 1) return "\u305F\u3063\u305F\u4ECA";
      if (minutes < 60) return `${minutes}\u5206\u524D`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}\u6642\u9593\u524D`;
      return `${Math.floor(hours / 24)}\u65E5\u524D`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_EmojiIcon = EmojiIcon_default;
      const _component_PostItem = PostItem_default;
      const _component_NuxtLink = NuxtLink;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl mx-auto p-4 space-y-4" }, _attrs))}><h1 class="text-2xl font-bold text-white hidden min-[681px]:block">\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3</h1><button class="${ssrRenderClass([unref(activeTab) === "notifications" ? "bg-indigo-600/20 border-indigo-500/50 text-white" : "bg-slate-800/30 border-slate-800 text-slate-400 hover:text-slate-200", "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition"])}">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:bell",
        class: "w-5 h-5"
      }, null, _parent));
      _push(`<span class="font-medium">\u901A\u77E5</span></button><div class="grid grid-cols-2 min-[681px]:grid-cols-4 gap-2"><!--[-->`);
      ssrRenderList(categories, (cat) => {
        _push(`<button class="${ssrRenderClass([unref(activeTab) === cat.key ? "bg-slate-800 border-slate-600 text-white" : "bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300", "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition border"])}">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: cat.icon,
          class: "w-4 h-4 shrink-0"
        }, null, _parent));
        _push(`<span class="truncate">${ssrInterpolate(cat.label)}</span></button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(loading)) _push(`<div class="text-center text-slate-500 py-8">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
      else {
        _push(`<!--[-->`);
        if (unref(activeTab) === "notifications") {
          _push(`<div>`);
          if (!unref(items).length) _push(`<div class="text-center text-slate-500 py-8">\u901A\u77E5\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093</div>`);
          else {
            _push(`<div class="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/20"><!--[-->`);
            ssrRenderList(unref(items), (n) => {
              var _a, _b, _c, _d, _e, _f, _g, _h;
              _push(`<button class="w-full flex items-start gap-3 px-4 py-3 border-b border-slate-800 last:border-b-0 text-left hover:bg-slate-800/30 transition"><div class="relative shrink-0">`);
              if ((_a = n.actor) == null ? void 0 : _a.avatarUrl) _push(`<img${ssrRenderAttr("src", n.actor.avatarUrl)} class="w-9 h-9 rounded-full object-cover">`);
              else _push(`<div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">${ssrInterpolate(((_c = (_b = n.actor) == null ? void 0 : _b.displayName) == null ? void 0 : _c.charAt(0)) || "?")}</div>`);
              _push(`<span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">`);
              _push(ssrRenderComponent(_component_Icon, {
                name: ((_d = notifMeta[n.type]) == null ? void 0 : _d.icon) || "lucide:bell",
                class: ["w-3 h-3", ((_e = notifMeta[n.type]) == null ? void 0 : _e.color) || "text-slate-400"]
              }, null, _parent));
              _push(`</span></div><div class="min-w-0 flex-1"><p class="text-sm text-slate-300"><span class="font-bold text-white">${ssrInterpolate(((_f = n.actor) == null ? void 0 : _f.displayName) || "\u4E0D\u660E")}</span> ${ssrInterpolate(((_g = notifMeta[n.type]) == null ? void 0 : _g.text) || "\u304C\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3\u3092\u3057\u307E\u3057\u305F")} `);
              if (n.type === "reaction" && n.emoji) _push(ssrRenderComponent(_component_EmojiIcon, {
                emoji: n.emoji,
                size: "sm",
                class: "inline-block align-text-bottom"
              }, null, _parent));
              else _push(`<!---->`);
              _push(`</p>`);
              if (n.type === "comment" && n.content) _push(`<p class="text-xs text-slate-500 truncate mt-0.5">${ssrInterpolate(n.content)}</p>`);
              else if ((_h = n.post) == null ? void 0 : _h.content) _push(`<p class="text-xs text-slate-500 truncate mt-0.5">${ssrInterpolate(n.post.content)}</p>`);
              else _push(`<!---->`);
              _push(`<p class="text-[11px] text-slate-600 mt-0.5">${ssrInterpolate(timeAgo(n.createdAt))}</p></div></button>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<div>`);
          if (!unref(items).length) _push(`<div class="text-center text-slate-500 py-8">${ssrInterpolate({
            reactions: "\u30EA\u30A2\u30AF\u30B7\u30E7\u30F3\u3057\u305F\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093",
            bookmarks: "\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF\u304C\u3042\u308A\u307E\u305B\u3093",
            reposts: "\u30EA\u30DD\u30B9\u30C8\u3057\u305F\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093",
            history: "\u95B2\u89A7\u5C65\u6B74\u304C\u3042\u308A\u307E\u305B\u3093"
          }[unref(activeTab)])}</div>`);
          else {
            _push(`<div class="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/20"><!--[-->`);
            ssrRenderList(unref(items), (post) => {
              var _a, _b;
              _push(ssrRenderComponent(_component_PostItem, {
                key: post.id,
                post,
                "current-user-id": (_b = (_a = unref(me)) == null ? void 0 : _a.user) == null ? void 0 : _b.id,
                onToggleRepost: toggleRepost,
                onToggleBookmark: toggleBookmark,
                onOpenMedia: openPost
              }, null, _parent));
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div>`);
        }
        _push(`<div class="h-1" aria-hidden="true"></div>`);
        if (unref(loadingMore)) _push(`<div class="text-center text-slate-500 py-4 text-sm">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
        else if (unref(items).length && !unref(hasMore)) _push(`<p class="text-center text-slate-600 py-4 text-xs">\u3059\u3079\u3066\u8868\u793A\u3057\u307E\u3057\u305F</p>`);
        else _push(`<!---->`);
        _push(`<!--]-->`);
      }
      _push(`<section class="pt-2"><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-bold text-white flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:list-video",
        class: "w-5 h-5 text-indigo-400"
      }, null, _parent));
      _push(` \u30D7\u30EC\u30A4\u30EA\u30B9\u30C8 </h2><button class="text-xs text-slate-500 hover:text-slate-300 transition">\u66F4\u65B0</button></div><p class="text-xs text-slate-500 mb-3">\u52D5\u753B\u3084\u6295\u7A3F\u3092\u307E\u3068\u3081\u3066\u6574\u7406\u3067\u304D\u307E\u3059\u3002</p><div class="grid grid-cols-2 min-[681px]:grid-cols-3 gap-3"><!--[-->`);
      ssrRenderList(unref(playlists), (list) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: list.id,
          to: `/playlists/${list.id}`,
          class: "group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-800/40 hover:border-indigo-500/60 transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="aspect-video bg-slate-800 flex items-center justify-center"${_scopeId}>`);
              if (list.coverUrl) _push2(`<img${ssrRenderAttr("src", list.coverUrl)} class="w-full h-full object-cover"${_scopeId}>`);
              else _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:list-video",
                class: "w-7 h-7 text-slate-600"
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="p-2"${_scopeId}><p class="text-sm text-white truncate"${_scopeId}>${ssrInterpolate(list.name)}</p><p class="text-[11px] text-slate-500"${_scopeId}>${ssrInterpolate(list.count)} \u4EF6</p></div>`);
            } else return [createVNode("div", { class: "aspect-video bg-slate-800 flex items-center justify-center" }, [list.coverUrl ? (openBlock(), createBlock("img", {
              key: 0,
              src: list.coverUrl,
              class: "w-full h-full object-cover"
            }, null, 8, ["src"])) : (openBlock(), createBlock(_component_Icon, {
              key: 1,
              name: "lucide:list-video",
              class: "w-7 h-7 text-slate-600"
            }))]), createVNode("div", { class: "p-2" }, [createVNode("p", { class: "text-sm text-white truncate" }, toDisplayString(list.name), 1), createVNode("p", { class: "text-[11px] text-slate-500" }, toDisplayString(list.count) + " \u4EF6", 1)])];
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div>`);
      if (!unref(playlists).length && !unref(playlistsLoading)) _push(`<p class="text-center text-slate-600 text-sm py-4"> \u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u6295\u7A3F\u306E\u300C\u2026\u300D\u2192\u300C\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u306B\u8FFD\u52A0\u300D\u304B\u3089\u4F5C\u6210\u3067\u304D\u307E\u3059\u3002 </p>`);
      else _push(`<!---->`);
      _push(`</section></div>`);
    };
  }
});
var _sfc_setup = actions_vue_vue_type_script_setup_true_lang_default.setup;
actions_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/actions.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var actions_default = actions_vue_vue_type_script_setup_true_lang_default;

export { actions_default as default };
//# sourceMappingURL=actions-BbPWjnhS.mjs.map
