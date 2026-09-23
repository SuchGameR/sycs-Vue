import { a as useRoute, i as useRouter, c as components_default, $ as $fetch$1 } from '../virtual/entry.mjs';
import { N as NuxtLink } from './nuxt-link-DHTgvg7C.mjs';
import { U as UserBadges_default, a as UserTitle_default } from './UserTitle-CTUBxh5l.mjs';
import { a as avatarSrc } from './avatar-BGDIRQ_Q.mjs';
import { u as useMediaPane } from './useMediaPane-CJDvgIq6.mjs';
import { u as useCustomEmojis, r as renderRichText } from './richText-C23QsgTl.mjs';
import { defineComponent, ref, watch, mergeProps, unref, withCtx, openBlock, createBlock, toDisplayString, createVNode, createTextVNode, createCommentVNode, Fragment, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
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

var search_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "search",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    useMediaPane();
    const { map: customEmojiMap } = useCustomEmojis();
    const queryStr = ref(String(route.query.q || ""));
    const tab = ref(String(route.query.type || "all"));
    const results = ref({
      users: [],
      posts: [],
      servers: []
    });
    const loading = ref(false);
    const error = ref("");
    const searched = ref(false);
    const tabs = [
      {
        key: "all",
        label: "\u3059\u3079\u3066",
        icon: "lucide:layout-grid"
      },
      {
        key: "posts",
        label: "\u6295\u7A3F",
        icon: "lucide:message-square"
      },
      {
        key: "users",
        label: "\u30E6\u30FC\u30B6\u30FC",
        icon: "lucide:users"
      },
      {
        key: "servers",
        label: "\u30B5\u30FC\u30D0\u30FC",
        icon: "lucide:server"
      }
    ];
    async function runSearch(silent = false) {
      var _a;
      const q = queryStr.value.trim();
      if (!q) return;
      if (!silent) loading.value = true;
      error.value = "";
      try {
        const data = await $fetch$1("/api/search", { params: {
          q,
          type: tab.value === "all" ? "all" : tab.value
        } });
        results.value = data;
        searched.value = true;
      } catch (e) {
        error.value = ((_a = e.data) == null ? void 0 : _a.message) || "\u691C\u7D22\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
      } finally {
        if (!silent) loading.value = false;
      }
    }
    function timeAgo(date) {
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 1) return "\u305F\u3063\u305F\u4ECA";
      if (minutes < 60) return `${minutes}\u5206\u524D`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}\u6642\u9593\u524D`;
      return `${Math.floor(hours / 24)}\u65E5\u524D`;
    }
    let debounceTimer = null;
    watch(queryStr, (v) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (v.trim()) runSearch(true);
      }, 400);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_NuxtLink = NuxtLink;
      const _component_UserBadges = UserBadges_default;
      const _component_UserTitle = UserTitle_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl mx-auto pb-24 min-[681px]:pb-6 min-h-full" }, _attrs))}><div class="sticky top-14 bg-[#0b0f19]/95 backdrop-blur z-20 border-b border-slate-800"><form class="p-3 flex items-center gap-2"><div class="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:search",
        class: "w-4 h-4 text-slate-500 shrink-0"
      }, null, _parent));
      _push(`<input${ssrRenderAttr("value", unref(queryStr))} type="search" placeholder="\u6295\u7A3F\u30FB\u30E6\u30FC\u30B6\u30FC\u30FB\u30B5\u30FC\u30D0\u30FC\u3092\u691C\u7D22" class="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm" autofocus>`);
      if (unref(queryStr)) {
        _push(`<button type="button" class="p-0.5 text-slate-500 hover:text-white transition">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      _push(`</div><button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition shrink-0"> \u691C\u7D22 </button></form><div class="flex gap-1 px-3 pb-2 overflow-x-auto"><!--[-->`);
      ssrRenderList(tabs, (t) => {
        _push(`<button class="${ssrRenderClass([unref(tab) === t.key ? "bg-indigo-600/20 text-indigo-400" : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50", "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0"])}">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: t.icon,
          class: "w-3.5 h-3.5"
        }, null, _parent));
        _push(` ${ssrInterpolate(t.label)}</button>`);
      });
      _push(`<!--]--></div></div>`);
      if (unref(error)) _push(`<div class="m-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">${ssrInterpolate(unref(error))}</div>`);
      else _push(`<!---->`);
      if (unref(loading)) _push(`<div class="text-center text-slate-500 py-10">\u691C\u7D22\u4E2D...</div>`);
      else if (unref(searched)) {
        _push(`<div class="divide-y divide-slate-800">`);
        if (unref(tab) !== "servers") {
          _push(`<!--[-->`);
          if (unref(tab) === "all") _push(`<div class="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">\u6295\u7A3F</div>`);
          else _push(`<!---->`);
          _push(`<!--[-->`);
          ssrRenderList(unref(results).posts, (p) => {
            var _a, _b, _c, _d, _e, _f, _g;
            _push(`<button class="w-full text-left px-3 py-3 flex gap-3 hover:bg-slate-800/30 transition">`);
            if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a = p.user) == null ? void 0 : _a.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(p.user.avatarUrl))} class="w-9 h-9 rounded-full object-cover shrink-0">`);
            else _push(`<div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">${ssrInterpolate(((_c = (_b = p.user) == null ? void 0 : _b.displayName) == null ? void 0 : _c.charAt(0)) || "?")}</div>`);
            _push(`<div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="font-bold text-white text-sm truncate">${ssrInterpolate(((_d = p.user) == null ? void 0 : _d.displayName) || "\u4E0D\u660E")}</span><span class="text-slate-500 text-xs shrink-0">@${ssrInterpolate((_e = p.user) == null ? void 0 : _e.username)} \xB7 ${ssrInterpolate(timeAgo(p.createdAt))}</span></div><p class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-3">${(_f = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(p.content, { custom: unref(customEmojiMap) })) != null ? _f : ""}</p>`);
            if ((_g = p.attachments) == null ? void 0 : _g.length) {
              _push(`<div class="flex gap-1 mt-1.5"><!--[-->`);
              ssrRenderList(p.attachments.filter((x) => String(x.mime || "").startsWith("image/")).slice(0, 3), (a) => {
                _push(`<img${ssrRenderAttr("src", a.url)} class="w-12 h-12 rounded-lg object-cover">`);
              });
              _push(`<!--]-->`);
              if (p.attachments.some((x) => !String(x.mime || "").startsWith("image/"))) {
                _push(`<span class="flex items-center gap-1 text-[11px] text-slate-500 px-2 rounded-lg bg-slate-800/60">`);
                _push(ssrRenderComponent(_component_Icon, {
                  name: "lucide:paperclip",
                  class: "w-3 h-3"
                }, null, _parent));
                _push(`${ssrInterpolate(p.attachments.filter((x) => !String(x.mime || "").startsWith("image/")).length)}</span>`);
              } else _push(`<!---->`);
              _push(`</div>`);
            } else _push(`<!---->`);
            _push(`</div></button>`);
          });
          _push(`<!--]-->`);
          if (unref(tab) !== "all" && !unref(results).posts.length) _push(`<div class="px-3 py-8 text-center text-slate-600 text-sm">\u6295\u7A3F\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093</div>`);
          else _push(`<!---->`);
          _push(`<!--]-->`);
        } else _push(`<!---->`);
        if (unref(tab) !== "posts") {
          _push(`<!--[-->`);
          if (unref(tab) === "all") _push(`<div class="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-800">\u30E6\u30FC\u30B6\u30FC</div>`);
          else _push(`<!---->`);
          _push(`<!--[-->`);
          ssrRenderList(unref(results).users, (u) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: u.id,
              to: `/profile/@${u.username}`,
              class: "w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-800/30 transition"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a, _b;
                if (_push2) {
                  if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(u.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(u.avatarUrl))} class="w-9 h-9 rounded-full object-cover shrink-0"${_scopeId}>`);
                  else _push2(`<div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0"${_scopeId}>${ssrInterpolate(((_a = u.displayName) == null ? void 0 : _a.charAt(0)) || "?")}</div>`);
                  _push2(`<div class="flex-1 min-w-0"${_scopeId}><p class="text-sm font-bold text-white truncate flex items-center gap-1"${_scopeId}>${ssrInterpolate(u.displayName)}`);
                  _push2(ssrRenderComponent(_component_UserBadges, { badges: u.badges }, null, _parent2, _scopeId));
                  _push2(ssrRenderComponent(_component_UserTitle, { title: u.title }, null, _parent2, _scopeId));
                  _push2(`</p><p class="text-xs text-slate-500 truncate"${_scopeId}>@${ssrInterpolate(u.username)}`);
                  if (u.bio) _push2(`<span class="text-slate-600"${_scopeId}> \xB7 ${ssrInterpolate(u.bio)}</span>`);
                  else _push2(`<!---->`);
                  _push2(`</p></div>`);
                  _push2(ssrRenderComponent(_component_Icon, {
                    name: "lucide:chevron-right",
                    class: "w-4 h-4 text-slate-600 shrink-0"
                  }, null, _parent2, _scopeId));
                } else return [
                  ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(u.avatarUrl) ? (openBlock(), createBlock("img", {
                    key: 0,
                    src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(u.avatarUrl),
                    class: "w-9 h-9 rounded-full object-cover shrink-0"
                  }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0"
                  }, toDisplayString(((_b = u.displayName) == null ? void 0 : _b.charAt(0)) || "?"), 1)),
                  createVNode("div", { class: "flex-1 min-w-0" }, [createVNode("p", { class: "text-sm font-bold text-white truncate flex items-center gap-1" }, [
                    createTextVNode(toDisplayString(u.displayName), 1),
                    createVNode(_component_UserBadges, { badges: u.badges }, null, 8, ["badges"]),
                    createVNode(_component_UserTitle, { title: u.title }, null, 8, ["title"])
                  ]), createVNode("p", { class: "text-xs text-slate-500 truncate" }, [createTextVNode("@" + toDisplayString(u.username), 1), u.bio ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-slate-600"
                  }, " \xB7 " + toDisplayString(u.bio), 1)) : createCommentVNode("", true)])]),
                  createVNode(_component_Icon, {
                    name: "lucide:chevron-right",
                    class: "w-4 h-4 text-slate-600 shrink-0"
                  })
                ];
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]-->`);
          if (unref(tab) === "users" && !unref(results).users.length) _push(`<div class="px-3 py-8 text-center text-slate-600 text-sm">\u30E6\u30FC\u30B6\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093</div>`);
          else _push(`<!---->`);
          _push(`<!--]-->`);
        } else _push(`<!---->`);
        if (unref(tab) === "servers" || unref(tab) === "all") {
          _push(`<!--[-->`);
          if (unref(tab) === "all") _push(`<div class="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-800">\u30B5\u30FC\u30D0\u30FC</div>`);
          else _push(`<!---->`);
          _push(`<!--[-->`);
          ssrRenderList(unref(results).servers, (s) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: s.id,
              to: `/servers/${s.id}`,
              class: "w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-800/30 transition"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a, _b, _c, _d;
                if (_push2) {
                  _push2(`<div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden"${_scopeId}>`);
                  if (s.icon_url || s.iconUrl) _push2(`<img${ssrRenderAttr("src", s.icon_url || s.iconUrl)} class="w-full h-full object-cover"${_scopeId}>`);
                  else _push2(`<!--[-->${ssrInterpolate(((_a = s.name) == null ? void 0 : _a.charAt(0)) || "?")}<!--]-->`);
                  _push2(`</div><div class="flex-1 min-w-0"${_scopeId}><p class="text-sm font-bold text-white truncate"${_scopeId}>${ssrInterpolate(s.name)}</p><p class="text-xs text-slate-500 line-clamp-1"${_scopeId}>${ssrInterpolate(s.description || `\u30E1\u30F3\u30D0\u30FC ${(_b = s.member_count) != null ? _b : 0} \u4EBA`)}</p></div>`);
                  _push2(ssrRenderComponent(_component_Icon, {
                    name: "lucide:chevron-right",
                    class: "w-4 h-4 text-slate-600 shrink-0"
                  }, null, _parent2, _scopeId));
                } else return [
                  createVNode("div", { class: "w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden" }, [s.icon_url || s.iconUrl ? (openBlock(), createBlock("img", {
                    key: 0,
                    src: s.icon_url || s.iconUrl,
                    class: "w-full h-full object-cover"
                  }, null, 8, ["src"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(((_c = s.name) == null ? void 0 : _c.charAt(0)) || "?"), 1)], 64))]),
                  createVNode("div", { class: "flex-1 min-w-0" }, [createVNode("p", { class: "text-sm font-bold text-white truncate" }, toDisplayString(s.name), 1), createVNode("p", { class: "text-xs text-slate-500 line-clamp-1" }, toDisplayString(s.description || `\u30E1\u30F3\u30D0\u30FC ${(_d = s.member_count) != null ? _d : 0} \u4EBA`), 1)]),
                  createVNode(_component_Icon, {
                    name: "lucide:chevron-right",
                    class: "w-4 h-4 text-slate-600 shrink-0"
                  })
                ];
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]-->`);
          if (unref(tab) === "servers" && !unref(results).servers.length) _push(`<div class="px-3 py-8 text-center text-slate-600 text-sm">\u30B5\u30FC\u30D0\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093</div>`);
          else _push(`<!---->`);
          _push(`<!--]-->`);
        } else _push(`<!---->`);
        if (!unref(results).users.length && !unref(results).posts.length && !unref(results).servers.length) _push(`<div class="px-3 py-10 text-center text-slate-600 text-sm">\u300C${ssrInterpolate(unref(queryStr))}\u300D\u306B\u4E00\u81F4\u3059\u308B\u7D50\u679C\u306F\u3042\u308A\u307E\u305B\u3093\u3067\u3057\u305F</div>`);
        else _push(`<!---->`);
        _push(`</div>`);
      } else {
        _push(`<div class="px-4 py-10 text-center">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:search",
          class: "w-10 h-10 mx-auto text-slate-700 mb-3"
        }, null, _parent));
        _push(`<p class="text-slate-500 text-sm">\u6295\u7A3F\u30FB\u30E6\u30FC\u30B6\u30FC\u30FB\u30B5\u30FC\u30D0\u30FC\u3092\u6A2A\u65AD\u691C\u7D22</p><p class="text-slate-700 text-xs mt-1">\u4F8B: \u30B2\u30FC\u30E0\u3001@\u30E6\u30FC\u30B6\u30FC\u540D\u3001\u30B5\u30FC\u30D0\u30FC\u540D</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
var _sfc_setup = search_vue_vue_type_script_setup_true_lang_default.setup;
search_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/search.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var search_default = search_vue_vue_type_script_setup_true_lang_default;

export { search_default as default };
//# sourceMappingURL=search-B5b6NXSO.mjs.map
