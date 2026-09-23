import { a as useRoute, m as useState, c as components_default, $ as $fetch$1 } from '../virtual/entry.mjs';
import { u as useFetch } from './fetch-Cq4So9M_.mjs';
import { N as NuxtLink } from './nuxt-link-DHTgvg7C.mjs';
import { U as UserBadges_default, a as UserTitle_default } from './UserTitle-CTUBxh5l.mjs';
import { a as avatarSrc } from './avatar-BGDIRQ_Q.mjs';
import { S as SettingsModal_default } from './SettingsModal-DfFw3XNJ.mjs';
import { u as useCustomEmojis, r as renderRichText } from './richText-C23QsgTl.mjs';
import { u as useInfiniteScroll, P as PostAttachments_default } from './useInfiniteScroll-pgXZQZjZ.mjs';
import { s as setInterval } from './interval-T_Je0Yfm.mjs';
import { defineComponent, computed, withAsyncContext, ref, watch, mergeProps, unref, withCtx, openBlock, createBlock, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderStyle, ssrRenderAttr, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderList } from 'vue/server-renderer';
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
import './useMediaPane-CJDvgIq6.mjs';

var _slug__vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { map: customEmojiMap } = useCustomEmojis();
    const route = useRoute();
    const slug = computed(() => route.params.slug);
    const { data: me } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/auth/me", { key: "profile-me" }, "$QaSvOYeF2P")), __temp = await __temp, __restore(), __temp);
    const isOwnProfile = computed(() => {
      var _a;
      if (!((_a = me.value) == null ? void 0 : _a.user)) return false;
      return me.value.user.username === resolvedUsername.value || me.value.user.id === resolvedId.value;
    });
    const profile = ref(null);
    const userPosts = ref([]);
    const loading = ref(true);
    const showSettings = ref(false);
    const postOffset = ref(0);
    const postHasMore = ref(true);
    const { loading: loadingMorePosts, reset: resetPostScroll } = useInfiniteScroll(async () => {
      return await loadPosts(false);
    });
    async function loadPosts(reset = true) {
      var _a, _b;
      if (!resolvedId.value) return { hasMore: false };
      if (reset) {
        postOffset.value = 0;
        postHasMore.value = true;
        resetPostScroll();
      }
      if (!postHasMore.value) return { hasMore: false };
      try {
        const pageSize = reset ? 10 : 5;
        const data = await $fetch$1(`/api/users/${resolvedId.value}/posts`, { params: {
          limit: pageSize,
          offset: postOffset.value
        } });
        const incoming = data.posts || [];
        postOffset.value = (_a = data.nextOffset) != null ? _a : postOffset.value + incoming.length;
        postHasMore.value = (_b = data.hasMore) != null ? _b : incoming.length === pageSize;
        if (reset) userPosts.value = incoming;
        else {
          const seen = new Set(userPosts.value.map((p) => p.id));
          userPosts.value = [...userPosts.value, ...incoming.filter((p) => !seen.has(p.id))];
        }
        return { hasMore: postHasMore.value };
      } catch {
        if (reset) userPosts.value = [];
        return { hasMore: false };
      }
    }
    const resolvedId = ref("");
    const resolvedUsername = ref("");
    const activeTab = ref("all");
    const showFilter = ref(false);
    ref(false);
    ref(null);
    useState("profile-header-state", () => null);
    async function loadProfile() {
      loading.value = true;
      try {
        const s = slug.value;
        const ac = new AbortController();
        const timeout = setTimeout(() => ac.abort(), 1e4);
        let data;
        if (s.startsWith("@")) {
          const username = s.slice(1);
          resolvedUsername.value = username;
          const resolved = await $fetch$1(`/api/users/by-username/${username}`, { signal: ac.signal });
          resolvedId.value = resolved.user.id;
          data = await $fetch$1(`/api/users/${resolved.user.id}/profile`, { signal: ac.signal });
        } else {
          data = await $fetch$1(`/api/users/${s}/profile`, { signal: ac.signal });
          resolvedId.value = s;
          resolvedUsername.value = data.user.username;
        }
        profile.value = data;
        friendStatus.value = data.friendStatus || "none";
        blocked.value = !!data.blocked;
        blockedBy.value = !!data.blockedBy;
        clearTimeout(timeout);
        if (!data.locked) await loadPosts(true);
      } catch {
        profile.value = null;
      } finally {
        loading.value = false;
      }
    }
    const settings = computed(() => {
      var _a, _b;
      try {
        return JSON.parse(((_b = (_a = profile.value) == null ? void 0 : _a.user) == null ? void 0 : _b.settings) || "{}");
      } catch {
        return {};
      }
    });
    const filteredPosts = computed(() => {
      let posts = userPosts.value;
      if (activeTab.value === "images") posts = posts.filter((p) => {
        var _a;
        return p.imageUrl || ((_a = p.attachments) == null ? void 0 : _a.some((a) => {
          var _a2;
          return (_a2 = a.mime) == null ? void 0 : _a2.startsWith("image/");
        }));
      });
      else if (activeTab.value === "videos") posts = posts.filter((p) => {
        var _a;
        return (_a = p.attachments) == null ? void 0 : _a.some((a) => {
          var _a2;
          return (_a2 = a.mime) == null ? void 0 : _a2.startsWith("video/");
        });
      });
      return posts;
    });
    const followBusy = ref(false);
    const friendBusy = ref(false);
    const friendCooldown = ref(0);
    let friendCooldownTimer = null;
    watch(friendCooldown, (cd) => {
      if (cd <= 0) {
        if (friendCooldownTimer) {
          clearInterval(friendCooldownTimer);
          friendCooldownTimer = null;
        }
      } else if (!friendCooldownTimer) friendCooldownTimer = setInterval();
    });
    const friendStatus = ref("none");
    computed(() => friendStatus.value === "accepted");
    const sentCountdown = computed(() => friendCooldown.value > 0 ? `(${friendCooldown.value}\u79D2)` : "");
    const startingDM = ref(false);
    const blocked = ref(false);
    const blockedBy = ref(false);
    const blockingBusy = ref(false);
    function timeAgo(date) {
      const diff = Date.now() - new Date(date).getTime();
      const m = Math.floor(diff / 6e4);
      if (m < 1) return "\u305F\u3063\u305F\u4ECA";
      if (m < 60) return `${m}\u5206\u524D`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}\u6642\u9593\u524D`;
      return `${Math.floor(h / 24)}\u65E5\u524D`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_UserBadges = UserBadges_default;
      const _component_UserTitle = UserTitle_default;
      const _component_Icon = components_default;
      const _component_SettingsModal = SettingsModal_default;
      const _component_NuxtLink = NuxtLink;
      const _component_PostAttachments = PostAttachments_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl mx-auto" }, _attrs))}>`);
      if (unref(loading)) _push(`<p class="text-center text-slate-500 py-8">\u8AAD\u307F\u8FBC\u307F\u4E2D...</p>`);
      else if (!unref(profile)) _push(`<p class="text-center text-slate-500 py-8">\u30E6\u30FC\u30B6\u30FC\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093</p>`);
      else {
        _push(`<!--[--><div class="bg-slate-800/30 border-b border-slate-800"><div class="${ssrRenderClass([unref(profile).user.bannerUrl ? "aspect-[3/1]" : "h-32", "bg-gradient-to-r from-indigo-900/50 to-purple-900/50"])}" style="${ssrRenderStyle(unref(profile).user.bannerUrl ? `background-image: url(${unref(profile).user.bannerUrl}); background-size: cover; background-position: center;` : "")}"></div><div class="px-5 pb-5"><div class="flex items-end -mt-12 mb-3">`);
        if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(profile).user.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(profile).user.avatarUrl))} class="w-20 h-20 rounded-full border-4 border-[#0b0f19] object-cover">`);
        else _push(`<div class="w-20 h-20 rounded-full border-4 border-[#0b0f19] bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white">${ssrInterpolate(((_a = unref(profile).user.displayName) == null ? void 0 : _a.charAt(0)) || "?")}</div>`);
        _push(`</div><div class="flex items-start justify-between"><div><div class="flex items-center gap-2 flex-wrap"><h1 class="text-xl font-bold text-white">${ssrInterpolate(unref(profile).user.displayName)}</h1>`);
        _push(ssrRenderComponent(_component_UserBadges, {
          badges: unref(profile).user.badges,
          size: "md"
        }, null, _parent));
        _push(ssrRenderComponent(_component_UserTitle, { title: unref(profile).user.title }, null, _parent));
        if (unref(profile).isPrivate) _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:lock",
          class: "w-4 h-4 text-slate-400",
          title: "\u9375\u30A2\u30AB\u30A6\u30F3\u30C8"
        }, null, _parent));
        else _push(`<!---->`);
        _push(`</div><p class="text-slate-500">@${ssrInterpolate(unref(profile).user.username)}</p>`);
        if (unref(profile).user.bio) _push(`<p class="mt-2 text-slate-300 text-sm">${ssrInterpolate(unref(profile).user.bio)}</p>`);
        else _push(`<!---->`);
        if (unref(profile).user.statusMessage) _push(`<p class="mt-1.5 text-[11px] text-emerald-400/90 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block"></span>${ssrInterpolate(unref(profile).user.statusMessage)}</p>`);
        else _push(`<!---->`);
        if (unref(settings).website || unref(settings).github || unref(settings).twitter) {
          _push(`<div class="flex flex-wrap gap-3 mt-2">`);
          if (unref(settings).website) {
            _push(`<a${ssrRenderAttr("href", unref(settings).website)} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:globe",
              class: "w-3.5 h-3.5"
            }, null, _parent));
            _push(` ${ssrInterpolate(unref(settings).website.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</a>`);
          } else _push(`<!---->`);
          if (unref(settings).github) {
            _push(`<a${ssrRenderAttr("href", `https://github.com/${unref(settings).github}`)} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:github",
              class: "w-3.5 h-3.5"
            }, null, _parent));
            _push(` ${ssrInterpolate(unref(settings).github)}</a>`);
          } else _push(`<!---->`);
          if (unref(settings).twitter) {
            _push(`<a${ssrRenderAttr("href", `https://x.com/${unref(settings).twitter.replace("@", "")}`)} target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-400 transition">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:twitter",
              class: "w-3.5 h-3.5"
            }, null, _parent));
            _push(` ${ssrInterpolate(unref(settings).twitter)}</a>`);
          } else _push(`<!---->`);
          _push(`</div>`);
        } else _push(`<!---->`);
        _push(`</div><div class="flex gap-2 shrink-0 flex-wrap justify-end">`);
        if (unref(isOwnProfile)) {
          _push(`<button class="px-4 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition flex items-center gap-1.5">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:settings",
            class: "w-4 h-4"
          }, null, _parent));
          _push(` \u8A2D\u5B9A</button>`);
        } else if ((_b = unref(me)) == null ? void 0 : _b.user) {
          _push(`<!--[--><button${ssrIncludeBooleanAttr(unref(followBusy)) ? " disabled" : ""} class="${ssrRenderClass([unref(profile).isFollowing ? "border border-slate-700 text-slate-300 hover:bg-slate-800" : "bg-indigo-600 text-white hover:bg-indigo-700", "px-4 py-1.5 rounded-lg text-sm font-bold transition disabled:opacity-50"])}">${ssrInterpolate(unref(profile).isFollowing ? "\u30D5\u30A9\u30ED\u30FC\u4E2D" : "\u30D5\u30A9\u30ED\u30FC")}</button><button class="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition" title="\u89AA\u3057\u3044\u53CB\u9054">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:heart",
            class: "w-4 h-4"
          }, null, _parent));
          _push(`</button>`);
          if (unref(friendStatus) === "accepted") {
            _push(`<span class="px-3 py-1.5 rounded-lg border border-emerald-700/60 bg-emerald-500/10 text-sm text-emerald-400 font-medium" title="\u30D5\u30EC\u30F3\u30C9">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:user-check",
              class: "w-4 h-4"
            }, null, _parent));
            _push(`</span>`);
          } else if (unref(friendStatus) === "received") {
            _push(`<button${ssrIncludeBooleanAttr(unref(friendBusy)) ? " disabled" : ""} class="px-3 py-1.5 rounded-lg border border-emerald-600 text-sm text-emerald-400 hover:bg-emerald-600/10 transition disabled:opacity-50" title="\u76F8\u624B\u304B\u3089\u7533\u8ACB\u304C\u6765\u3066\u3044\u307E\u3059 - \u627F\u8A8D">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:user-check",
              class: "w-4 h-4"
            }, null, _parent));
            _push(`</button>`);
          } else {
            _push(`<button${ssrIncludeBooleanAttr(unref(friendBusy) || unref(friendStatus) === "sent" && unref(friendCooldown) > 0) ? " disabled" : ""} class="${ssrRenderClass([unref(friendStatus) === "sent" ? "text-indigo-400 border-indigo-700/60 bg-indigo-500/10" : "text-slate-300 hover:bg-slate-800", "px-3 py-1.5 rounded-lg border border-slate-700 text-sm transition disabled:opacity-50"])}"${ssrRenderAttr("title", unref(friendStatus) === "sent" ? `\u7533\u8ACB\u6E08\u307F - ${unref(friendCooldown)}\u79D2\u5F8C\u306B\u518D\u9001\u3067\u304D\u307E\u3059` : "\u30D5\u30EC\u30F3\u30C9\u7533\u8ACB")}>`);
            _push(ssrRenderComponent(_component_Icon, {
              name: unref(friendStatus) === "sent" ? "lucide:check-check" : "lucide:user-plus",
              class: "w-4 h-4"
            }, null, _parent));
            if (unref(friendStatus) === "sent") _push(`<span class="ml-1">${ssrInterpolate(unref(sentCountdown))}</span>`);
            else _push(`<!---->`);
            _push(`</button>`);
          }
          _push(`<button${ssrIncludeBooleanAttr(unref(blocked) || unref(blockedBy) || unref(startingDM)) ? " disabled" : ""} class="px-3 py-1.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed" title="DM\u3092\u9001\u308B">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:message-square",
            class: "w-4 h-4"
          }, null, _parent));
          _push(`</button><button${ssrIncludeBooleanAttr(unref(blockingBusy)) ? " disabled" : ""} class="${ssrRenderClass([unref(blocked) ? "border-red-700/60 bg-red-500/10 text-red-400 hover:bg-red-500/20" : "border-slate-700 text-slate-400 hover:bg-slate-800", "px-3 py-1.5 rounded-lg border text-sm transition disabled:opacity-50"])}"${ssrRenderAttr("title", unref(blocked) ? "\u30D6\u30ED\u30C3\u30AF\u3092\u89E3\u9664" : "\u30D6\u30ED\u30C3\u30AF")}>`);
          if (unref(blockingBusy)) _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:loader-2",
            class: "w-4 h-4 animate-spin"
          }, null, _parent));
          else _push(ssrRenderComponent(_component_Icon, {
            name: unref(blocked) ? "lucide:shield-check" : "lucide:ban",
            class: "w-4 h-4"
          }, null, _parent));
          _push(`</button>`);
          if (unref(blockedBy)) _push(`<span class="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-500" title="\u3053\u306E\u30E6\u30FC\u30B6\u30FC\u306B\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u3066\u3044\u307E\u3059">\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u3066\u3044\u307E\u3059</span>`);
          else _push(`<!---->`);
          _push(`<!--]-->`);
        } else _push(`<!---->`);
        _push(`</div></div><div class="flex gap-5 mt-4 text-sm"><span><span class="font-bold text-white">${ssrInterpolate(unref(profile).stats.posts)}</span> <span class="text-slate-500">\u6295\u7A3F</span></span><span><span class="font-bold text-white">${ssrInterpolate(unref(profile).stats.followers)}</span> <span class="text-slate-500">\u30D5\u30A9\u30ED\u30EF\u30FC</span></span><span><span class="font-bold text-white">${ssrInterpolate(unref(profile).stats.following)}</span> <span class="text-slate-500">\u30D5\u30A9\u30ED\u30FC\u4E2D</span></span></div>`);
        if (unref(settings).birthday || unref(settings).birthplace) {
          _push(`<div class="flex gap-4 mt-3 text-xs text-slate-500">`);
          if (unref(settings).birthday) {
            _push(`<span>`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:cake",
              class: "w-3.5 h-3.5 inline mr-1"
            }, null, _parent));
            _push(`${ssrInterpolate(unref(settings).birthday)}</span>`);
          } else _push(`<!---->`);
          if (unref(settings).birthplace) {
            _push(`<span>`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:map-pin",
              class: "w-3.5 h-3.5 inline mr-1"
            }, null, _parent));
            _push(`${ssrInterpolate(unref(settings).birthplace)}</span>`);
          } else _push(`<!---->`);
          _push(`</div>`);
        } else _push(`<!---->`);
        _push(`</div></div>`);
        if (unref(isOwnProfile) && unref(showSettings)) _push(ssrRenderComponent(_component_SettingsModal, { onClose: ($event) => {
          showSettings.value = false;
          loadProfile();
        } }, null, _parent));
        else _push(`<!---->`);
        _push(`<div class="flex items-center border-b border-slate-800 px-5 sticky top-0 backdrop-blur-[10px] z-40"><!--[-->`);
        ssrRenderList([
          {
            key: "all",
            label: "\u6295\u7A3F"
          },
          {
            key: "images",
            label: "\u753B\u50CF"
          },
          {
            key: "videos",
            label: "\u52D5\u753B"
          }
        ], (tab) => {
          _push(`<button class="${ssrRenderClass([unref(activeTab) === tab.key ? "text-white border-indigo-500" : "text-slate-500 border-transparent hover:text-slate-300", "px-4 py-3 text-sm font-medium transition border-b-2 -mb-[1px]"])}">${ssrInterpolate(tab.label)}</button>`);
        });
        _push(`<!--]--><div class="relative ml-auto"><button class="p-2 text-slate-500 hover:text-white transition">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:sliders-horizontal",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button>`);
        if (unref(showFilter)) _push(`<div class="absolute top-full right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl z-50 min-w-40"><button class="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition">\u4EBA\u6C17\u9806</button><button class="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition">\u65B0\u3057\u3044\u9806</button><button class="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition">\u53E4\u3044\u9806</button></div>`);
        else _push(`<!---->`);
        _push(`</div></div><div class="px-5 space-y-3 py-4">`);
        if (unref(profile).locked) {
          _push(`<div class="text-center py-12 text-slate-400">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:lock",
            class: "w-10 h-10 mx-auto mb-3 text-slate-500"
          }, null, _parent));
          _push(`<p class="font-bold text-white">\u3053\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u306F\u975E\u516C\u958B\u3067\u3059</p><p class="text-sm mt-1">\u30D5\u30A9\u30ED\u30FC\u3059\u308B\u3068\u6295\u7A3F\u3092\u95B2\u89A7\u3067\u304D\u307E\u3059\u3002</p></div>`);
        } else if (unref(filteredPosts).length) {
          _push(`<!--[-->`);
          ssrRenderList(unref(filteredPosts), (post) => {
            var _a2, _b2;
            _push(`<div class="p-4 bg-slate-800/30 border border-slate-800 rounded-xl"><div class="flex gap-3">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/profile/@${post.user.username}`,
              class: "shrink-0"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(post.user.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(post.user.avatarUrl))} class="w-10 h-10 rounded-full object-cover"${_scopeId}>`);
                else _push2(`<div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm"${_scopeId}>${ssrInterpolate(post.user.displayName.charAt(0))}</div>`);
                else return [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(post.user.avatarUrl) ? (openBlock(), createBlock("img", {
                  key: 0,
                  src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(post.user.avatarUrl),
                  class: "w-10 h-10 rounded-full object-cover"
                }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm"
                }, toDisplayString(post.user.displayName.charAt(0)), 1))];
              }),
              _: 2
            }, _parent));
            _push(`<div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-1">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/profile/@${post.user.username}`,
              class: "font-bold text-white hover:underline truncate"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) _push2(`${ssrInterpolate(post.user.displayName)}`);
                else return [createTextVNode(toDisplayString(post.user.displayName), 1)];
              }),
              _: 2
            }, _parent));
            _push(ssrRenderComponent(_component_UserBadges, { badges: post.user.badges }, null, _parent));
            _push(ssrRenderComponent(_component_UserTitle, { title: post.user.title }, null, _parent));
            _push(`<span class="text-slate-500 text-sm shrink-0">@${ssrInterpolate(post.user.username)} \xB7 ${ssrInterpolate(timeAgo(post.createdAt))}</span></div><p class="text-slate-200 leading-relaxed whitespace-pre-wrap break-words">${(_a2 = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(post.content, { custom: unref(customEmojiMap) })) != null ? _a2 : ""}</p>`);
            if ((_b2 = post.attachments) == null ? void 0 : _b2.length) _push(ssrRenderComponent(_component_PostAttachments, { attachments: post.attachments }, null, _parent));
            else _push(`<!---->`);
            _push(`<div class="flex items-center gap-4 mt-3 text-slate-500"><button class="${ssrRenderClass([post.reposted ? "text-green-400" : "hover:text-green-400", "flex items-center gap-1.5 transition text-sm"])}">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:repeat-2",
              class: "w-4 h-4"
            }, null, _parent));
            _push(` <span>${ssrInterpolate(post.repostCount || 0)}</span></button><button class="${ssrRenderClass([post.bookmarked ? "text-amber-400" : "hover:text-amber-400", "flex items-center gap-1.5 transition text-sm"])}"><svg viewBox="0 0 24 24" class="${ssrRenderClass([post.bookmarked ? "fill-amber-400 stroke-amber-400" : "stroke-current fill-none", "w-4 h-4"])}"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg></button></div></div></div></div>`);
          });
          _push(`<!--]-->`);
        } else if (!unref(profile).locked) _push(`<p class="text-center text-slate-500 py-8">\u307E\u3060\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093</p>`);
        else _push(`<!---->`);
        if (!unref(profile).locked) _push(`<div class="h-1" aria-hidden="true"></div>`);
        else _push(`<!---->`);
        if (!unref(profile).locked && unref(loadingMorePosts)) _push(`<div class="text-center text-slate-500 py-4 text-sm">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
        else if (!unref(profile).locked && unref(userPosts).length && !unref(postHasMore)) _push(`<p class="text-center text-slate-600 py-4 text-xs">\u3059\u3079\u3066\u8868\u793A\u3057\u307E\u3057\u305F</p>`);
        else _push(`<!---->`);
        _push(`</div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
var _sfc_setup = _slug__vue_vue_type_script_setup_true_lang_default.setup;
_slug__vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/profile/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _slug__default = _slug__vue_vue_type_script_setup_true_lang_default;

export { _slug__default as default };
//# sourceMappingURL=_slug_-BXAaWyvs.mjs.map
