import { u as useFetch } from './fetch-CdHJIb6H.mjs';
import { N as NuxtLink } from './nuxt-link-Z61FlDbB.mjs';
import { defineComponent, ref, withAsyncContext, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, Fragment, createTextVNode, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
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
  async setup(__props) {
    let __temp, __restore;
    const channels = ref([]);
    const loading = ref(true);
    function otherMembers(ch) {
      var _a;
      return ((_a = ch.members) == null ? void 0 : _a.filter((m) => {
        var _a2, _b;
        return m.id !== ((_b = (_a2 = me.value) == null ? void 0 : _a2.user) == null ? void 0 : _b.id);
      })) || [];
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
    const { data: me } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/auth/me", { key: "dm-me" }, "$Zo35GyEKe7")), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = NuxtLink;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl mx-auto p-4 space-y-4" }, _attrs))}><h1 class="text-2xl font-bold text-white">DM</h1>`);
      if (unref(loading)) _push(`<div class="text-center text-slate-500 py-8">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
      else if (!unref(channels).length) _push(`<div class="text-center text-slate-500 py-8"><p>\u307E\u3060DM\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u3042\u308A\u307E\u305B\u3093</p></div>`);
      else {
        _push(`<div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(channels), (ch) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: ch.id,
            to: `/dm/${ch.id}`,
            class: "flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
              if (_push2) {
                _push2(`<div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden"${_scopeId}>`);
                if ((_a = otherMembers(ch)[0]) == null ? void 0 : _a.avatarUrl) _push2(`<img${ssrRenderAttr("src", otherMembers(ch)[0].avatarUrl)} class="w-full h-full object-cover"${_scopeId}>`);
                else _push2(`<!--[-->${ssrInterpolate(((_c = (_b = otherMembers(ch)[0]) == null ? void 0 : _b.displayName) == null ? void 0 : _c.charAt(0)) || "?")}<!--]-->`);
                _push2(`</div><div class="min-w-0 flex-1"${_scopeId}><div class="flex items-center justify-between gap-2"${_scopeId}><p class="text-sm font-bold text-white truncate"${_scopeId}>${ssrInterpolate(otherMembers(ch).map((m) => m.displayName).join(", ") || "\u4E0D\u660E")} <span class="text-xs font-normal text-slate-500"${_scopeId}>@${ssrInterpolate(otherMembers(ch).map((m) => m.username).join(", @") || "?")}</span></p>`);
                if ((_d = ch.lastMessage) == null ? void 0 : _d.createdAt) _push2(`<span class="text-[11px] text-slate-600 shrink-0"${_scopeId}>${ssrInterpolate(timeAgo(ch.lastMessage.createdAt))}</span>`);
                else _push2(`<!---->`);
                _push2(`</div>`);
                if (ch.lastMessage) {
                  _push2(`<p class="text-xs text-slate-400 truncate"${_scopeId}><span class="text-slate-300"${_scopeId}>${ssrInterpolate((_e = ch.lastMessage.sender) == null ? void 0 : _e.displayName)}`);
                  if (ch.lastMessage.edited) _push2(`<span class="text-slate-500"${_scopeId}>\uFF08\u7DE8\u96C6\u6E08\u307F\uFF09</span>`);
                  else _push2(`<!---->`);
                  _push2(`: </span>${ssrInterpolate(ch.lastMessage.content)}</p>`);
                } else _push2(`<p class="text-xs text-slate-500"${_scopeId}>DM\u3092\u958B\u304F</p>`);
                _push2(`</div>`);
              } else return [createVNode("div", { class: "w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden" }, [((_f = otherMembers(ch)[0]) == null ? void 0 : _f.avatarUrl) ? (openBlock(), createBlock("img", {
                key: 0,
                src: otherMembers(ch)[0].avatarUrl,
                class: "w-full h-full object-cover"
              }, null, 8, ["src"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(((_h = (_g = otherMembers(ch)[0]) == null ? void 0 : _g.displayName) == null ? void 0 : _h.charAt(0)) || "?"), 1)], 64))]), createVNode("div", { class: "min-w-0 flex-1" }, [createVNode("div", { class: "flex items-center justify-between gap-2" }, [createVNode("p", { class: "text-sm font-bold text-white truncate" }, [createTextVNode(toDisplayString(otherMembers(ch).map((m) => m.displayName).join(", ") || "\u4E0D\u660E") + " ", 1), createVNode("span", { class: "text-xs font-normal text-slate-500" }, "@" + toDisplayString(otherMembers(ch).map((m) => m.username).join(", @") || "?"), 1)]), ((_i = ch.lastMessage) == null ? void 0 : _i.createdAt) ? (openBlock(), createBlock("span", {
                key: 0,
                class: "text-[11px] text-slate-600 shrink-0"
              }, toDisplayString(timeAgo(ch.lastMessage.createdAt)), 1)) : createCommentVNode("", true)]), ch.lastMessage ? (openBlock(), createBlock("p", {
                key: 0,
                class: "text-xs text-slate-400 truncate"
              }, [createVNode("span", { class: "text-slate-300" }, [
                createTextVNode(toDisplayString((_j = ch.lastMessage.sender) == null ? void 0 : _j.displayName), 1),
                ch.lastMessage.edited ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "text-slate-500"
                }, "\uFF08\u7DE8\u96C6\u6E08\u307F\uFF09")) : createCommentVNode("", true),
                createTextVNode(": ")
              ]), createTextVNode(toDisplayString(ch.lastMessage.content), 1)])) : (openBlock(), createBlock("p", {
                key: 1,
                class: "text-xs text-slate-500"
              }, "DM\u3092\u958B\u304F"))])];
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
var _sfc_setup = index_vue_vue_type_script_setup_true_lang_default.setup;
index_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dm/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var dm_default = index_vue_vue_type_script_setup_true_lang_default;

export { dm_default as default };
//# sourceMappingURL=dm-LD4aQpDi.mjs.map
