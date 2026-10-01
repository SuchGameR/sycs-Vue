import { f as useState, c as components_default, $ as $fetch$1, n as navigateTo } from '../virtual/entry.mjs';
import { u as useFetch } from './fetch-C2pjxSar.mjs';
import { N as NuxtLink } from './nuxt-link-1Qo3YrhL.mjs';
import { B as BottomSheet_default } from './BottomSheet-lvIleqFE.mjs';
import { a as avatarSrc } from './avatar-Dl3G3V3K.mjs';
import { u as useAccounts } from './useAccounts-SBXochGK.mjs';
import { S as ServerListModal_default } from './ServerListModal-BzbS4U8N.mjs';
import { S as SettingsModal_default } from './SettingsModal-CsgJUYKF.mjs';
import { u as useUnread } from './useUnread-0m2SRGBz.mjs';
import { defineComponent, ref, withAsyncContext, computed, watch, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, Fragment, createTextVNode, toDisplayString, createCommentVNode, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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
import './UserBadges-BDdpg7rV.mjs';
import './UserTitle-CX959JWB.mjs';

var index_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const unread = useUnread();
    useAccounts();
    const showSettings = ref(false);
    const { data: me } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/auth/me", { key: "dm-me" }, "$VR-Yber1N1")), __temp = await __temp, __restore(), __temp);
    const myUser = computed(() => {
      var _a;
      return ((_a = me.value) == null ? void 0 : _a.user) || null;
    });
    const myId = computed(() => {
      var _a;
      return (_a = myUser.value) == null ? void 0 : _a.id;
    });
    const mode = useState("sycs:social-mode", () => "messages");
    watch(mode, (v) => {
    });
    const modes = [{
      key: "servers",
      label: "\u30B5\u30FC\u30D0\u30FC",
      icon: "lucide:server"
    }, {
      key: "messages",
      label: "\u30E1\u30C3\u30BB\u30FC\u30B8",
      icon: "lucide:messages-square"
    }];
    const servers = ref([]);
    const serversLoading = ref(false);
    const serversError = ref("");
    const serversLoaded = ref(false);
    const showServerSheet = ref(false);
    async function loadServers(force = false) {
      var _a;
      if (serversLoaded.value && !force) return;
      serversLoading.value = true;
      serversError.value = "";
      try {
        const data = await $fetch$1("/api/servers");
        servers.value = data.servers || [];
        serversLoaded.value = true;
      } catch (e) {
        serversError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u30B5\u30FC\u30D0\u30FC\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F";
      } finally {
        serversLoading.value = false;
      }
    }
    watch(mode, (v) => {
      if (v === "servers") loadServers();
    });
    const channels = ref([]);
    const channelsLoading = ref(true);
    function otherMembers(ch) {
      return (ch.members || []).filter((m) => m.id !== myId.value);
    }
    function timeAgo(date) {
      if (!date) return "";
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 1) return "\u305F\u3063\u305F\u4ECA";
      if (minutes < 60) return `${minutes}\u5206\u524D`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}\u6642\u9593\u524D`;
      return `${Math.floor(hours / 24)}\u65E5\u524D`;
    }
    const friends = ref([]);
    const friendsLoading = ref(false);
    const friendsError = ref("");
    const friendsLoaded = ref(false);
    const showFriends = ref(false);
    const startingDmId = ref(null);
    function toFriends(rows) {
      var _a;
      const list = Array.isArray(rows) ? rows : [];
      const selfId = myId.value;
      const selfName = (((_a = myUser.value) == null ? void 0 : _a.username) || "").toLowerCase();
      return list.filter((r) => {
        if (!(r == null ? void 0 : r.id)) return false;
        if (selfId && String(r.id) === selfId) return false;
        if (selfName && String(r.username || "").toLowerCase() === selfName) return false;
        return true;
      }).map((r) => {
        var _a2, _b, _c;
        return {
          id: String(r.id),
          username: String(r.username || ""),
          displayName: String(r.displayName || r.username || "\u4E0D\u660E"),
          avatarUrl: (_a2 = r.avatarUrl) != null ? _a2 : null,
          bio: (_b = r.bio) != null ? _b : "",
          statusMessage: (_c = r.statusMessage) != null ? _c : ""
        };
      }).sort((a, b) => a.displayName.localeCompare(b.displayName, "ja"));
    }
    async function loadFriends() {
      var _a;
      if (friendsLoaded.value) return;
      if (!myId.value) {
        friendsError.value = "\u30B5\u30A4\u30F3\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059";
        return;
      }
      friendsLoading.value = true;
      friendsError.value = "";
      try {
        const data = await $fetch$1(`/api/users/${myId.value}/friends`);
        friends.value = toFriends(data == null ? void 0 : data.friends);
        friendsLoaded.value = true;
      } catch (e) {
        friends.value = [];
        friendsError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u30D5\u30EC\u30F3\u30C9\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F";
      } finally {
        friendsLoading.value = false;
      }
    }
    async function startDM(participantId) {
      var _a, _b, _c;
      if (startingDmId.value) return;
      startingDmId.value = participantId;
      try {
        const data = await $fetch$1("/api/dm/channels", {
          method: "POST",
          body: { participantId }
        });
        showFriends.value = false;
        await navigateTo(`/social/${data.channel.id}`);
      } catch (e) {
        if (((_b = e == null ? void 0 : e.statusCode) != null ? _b : (_a = e == null ? void 0 : e.response) == null ? void 0 : _a.status) === 401) await navigateTo(`/signin?redirect=${encodeURIComponent("/social")}`);
        else alert(((_c = e == null ? void 0 : e.data) == null ? void 0 : _c.message) || "\u4F1A\u8A71\u3092\u958B\u59CB\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F");
      } finally {
        startingDmId.value = null;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g;
      const _component_Icon = components_default;
      const _component_NuxtLink = NuxtLink;
      const _component_BottomSheet = BottomSheet_default;
      const _component_ServerListModal = ServerListModal_default;
      const _component_SettingsModal = SettingsModal_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl mx-auto p-4 space-y-4 pb-24 min-[681px]:pb-6" }, _attrs))}><div class="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container/40 border border-outline-variant"><button type="button" class="flex-1 min-w-0 flex items-center gap-3 text-left"${ssrRenderAttr("title", `${((_a = unref(myUser)) == null ? void 0 : _a.displayName) || "\u30DE\u30A4\u30A2\u30AB\u30A6\u30F3\u30C8"} \u3092\u5207\u308A\u66FF\u3048\u308B`)}><div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden relative group">`);
      if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_b = unref(myUser)) == null ? void 0 : _b.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_c = unref(myUser)) == null ? void 0 : _c.avatarUrl))} class="w-full h-full object-cover" alt="">`);
      else _push(`<!--[-->${ssrInterpolate(((_e = (_d = unref(myUser)) == null ? void 0 : _d.displayName) == null ? void 0 : _e.charAt(0)) || "?")}<!--]-->`);
      _push(`<span class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:repeat-2",
        class: "w-3.5 h-3.5 text-white"
      }, null, _parent));
      _push(`</span></div><div class="min-w-0 flex-1"><p class="text-sm font-bold text-on-surface truncate">${ssrInterpolate(((_f = unref(myUser)) == null ? void 0 : _f.displayName) || "\u30DE\u30A4\u30A2\u30AB\u30A6\u30F3\u30C8")}</p><p class="text-xs text-on-surface-variant truncate">@${ssrInterpolate(((_g = unref(myUser)) == null ? void 0 : _g.username) || "?")}</p></div>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:chevron-down",
        class: "w-4 h-4 text-on-surface-variant shrink-0"
      }, null, _parent));
      _push(`</button><button type="button" aria-label="\u30A2\u30AB\u30A6\u30F3\u30C8\u8A2D\u5B9A" title="\u30A2\u30AB\u30A6\u30F3\u30C8\u8A2D\u5B9A" class="shrink-0 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:settings",
        class: "w-[18px] h-[18px]"
      }, null, _parent));
      _push(`</button><button class="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-container/70 border border-outline-variant text-sm text-on-surface hover:bg-surface-container transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:user-round-check",
        class: "w-4 h-4 text-indigo-400"
      }, null, _parent));
      _push(` \u30D5\u30EC\u30F3\u30C9 `);
      if (unref(friendsLoaded) && unref(friends).length) _push(`<span class="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">${ssrInterpolate(unref(friends).length)}</span>`);
      else _push(`<!---->`);
      _push(`</button></div><div class="flex gap-1 p-1 rounded-full bg-surface-container/50 border border-outline-variant" role="tablist"><!--[-->`);
      ssrRenderList(modes, (m) => {
        _push(`<button role="tab"${ssrRenderAttr("aria-selected", unref(mode) === m.key)} class="${ssrRenderClass([unref(mode) === m.key ? "bg-indigo-600 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60", "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-sm font-bold transition"])}">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: m.icon,
          class: "w-4 h-4"
        }, null, _parent));
        _push(` ${ssrInterpolate(m.label)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(mode) === "servers") {
        _push(`<!--[--><div class="flex gap-2"><button class="flex-1 py-2.5 rounded-lg border border-outline text-sm text-on-surface hover:bg-surface-container transition flex items-center justify-center gap-1.5">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:log-in",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` \u53C2\u52A0 </button><button class="flex-1 py-2.5 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition flex items-center justify-center gap-1.5">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:plus",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` \u4F5C\u6210 </button></div>`);
        if (unref(serversLoading)) _push(`<div class="text-center text-on-surface-variant py-8">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
        else if (unref(serversError)) {
          _push(`<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 flex items-center justify-between gap-2"><span>${ssrInterpolate(unref(serversError))}</span><button class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container transition">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:rotate-cw",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`\u518D\u8A66\u884C </button></div>`);
        } else if (!unref(servers).length) _push(`<div class="text-center text-on-surface-variant py-10 text-sm"> \u53C2\u52A0\u3057\u3066\u3044\u308B\u30B5\u30FC\u30D0\u30FC\u306F\u3042\u308A\u307E\u305B\u3093 </div>`);
        else {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(servers), (s) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: s.id,
              to: `/servers/${s.id}`,
              class: "flex items-center gap-3 p-3 bg-surface-container/30 rounded-xl border border-outline-variant hover:bg-surface-container/50 transition"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a2, _b2, _c2, _d2, _e2, _f2;
                if (_push2) {
                  _push2(`<div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden"${_scopeId}>`);
                  if (s.iconUrl || s.icon_url) _push2(`<img${ssrRenderAttr("src", s.iconUrl || s.icon_url)} class="w-full h-full object-cover" alt=""${_scopeId}>`);
                  else _push2(`<!--[-->${ssrInterpolate(((_a2 = s.name) == null ? void 0 : _a2.charAt(0)) || "?")}<!--]-->`);
                  _push2(`</div><div class="min-w-0 flex-1"${_scopeId}><p class="text-sm font-bold text-on-surface truncate"${_scopeId}>${ssrInterpolate(s.name)}</p><p class="text-xs text-on-surface-variant truncate"${_scopeId}>${ssrInterpolate(s.description || `\u30E1\u30F3\u30D0\u30FC ${(_c2 = (_b2 = s.memberCount) != null ? _b2 : s.member_count) != null ? _c2 : 0} \u4EBA`)}</p></div>`);
                  _push2(ssrRenderComponent(_component_Icon, {
                    name: "lucide:chevron-right",
                    class: "w-4 h-4 text-on-surface-variant shrink-0"
                  }, null, _parent2, _scopeId));
                } else return [
                  createVNode("div", { class: "w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden" }, [s.iconUrl || s.icon_url ? (openBlock(), createBlock("img", {
                    key: 0,
                    src: s.iconUrl || s.icon_url,
                    class: "w-full h-full object-cover",
                    alt: ""
                  }, null, 8, ["src"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(((_d2 = s.name) == null ? void 0 : _d2.charAt(0)) || "?"), 1)], 64))]),
                  createVNode("div", { class: "min-w-0 flex-1" }, [createVNode("p", { class: "text-sm font-bold text-on-surface truncate" }, toDisplayString(s.name), 1), createVNode("p", { class: "text-xs text-on-surface-variant truncate" }, toDisplayString(s.description || `\u30E1\u30F3\u30D0\u30FC ${(_f2 = (_e2 = s.memberCount) != null ? _e2 : s.member_count) != null ? _f2 : 0} \u4EBA`), 1)]),
                  createVNode(_component_Icon, {
                    name: "lucide:chevron-right",
                    class: "w-4 h-4 text-on-surface-variant shrink-0"
                  })
                ];
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!--[-->`);
        if (unref(channelsLoading)) _push(`<div class="text-center text-on-surface-variant py-8">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
        else if (!unref(channels).length) {
          _push(`<div class="text-center text-on-surface-variant py-10 text-sm space-y-3"><p>\u307E\u3060\u4F1A\u8A71\u304C\u3042\u308A\u307E\u305B\u3093</p><button class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:user-round-check",
            class: "w-4 h-4"
          }, null, _parent));
          _push(` \u30D5\u30EC\u30F3\u30C9\u304B\u3089\u4F1A\u8A71\u3092\u59CB\u3081\u308B </button></div>`);
        } else {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(channels), (ch) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: ch.id,
              to: `/social/${ch.id}`,
              class: "flex items-center gap-3 p-3 bg-surface-container/30 rounded-xl border border-outline-variant hover:bg-surface-container/50 transition"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h, _i, _j, _k, _l, _m, _n;
                if (_push2) {
                  _push2(`<div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden"${_scopeId}>`);
                  if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = otherMembers(ch)[0]) == null ? void 0 : _a2.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_b2 = otherMembers(ch)[0]) == null ? void 0 : _b2.avatarUrl))} class="w-full h-full object-cover" alt=""${_scopeId}>`);
                  else _push2(`<!--[-->${ssrInterpolate(((_d2 = (_c2 = otherMembers(ch)[0]) == null ? void 0 : _c2.displayName) == null ? void 0 : _d2.charAt(0)) || "?")}<!--]-->`);
                  _push2(`</div><div class="min-w-0 flex-1"${_scopeId}><div class="flex items-center justify-between gap-2"${_scopeId}><p class="text-sm font-bold text-on-surface truncate"${_scopeId}>${ssrInterpolate(otherMembers(ch).map((m) => m.displayName).join(", ") || "\u4E0D\u660E")} <span class="text-xs font-normal text-on-surface-variant"${_scopeId}>@${ssrInterpolate(otherMembers(ch).map((m) => m.username).join(", @") || "?")}</span></p><span class="flex items-center gap-1.5 shrink-0"${_scopeId}>`);
                  if (unref(unread).hasDmUnread(ch.id)) _push2(`<span class="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center"${_scopeId}>1</span>`);
                  else _push2(`<!---->`);
                  if ((_e2 = ch.lastMessage) == null ? void 0 : _e2.createdAt) _push2(`<span class="text-[11px] text-slate-600"${_scopeId}>${ssrInterpolate(timeAgo(ch.lastMessage.createdAt))}</span>`);
                  else _push2(`<!---->`);
                  _push2(`</span></div>`);
                  if (ch.lastMessage) {
                    _push2(`<p class="text-xs text-on-surface-variant truncate"${_scopeId}><span class="text-on-surface"${_scopeId}>${ssrInterpolate((_f2 = ch.lastMessage.sender) == null ? void 0 : _f2.displayName)}`);
                    if (ch.lastMessage.edited) _push2(`<span class="text-on-surface-variant"${_scopeId}>\uFF08\u7DE8\u96C6\u6E08\u307F\uFF09</span>`);
                    else _push2(`<!---->`);
                    _push2(`: </span>${ssrInterpolate(ch.lastMessage.content)}</p>`);
                  } else _push2(`<p class="text-xs text-on-surface-variant"${_scopeId}>\u4F1A\u8A71\u3092\u958B\u304F</p>`);
                  if ((_g2 = otherMembers(ch)[0]) == null ? void 0 : _g2.statusMessage) _push2(`<p class="text-[11px] text-emerald-400/80 truncate flex items-center gap-1 mt-0.5"${_scopeId}><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block"${_scopeId}></span>${ssrInterpolate(otherMembers(ch)[0].statusMessage)}</p>`);
                  else _push2(`<!---->`);
                  _push2(`</div>`);
                } else return [createVNode("div", { class: "w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden" }, [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_h = otherMembers(ch)[0]) == null ? void 0 : _h.avatarUrl) ? (openBlock(), createBlock("img", {
                  key: 0,
                  src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_i = otherMembers(ch)[0]) == null ? void 0 : _i.avatarUrl),
                  class: "w-full h-full object-cover",
                  alt: ""
                }, null, 8, ["src"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(((_k = (_j = otherMembers(ch)[0]) == null ? void 0 : _j.displayName) == null ? void 0 : _k.charAt(0)) || "?"), 1)], 64))]), createVNode("div", { class: "min-w-0 flex-1" }, [
                  createVNode("div", { class: "flex items-center justify-between gap-2" }, [createVNode("p", { class: "text-sm font-bold text-on-surface truncate" }, [createTextVNode(toDisplayString(otherMembers(ch).map((m) => m.displayName).join(", ") || "\u4E0D\u660E") + " ", 1), createVNode("span", { class: "text-xs font-normal text-on-surface-variant" }, "@" + toDisplayString(otherMembers(ch).map((m) => m.username).join(", @") || "?"), 1)]), createVNode("span", { class: "flex items-center gap-1.5 shrink-0" }, [unref(unread).hasDmUnread(ch.id) ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center"
                  }, "1")) : createCommentVNode("", true), ((_l = ch.lastMessage) == null ? void 0 : _l.createdAt) ? (openBlock(), createBlock("span", {
                    key: 1,
                    class: "text-[11px] text-slate-600"
                  }, toDisplayString(timeAgo(ch.lastMessage.createdAt)), 1)) : createCommentVNode("", true)])]),
                  ch.lastMessage ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-xs text-on-surface-variant truncate"
                  }, [createVNode("span", { class: "text-on-surface" }, [
                    createTextVNode(toDisplayString((_m = ch.lastMessage.sender) == null ? void 0 : _m.displayName), 1),
                    ch.lastMessage.edited ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "text-on-surface-variant"
                    }, "\uFF08\u7DE8\u96C6\u6E08\u307F\uFF09")) : createCommentVNode("", true),
                    createTextVNode(": ")
                  ]), createTextVNode(toDisplayString(ch.lastMessage.content), 1)])) : (openBlock(), createBlock("p", {
                    key: 1,
                    class: "text-xs text-on-surface-variant"
                  }, "\u4F1A\u8A71\u3092\u958B\u304F")),
                  ((_n = otherMembers(ch)[0]) == null ? void 0 : _n.statusMessage) ? (openBlock(), createBlock("p", {
                    key: 2,
                    class: "text-[11px] text-emerald-400/80 truncate flex items-center gap-1 mt-0.5"
                  }, [createVNode("span", { class: "w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" }), createTextVNode(toDisplayString(otherMembers(ch)[0].statusMessage), 1)])) : createCommentVNode("", true)
                ])];
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        }
        _push(`<!--]-->`);
      }
      _push(ssrRenderComponent(_component_BottomSheet, {
        open: unref(showFriends),
        height: "min(75dvh, 34rem)",
        "dismiss-on-backdrop": true,
        onClose: ($event) => showFriends.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-4"${_scopeId}><div class="flex items-center justify-between mb-3"${_scopeId}><span class="font-bold text-on-surface"${_scopeId}>\u30D5\u30EC\u30F3\u30C9</span><button class="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:x",
              class: "w-5 h-5"
            }, null, _parent2, _scopeId));
            _push2(`</button></div>`);
            if (unref(friendsLoading)) {
              _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
              ssrRenderList(3, (i) => {
                _push2(`<div class="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container/30 border border-outline-variant"${_scopeId}><div class="w-9 h-9 rounded-full bg-surface-container animate-pulse shrink-0"${_scopeId}></div><div class="flex-1 min-w-0 space-y-2"${_scopeId}><div class="h-3 w-1/3 rounded bg-surface-container animate-pulse"${_scopeId}></div><div class="h-2.5 w-1/4 rounded bg-surface-container animate-pulse"${_scopeId}></div></div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else if (unref(friendsError)) {
              _push2(`<div class="p-3 rounded-xl bg-surface-container/40 border border-outline-variant text-center"${_scopeId}><p class="text-sm text-on-surface"${_scopeId}>${ssrInterpolate(unref(friendsError))}</p><button class="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-sm text-on-surface hover:bg-surface-container transition"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:rotate-cw",
                class: "w-4 h-4"
              }, null, _parent2, _scopeId));
              _push2(`\u518D\u8AAD\u307F\u8FBC\u307F </button></div>`);
            } else if (!unref(friends).length) {
              _push2(`<div class="p-6 rounded-xl bg-surface-container/40 border border-outline-variant text-center"${_scopeId}><div class="w-10 h-10 mx-auto rounded-full bg-surface-container flex items-center justify-center"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:user-round-x",
                class: "w-5 h-5 text-on-surface-variant"
              }, null, _parent2, _scopeId));
              _push2(`</div><p class="mt-2 text-sm text-on-surface"${_scopeId}>\u307E\u3060\u30D5\u30EC\u30F3\u30C9\u304C\u3044\u307E\u305B\u3093</p><p class="text-xs text-on-surface-variant mt-1"${_scopeId}>\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u304B\u3089\u30D5\u30EC\u30F3\u30C9\u7533\u8ACB\u3092\u9001\u308B\u3068\u3001\u3053\u3053\u306B\u8868\u793A\u3055\u308C\u307E\u3059</p></div>`);
            } else {
              _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
              ssrRenderList(unref(friends), (f) => {
                var _a2;
                _push2(`<button type="button"${ssrIncludeBooleanAttr(!!unref(startingDmId)) ? " disabled" : ""} class="w-full flex items-center gap-3 p-2.5 rounded-xl bg-surface-container/40 border border-outline-variant hover:bg-surface-container/70 active:bg-surface-container transition text-left disabled:opacity-50 disabled:cursor-not-allowed"${_scopeId}><div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden"${_scopeId}>`);
                if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(f.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(f.avatarUrl))} class="w-full h-full object-cover" alt=""${_scopeId}>`);
                else _push2(`<!--[-->${ssrInterpolate(((_a2 = f.displayName) == null ? void 0 : _a2.charAt(0)) || "?")}<!--]-->`);
                _push2(`</div><div class="min-w-0 flex-1"${_scopeId}><p class="text-sm font-bold text-on-surface truncate"${_scopeId}>${ssrInterpolate(f.displayName)}</p><p class="text-xs text-on-surface-variant truncate"${_scopeId}>@${ssrInterpolate(f.username)}</p>`);
                if (f.statusMessage) _push2(`<p class="text-[11px] text-emerald-400/80 truncate flex items-center gap-1 mt-0.5"${_scopeId}><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block"${_scopeId}></span>${ssrInterpolate(f.statusMessage)}</p>`);
                else if (f.bio) _push2(`<p class="text-[11px] text-on-surface-variant/80 truncate mt-0.5"${_scopeId}>${ssrInterpolate(f.bio)}</p>`);
                else _push2(`<!---->`);
                _push2(`</div>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: unref(startingDmId) === f.id ? "lucide:loader-2" : "lucide:message-square",
                  class: unref(startingDmId) === f.id ? "w-4 h-4 text-indigo-400 animate-spin shrink-0" : "w-4 h-4 text-indigo-400 shrink-0"
                }, null, _parent2, _scopeId));
                _push2(`</button>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(`</div>`);
          } else return [createVNode("div", { class: "p-4" }, [createVNode("div", { class: "flex items-center justify-between mb-3" }, [createVNode("span", { class: "font-bold text-on-surface" }, "\u30D5\u30EC\u30F3\u30C9"), createVNode("button", {
            onClick: ($event) => showFriends.value = false,
            class: "p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
          }, [createVNode(_component_Icon, {
            name: "lucide:x",
            class: "w-5 h-5"
          })], 8, ["onClick"])]), unref(friendsLoading) ? (openBlock(), createBlock("div", {
            key: 0,
            class: "space-y-2"
          }, [(openBlock(), createBlock(Fragment, null, renderList(3, (i) => {
            return createVNode("div", {
              key: `skeleton-${i}`,
              class: "flex items-center gap-3 p-2.5 rounded-xl bg-surface-container/30 border border-outline-variant"
            }, [createVNode("div", { class: "w-9 h-9 rounded-full bg-surface-container animate-pulse shrink-0" }), createVNode("div", { class: "flex-1 min-w-0 space-y-2" }, [createVNode("div", { class: "h-3 w-1/3 rounded bg-surface-container animate-pulse" }), createVNode("div", { class: "h-2.5 w-1/4 rounded bg-surface-container animate-pulse" })])]);
          }), 64))])) : unref(friendsError) ? (openBlock(), createBlock("div", {
            key: 1,
            class: "p-3 rounded-xl bg-surface-container/40 border border-outline-variant text-center"
          }, [createVNode("p", { class: "text-sm text-on-surface" }, toDisplayString(unref(friendsError)), 1), createVNode("button", {
            onClick: ($event) => {
              friendsLoaded.value = false;
              loadFriends();
            },
            class: "mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-sm text-on-surface hover:bg-surface-container transition"
          }, [createVNode(_component_Icon, {
            name: "lucide:rotate-cw",
            class: "w-4 h-4"
          }), createTextVNode("\u518D\u8AAD\u307F\u8FBC\u307F ")], 8, ["onClick"])])) : !unref(friends).length ? (openBlock(), createBlock("div", {
            key: 2,
            class: "p-6 rounded-xl bg-surface-container/40 border border-outline-variant text-center"
          }, [
            createVNode("div", { class: "w-10 h-10 mx-auto rounded-full bg-surface-container flex items-center justify-center" }, [createVNode(_component_Icon, {
              name: "lucide:user-round-x",
              class: "w-5 h-5 text-on-surface-variant"
            })]),
            createVNode("p", { class: "mt-2 text-sm text-on-surface" }, "\u307E\u3060\u30D5\u30EC\u30F3\u30C9\u304C\u3044\u307E\u305B\u3093"),
            createVNode("p", { class: "text-xs text-on-surface-variant mt-1" }, "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u304B\u3089\u30D5\u30EC\u30F3\u30C9\u7533\u8ACB\u3092\u9001\u308B\u3068\u3001\u3053\u3053\u306B\u8868\u793A\u3055\u308C\u307E\u3059")
          ])) : (openBlock(), createBlock("div", {
            key: 3,
            class: "space-y-2"
          }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(friends), (f) => {
            var _a2;
            return openBlock(), createBlock("button", {
              key: f.id,
              type: "button",
              onClick: ($event) => startDM(f.id),
              disabled: !!unref(startingDmId),
              class: "w-full flex items-center gap-3 p-2.5 rounded-xl bg-surface-container/40 border border-outline-variant hover:bg-surface-container/70 active:bg-surface-container transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
            }, [
              createVNode("div", { class: "w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden" }, [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(f.avatarUrl) ? (openBlock(), createBlock("img", {
                key: 0,
                src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(f.avatarUrl),
                class: "w-full h-full object-cover",
                alt: ""
              }, null, 8, ["src"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(((_a2 = f.displayName) == null ? void 0 : _a2.charAt(0)) || "?"), 1)], 64))]),
              createVNode("div", { class: "min-w-0 flex-1" }, [
                createVNode("p", { class: "text-sm font-bold text-on-surface truncate" }, toDisplayString(f.displayName), 1),
                createVNode("p", { class: "text-xs text-on-surface-variant truncate" }, "@" + toDisplayString(f.username), 1),
                f.statusMessage ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-[11px] text-emerald-400/80 truncate flex items-center gap-1 mt-0.5"
                }, [createVNode("span", { class: "w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" }), createTextVNode(toDisplayString(f.statusMessage), 1)])) : f.bio ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "text-[11px] text-on-surface-variant/80 truncate mt-0.5"
                }, toDisplayString(f.bio), 1)) : createCommentVNode("", true)
              ]),
              createVNode(_component_Icon, {
                name: unref(startingDmId) === f.id ? "lucide:loader-2" : "lucide:message-square",
                class: unref(startingDmId) === f.id ? "w-4 h-4 text-indigo-400 animate-spin shrink-0" : "w-4 h-4 text-indigo-400 shrink-0"
              }, null, 8, ["name", "class"])
            ], 8, ["onClick", "disabled"]);
          }), 128))]))])];
        }),
        _: 1
      }, _parent));
      if (unref(showServerSheet)) _push(ssrRenderComponent(_component_ServerListModal, { onClose: ($event) => {
        showServerSheet.value = false;
        loadServers(true);
      } }, null, _parent));
      else _push(`<!---->`);
      if (unref(showSettings)) _push(ssrRenderComponent(_component_SettingsModal, { onClose: ($event) => showSettings.value = false }, null, _parent));
      else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/social/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var social_default = index_vue_vue_type_script_setup_true_lang_default;

export { social_default as default };
//# sourceMappingURL=social-DdBLeiNq.mjs.map
