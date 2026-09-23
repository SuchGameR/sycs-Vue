import { a as useRoute, m as useState, $ as $fetch$1, o as useRealtime, _ as _plugin_vue_export_helper_default, i as useRouter, c as components_default, C as ClientOnly } from '../virtual/entry.mjs';
import { u as useFetch } from './fetch-Cq4So9M_.mjs';
import { N as NuxtLink } from './nuxt-link-DHTgvg7C.mjs';
import { U as UserBadges_default, a as UserTitle_default } from './UserTitle-CTUBxh5l.mjs';
import { u as useCustomTimelines, T as TIMELINE_PRESETS } from './useCustomTimelines-B55Xm7bh.mjs';
import { a as avatarSrc } from './avatar-BGDIRQ_Q.mjs';
import { u as useAccounts, M as ModelViewer_default, E as EmojiTextarea_default } from './ModelViewer-Ciluudu5.mjs';
import { u as useMediaPane, a as useAppPreferences } from './useMediaPane-CJDvgIq6.mjs';
import { S as SettingsModal_default } from './SettingsModal-DfFw3XNJ.mjs';
import { u as useUnread } from './useUnread-C7Vd8IF6.mjs';
import { u as useCustomEmojis, r as renderRichText } from './richText-C23QsgTl.mjs';
import { u as useQuoteComposer, E as EmojiIcon_default, R as ReactionPicker_default } from './useQuoteComposer-aC9wgnjC.mjs';
import { F as FileCard_default, u as useInfiniteScroll, P as PostAttachments_default } from './useInfiniteScroll-pgXZQZjZ.mjs';
import { s as setInterval } from './interval-T_Je0Yfm.mjs';
import { u as useVoiceCall } from './useVoiceCall-c99S1h1A.mjs';
import { u as usePlaylists } from './usePlaylists-B3RYj2Xy.mjs';
import { defineComponent, computed, ref, watch, mergeProps, unref, withCtx, createTextVNode, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, Fragment, reactive, nextTick, isRef, resolveDynamicComponent, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderAttr, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport, ssrRenderVNode } from 'vue/server-renderer';
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
import './richEditor-sKEqCQC9.mjs';
import '@tiptap/core';
import '@tiptap/vue-3';
import '@tiptap/extension-document';
import '@tiptap/extension-paragraph';
import '@tiptap/extension-text';
import '@tiptap/extension-hard-break';

var selectCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500";
var CustomTimelineModal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "CustomTimelineModal",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    useCustomTimelines();
    const mode = ref("easy");
    const label = ref("");
    const conditions = reactive({
      scope: "global",
      mediaType: "",
      sort: "latest",
      includeRelated: false,
      serverId: "",
      channelId: ""
    });
    const { data: serversData } = useFetch("/api/servers", { key: "timeline-builder-servers" }, "$f5bycPfCHk");
    const servers = computed(() => {
      var _a;
      return ((_a = serversData.value) == null ? void 0 : _a.servers) || [];
    });
    const channels = ref([]);
    const loadingChannels = ref(false);
    watch(() => conditions.serverId, async (id) => {
      conditions.channelId = "";
      channels.value = [];
      if (!id) return;
      loadingChannels.value = true;
      try {
        const data = await $fetch$1(`/api/servers/${id}`);
        channels.value = (data.channels || []).filter((c) => c.type !== "voice");
      } catch {
        channels.value = [];
      } finally {
        loadingChannels.value = false;
      }
    });
    const scopeOptions = [
      {
        key: "global",
        label: "\u5168\u4F53"
      },
      {
        key: "local",
        label: "\u30ED\u30FC\u30AB\u30EB"
      },
      {
        key: "following",
        label: "\u30D5\u30A9\u30ED\u30FC\u4E2D"
      },
      {
        key: "recommended",
        label: "\u30AA\u30B9\u30B9\u30E1"
      }
    ];
    const mediaOptions = [
      {
        key: "",
        label: "\u3059\u3079\u3066"
      },
      {
        key: "video",
        label: "\u52D5\u753B"
      },
      {
        key: "image",
        label: "\u753B\u50CF"
      },
      {
        key: "audio",
        label: "\u97F3\u697D"
      },
      {
        key: "text",
        label: "\u30C6\u30AD\u30B9\u30C8"
      }
    ];
    const sortOptions = [{
      key: "latest",
      label: "\u6700\u65B0"
    }, {
      key: "popular",
      label: "\u4EBA\u6C17"
    }];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70"><div class="bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-md max-h-[88vh] overflow-y-auto"><div class="flex items-center justify-between px-5 py-4 border-b border-slate-800"><h3 class="font-bold text-white">\u30AB\u30B9\u30BF\u30E0\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3</h3><button class="text-slate-500 hover:text-white transition">`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-5 h-5"
        }, null, _parent));
        _push2(`</button></div><div class="flex p-1.5 m-4 mb-2 rounded-xl bg-slate-800/60"><button class="${ssrRenderClass([unref(mode) === "easy" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white", "flex-1 py-1.5 rounded-lg text-sm font-bold transition"])}">\u304B\u3093\u305F\u3093</button><button class="${ssrRenderClass([unref(mode) === "detail" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white", "flex-1 py-1.5 rounded-lg text-sm font-bold transition"])}">\u8A73\u7D30</button></div>`);
        if (unref(mode) === "easy") {
          _push2(`<div class="p-4 pt-2"><p class="text-xs text-slate-500 mb-3">\u3088\u304F\u4F7F\u3046\u6761\u4EF6\u304B\u3089\u4F5C\u6210\uFF08\u30BF\u30D6\u306B\u30D4\u30F3\u7559\u3081\u3055\u308C\u307E\u3059\uFF09</p><div class="grid grid-cols-2 gap-2"><!--[-->`);
          ssrRenderList(unref(TIMELINE_PRESETS), (p) => {
            _push2(`<button class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800 transition text-left">`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: p.icon,
              class: "w-4 h-4 text-indigo-400 shrink-0"
            }, null, _parent));
            _push2(`<span class="text-sm text-slate-200">${ssrInterpolate(p.label)}</span></button>`);
          });
          _push2(`<!--]--></div></div>`);
        } else {
          _push2(`<div class="p-4 pt-2 space-y-4"><div><label class="block text-xs font-bold text-slate-400 mb-1.5">\u540D\u524D</label><input${ssrRenderAttr("value", unref(label))} class="${ssrRenderClass(selectCls)}" placeholder="\u30DE\u30A4\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3" maxlength="30"></div><div class="grid grid-cols-2 gap-3"><div><label class="block text-xs font-bold text-slate-400 mb-1.5">\u7BC4\u56F2</label><select class="${ssrRenderClass(selectCls)}"><!--[-->`);
          ssrRenderList(scopeOptions, (o) => {
            _push2(`<option${ssrRenderAttr("value", o.key)}${ssrIncludeBooleanAttr(Array.isArray(unref(conditions).scope) ? ssrLooseContain(unref(conditions).scope, o.key) : ssrLooseEqual(unref(conditions).scope, o.key)) ? " selected" : ""}>${ssrInterpolate(o.label)}</option>`);
          });
          _push2(`<!--]--></select></div><div><label class="block text-xs font-bold text-slate-400 mb-1.5">\u4E26\u3073\u9806</label><select class="${ssrRenderClass(selectCls)}"><!--[-->`);
          ssrRenderList(sortOptions, (o) => {
            _push2(`<option${ssrRenderAttr("value", o.key)}${ssrIncludeBooleanAttr(Array.isArray(unref(conditions).sort) ? ssrLooseContain(unref(conditions).sort, o.key) : ssrLooseEqual(unref(conditions).sort, o.key)) ? " selected" : ""}>${ssrInterpolate(o.label)}</option>`);
          });
          _push2(`<!--]--></select></div></div><div><label class="block text-xs font-bold text-slate-400 mb-1.5">\u30E1\u30C7\u30A3\u30A2\u7A2E\u5225</label><div class="flex flex-wrap gap-1.5"><!--[-->`);
          ssrRenderList(mediaOptions, (o) => {
            _push2(`<button type="button" class="${ssrRenderClass([unref(conditions).mediaType === o.key ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white", "px-3 py-1.5 rounded-lg text-xs font-bold transition"])}">${ssrInterpolate(o.label)}</button>`);
          });
          _push2(`<!--]--></div></div><div><label class="block text-xs font-bold text-slate-400 mb-1.5">\u30B5\u30FC\u30D0\u30FC / \u30C1\u30E3\u30F3\u30CD\u30EB\u6307\u5B9A\uFF08\u4EFB\u610F\uFF09</label><div class="grid grid-cols-2 gap-3"><select class="${ssrRenderClass(selectCls)}"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(conditions).serverId) ? ssrLooseContain(unref(conditions).serverId, "") : ssrLooseEqual(unref(conditions).serverId, "")) ? " selected" : ""}>\u3059\u3079\u3066\u306E\u30B5\u30FC\u30D0\u30FC</option><!--[-->`);
          ssrRenderList(unref(servers), (s) => {
            _push2(`<option${ssrRenderAttr("value", s.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(conditions).serverId) ? ssrLooseContain(unref(conditions).serverId, s.id) : ssrLooseEqual(unref(conditions).serverId, s.id)) ? " selected" : ""}>${ssrInterpolate(s.name)}</option>`);
          });
          _push2(`<!--]--></select><select class="${ssrRenderClass(selectCls)}"${ssrIncludeBooleanAttr(!unref(conditions).serverId || unref(loadingChannels)) ? " disabled" : ""}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(conditions).channelId) ? ssrLooseContain(unref(conditions).channelId, "") : ssrLooseEqual(unref(conditions).channelId, "")) ? " selected" : ""}>${ssrInterpolate(unref(loadingChannels) ? "\u8AAD\u307F\u8FBC\u307F\u4E2D..." : "\u3059\u3079\u3066\u306E\u30C1\u30E3\u30F3\u30CD\u30EB")}</option><!--[-->`);
          ssrRenderList(unref(channels), (c) => {
            _push2(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(conditions).channelId) ? ssrLooseContain(unref(conditions).channelId, c.id) : ssrLooseEqual(unref(conditions).channelId, c.id)) ? " selected" : ""}>#${ssrInterpolate(c.name)}</option>`);
          });
          _push2(`<!--]--></select></div></div><label class="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(conditions).includeRelated) ? ssrLooseContain(unref(conditions).includeRelated, null) : unref(conditions).includeRelated) ? " checked" : ""} type="checkbox" class="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"><div><p class="text-sm text-white font-medium">\u95A2\u9023\u30B3\u30F3\u30C6\u30F3\u30C4\u3092\u542B\u3081\u308B</p><p class="text-xs text-slate-500">\u3044\u3044\u306D\u3057\u305F\u4EBA\u306E\u6295\u7A3F\u306A\u3069\u3001\u4F3C\u305F\u7CFB\u7D71\u306E\u4EBA\u305F\u3061\u3092\u542B\u3081\u307E\u3059</p></div></label><button class="w-full py-2.5 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition"> \u4F5C\u6210\u3057\u3066\u30D4\u30F3\u7559\u3081 </button></div>`);
        }
        _push2(`</div></div>`);
      }, "body", false, _parent);
    };
  }
});
var _sfc_setup$21 = CustomTimelineModal_vue_vue_type_script_setup_true_lang_default.setup;
CustomTimelineModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CustomTimelineModal.vue");
  return _sfc_setup$21 ? _sfc_setup$21(props, ctx) : void 0;
};
var CustomTimelineModal_default = Object.assign(CustomTimelineModal_vue_vue_type_script_setup_true_lang_default, { __name: "CustomTimelineModal" });
var TimelineTabs_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TimelineTabs",
  __ssrInlineRender: true,
  setup(__props) {
    const { fixedTabs, pinnedTabs, unpinnedTabs, activeId } = useCustomTimelines();
    const showBuilder = ref(false);
    const showMore = ref(false);
    ref(null);
    const menuPos = ref({
      top: 0,
      left: 0
    });
    ref(null);
    const visibleTabs = computed(() => [...fixedTabs, ...pinnedTabs.value]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_CustomTimelineModal = CustomTimelineModal_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-1 min-w-0 max-w-full" }, _attrs))} data-v-a2ed3202><div class="flex items-center gap-1 overflow-x-auto min-w-0 [scrollbar-width:none] [&amp;::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing" data-v-a2ed3202><!--[-->`);
      ssrRenderList(unref(visibleTabs), (tab) => {
        _push(`<div class="${ssrRenderClass([unref(activeId) === tab.id ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800/70", "group flex items-center rounded-full transition whitespace-nowrap shrink-0"])}" data-v-a2ed3202><button class="${ssrRenderClass([tab.fixed ? "pr-3 py-1.5" : "pr-1 py-1.5", "pl-3 text-sm font-medium truncate max-w-[9rem]"])}" data-v-a2ed3202>${ssrInterpolate(tab.label)}</button>`);
        if (!tab.fixed) {
          _push(`<button class="${ssrRenderClass([unref(activeId) === tab.id ? "text-slate-500 hover:text-slate-900 hover:bg-slate-300" : "text-slate-500 hover:text-white hover:bg-slate-700", "mr-1 p-0.5 rounded-full transition shrink-0"])}" title="\u30BF\u30D6\u3092\u9589\u3058\u308B" data-v-a2ed3202>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:x",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`</button>`);
        } else _push(`<!---->`);
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
      if (unref(unpinnedTabs).length) {
        _push(`<div class="shrink-0" data-v-a2ed3202><button class="${ssrRenderClass([unref(showMore) ? "text-slate-200 bg-slate-800/50" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50", "px-2.5 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1"])}" data-v-a2ed3202> \u305D\u306E\u4ED6 `);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:chevron-down",
          class: ["w-3.5 h-3.5 transition-transform", unref(showMore) ? "rotate-180" : ""]
        }, null, _parent));
        _push(`</button></div>`);
      } else _push(`<!---->`);
      _push(`<button class="p-1.5 rounded-full text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 transition shrink-0" title="\u30AB\u30B9\u30BF\u30E0\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3\u3092\u4F5C\u6210" data-v-a2ed3202>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:plus",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showMore)) _push2(`<div class="fixed inset-0 z-[299]" data-v-a2ed3202></div>`);
        else _push2(`<!---->`);
        if (unref(showMore)) {
          _push2(`<div class="fixed z-[300] bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl min-w-52 max-h-[60vh] overflow-y-auto" style="${ssrRenderStyle({
            top: unref(menuPos).top + "px",
            left: unref(menuPos).left + "px"
          })}" data-v-a2ed3202><!--[-->`);
          ssrRenderList(unref(unpinnedTabs), (tab) => {
            _push2(`<div class="flex items-center group" data-v-a2ed3202><button class="${ssrRenderClass([unref(activeId) === tab.id ? "text-indigo-400" : "text-slate-400 hover:text-white hover:bg-slate-800/50", "flex-1 text-left px-3 py-2 text-sm transition truncate"])}" data-v-a2ed3202>${ssrInterpolate(tab.label)}</button><button class="p-1.5 text-slate-600 hover:text-indigo-400 transition" title="\u30D4\u30F3\u7559\u3081" data-v-a2ed3202>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:pin",
              class: "w-3.5 h-3.5"
            }, null, _parent));
            _push2(`</button><button class="p-1.5 mr-1 text-slate-600 hover:text-red-400 transition" title="\u524A\u9664" data-v-a2ed3202>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:trash-2",
              class: "w-3.5 h-3.5"
            }, null, _parent));
            _push2(`</button></div>`);
          });
          _push2(`<!--]--></div>`);
        } else _push2(`<!---->`);
      }, "body", false, _parent);
      if (unref(showBuilder)) _push(ssrRenderComponent(_component_CustomTimelineModal, { onClose: ($event) => showBuilder.value = false }, null, _parent));
      else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup$20 = TimelineTabs_vue_vue_type_script_setup_true_lang_default.setup;
TimelineTabs_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/TimelineTabs.vue");
  return _sfc_setup$20 ? _sfc_setup$20(props, ctx) : void 0;
};
var TimelineTabs_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(TimelineTabs_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-a2ed3202"]]), { __name: "TimelineTabs" });
var AppHeader_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "AppHeader",
  __ssrInlineRender: true,
  props: {
    isServerPage: { type: Boolean },
    server: {}
  },
  setup(__props) {
    const route = useRoute();
    useRouter();
    const me = useState("current-user", () => null);
    useAccounts();
    const isHomePage = computed(() => route.path === "/home");
    const isProfilePage = computed(() => route.path.startsWith("/profile/"));
    const profileHeader = useState("profile-header-state", () => null);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_NuxtLink = NuxtLink;
      const _component_UserBadges = UserBadges_default;
      const _component_TimelineTabs = TimelineTabs_default;
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-686e8b98><div class="h-14 flex overflow-hidden relative" data-v-686e8b98>`);
      if (__props.isServerPage && ((_a = __props.server) == null ? void 0 : _a.bannerUrl)) _push(`<!--[--><img${ssrRenderAttr("src", __props.server.bannerUrl)} class="absolute inset-0 w-full h-full object-cover" data-v-686e8b98><div class="absolute inset-0 bg-[#0b0f19]/70" data-v-686e8b98></div><!--]-->`);
      else _push(`<!---->`);
      _push(`<div class="${ssrRenderClass([__props.isServerPage ? "" : "shadow-[0px_0px_43px_50px_#0b0f19]", "hidden min-[681px]:flex items-center px-4 w-48 min-[1024px]:w-60 shrink-0 z-40"])}" data-v-686e8b98>`);
      if (!__props.isServerPage) _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "text-lg font-extrabold tracking-tighter shrink-0"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) _push2(` SYCS<span class="text-indigo-500" data-v-686e8b98${_scopeId}>.</span>`);
          else return [createTextVNode(" SYCS"), createVNode("span", { class: "text-indigo-500" }, ".")];
        }),
        _: 1
      }, _parent));
      else _push(`<!---->`);
      _push(`</div><div class="flex-1 flex items-center gap-4 px-4 min-w-0 justify-center relative overflow-hidden" data-v-686e8b98>`);
      if (unref(isProfilePage) && unref(profileHeader)) {
        _push(`<div class="absolute inset-0" data-v-686e8b98>`);
        if ((_b = unref(profileHeader)) == null ? void 0 : _b.bannerUrl) _push(`<div class="absolute inset-0 bg-cover bg-center" style="${ssrRenderStyle(`background-image: url(${unref(profileHeader).bannerUrl})`)}" data-v-686e8b98></div>`);
        else _push(`<!---->`);
        _push(`<div class="absolute inset-0 backdrop-blur-[10px] bg-[#0b0f19]/40" data-v-686e8b98></div></div>`);
      } else _push(`<!---->`);
      _push(`<div class="relative flex items-center gap-4 flex-1 min-w-0 justify-center" data-v-686e8b98>`);
      if (!__props.isServerPage && !unref(isHomePage) && !(unref(isProfilePage) && unref(profileHeader))) _push(ssrRenderComponent(_component_NuxtLink, {
        key: "logo",
        to: "/",
        class: "text-lg font-extrabold tracking-tighter shrink-0 min-[681px]:hidden"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) _push2(` SYCS<span class="text-indigo-500" data-v-686e8b98${_scopeId}>.</span>`);
          else return [createTextVNode(" SYCS"), createVNode("span", { class: "text-indigo-500" }, ".")];
        }),
        _: 1
      }, _parent));
      else if (unref(isProfilePage) && unref(profileHeader)) {
        _push(`<div class="flex items-center gap-3 shrink-0 mx-auto pr-4" data-v-686e8b98>`);
        if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(profileHeader).avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(profileHeader).avatarUrl))} class="w-8 h-8 rounded-full object-cover shrink-0" data-v-686e8b98>`);
        else _push(`<div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0" data-v-686e8b98>${ssrInterpolate(((_c = unref(profileHeader).displayName) == null ? void 0 : _c.charAt(0)) || "?")}</div>`);
        _push(`<div class="min-w-0" data-v-686e8b98><p class="text-sm font-bold text-white truncate leading-tight flex items-center gap-1" data-v-686e8b98>${ssrInterpolate(unref(profileHeader).displayName)}`);
        _push(ssrRenderComponent(_component_UserBadges, { badges: unref(profileHeader).badges }, null, _parent));
        _push(`</p><p class="text-[10px] text-slate-500 leading-tight" data-v-686e8b98>@${ssrInterpolate(unref(profileHeader).username)}</p></div></div>`);
      } else _push(`<!---->`);
      if (__props.isServerPage && __props.server) {
        _push(`<div class="flex items-center gap-3 shrink-0" data-v-686e8b98><div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden" data-v-686e8b98>`);
        if (__props.server.iconUrl) _push(`<img${ssrRenderAttr("src", __props.server.iconUrl)} class="w-full h-full object-cover" data-v-686e8b98>`);
        else _push(`<!--[-->${ssrInterpolate(((_d = __props.server.name) == null ? void 0 : _d.charAt(0)) || "?")}<!--]-->`);
        _push(`</div><div class="min-w-0" data-v-686e8b98><p class="text-sm font-bold text-white truncate leading-tight" data-v-686e8b98>${ssrInterpolate(__props.server.name)}</p><p class="text-[10px] text-slate-500 leading-tight" data-v-686e8b98>\u30B5\u30FC\u30D0\u30FC</p></div></div>`);
      } else _push(`<!---->`);
      if (unref(isHomePage)) _push(ssrRenderComponent(_component_TimelineTabs, { class: "mx-auto max-w-[560px]" }, null, _parent));
      else _push(`<!---->`);
      if (!unref(isHomePage)) _push(`<div class="${ssrRenderClass([unref(isProfilePage) ? "hidden" : "", "flex items-center gap-2 ml-auto"])}" data-v-686e8b98></div>`);
      else _push(`<!---->`);
      _push(`</div></div><div class="${ssrRenderClass([__props.isServerPage ? "" : "shadow-[0px_0px_43px_50px_#0b0f19]", "hidden min-[1024px]:flex items-center gap-2 px-4 w-[280px] shrink-0 z-40"])}" data-v-686e8b98><button class="flex-1 flex items-center gap-2 bg-slate-900/70 border border-slate-800 rounded-full px-3 py-1.5 text-sm text-slate-500 hover:border-slate-600 focus-within:border-indigo-500 transition min-w-0" title="\u691C\u7D22" data-v-686e8b98>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:search",
        class: "w-3.5 h-3.5 shrink-0"
      }, null, _parent));
      _push(`<span class="truncate" data-v-686e8b98>\u691C\u7D22</span><span class="ml-auto text-[10px] text-slate-700 border border-slate-800 rounded px-1 shrink-0" data-v-686e8b98>Ctrl+K</span></button>`);
      if ((_e = unref(me)) == null ? void 0 : _e.id) {
        _push(`<button class="w-8 h-8 rounded-full overflow-hidden bg-indigo-600 ring-1 ring-slate-700/60 hover:ring-indigo-500 transition shrink-0 relative group" title="\u30A2\u30AB\u30A6\u30F3\u30C8\u5207\u308A\u66FF\u3048" data-v-686e8b98>`);
        if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(me).avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(me).avatarUrl))} class="w-full h-full object-cover" data-v-686e8b98>`);
        else _push(`<div class="w-full h-full flex items-center justify-center text-white text-xs font-bold" data-v-686e8b98>${ssrInterpolate(((_f = unref(me).displayName) == null ? void 0 : _f.charAt(0)) || "?")}</div>`);
        _push(`<span class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition" data-v-686e8b98>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:repeat-2",
          class: "w-3.5 h-3.5 text-white"
        }, null, _parent));
        _push(`</span></button>`);
      } else _push(`<!---->`);
      _push(`</div></div><button class="min-[1024px]:hidden absolute right-3 top-3 z-40 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition" title="\u691C\u7D22" data-v-686e8b98>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:search",
        class: "w-5 h-5"
      }, null, _parent));
      _push(`</button></div>`);
    };
  }
});
var _sfc_setup$19 = AppHeader_vue_vue_type_script_setup_true_lang_default.setup;
AppHeader_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppHeader.vue");
  return _sfc_setup$19 ? _sfc_setup$19(props, ctx) : void 0;
};
var AppHeader_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(AppHeader_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-686e8b98"]]), { __name: "AppHeader" });
var ServerListModal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "ServerListModal",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const servers = ref([]);
    const loading = ref(true);
    const showCreateForm = ref(false);
    const showJoinForm = ref(false);
    const createForm = ref({
      name: "",
      description: ""
    });
    const joinCode = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="fixed inset-0 z-[100] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/60"></div><div class="${ssrRenderClass([{ "!max-h-none": unref(showCreateForm) || unref(showJoinForm) }, "relative bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4"])}"><div class="flex items-center justify-between"><h2 class="text-xl font-bold text-white">\u30B5\u30FC\u30D0\u30FC\u4E00\u89A7</h2><button class="text-slate-500 hover:text-white transition">`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-5 h-5"
        }, null, _parent));
        _push2(`</button></div><div class="flex gap-2"><button class="flex-1 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition flex items-center justify-center gap-1.5">`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "lucide:log-in",
          class: "w-4 h-4"
        }, null, _parent));
        _push2(` \u53C2\u52A0 </button><button class="flex-1 py-2.5 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition flex items-center justify-center gap-1.5">`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "lucide:plus",
          class: "w-4 h-4"
        }, null, _parent));
        _push2(` \u4F5C\u6210 </button></div>`);
        if (unref(loading)) _push2(`<div class="text-center text-slate-500 py-6 text-sm">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
        else if (!unref(servers).length) _push2(`<div class="text-center text-slate-500 py-6 text-sm">\u53C2\u52A0\u3057\u3066\u3044\u308B\u30B5\u30FC\u30D0\u30FC\u306F\u3042\u308A\u307E\u305B\u3093</div>`);
        else {
          _push2(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(servers), (server) => {
            var _a;
            _push2(`<button class="w-full text-left bg-slate-800/30 border border-slate-800 rounded-xl p-3 hover:bg-slate-800/50 hover:border-slate-700 transition flex items-center gap-3"><div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">${ssrInterpolate((_a = server.name) == null ? void 0 : _a.charAt(0))}</div><div class="flex-1 min-w-0"><h3 class="font-bold text-sm text-white truncate">${ssrInterpolate(server.name)}</h3><p class="text-xs text-slate-500 truncate">${ssrInterpolate(server.description || "\u8AAC\u660E\u306A\u3057")}</p></div></button>`);
          });
          _push2(`<!--]--></div>`);
        }
        if (unref(showCreateForm)) _push2(`<div class="absolute inset-0 bg-[#151a24] rounded-2xl p-6 flex flex-col space-y-4 z-10"><h3 class="text-lg font-bold text-white">\u30B5\u30FC\u30D0\u30FC\u3092\u4F5C\u6210</h3><div class="space-y-3 flex-1"><div><label class="text-xs text-slate-500 font-medium block mb-1">\u30B5\u30FC\u30D0\u30FC\u540D</label><input${ssrRenderAttr("value", unref(createForm).name)} class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500" placeholder="\u30B5\u30FC\u30D0\u30FC\u540D"></div><div><label class="text-xs text-slate-500 font-medium block mb-1">\u8AAC\u660E (\u4EFB\u610F)</label><textarea rows="3" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 resize-none" placeholder="\u8AAC\u660E">${ssrInterpolate(unref(createForm).description)}</textarea></div></div><div class="flex justify-end gap-2"><button class="px-4 py-2 text-sm text-slate-400 hover:text-white transition">\u623B\u308B</button><button${ssrIncludeBooleanAttr(!unref(createForm).name.trim()) ? " disabled" : ""} class="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50">\u4F5C\u6210</button></div></div>`);
        else _push2(`<!---->`);
        if (unref(showJoinForm)) _push2(`<div class="absolute inset-0 bg-[#151a24] rounded-2xl p-6 flex flex-col space-y-4 z-10"><h3 class="text-lg font-bold text-white">\u62DB\u5F85\u30B3\u30FC\u30C9\u3067\u53C2\u52A0</h3><div class="flex-1"><label class="text-xs text-slate-500 font-medium block mb-1">\u62DB\u5F85\u30B3\u30FC\u30C9</label><input${ssrRenderAttr("value", unref(joinCode))} class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500" placeholder="\u30B3\u30FC\u30C9\u3092\u5165\u529B"></div><div class="flex justify-end gap-2"><button class="px-4 py-2 text-sm text-slate-400 hover:text-white transition">\u623B\u308B</button><button${ssrIncludeBooleanAttr(!unref(joinCode).trim()) ? " disabled" : ""} class="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50">\u53C2\u52A0</button></div></div>`);
        else _push2(`<!---->`);
        _push2(`</div></div>`);
      }, "body", false, _parent);
    };
  }
});
var _sfc_setup$18 = ServerListModal_vue_vue_type_script_setup_true_lang_default.setup;
ServerListModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ServerListModal.vue");
  return _sfc_setup$18 ? _sfc_setup$18(props, ctx) : void 0;
};
var ServerListModal_default = Object.assign(ServerListModal_vue_vue_type_script_setup_true_lang_default, { __name: "ServerListModal" });
var SidebarLeft_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SidebarLeft",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const showServerList = ref(false);
    const showSettings = ref(false);
    const { activityUnread, dmUnread, dmLatest } = useUnread();
    const { data: serversData } = useFetch("/api/servers", { key: "sidebar-servers" }, "$yR9YNIO4Ig");
    const servers = computed(() => {
      var _a;
      return ((_a = serversData.value) == null ? void 0 : _a.servers) || [];
    });
    const { data: userData } = useFetch("/api/auth/me", { key: "sidebar-user" }, "$Lb1UQyg44m");
    useAccounts();
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = NuxtLink;
      const _component_Icon = components_default;
      const _component_ServerListModal = ServerListModal_default;
      const _component_SettingsModal = SettingsModal_default;
      _push(`<aside${ssrRenderAttrs(mergeProps({ class: "flex flex-col border-r border-slate-800 bg-[#0b0f19] h-[calc(100vh-56px-var(--app-footer-h))] sticky top-14 px-3 py-4 overflow-y-auto" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/home",
        class: ["px-2 py-2 rounded-lg flex items-center gap-3 transition", unref(route).path === "/home" ? "bg-slate-800/50 text-white font-medium" : "text-slate-400 hover:bg-slate-800/30"]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:home",
              class: "w-5 h-5 shrink-0"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-sm truncate"${_scopeId}>\u30DB\u30FC\u30E0</span>`);
          } else return [createVNode(_component_Icon, {
            name: "lucide:home",
            class: "w-5 h-5 shrink-0"
          }), createVNode("span", { class: "text-sm truncate" }, "\u30DB\u30FC\u30E0")];
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/dm",
        class: ["relative px-2 py-2 rounded-lg flex items-center gap-3 transition text-slate-400 hover:bg-slate-800/30 hover:text-slate-100", unref(route).path.startsWith("/dm") ? "bg-slate-800/50 text-white font-medium" : ""]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b;
          if (_push2) {
            _push2(`<span class="relative shrink-0"${_scopeId}>`);
            if ((_a2 = unref(dmLatest)) == null ? void 0 : _a2.avatarUrl) _push2(`<img${ssrRenderAttr("src", unref(dmLatest).avatarUrl)} class="w-5 h-5 rounded-full object-cover"${_scopeId}>`);
            else _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:message-square",
              class: "w-5 h-5"
            }, null, _parent2, _scopeId));
            if (unref(dmUnread) > 0) _push2(`<span class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"${_scopeId}>${ssrInterpolate(unref(dmUnread))}</span>`);
            else _push2(`<!---->`);
            _push2(`</span><span class="text-sm truncate"${_scopeId}>DM</span>`);
          } else return [createVNode("span", { class: "relative shrink-0" }, [((_b = unref(dmLatest)) == null ? void 0 : _b.avatarUrl) ? (openBlock(), createBlock("img", {
            key: 0,
            src: unref(dmLatest).avatarUrl,
            class: "w-5 h-5 rounded-full object-cover"
          }, null, 8, ["src"])) : (openBlock(), createBlock(_component_Icon, {
            key: 1,
            name: "lucide:message-square",
            class: "w-5 h-5"
          })), unref(dmUnread) > 0 ? (openBlock(), createBlock("span", {
            key: 2,
            class: "absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
          }, toDisplayString(unref(dmUnread)), 1)) : createCommentVNode("", true)]), createVNode("span", { class: "text-sm truncate" }, "DM")];
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/actions",
        class: ["relative px-2 py-2 rounded-lg flex items-center gap-3 transition text-slate-400 hover:bg-slate-800/30 hover:text-slate-100", unref(route).path.startsWith("/actions") || unref(route).path.startsWith("/notifications") ? "bg-slate-800/50 text-white font-medium" : ""]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="relative shrink-0"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:bell",
              class: "w-5 h-5"
            }, null, _parent2, _scopeId));
            if (unref(activityUnread) > 0) _push2(`<span class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"${_scopeId}>${ssrInterpolate(unref(activityUnread))}</span>`);
            else _push2(`<!---->`);
            _push2(`</span><span class="text-sm truncate"${_scopeId}>\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3</span>`);
          } else return [createVNode("span", { class: "relative shrink-0" }, [createVNode(_component_Icon, {
            name: "lucide:bell",
            class: "w-5 h-5"
          }), unref(activityUnread) > 0 ? (openBlock(), createBlock("span", {
            key: 0,
            class: "absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
          }, toDisplayString(unref(activityUnread)), 1)) : createCommentVNode("", true)]), createVNode("span", { class: "text-sm truncate" }, "\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3")];
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/search",
        class: ["px-2 py-2 rounded-lg flex items-center gap-3 transition text-slate-400 hover:bg-slate-800/30 hover:text-slate-100", unref(route).path === "/search" ? "bg-slate-800/50 text-white font-medium" : ""]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:search",
              class: "w-5 h-5 shrink-0"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-sm truncate"${_scopeId}>\u691C\u7D22</span>`);
          } else return [createVNode(_component_Icon, {
            name: "lucide:search",
            class: "w-5 h-5 shrink-0"
          }), createVNode("span", { class: "text-sm truncate" }, "\u691C\u7D22")];
        }),
        _: 1
      }, _parent));
      if (unref(servers).length) {
        _push(`<div class="mt-6"><div class="px-2 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">\u30B5\u30FC\u30D0\u30FC</div><div class="space-y-0.5"><!--[-->`);
        ssrRenderList(unref(servers), (s) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: s.id,
            to: `/servers/${s.id}`,
            class: ["w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition text-sm", unref(route).path === `/servers/${s.id}` ? "bg-slate-800/50 text-white" : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"${_scopeId}>`);
                if (s.iconUrl) _push2(`<img${ssrRenderAttr("src", s.iconUrl)} class="w-full h-full object-cover"${_scopeId}>`);
                else _push2(`<!--[-->${ssrInterpolate(s.name.charAt(0))}<!--]-->`);
                _push2(`</div><span class="truncate"${_scopeId}>${ssrInterpolate(s.name)}</span>`);
              } else return [createVNode("div", { class: "w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden" }, [s.iconUrl ? (openBlock(), createBlock("img", {
                key: 0,
                src: s.iconUrl,
                class: "w-full h-full object-cover"
              }, null, 8, ["src"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(s.name.charAt(0)), 1)], 64))]), createVNode("span", { class: "truncate" }, toDisplayString(s.name), 1)];
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else _push(`<!---->`);
      _push(`<button class="mt-4 w-full px-2 py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 rounded-lg flex items-center gap-3 text-sm transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:plus",
        class: "w-4 h-4"
      }, null, _parent));
      _push(` \u30B5\u30FC\u30D0\u30FC\u3092\u63A2\u3059 </button>`);
      if (unref(showServerList)) _push(ssrRenderComponent(_component_ServerListModal, { onClose: ($event) => showServerList.value = false }, null, _parent));
      else _push(`<!---->`);
      if ((_a = unref(userData)) == null ? void 0 : _a.user) {
        _push(`<div class="group relative pt-4 border-t border-slate-800 mt-auto"><div class="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 z-50"><button class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:user-round-cog",
          class: "w-4 h-4 shrink-0"
        }, null, _parent));
        _push(` \u30A2\u30AB\u30A6\u30F3\u30C8\u5207\u308A\u66FF\u3048 </button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/signin",
          class: "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:user-plus",
                class: "w-4 h-4 shrink-0"
              }, null, _parent2, _scopeId));
              _push2(` \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u8FFD\u52A0 `);
            } else return [createVNode(_component_Icon, {
              name: "lucide:user-plus",
              class: "w-4 h-4 shrink-0"
            }), createTextVNode(" \u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u8FFD\u52A0 ")];
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="flex items-center gap-1 px-2 h-11 rounded-lg group-hover:bg-slate-800/30 transition">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/profile/@${unref(userData).user.username}`,
          class: "flex items-center gap-2 flex-1 min-w-0"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b;
            if (_push2) {
              _push2(`<div class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"${_scopeId}>`);
              if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(userData).user.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(userData).user.avatarUrl))} class="w-full h-full object-cover"${_scopeId}>`);
              else _push2(`<!--[-->${ssrInterpolate(((_a2 = unref(userData).user.displayName) == null ? void 0 : _a2.charAt(0)) || "?")}<!--]-->`);
              _push2(`</div><span class="text-sm text-slate-400 group-hover:text-white truncate"${_scopeId}>@${ssrInterpolate(unref(userData).user.username)}</span>`);
            } else return [createVNode("div", { class: "w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden" }, [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(userData).user.avatarUrl) ? (openBlock(), createBlock("img", {
              key: 0,
              src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(userData).user.avatarUrl),
              class: "w-full h-full object-cover"
            }, null, 8, ["src"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(((_b = unref(userData).user.displayName) == null ? void 0 : _b.charAt(0)) || "?"), 1)], 64))]), createVNode("span", { class: "text-sm text-slate-400 group-hover:text-white truncate" }, "@" + toDisplayString(unref(userData).user.username), 1)];
          }),
          _: 1
        }, _parent));
        _push(`<div class="hidden group-hover:flex items-center gap-0.5"><button class="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/50 transition" title="\u8A2D\u5B9A">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:settings",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button><button class="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800/50 transition" title="\u30B5\u30A4\u30F3\u30A2\u30A6\u30C8">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:log-out",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button></div></div></div>`);
      } else _push(`<!---->`);
      if (unref(showSettings)) _push(ssrRenderComponent(_component_SettingsModal, { onClose: ($event) => showSettings.value = false }, null, _parent));
      else _push(`<!---->`);
      _push(`</aside>`);
    };
  }
});
var _sfc_setup$17 = SidebarLeft_vue_vue_type_script_setup_true_lang_default.setup;
SidebarLeft_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SidebarLeft.vue");
  return _sfc_setup$17 ? _sfc_setup$17(props, ctx) : void 0;
};
var SidebarLeft_default = Object.assign(SidebarLeft_vue_vue_type_script_setup_true_lang_default, { __name: "SidebarLeft" });
var MAX_FILES = 8;
var PostComments_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "PostComments",
  __ssrInlineRender: true,
  props: { post: {} },
  emits: ["update"],
  setup(__props, { emit: __emit }) {
    const { map: customEmojiMap } = useCustomEmojis();
    const props = __props;
    const emit = __emit;
    const me = useState("comments-me", () => null);
    const comments = ref([]);
    const loading = ref(true);
    const draft = ref("");
    const submitting = ref(false);
    const error = ref("");
    ref(false);
    ref(null);
    const dragging = ref(false);
    const pendingFiles = ref([]);
    function fileIcon(mime) {
      if (mime.startsWith("image/")) return "lucide:image";
      if (mime.startsWith("video/")) return "lucide:video";
      if (mime.startsWith("audio/")) return "lucide:music";
      return "lucide:file";
    }
    const commentOffset = ref(0);
    const commentHasMore = ref(true);
    const { loading: loadingMoreComments, reset: resetCommentScroll } = useInfiniteScroll(async () => {
      return await loadComments(false);
    });
    function sortComments() {
      comments.value = [...comments.value].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    async function loadComments(reset = true) {
      var _a, _b;
      if (reset) {
        commentOffset.value = 0;
        commentHasMore.value = true;
        resetCommentScroll();
        loading.value = true;
      } else if (!commentHasMore.value) return { hasMore: false };
      try {
        const data = await $fetch$1(`/api/posts/${props.post.id}/comments`, { params: {
          limit: 10,
          offset: commentOffset.value
        } });
        const incoming = data.comments || [];
        commentOffset.value = (_a = data.nextOffset) != null ? _a : commentOffset.value + incoming.length;
        commentHasMore.value = (_b = data.hasMore) != null ? _b : incoming.length === 10;
        if (reset) comments.value = incoming;
        else {
          const seen = new Set(comments.value.map((c) => c.id));
          comments.value = [...comments.value, ...incoming.filter((c) => !seen.has(c.id))];
          sortComments();
        }
        return { hasMore: commentHasMore.value };
      } catch {
        if (reset) comments.value = [];
        return { hasMore: false };
      } finally {
        if (reset) loading.value = false;
      }
    }
    watch(() => props.post.id, () => {
      comments.value = [];
      loadComments(true);
    });
    function applyReactionDelta(emoji, userId, active, isMe) {
      var _a;
      const reactions = [...props.post.reactions || []];
      let group = reactions.find((r) => r.emoji === emoji);
      if (active) {
        if (!group) {
          group = {
            emoji,
            count: 0,
            mine: false,
            users: []
          };
          reactions.push(group);
        }
        if (!((_a = group.users) == null ? void 0 : _a.some((u) => u.id === userId))) {
          group.count += 1;
          group.users = [...group.users || [], { id: userId }];
        }
        group.mine = true;
      } else if (group) {
        group.count = Math.max(0, group.count - 1);
        group.users = (group.users || []).filter((u) => u.id !== userId);
        group.mine = false;
        if (group.count === 0) {
          const idx = reactions.indexOf(group);
          if (idx >= 0) reactions.splice(idx, 1);
        }
      }
      emit("update", props.post.id, { reactions: [...reactions] });
    }
    async function toggleReaction(emoji) {
      var _a;
      try {
        const res = await $fetch$1(`/api/posts/${props.post.id}/reactions`, {
          method: "POST",
          body: { emoji }
        });
        const uid = (_a = me.value) == null ? void 0 : _a.id;
        if (uid) applyReactionDelta(emoji, uid, res.active, true);
      } catch {
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
    return (_ctx, _push, _parent, _attrs) => {
      const _component_EmojiIcon = EmojiIcon_default;
      const _component_ReactionPicker = ReactionPicker_default;
      const _component_NuxtLink = NuxtLink;
      const _component_UserBadges = UserBadges_default;
      const _component_UserTitle = UserTitle_default;
      const _component_PostAttachments = PostAttachments_default;
      const _component_Icon = components_default;
      const _component_EmojiTextarea = EmojiTextarea_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col h-full min-h-0" }, _attrs))}><div class="px-4 pt-3 pb-2 flex flex-wrap items-center gap-1.5 shrink-0 border-b border-slate-800/60"><!--[-->`);
      ssrRenderList(__props.post.reactions || [], (r) => {
        _push(`<button class="${ssrRenderClass([r.mine ? "bg-indigo-600/25 border-indigo-500/50 text-indigo-200" : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500", "flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition"])}"${ssrRenderAttr("title", (r.users || []).map((u) => u.displayName || "").join(", "))}>`);
        _push(ssrRenderComponent(_component_EmojiIcon, {
          emoji: r.emoji,
          size: "sm"
        }, null, _parent));
        _push(`<span class="text-xs">${ssrInterpolate(r.count)}</span></button>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_ReactionPicker, { onSelect: toggleReaction }, null, _parent));
      _push(`</div><div class="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">`);
      if (unref(loading)) _push(`<div class="text-center text-slate-500 text-sm py-6">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
      else {
        _push(`<!--[--><!--[-->`);
        ssrRenderList(unref(comments), (c) => {
          var _a, _b, _c, _d, _e, _f;
          _push(`<div class="flex gap-2.5">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/profile/@${((_a = c.user) == null ? void 0 : _a.username) || c.userId}`,
            class: "shrink-0"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b2, _c2, _d2, _e2, _f2;
              if (_push2) if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = c.user) == null ? void 0 : _a2.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(c.user.avatarUrl))} class="w-7 h-7 rounded-full object-cover"${_scopeId}>`);
              else _push2(`<div class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold"${_scopeId}>${ssrInterpolate(((_c2 = (_b2 = c.user) == null ? void 0 : _b2.displayName) == null ? void 0 : _c2.charAt(0)) || "?")}</div>`);
              else return [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_d2 = c.user) == null ? void 0 : _d2.avatarUrl) ? (openBlock(), createBlock("img", {
                key: 0,
                src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(c.user.avatarUrl),
                class: "w-7 h-7 rounded-full object-cover"
              }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold"
              }, toDisplayString(((_f2 = (_e2 = c.user) == null ? void 0 : _e2.displayName) == null ? void 0 : _f2.charAt(0)) || "?"), 1))];
            }),
            _: 2
          }, _parent));
          _push(`<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="text-sm font-bold text-white truncate">${ssrInterpolate(((_b = c.user) == null ? void 0 : _b.displayName) || "\u4E0D\u660E")}</span>`);
          _push(ssrRenderComponent(_component_UserBadges, { badges: (_c = c.user) == null ? void 0 : _c.badges }, null, _parent));
          _push(ssrRenderComponent(_component_UserTitle, { title: (_d = c.user) == null ? void 0 : _d.title }, null, _parent));
          _push(`<span class="text-[11px] text-slate-600 shrink-0">${ssrInterpolate(timeAgo(c.createdAt))}</span></div>`);
          if (c.content) _push(`<p class="text-sm text-slate-300 whitespace-pre-wrap break-words">${(_e = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(c.content, { custom: unref(customEmojiMap) })) != null ? _e : ""}</p>`);
          else _push(`<!---->`);
          if ((_f = c.attachments) == null ? void 0 : _f.length) _push(ssrRenderComponent(_component_PostAttachments, {
            attachments: c.attachments,
            class: "max-w-md"
          }, null, _parent));
          else _push(`<!---->`);
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(comments).length) _push(`<p class="text-center text-slate-500 text-sm py-8">\u307E\u3060\u30B3\u30E1\u30F3\u30C8\u306F\u3042\u308A\u307E\u305B\u3093</p>`);
        else _push(`<!---->`);
        _push(`<div class="h-1" aria-hidden="true"></div>`);
        if (unref(loadingMoreComments)) _push(`<div class="text-center text-slate-500 text-xs py-2">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
        else if (unref(comments).length && !unref(commentHasMore)) _push(`<p class="text-center text-slate-600 text-[11px] py-2">\u3059\u3079\u3066\u8868\u793A\u3057\u307E\u3057\u305F</p>`);
        else _push(`<!---->`);
        _push(`<!--]-->`);
      }
      _push(`</div><div class="border-t border-slate-800 p-3 shrink-0"><div class="${ssrRenderClass([unref(dragging) ? "border-indigo-500 bg-indigo-600/10" : "border-slate-700 focus-within:border-indigo-500", "bg-slate-900 border rounded-xl px-3 py-2 transition"])}">`);
      if (unref(pendingFiles).length) {
        _push(`<div class="flex flex-wrap gap-2 mb-2"><!--[-->`);
        ssrRenderList(unref(pendingFiles), (f, i) => {
          _push(`<div class="relative group w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">`);
          if (f.type === "image") _push(`<img${ssrRenderAttr("src", f.preview)} class="w-full h-full object-cover">`);
          else {
            _push(`<div class="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400 px-1">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: fileIcon(f.mime),
              class: "w-5 h-5"
            }, null, _parent));
            _push(`<span class="text-[9px] truncate w-full text-center">${ssrInterpolate(f.file.name)}</span></div>`);
          }
          _push(`<button class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:x",
            class: "w-3 h-3"
          }, null, _parent));
          _push(`</button></div>`);
        });
        _push(`<!--]--></div>`);
      } else _push(`<!---->`);
      _push(ssrRenderComponent(_component_EmojiTextarea, {
        modelValue: unref(draft),
        "onUpdate:modelValue": ($event) => isRef(draft) ? draft.value = $event : null,
        class: "w-full",
        rows: 1,
        "submit-on-enter": "",
        placeholder: "\u30B3\u30E1\u30F3\u30C8\u3092\u8FFD\u52A0...",
        "textarea-class": "w-full bg-transparent border-none focus:ring-0 text-sm text-white placeholder-slate-500 resize-none py-0.5 max-h-28"
      }, null, _parent));
      _push(`<div class="flex items-center gap-1 mt-1"><button${ssrIncludeBooleanAttr(unref(pendingFiles).length >= MAX_FILES || unref(submitting)) ? " disabled" : ""} class="p-1.5 rounded-full text-slate-500 hover:text-indigo-400 hover:bg-slate-800/50 transition disabled:opacity-30"${ssrRenderAttr("title", `\u30D5\u30A1\u30A4\u30EB\u6DFB\u4ED8 (${unref(pendingFiles).length}/${MAX_FILES})`)}>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:paperclip",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button>`);
      if (unref(pendingFiles).length) _push(`<span class="text-[10px] text-slate-600">${ssrInterpolate(unref(pendingFiles).length)}/${ssrInterpolate(MAX_FILES)}</span>`);
      else _push(`<!---->`);
      _push(`<span class="flex-1"></span><button${ssrIncludeBooleanAttr(!unref(draft).trim() && !unref(pendingFiles).length || unref(submitting)) ? " disabled" : ""} class="p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-40 transition shrink-0" title="\u9001\u4FE1">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: unref(submitting) ? "lucide:loader-2" : "lucide:send",
        class: ["w-4 h-4", { "animate-spin": unref(submitting) }]
      }, null, _parent));
      _push(`</button></div></div><input type="file" multiple class="hidden">`);
      if (unref(error)) _push(`<p class="text-xs text-red-400 mt-1">${ssrInterpolate(unref(error))}</p>`);
      else _push(`<!---->`);
      _push(`</div></div>`);
    };
  }
});
var _sfc_setup$16 = PostComments_vue_vue_type_script_setup_true_lang_default.setup;
PostComments_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PostComments.vue");
  return _sfc_setup$16 ? _sfc_setup$16(props, ctx) : void 0;
};
var PostComments_default = Object.assign(PostComments_vue_vue_type_script_setup_true_lang_default, { __name: "PostComments" });
var VideoPlayer_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "VideoPlayer",
  __ssrInlineRender: true,
  props: {
    src: {},
    poster: {},
    autoplay: { type: Boolean }
  },
  setup(__props) {
    ref(null);
    const playing = ref(false);
    const muted = ref(false);
    const current = ref(0);
    const duration = ref(0);
    const volume = ref(1);
    const rate = ref(1);
    const showControls = ref(true);
    const container = ref(null);
    function fmt(t) {
      if (!isFinite(t)) return "0:00";
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    }
    const progress = computed(() => duration.value ? current.value / duration.value * 100 : 0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "container",
        ref: container,
        class: "relative group/video rounded-xl overflow-hidden bg-black select-none"
      }, _attrs))}><video${ssrRenderAttr("src", __props.src)}${ssrRenderAttr("poster", __props.poster)}${ssrIncludeBooleanAttr(__props.autoplay !== false) ? " autoplay" : ""} playsinline class="w-full max-h-[60vh] bg-black cursor-pointer"></video>`);
      if (!unref(playing)) {
        _push(`<button class="absolute inset-0 flex items-center justify-center bg-black/20 transition"><span class="w-16 h-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:play",
          class: "w-7 h-7 text-white ml-1"
        }, null, _parent));
        _push(`</span></button>`);
      } else _push(`<!---->`);
      _push(`<div class="${ssrRenderClass([unref(showControls) || !unref(playing) ? "opacity-100" : "opacity-0 pointer-events-none", "absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 to-transparent transition-opacity duration-200"])}"><input type="range" min="0"${ssrRenderAttr("max", unref(duration) || 0)} step="0.1"${ssrRenderAttr("value", unref(current))} class="w-full accent-indigo-500 h-1 cursor-pointer" style="${ssrRenderStyle({ backgroundSize: unref(progress) + "% 100%" })}"><div class="flex items-center gap-2 mt-1.5"><button class="p-1 rounded-md text-white hover:bg-white/15 transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: unref(playing) ? "lucide:pause" : "lucide:play",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><span class="text-[11px] text-white/80 tabular-nums">${ssrInterpolate(fmt(unref(current)))} / ${ssrInterpolate(fmt(unref(duration)))}</span><div class="flex-1"></div><button class="px-1.5 py-0.5 rounded-md text-[11px] font-bold text-white/80 hover:bg-white/15 transition tabular-nums">${ssrInterpolate(unref(rate))}x </button><div class="flex items-center gap-1 group/vol"><button class="p-1 rounded-md text-white hover:bg-white/15 transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: unref(muted) || unref(volume) === 0 ? "lucide:volume-x" : unref(volume) < 0.5 ? "lucide:volume-1" : "lucide:volume-2",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><input type="range" min="0" max="1" step="0.05"${ssrRenderAttr("value", unref(muted) ? 0 : unref(volume))} class="w-0 group-hover/vol:w-16 transition-all accent-indigo-500 h-1 cursor-pointer"></div><button class="p-1 rounded-md text-white hover:bg-white/15 transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:maximize",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button></div></div></div>`);
    };
  }
});
var _sfc_setup$15 = VideoPlayer_vue_vue_type_script_setup_true_lang_default.setup;
VideoPlayer_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/media/VideoPlayer.vue");
  return _sfc_setup$15 ? _sfc_setup$15(props, ctx) : void 0;
};
var VideoPlayer_default = Object.assign(VideoPlayer_vue_vue_type_script_setup_true_lang_default, { __name: "MediaVideoPlayer" });
var MusicPlayer_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "MusicPlayer",
  __ssrInlineRender: true,
  props: {
    src: {},
    title: {},
    artist: {},
    cover: {},
    autoplay: { type: Boolean }
  },
  setup(__props) {
    ref(null);
    const playing = ref(false);
    const current = ref(0);
    const duration = ref(0);
    const volume = ref(1);
    const loop = ref(false);
    function fmt(t) {
      if (!isFinite(t)) return "0:00";
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    }
    const progress = computed(() => duration.value ? current.value / duration.value * 100 : 0);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "rounded-2xl bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 p-4 border border-indigo-500/20" }, _attrs))} data-v-b7b72766><audio${ssrRenderAttr("src", __props.src)}${ssrIncludeBooleanAttr(__props.autoplay !== false) ? " autoplay" : ""} data-v-b7b72766></audio><div class="flex items-center gap-4" data-v-b7b72766><div class="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-lg" data-v-b7b72766>`);
      if (__props.cover) _push(`<img${ssrRenderAttr("src", __props.cover)} class="w-full h-full object-cover" data-v-b7b72766>`);
      else _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:music",
        class: ["w-8 h-8 text-white/90", unref(playing) ? "animate-pulse" : ""]
      }, null, _parent));
      if (unref(playing)) _push(`<div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/70 border border-white/20 flex items-end justify-center gap-0.5 pb-1" data-v-b7b72766><span class="w-0.5 bg-indigo-400 animate-[eq_0.9s_ease-in-out_infinite] h-3" data-v-b7b72766></span><span class="w-0.5 bg-indigo-400 animate-[eq_1.1s_ease-in-out_infinite] h-2" data-v-b7b72766></span><span class="w-0.5 bg-indigo-400 animate-[eq_0.8s_ease-in-out_infinite] h-3.5" data-v-b7b72766></span></div>`);
      else _push(`<!---->`);
      _push(`</div><div class="min-w-0 flex-1" data-v-b7b72766><p class="text-sm font-bold text-white truncate" data-v-b7b72766>${ssrInterpolate(__props.title || "\u30AA\u30FC\u30C7\u30A3\u30AA")}</p><p class="text-[11px] text-slate-400 truncate" data-v-b7b72766>${ssrInterpolate(__props.artist || "")}</p><div class="flex items-center gap-2 mt-2" data-v-b7b72766><span class="text-[10px] text-slate-400 tabular-nums w-8 text-right" data-v-b7b72766>${ssrInterpolate(fmt(unref(current)))}</span><input type="range" min="0"${ssrRenderAttr("max", unref(duration) || 0)} step="0.1"${ssrRenderAttr("value", unref(current))} class="flex-1 accent-indigo-500 h-1 cursor-pointer" style="${ssrRenderStyle({ backgroundSize: unref(progress) + "% 100%" })}" data-v-b7b72766><span class="text-[10px] text-slate-400 tabular-nums w-8" data-v-b7b72766>${ssrInterpolate(fmt(unref(duration)))}</span></div></div></div><div class="flex items-center justify-center gap-3 mt-3" data-v-b7b72766><button class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition" title="10\u79D2\u623B\u3059" data-v-b7b72766>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:rotate-ccw",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><button class="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition shadow-lg shadow-indigo-900/40" data-v-b7b72766>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: unref(playing) ? "lucide:pause" : "lucide:play",
        class: ["w-5 h-5", !unref(playing) ? "ml-0.5" : ""]
      }, null, _parent));
      _push(`</button><button class="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition" title="10\u79D2\u9032\u3081\u308B" data-v-b7b72766>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:rotate-cw",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><div class="flex items-center gap-1 ml-2" data-v-b7b72766><button class="${ssrRenderClass([unref(loop) ? "text-indigo-400 bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/10", "p-1.5 rounded-lg transition"])}" title="\u30EA\u30D4\u30FC\u30C8" data-v-b7b72766>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:repeat",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:volume-2",
        class: "w-4 h-4 text-slate-300"
      }, null, _parent));
      _push(`<input type="range" min="0" max="1" step="0.05"${ssrRenderAttr("value", unref(volume))} class="w-16 accent-indigo-500 h-1 cursor-pointer" data-v-b7b72766></div></div></div>`);
    };
  }
});
var _sfc_setup$14 = MusicPlayer_vue_vue_type_script_setup_true_lang_default.setup;
MusicPlayer_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/media/MusicPlayer.vue");
  return _sfc_setup$14 ? _sfc_setup$14(props, ctx) : void 0;
};
var MusicPlayer_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(MusicPlayer_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-b7b72766"]]), { __name: "MediaMusicPlayer" });
var ImageGallery_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "ImageGallery",
  __ssrInlineRender: true,
  props: {
    images: {},
    index: {}
  },
  emits: ["update:index"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const zoom = ref(1);
    const pan = ref({
      x: 0,
      y: 0
    });
    const dragging = ref(false);
    ref(null);
    const current = computed(() => props.images[props.index] || null);
    function reset() {
      zoom.value = 1;
      pan.value = {
        x: 0,
        y: 0
      };
    }
    watch(() => props.index, reset);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "rounded-xl overflow-hidden bg-black/40 relative" }, _attrs))}><div class="relative flex items-center justify-center min-h-[200px]"><img${ssrRenderAttr("src", (_a = unref(current)) == null ? void 0 : _a.url)} class="${ssrRenderClass([unref(zoom) > 1 ? unref(dragging) ? "cursor-grabbing" : "cursor-grab" : "", "w-full max-h-[55vh] object-contain select-none"])}" style="${ssrRenderStyle({ transform: `translate(${unref(pan).x}px, ${unref(pan).y}px) scale(${unref(zoom)})` })}" draggable="false">`);
      if (__props.images.length > 1) {
        _push(`<button class="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:chevron-left",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      if (__props.images.length > 1) {
        _push(`<button class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:chevron-right",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      _push(`</div><div class="absolute top-2 right-2 flex items-center gap-1 bg-black/60 rounded-full px-1.5 py-1"><button class="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition" title="\u7E2E\u5C0F">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:zoom-out",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><span class="text-[10px] text-white/70 w-9 text-center tabular-nums">${ssrInterpolate(Math.round(unref(zoom) * 100))}%</span><button class="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition" title="\u62E1\u5927">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:zoom-in",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><button class="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition" title="\u30EA\u30BB\u30C3\u30C8">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:rotate-ccw",
        class: "w-3.5 h-3.5"
      }, null, _parent));
      _push(`</button><button class="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition" title="\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:download",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button></div>`);
      if (__props.images.length > 1) _push(`<div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white/80 tabular-nums">${ssrInterpolate(__props.index + 1)} / ${ssrInterpolate(__props.images.length)}</div>`);
      else _push(`<!---->`);
      if (__props.images.length > 1) {
        _push(`<div class="flex gap-1.5 p-2 overflow-x-auto"><!--[-->`);
        ssrRenderList(__props.images, (img, i) => {
          _push(`<button class="${ssrRenderClass([i === __props.index ? "border-indigo-500" : "border-transparent opacity-60 hover:opacity-100", "w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition"])}"><img${ssrRenderAttr("src", img.url)} class="w-full h-full object-cover"></button>`);
        });
        _push(`<!--]--></div>`);
      } else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup$13 = ImageGallery_vue_vue_type_script_setup_true_lang_default.setup;
ImageGallery_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/media/ImageGallery.vue");
  return _sfc_setup$13 ? _sfc_setup$13(props, ctx) : void 0;
};
var ImageGallery_default = Object.assign(ImageGallery_vue_vue_type_script_setup_true_lang_default, { __name: "MediaImageGallery" });
var MediaDetailPane_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "MediaDetailPane",
  __ssrInlineRender: true,
  setup(__props) {
    const { map: customEmojiMap } = useCustomEmojis();
    const MODEL_EXT = /\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i;
    const pane = useMediaPane();
    const { selected, sourceLabel, width } = pane;
    const mediaIndex = ref(0);
    watch(() => {
      var _a;
      return [(_a = selected.value) == null ? void 0 : _a.id, pane.kind.value];
    }, () => {
      mediaIndex.value = 0;
    });
    const attachments = computed(() => {
      var _a;
      return ((_a = selected.value) == null ? void 0 : _a.attachments) || [];
    });
    const kind = computed(() => pane.kind.value);
    const images = computed(() => attachments.value.filter((a) => String(a.mime || "").startsWith("image/")));
    const videos = computed(() => attachments.value.filter((a) => String(a.mime || "").startsWith("video/")));
    const audios = computed(() => attachments.value.filter((a) => String(a.mime || "").startsWith("audio/")));
    const models = computed(() => attachments.value.filter((a) => String(a.mime || "").toLowerCase().startsWith("model/") || MODEL_EXT.test(String(a.url || ""))));
    const files = computed(() => attachments.value.filter((a) => {
      const mime = String(a.mime || "");
      return !mime.startsWith("image/") && !mime.startsWith("video/") && !mime.startsWith("audio/") && !String(a.mime || "").toLowerCase().startsWith("model/") && !MODEL_EXT.test(String(a.url || ""));
    }));
    const mediaList = computed(() => {
      if (kind.value === "video") return videos.value;
      if (kind.value === "audio") return audios.value;
      if (kind.value === "model") return models.value;
      return [];
    });
    const currentMedia = computed(() => mediaList.value[Math.min(mediaIndex.value, mediaList.value.length - 1)] || null);
    const currentAttachment = computed(() => {
      if (kind.value === "image") return images.value[Math.min(mediaIndex.value, images.value.length - 1)] || null;
      if (kind.value === "file") return files.value[Math.min(mediaIndex.value, files.value.length - 1)] || null;
      return currentMedia.value;
    });
    const download = computed(() => {
      var _a, _b, _c;
      return {
        href: ((_a = currentAttachment.value) == null ? void 0 : _a.originalUrl) || ((_b = currentAttachment.value) == null ? void 0 : _b.url) || null,
        name: ((_c = currentAttachment.value) == null ? void 0 : _c.originalName) || void 0
      };
    });
    const kindLabel = computed(() => {
      if (kind.value === "video") return "\u52D5\u753B";
      if (kind.value === "image") return "\u753B\u50CF";
      if (kind.value === "audio") return "\u97F3\u697D";
      if (kind.value === "model") return "3D\u30E2\u30C7\u30EB";
      if (kind.value === "file") return "\u30D5\u30A1\u30A4\u30EB";
      return "\u30B9\u30EC\u30C3\u30C9";
    });
    const kindIcon = computed(() => {
      if (kind.value === "video") return "lucide:video";
      if (kind.value === "image") return "lucide:image";
      if (kind.value === "audio") return "lucide:music";
      if (kind.value === "model") return "lucide:box";
      if (kind.value === "file") return "lucide:file";
      return "lucide:message-square";
    });
    function onPatch(postId, patch) {
      var _a;
      if (((_a = selected.value) == null ? void 0 : _a.id) !== postId) return;
      pane.updatePost({
        ...selected.value,
        ...patch
      });
    }
    const resizing = ref(false);
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
      var _a, _b, _c, _d, _e, _f;
      const _component_Icon = components_default;
      const _component_NuxtLink = NuxtLink;
      const _component_UserBadges = UserBadges_default;
      const _component_PostComments = PostComments_default;
      _push(`<aside${ssrRenderAttrs(mergeProps({
        class: ["hidden min-[1024px]:flex flex-col shrink-0 bg-[#0d1220] h-[calc(100vh-56px-var(--app-footer-h))] sticky top-14 relative overflow-hidden", unref(selected) ? "border-l border-slate-800" : "border-l-0"],
        style: {
          width: (unref(selected) ? unref(width) : 0) + "px",
          transition: unref(resizing) ? "none" : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        },
        "aria-hidden": !unref(selected)
      }, _attrs))} data-v-023c4034><div class="${ssrRenderClass([unref(selected) ? "" : "pointer-events-none", "absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-20 group"])}" data-v-023c4034><div class="${ssrRenderClass([unref(resizing) ? "bg-indigo-500" : "group-hover:bg-indigo-500/50", "w-full h-full transition"])}" data-v-023c4034></div></div>`);
      if (unref(selected)) {
        _push(`<div class="h-full flex flex-col shrink-0" style="${ssrRenderStyle({ width: unref(width) + "px" })}" data-v-023c4034><div class="h-12 px-4 flex items-center gap-2 border-b border-slate-800 shrink-0" data-v-023c4034><button class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 text-xs" title="\u623B\u308B" data-v-023c4034>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:chevron-left",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`<span class="hidden min-[1300px]:inline" data-v-023c4034>\u623B\u308B</span></button>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: unref(kindIcon),
          class: "w-4 h-4 text-indigo-400 shrink-0 ml-1"
        }, null, _parent));
        _push(`<span class="text-xs font-bold text-slate-400 uppercase tracking-wider" data-v-023c4034>${ssrInterpolate(unref(kindLabel))}</span>`);
        if (unref(sourceLabel)) _push(`<span class="text-[11px] text-slate-600 truncate" data-v-023c4034>\xB7 ${ssrInterpolate(unref(sourceLabel))}</span>`);
        else _push(`<!---->`);
        if (unref(download).href) {
          _push(`<a${ssrRenderAttr("href", unref(download).href)}${ssrRenderAttr("download", unref(download).name)} class="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" title="\u5143\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9" data-v-023c4034>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:download",
            class: "w-4 h-4"
          }, null, _parent));
          _push(`</a>`);
        } else _push(`<!---->`);
        _push(`<button class="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition" title="\u9589\u3058\u308B" data-v-023c4034>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button></div><div class="flex-1 overflow-y-auto min-h-0" data-v-023c4034><div class="px-4 py-3 flex items-center gap-3" data-v-023c4034>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/profile/@${(_a = unref(selected).user) == null ? void 0 : _a.username}`,
          class: "shrink-0"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d2, _e2, _f2;
            if (_push2) if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = unref(selected).user) == null ? void 0 : _a2.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(selected).user.avatarUrl))} class="w-9 h-9 rounded-full object-cover" data-v-023c4034${_scopeId}>`);
            else _push2(`<div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm" data-v-023c4034${_scopeId}>${ssrInterpolate(((_c2 = (_b2 = unref(selected).user) == null ? void 0 : _b2.displayName) == null ? void 0 : _c2.charAt(0)) || "?")}</div>`);
            else return [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_d2 = unref(selected).user) == null ? void 0 : _d2.avatarUrl) ? (openBlock(), createBlock("img", {
              key: 0,
              src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(selected).user.avatarUrl),
              class: "w-9 h-9 rounded-full object-cover"
            }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
              key: 1,
              class: "w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm"
            }, toDisplayString(((_f2 = (_e2 = unref(selected).user) == null ? void 0 : _e2.displayName) == null ? void 0 : _f2.charAt(0)) || "?"), 1))];
          }),
          _: 1
        }, _parent));
        _push(`<div class="min-w-0" data-v-023c4034><p class="text-sm font-bold text-white truncate flex items-center gap-1" data-v-023c4034>${ssrInterpolate(((_b = unref(selected).user) == null ? void 0 : _b.displayName) || "\u4E0D\u660E")}`);
        _push(ssrRenderComponent(_component_UserBadges, { badges: (_c = unref(selected).user) == null ? void 0 : _c.badges }, null, _parent));
        _push(`</p><p class="text-[11px] text-slate-500 truncate" data-v-023c4034>@${ssrInterpolate((_d = unref(selected).user) == null ? void 0 : _d.username)} \xB7 ${ssrInterpolate(timeAgo(unref(selected).createdAt))}</p></div></div><div class="px-4" data-v-023c4034>`);
        if (unref(kind) === "video" && unref(currentMedia)) {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(VideoPlayer_default, {
            key: unref(currentMedia).id,
            src: unref(currentMedia).url
          }, null, _parent));
          if (unref(videos).length > 1) {
            _push(`<div class="flex gap-1.5 mt-2 overflow-x-auto pb-1" data-v-023c4034><!--[-->`);
            ssrRenderList(unref(videos), (v, i) => {
              _push(`<button class="${ssrRenderClass([i === unref(mediaIndex) ? "border-indigo-500" : "border-transparent opacity-60 hover:opacity-100", "h-12 w-16 rounded-lg shrink-0 border-2 flex items-center justify-center bg-black/50 transition"])}" data-v-023c4034>`);
              _push(ssrRenderComponent(_component_Icon, {
                name: "lucide:play",
                class: "w-4 h-4 text-white/80"
              }, null, _parent));
              _push(`</button>`);
            });
            _push(`<!--]--></div>`);
          } else _push(`<!---->`);
          _push(`<!--]-->`);
        } else if (unref(kind) === "image") _push(ssrRenderComponent(ImageGallery_default, {
          images: unref(images),
          index: unref(mediaIndex),
          "onUpdate:index": ($event) => mediaIndex.value = $event
        }, null, _parent));
        else if (unref(kind) === "audio" && unref(currentMedia)) {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(MusicPlayer_default, {
            key: unref(currentMedia).id,
            src: unref(currentMedia).url,
            title: `\u30AA\u30FC\u30C7\u30A3\u30AA ${unref(mediaIndex) + 1} / ${unref(audios).length}`,
            artist: "@" + (((_e = unref(selected).user) == null ? void 0 : _e.username) || "")
          }, null, _parent));
          if (unref(audios).length > 1) {
            _push(`<div class="flex flex-wrap gap-1.5 mt-3" data-v-023c4034><!--[-->`);
            ssrRenderList(unref(audios), (a, i) => {
              _push(`<button class="${ssrRenderClass([i === unref(mediaIndex) ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white", "px-2.5 py-1 rounded-lg text-xs font-bold transition"])}" data-v-023c4034>${ssrInterpolate(i + 1)}</button>`);
            });
            _push(`<!--]--></div>`);
          } else _push(`<!---->`);
          _push(`<!--]-->`);
        } else if (unref(kind) === "model" && unref(currentMedia)) {
          _push(`<!--[-->`);
          _push(ssrRenderComponent(ModelViewer_default, {
            key: unref(currentMedia).id,
            src: unref(currentMedia).url
          }, null, _parent));
          if (unref(models).length > 1) {
            _push(`<div class="flex flex-wrap gap-1.5 mt-3" data-v-023c4034><!--[-->`);
            ssrRenderList(unref(models), (m, i) => {
              _push(`<button class="${ssrRenderClass([i === unref(mediaIndex) ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white", "px-2.5 py-1 rounded-lg text-xs font-bold transition"])}" data-v-023c4034>${ssrInterpolate(i + 1)}</button>`);
            });
            _push(`<!--]--></div>`);
          } else _push(`<!---->`);
          _push(`<!--]-->`);
        } else if (unref(kind) === "file") {
          _push(`<div class="space-y-2" data-v-023c4034><!--[-->`);
          ssrRenderList(unref(files), (f) => {
            _push(ssrRenderComponent(FileCard_default, {
              key: f.id,
              url: f.url,
              mime: f.mime
            }, null, _parent));
          });
          _push(`<!--]--></div>`);
        } else _push(`<!---->`);
        _push(`</div>`);
        if (unref(selected).content) _push(`<p class="px-4 py-3 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words" data-v-023c4034>${(_f = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(unref(selected).content, { custom: unref(customEmojiMap) })) != null ? _f : ""}</p>`);
        else _push(`<!---->`);
        _push(`<div class="px-4 pb-3 flex items-center gap-4 text-slate-500 border-b border-slate-800/60" data-v-023c4034><span class="flex items-center gap-1.5 text-sm" data-v-023c4034>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:smile-plus",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` ${ssrInterpolate((unref(selected).reactions || []).reduce((n, r) => n + (r.count || 0), 0))}</span><span class="flex items-center gap-1.5 text-sm" data-v-023c4034>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:repeat-2",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` ${ssrInterpolate(unref(selected).repostCount || 0)}</span><span class="flex items-center gap-1.5 text-sm ml-auto" data-v-023c4034>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:eye",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` ${ssrInterpolate(unref(selected).viewCount || 0)}</span></div><div class="min-h-[320px] flex flex-col" data-v-023c4034>`);
        _push(ssrRenderComponent(_component_PostComments, {
          post: unref(selected),
          onUpdate: onPatch
        }, null, _parent));
        _push(`</div></div></div>`);
      } else _push(`<!---->`);
      _push(`</aside>`);
    };
  }
});
var _sfc_setup$12 = MediaDetailPane_vue_vue_type_script_setup_true_lang_default.setup;
MediaDetailPane_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MediaDetailPane.vue");
  return _sfc_setup$12 ? _sfc_setup$12(props, ctx) : void 0;
};
var MediaDetailPane_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(MediaDetailPane_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-023c4034"]]), { __name: "MediaDetailPane" });
var MobileNav_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "MobileNav",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { activityUnread, dmUnread, dmLatest } = useUnread();
    const items = [
      {
        to: "/home",
        label: "\u30DB\u30FC\u30E0",
        icon: "lucide:home"
      },
      {
        to: "/dm",
        label: "DM",
        icon: "lucide:message-square"
      },
      {
        to: "/actions",
        label: "\u30A2\u30AF\u30C6\u30A3\u30D3\u30C6\u30A3",
        icon: "lucide:bell"
      }
    ];
    function isActive(to) {
      if (to === "/home") return route.path === "/home";
      return route.path.startsWith(to);
    }
    const showServers = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = NuxtLink;
      const _component_Icon = components_default;
      const _component_ServerListModal = ServerListModal_default;
      _push(`<nav${ssrRenderAttrs(mergeProps({ class: "fixed bottom-0 left-0 right-0 h-16 bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around px-2 z-[70]" }, _attrs))}><!--[-->`);
      ssrRenderList(items, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.to,
          to: item.to,
          class: ["relative flex flex-col items-center gap-1 transition px-2", isActive(item.to) ? "text-indigo-400" : "text-slate-500"]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b;
            if (_push2) {
              _push2(`<span class="relative"${_scopeId}>`);
              if (item.to !== "/dm") _push2(ssrRenderComponent(_component_Icon, {
                name: item.icon,
                class: "w-6 h-6"
              }, null, _parent2, _scopeId));
              else if ((_a = unref(dmLatest)) == null ? void 0 : _a.avatarUrl) _push2(`<img${ssrRenderAttr("src", unref(dmLatest).avatarUrl)} class="w-6 h-6 rounded-full object-cover"${_scopeId}>`);
              else _push2(ssrRenderComponent(_component_Icon, {
                name: item.icon,
                class: "w-6 h-6"
              }, null, _parent2, _scopeId));
              if (item.to === "/actions" && unref(activityUnread) > 0) _push2(`<span class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"${_scopeId}>${ssrInterpolate(unref(activityUnread))}</span>`);
              else _push2(`<!---->`);
              if (item.to === "/dm" && unref(dmUnread) > 0) _push2(`<span class="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"${_scopeId}>${ssrInterpolate(unref(dmUnread))}</span>`);
              else _push2(`<!---->`);
              _push2(`</span><span class="text-[10px] font-bold"${_scopeId}>${ssrInterpolate(item.label)}</span>`);
            } else return [createVNode("span", { class: "relative" }, [
              item.to !== "/dm" ? (openBlock(), createBlock(_component_Icon, {
                key: 0,
                name: item.icon,
                class: "w-6 h-6"
              }, null, 8, ["name"])) : ((_b = unref(dmLatest)) == null ? void 0 : _b.avatarUrl) ? (openBlock(), createBlock("img", {
                key: 1,
                src: unref(dmLatest).avatarUrl,
                class: "w-6 h-6 rounded-full object-cover"
              }, null, 8, ["src"])) : (openBlock(), createBlock(_component_Icon, {
                key: 2,
                name: item.icon,
                class: "w-6 h-6"
              }, null, 8, ["name"])),
              item.to === "/actions" && unref(activityUnread) > 0 ? (openBlock(), createBlock("span", {
                key: 3,
                class: "absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
              }, toDisplayString(unref(activityUnread)), 1)) : createCommentVNode("", true),
              item.to === "/dm" && unref(dmUnread) > 0 ? (openBlock(), createBlock("span", {
                key: 4,
                class: "absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
              }, toDisplayString(unref(dmUnread)), 1)) : createCommentVNode("", true)
            ]), createVNode("span", { class: "text-[10px] font-bold" }, toDisplayString(item.label), 1)];
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/search",
        class: ["flex flex-col items-center gap-1 text-slate-500 px-2", unref(route).path === "/search" ? "text-indigo-400" : ""]
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:search",
              class: "w-6 h-6"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-[10px] font-bold"${_scopeId}>\u691C\u7D22</span>`);
          } else return [createVNode(_component_Icon, {
            name: "lucide:search",
            class: "w-6 h-6"
          }), createVNode("span", { class: "text-[10px] font-bold" }, "\u691C\u7D22")];
        }),
        _: 1
      }, _parent));
      _push(`<button class="flex flex-col items-center gap-1 text-slate-500 px-2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:server",
        class: "w-6 h-6"
      }, null, _parent));
      _push(`<span class="text-[10px] font-bold">\u30B5\u30FC\u30D0\u30FC</span></button>`);
      if (unref(showServers)) _push(ssrRenderComponent(_component_ServerListModal, { onClose: ($event) => showServers.value = false }, null, _parent));
      else _push(`<!---->`);
      _push(`</nav>`);
    };
  }
});
var _sfc_setup$11 = MobileNav_vue_vue_type_script_setup_true_lang_default.setup;
MobileNav_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MobileNav.vue");
  return _sfc_setup$11 ? _sfc_setup$11(props, ctx) : void 0;
};
var MobileNav_default = Object.assign(MobileNav_vue_vue_type_script_setup_true_lang_default, { __name: "MobileNav" });
var MediaMiniPlayer_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "MediaMiniPlayer",
  __ssrInlineRender: true,
  setup(__props) {
    const { map: customEmojiMap } = useCustomEmojis();
    const MODEL_EXT = /\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i;
    const pane = useMediaPane();
    const { selected, sourceLabel, mobileFull, kind } = pane;
    const mediaIndex = ref(0);
    watch(() => {
      var _a;
      return (_a = selected.value) == null ? void 0 : _a.id;
    }, () => {
      mediaIndex.value = 0;
    });
    const attachments = computed(() => {
      var _a;
      return ((_a = selected.value) == null ? void 0 : _a.attachments) || [];
    });
    const images = computed(() => attachments.value.filter((a) => String(a.mime || "").startsWith("image/")));
    const firstImage = computed(() => images.value[0]);
    const firstVideo = computed(() => attachments.value.find((a) => String(a.mime || "").startsWith("video/")));
    const firstAudio = computed(() => attachments.value.find((a) => String(a.mime || "").startsWith("audio/")));
    const firstModel = computed(() => attachments.value.find((a) => String(a.mime || "").toLowerCase().startsWith("model/") || MODEL_EXT.test(String(a.url || ""))));
    const files = computed(() => attachments.value.filter((a) => {
      const mime = String(a.mime || "");
      return !mime.startsWith("image/") && !mime.startsWith("video/") && !mime.startsWith("audio/") && !mime.toLowerCase().startsWith("model/") && !MODEL_EXT.test(String(a.url || ""));
    }));
    const kindIcon = computed(() => {
      if (kind.value === "video") return "lucide:video";
      if (kind.value === "image") return "lucide:image";
      if (kind.value === "audio") return "lucide:music";
      if (kind.value === "model") return "lucide:box";
      if (kind.value === "file") return "lucide:file";
      return "lucide:message-square";
    });
    function onPatch(postId, patch) {
      var _a;
      if (((_a = selected.value) == null ? void 0 : _a.id) !== postId) return;
      pane.updatePost({
        ...selected.value,
        ...patch
      });
    }
    const currentFull = computed(() => {
      if (kind.value === "video") return firstVideo.value || null;
      if (kind.value === "audio") return firstAudio.value || null;
      if (kind.value === "model") return firstModel.value || null;
      if (kind.value === "image") return images.value[Math.min(mediaIndex.value, images.value.length - 1)] || null;
      return files.value[0] || null;
    });
    const download = computed(() => {
      var _a, _b, _c;
      return {
        href: ((_a = currentFull.value) == null ? void 0 : _a.originalUrl) || ((_b = currentFull.value) == null ? void 0 : _b.url) || null,
        name: ((_c = currentFull.value) == null ? void 0 : _c.originalName) || void 0
      };
    });
    function timeAgo(date) {
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 1) return "\u305F\u3063\u305F\u4ECA";
      if (minutes < 60) return `${minutes}\u5206\u524D`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}\u6642\u9593\u524D`;
      return `${Math.floor(hours / 24)}\u65E5\u524D`;
    }
    watch(mobileFull, (v) => {
    });
    const { mediaOpenMode } = useAppPreferences();
    const isSheet = computed(() => mediaOpenMode.value === "sheet");
    const dragY = ref(0);
    ref(0);
    const dragging = ref(false);
    const sheetStyle = computed(() => {
      if (!dragging.value || dragY.value <= 0) return {};
      return {
        transform: `translateY(${dragY.value}px)`,
        transition: "none"
      };
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_Icon = components_default;
      const _component_PostComments = PostComments_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-[1024px]:hidden" }, _attrs))} data-v-3065cae1>`);
      if (unref(selected) && !unref(mobileFull)) {
        _push(`<div class="fixed left-3 right-3 bottom-[4.5rem] z-[80] bg-[#151a24] border border-slate-700 rounded-xl shadow-2xl flex items-center gap-3 p-2" data-v-3065cae1><button class="shrink-0" data-v-3065cae1>`);
        if (unref(firstImage)) _push(`<img${ssrRenderAttr("src", unref(firstImage).url)} class="w-11 h-11 rounded-lg object-cover" data-v-3065cae1>`);
        else {
          _push(`<div class="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center" data-v-3065cae1>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: unref(kindIcon),
            class: "w-5 h-5 text-indigo-400"
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`</button><button class="flex-1 min-w-0 text-left" data-v-3065cae1><p class="text-sm font-bold text-white truncate" data-v-3065cae1>${ssrInterpolate(((_a = unref(selected).user) == null ? void 0 : _a.displayName) || "\u30E1\u30C7\u30A3\u30A2")}</p><p class="text-[11px] text-slate-500 truncate" data-v-3065cae1>${ssrInterpolate(unref(selected).content || unref(sourceLabel) || "\u30BF\u30C3\u30D7\u3057\u3066\u958B\u304F")}</p></button><button class="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition shrink-0" data-v-3065cae1>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button></div>`);
      } else _push(`<!---->`);
      if (unref(selected) && unref(mobileFull)) {
        _push(`<div class="fixed inset-0 z-[120] flex flex-col justify-end" data-v-3065cae1>`);
        if (unref(isSheet)) _push(`<div class="absolute inset-0 bg-black/60" data-v-3065cae1></div>`);
        else _push(`<!---->`);
        _push(`<div class="${ssrRenderClass([unref(isSheet) ? "rounded-t-3xl border-t border-slate-700 shadow-2xl max-h-[92vh]" : "inset-0 h-full", "relative flex flex-col bg-[#0b0f19] overflow-hidden"])}" style="${ssrRenderStyle(unref(isSheet) ? {
          height: "92vh",
          ...unref(sheetStyle)
        } : {})}" data-v-3065cae1>`);
        if (unref(isSheet)) _push(`<div class="shrink-0 flex flex-col items-center pt-2 pb-1 cursor-grab active:cursor-grabbing select-none touch-none" data-v-3065cae1><div class="w-10 h-1 rounded-full bg-slate-700" data-v-3065cae1></div><span class="text-[10px] text-slate-600 mt-1" data-v-3065cae1>\u4E0B\u306B\u30C9\u30E9\u30C3\u30B0\u3057\u3066\u623B\u308B</span></div>`);
        else _push(`<!---->`);
        _push(`<div class="h-12 px-2 flex items-center gap-2 border-b border-slate-800 shrink-0" data-v-3065cae1><button class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" title="\u623B\u308B" data-v-3065cae1>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: unref(isSheet) ? "lucide:chevrons-down" : "lucide:chevron-down",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button><span class="text-sm font-bold text-white truncate flex-1" data-v-3065cae1>${ssrInterpolate(((_b = unref(selected).user) == null ? void 0 : _b.displayName) || "\u30E1\u30C7\u30A3\u30A2")}</span>`);
        if (unref(download).href) {
          _push(`<a${ssrRenderAttr("href", unref(download).href)}${ssrRenderAttr("download", unref(download).name)} class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" title="\u5143\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9" data-v-3065cae1>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:download",
            class: "w-5 h-5"
          }, null, _parent));
          _push(`</a>`);
        } else _push(`<!---->`);
        _push(`<button class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition" title="\u9589\u3058\u308B" data-v-3065cae1>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button></div><div class="flex-1 overflow-y-auto min-h-0" data-v-3065cae1><div class="px-3 pt-3" data-v-3065cae1>`);
        if (unref(firstVideo)) _push(ssrRenderComponent(VideoPlayer_default, { src: unref(firstVideo).url }, null, _parent));
        else if (unref(images).length) _push(ssrRenderComponent(ImageGallery_default, {
          images: unref(images),
          index: unref(mediaIndex),
          "onUpdate:index": ($event) => mediaIndex.value = $event
        }, null, _parent));
        else if (unref(firstAudio)) _push(ssrRenderComponent(MusicPlayer_default, {
          src: unref(firstAudio).url,
          title: "\u30AA\u30FC\u30C7\u30A3\u30AA",
          artist: "@" + (((_c = unref(selected).user) == null ? void 0 : _c.username) || "")
        }, null, _parent));
        else if (unref(firstModel)) _push(ssrRenderComponent(ModelViewer_default, { src: unref(firstModel).url }, null, _parent));
        else if (unref(files).length) {
          _push(`<div class="space-y-2" data-v-3065cae1><!--[-->`);
          ssrRenderList(unref(files), (f) => {
            _push(ssrRenderComponent(FileCard_default, {
              key: f.id,
              url: f.url,
              mime: f.mime
            }, null, _parent));
          });
          _push(`<!--]--></div>`);
        } else _push(`<!---->`);
        _push(`</div><div class="px-3 py-3" data-v-3065cae1>`);
        if (unref(selected).content) _push(`<p class="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words" data-v-3065cae1>${(_d = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(unref(selected).content, { custom: unref(customEmojiMap) })) != null ? _d : ""}</p>`);
        else _push(`<!---->`);
        _push(`<div class="flex items-center gap-4 mt-3 text-slate-500 text-sm" data-v-3065cae1><span class="flex items-center gap-1.5" data-v-3065cae1>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:smile-plus",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`${ssrInterpolate((unref(selected).reactions || []).reduce((n, r) => n + (r.count || 0), 0))}</span><span class="flex items-center gap-1.5" data-v-3065cae1>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:repeat-2",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`${ssrInterpolate(unref(selected).repostCount || 0)}</span><span class="ml-auto" data-v-3065cae1>${ssrInterpolate(timeAgo(unref(selected).createdAt))}</span></div></div><div class="border-t border-slate-800 min-h-[40vh]" data-v-3065cae1>`);
        _push(ssrRenderComponent(_component_PostComments, {
          post: unref(selected),
          onUpdate: onPatch
        }, null, _parent));
        _push(`</div></div></div></div>`);
      } else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup$10 = MediaMiniPlayer_vue_vue_type_script_setup_true_lang_default.setup;
MediaMiniPlayer_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MediaMiniPlayer.vue");
  return _sfc_setup$10 ? _sfc_setup$10(props, ctx) : void 0;
};
var MediaMiniPlayer_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(MediaMiniPlayer_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-3065cae1"]]), { __name: "MediaMiniPlayer" });
var GRID = 100;
var VoiceCallDock_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "VoiceCallDock",
  __ssrInlineRender: true,
  setup(__props) {
    const { status, members, muted, speakerMuted, remoteStreams, remoteScreenStreams, incoming, errorMsg, activeRoom, callState, me, cameraEnabled, screenSharing, localVideoStream, screenStream, localStream, reactions, whiteboardStrokes} = useVoiceCall();
    const elapsed = ref(0);
    let timer = null;
    watch(status, (s) => {
      if (s === "active") {
        elapsed.value = 0;
        timer = setInterval();
      } else if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }, { immediate: true });
    const minimized = ref(false);
    ref(null);
    const miniPos = reactive({
      x: 0,
      y: 0
    });
    reactive({
      active: false,
      moved: false,
      startX: 0,
      startY: 0,
      origX: 0,
      origY: 0
    });
    const miniPeer = computed(() => {
      return members.value.find((m) => {
        var _a;
        return m.userId !== ((_a = me.value) == null ? void 0 : _a.userId);
      }) || me.value || null;
    });
    const callTime = computed(() => {
      const m = Math.floor(elapsed.value / 60);
      const s = elapsed.value % 60;
      return `${m}:${String(s).padStart(2, "0")}`;
    });
    const callOpen = computed(() => !!activeRoom.value && (status.value === "active" || status.value === "connecting"));
    const roomTitle = computed(() => {
      var _a;
      return ((_a = activeRoom.value) == null ? void 0 : _a.label) || "\u901A\u8A71";
    });
    const showError = computed(() => !!errorMsg.value && status.value === "idle");
    const stateMeta = computed(() => {
      if (callState.value === "connected") return {
        label: "\u901A\u8A71\u4E2D",
        cls: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
        dot: "bg-emerald-400"
      };
      if (callState.value === "reconnecting") return {
        label: "\u518D\u63A5\u7D9A\u4E2D...",
        cls: "text-amber-400 border-amber-500/40 bg-amber-500/10",
        dot: "bg-amber-400 animate-pulse"
      };
      if (callState.value === "failed") return {
        label: "\u63A5\u7D9A\u5931\u6557",
        cls: "text-red-400 border-red-500/40 bg-red-500/10",
        dot: "bg-red-400"
      };
      if (members.value.filter((m) => {
        var _a;
        return m.userId !== ((_a = me.value) == null ? void 0 : _a.userId);
      }).length === 0) return {
        label: "\u5F85\u6A5F\u4E2D...",
        cls: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
        dot: "bg-emerald-400"
      };
      return {
        label: "\u63A5\u7D9A\u4E2D...",
        cls: "text-sky-400 border-sky-500/40 bg-sky-500/10",
        dot: "bg-sky-400 animate-pulse"
      };
    });
    let ringCtx = null;
    let ringOsc = null;
    function stopRing() {
      try {
        if (ringCtx) {
          if (ringCtx._pulseTimer) clearInterval(ringCtx._pulseTimer);
          ringOsc == null ? void 0 : ringOsc.stop();
          ringCtx.close();
        }
      } catch {
      }
      ringCtx = null;
      ringOsc = null;
    }
    watch(incoming, (v) => {
      if (v) ;
      else stopRing();
    }, { immediate: true });
    const hasVideo = ref({});
    const screenTiles = ref([]);
    let videoPoll = null;
    watch(callOpen, (open) => {
      if (videoPoll) {
        clearInterval(videoPoll);
        videoPoll = null;
      }
      if (open) videoPoll = setInterval();
    });
    const tiles = computed(() => {
      var _a;
      const list = [];
      for (const m of members.value) if (m.userId !== ((_a = me.value) == null ? void 0 : _a.userId)) list.push({
        userId: m.userId,
        name: m.displayName || m.username,
        avatarUrl: m.avatarUrl,
        isSelf: false
      });
      if (me.value) list.push({
        userId: me.value.userId,
        name: me.value.displayName,
        avatarUrl: me.value.avatarUrl,
        isSelf: true
      });
      return list;
    });
    const tileReactions = (uid) => reactions.value.filter((r) => r.from === uid);
    let audioCtx = null;
    const analysers = /* @__PURE__ */ new Map();
    const speaking = ref({});
    let speakLoop = null;
    function attachAnalyser(uid, stream) {
      if (!stream || !stream.getAudioTracks().length) return;
      return;
    }
    function refreshAnalysers() {
      analysers.clear();
      for (const [uid, stream] of Object.entries(remoteStreams.value)) attachAnalyser(uid, stream);
      if (localStream.value) attachAnalyser("me", localStream.value);
      if (!speakLoop) speakLoop = setInterval();
    }
    watch(remoteStreams, refreshAnalysers, { deep: true });
    watch(callOpen, (open) => {
      if (!open && speakLoop) {
        clearInterval(speakLoop);
        speakLoop = null;
        speaking.value = {};
        audioCtx == null ? void 0 : audioCtx.close().catch(() => {
        });
        audioCtx = null;
      }
      if (open) refreshAnalysers();
    });
    watch(speakerMuted, () => {
    });
    const avatarPop = (uid, isSelf) => {
      const level = isSelf ? speaking.value["me"] || 0 : speaking.value[uid] || 0;
      if (level <= 0) return {};
      return {
        transform: `scale(${1 + Math.min(level * 1.6, 0.34)})`,
        transition: "transform 140ms ease"
      };
    };
    const speakingGlow = (uid, isSelf) => {
      return (isSelf ? speaking.value["me"] || 0 : speaking.value[uid] || 0) > 0 ? "ring-2 ring-emerald-400/80 shadow-[0_0_18px_rgba(52,211,153,0.45)]" : "";
    };
    function tryResumeAudio() {
      nextTick(() => {
        if (!callOpen.value) return;
        const root = (void 0).querySelector("[data-vc-aud-root]");
        if (!root) return;
        root.querySelectorAll("audio.vc-aud").forEach((a) => {
          const p = a.play();
          if (p) p.catch(() => {
          });
        });
      });
    }
    watch(() => [
      callOpen.value,
      remoteStreams,
      remoteScreenStreams
    ], () => {
      tryResumeAudio();
    }, { deep: true });
    const showReactions = ref(false);
    const EMOJIS = [
      "\u{1F44D}",
      "\u2764\uFE0F",
      "\u{1F606}",
      "\u{1F62E}",
      "\u{1F622}",
      "\u{1F621}",
      "\u{1F525}",
      "\u{1F389}"
    ];
    const inviteOpen = ref(false);
    const copied = ref(false);
    const inviteLink = computed(() => {
      const room = activeRoom.value;
      if (!room) return "";
      if (room.kind === "dm" && room.roomKey.startsWith("dm:")) return `${(void 0).origin}/dm/${room.roomKey.slice(3)}`;
      return (void 0).origin + (room.roomKey.includes(":") ? "/" + room.roomKey.slice(room.roomKey.lastIndexOf(":") + 1) : "");
    });
    const expandedScreen = ref(null);
    const whiteboardOpen = ref(false);
    const wbCanvas = ref(null);
    const wbColor = ref("#ffffff");
    const wbWidth = ref(3);
    ref(false);
    const wbCurrent = ref([]);
    const wbPanMode = ref(false);
    const wbView = reactive({
      x: 0,
      y: 0,
      scale: 1
    });
    const WB_COLORS = [
      "#ffffff",
      "#ef4444",
      "#22c55e",
      "#3b82f6",
      "#f59e0b",
      "#a855f7"
    ];
    function wbResize() {
      const el = wbCanvas.value;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.width = Math.max(1, r.width);
      el.height = Math.max(1, r.height);
      if (wbView.x === 0 && wbView.y === 0 && wbView.scale === 1) {
        wbView.x = r.width / 2 - 400;
        wbView.y = r.height / 2 - 300;
      }
      redrawWb();
    }
    function redrawWb() {
      const el = wbCanvas.value;
      if (!el) return;
      const ctx = el.getContext("2d");
      if (!ctx) return;
      const W = el.width, H = el.height;
      const { x, y, scale } = wbView;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const x0 = -x / scale, y0 = -y / scale;
      const x1 = (W - x) / scale, y1 = (H - y) / scale;
      const minor = Math.max(20, GRID * (scale < 0.5 ? 4 : scale <= 1 ? 2 : 1)) / scale;
      ctx.lineWidth = 1 / scale;
      ctx.strokeStyle = "rgba(148,163,184,0.10)";
      ctx.beginPath();
      for (let gx = Math.floor(x0 / minor) * minor; gx < x1; gx += minor) {
        ctx.moveTo(gx * scale + x, 0);
        ctx.lineTo(gx * scale + x, H);
      }
      for (let gy = Math.floor(y0 / minor) * minor; gy < y1; gy += minor) {
        ctx.moveTo(0, gy * scale + y);
        ctx.lineTo(W, gy * scale + y);
      }
      ctx.stroke();
      ctx.strokeStyle = "rgba(148,163,184,0.18)";
      ctx.beginPath();
      for (let gx = Math.floor(x0 / GRID) * GRID; gx < x1; gx += GRID) {
        ctx.moveTo(gx * scale + x, 0);
        ctx.lineTo(gx * scale + x, H);
      }
      for (let gy = Math.floor(y0 / GRID) * GRID; gy < y1; gy += GRID) {
        ctx.moveTo(0, gy * scale + y);
        ctx.lineTo(W, gy * scale + y);
      }
      ctx.stroke();
      ctx.setTransform(scale, 0, 0, scale, x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const drawStroke = (segments, color, width) => {
        if (!segments || segments.length < 2) return;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, width * (scale * 0.12 + 0.9));
        ctx.beginPath();
        segments.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      };
      for (const s of whiteboardStrokes.value) drawStroke(s.segments, s.color, s.width);
      drawStroke(wbCurrent.value, wbColor.value, wbWidth.value);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    watch(whiteboardStrokes, () => redrawWb(), { deep: true });
    watch(whiteboardOpen, (o) => {
      if (o) setTimeout(() => wbResize(), 60);
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-9995d6e9>`);
      if (unref(showError)) {
        _push(`<div class="fixed bottom-20 min-[681px]:bottom-[38px] right-4 z-[95] bg-red-950/90 border border-red-800/60 rounded-xl px-4 py-3 text-sm text-red-200 flex items-center gap-3 max-w-xs shadow-2xl" data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:phone-missed",
          class: "w-4 h-4 shrink-0"
        }, null, _parent));
        _push(`<span class="flex-1" data-v-9995d6e9>${ssrInterpolate(unref(errorMsg))}</span><button class="text-red-400 hover:text-white transition shrink-0" data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button></div>`);
      } else _push(`<!---->`);
      if (unref(incoming)) {
        _push(`<div class="fixed bottom-20 min-[681px]:bottom-[38px] right-4 z-[95] w-72 bg-[#151a24]/95 border border-slate-700 rounded-2xl p-4 shadow-2xl backdrop-blur" data-v-9995d6e9><div class="flex items-center gap-3" data-v-9995d6e9><div class="relative" data-v-9995d6e9>`);
        if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(incoming).from.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(incoming).from.avatarUrl))} class="w-11 h-11 rounded-full object-cover" data-v-9995d6e9>`);
        else _push(`<div class="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold" data-v-9995d6e9>${ssrInterpolate(((_a = unref(incoming).from.displayName) == null ? void 0 : _a.charAt(0)) || "?")}</div>`);
        _push(`<span class="absolute -bottom-0.5 -right-0.5 flex w-3 h-3" data-v-9995d6e9><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" data-v-9995d6e9></span><span class="relative inline-flex rounded-full w-3 h-3 bg-emerald-500" data-v-9995d6e9></span></span></div><div class="min-w-0" data-v-9995d6e9><p class="text-white font-bold text-sm truncate" data-v-9995d6e9>${ssrInterpolate(unref(incoming).from.displayName)}</p><p class="text-slate-400 text-xs" data-v-9995d6e9>\u7740\u4FE1\u4E2D...</p></div></div><div class="flex justify-center gap-4 mt-4" data-v-9995d6e9><button class="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center justify-center" title="\u62D2\u5426" data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:phone-off",
          class: "w-5 h-5 text-white"
        }, null, _parent));
        _push(`</button><button class="w-11 h-11 rounded-full bg-green-600 hover:bg-green-700 transition flex items-center justify-center" title="\u5FDC\u7B54" data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:phone",
          class: "w-5 h-5 text-white"
        }, null, _parent));
        _push(`</button></div></div>`);
      } else _push(`<!---->`);
      if (unref(callOpen) && !unref(minimized)) {
        _push(`<div data-vc-aud-root class="fixed inset-0 z-[85] bg-[#0b0f19] flex flex-col" data-v-9995d6e9><div class="flex items-center justify-between px-5 py-3 shrink-0 border-b border-slate-800/60" data-v-9995d6e9><div class="flex items-center gap-2.5 min-w-0" data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:phone",
          class: "w-4 h-4 text-slate-400 shrink-0"
        }, null, _parent));
        _push(`<h2 class="font-bold text-white truncate" data-v-9995d6e9>${ssrInterpolate(unref(roomTitle))}</h2></div><div class="flex items-center gap-2 shrink-0" data-v-9995d6e9><span class="${ssrRenderClass(["px-2.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5", unref(stateMeta).cls])}" data-v-9995d6e9><span class="${ssrRenderClass(["w-2 h-2 rounded-full", unref(stateMeta).dot])}" data-v-9995d6e9></span> ${ssrInterpolate(unref(callState) === "connected" ? "\u901A\u8A71\u4E2D" : unref(stateMeta).label)}</span>`);
        if (unref(status) === "active") _push(`<span class="text-xs text-slate-400 tabular-nums" data-v-9995d6e9>${ssrInterpolate(unref(callTime))}</span>`);
        else _push(`<!---->`);
        _push(`<span class="text-xs text-slate-500" data-v-9995d6e9>${ssrInterpolate(unref(tiles).length + unref(screenTiles).length)}\u540D</span><button class="w-8 h-8 rounded-full bg-slate-800/60 hover:bg-slate-700 transition flex items-center justify-center" title="\u6700\u5C0F\u5316\uFF08\u30C9\u30E9\u30C3\u30B0\u3067\u304D\u308B\u901A\u8A71\u30A2\u30A4\u30B3\u30F3\u306B\uFF09" data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:minus",
          class: "w-4 h-4 text-slate-300"
        }, null, _parent));
        _push(`</button></div></div><div class="flex-1 overflow-y-auto p-4 min-h-0" data-v-9995d6e9><div class="h-full grid gap-3 content-center" style="${ssrRenderStyle({ "grid-template-columns": "repeat(auto-fill, minmax(230px, 1fr))" })}" data-v-9995d6e9><!--[-->`);
        ssrRenderList(unref(screenTiles), (s) => {
          _push(`<div class="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 md:col-span-2 md:row-span-2 min-h-[200px] max-h-[70vh] flex flex-col items-center justify-center cursor-pointer group" data-v-9995d6e9><video${ssrRenderAttr("srcObject", unref(remoteScreenStreams)[s.userId])} muted autoplay playsinline webkit-playsinline class="absolute inset-0 w-full h-full object-contain bg-black" data-v-9995d6e9></video><div class="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-1" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:monitor-up",
            class: "w-3 h-3"
          }, null, _parent));
          _push(` ${ssrInterpolate(s.name)}\u306E\u753B\u9762 </div><div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:maximize",
            class: "w-8 h-8 text-white"
          }, null, _parent));
          _push(`</div></div>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(unref(tiles), (t) => {
          _push(`<div class="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 min-h-[180px] flex flex-col items-center justify-center" data-v-9995d6e9>`);
          if (!t.isSelf && unref(hasVideo)[t.userId]) _push(`<div class="absolute inset-0 w-full h-full" data-v-9995d6e9><video${ssrRenderAttr("srcObject", unref(remoteStreams)[t.userId])} muted autoplay playsinline webkit-playsinline class="absolute inset-0 w-full h-full object-cover" data-v-9995d6e9></video></div>`);
          else {
            _push(`<div class="absolute inset-0 flex flex-col items-center justify-center" data-v-9995d6e9><div style="${ssrRenderStyle(avatarPop(t.userId, t.isSelf))}" class="${ssrRenderClass(["relative w-28 h-28 rounded-full", speakingGlow(t.userId, t.isSelf)])}" data-v-9995d6e9>`);
            if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(t.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(t.avatarUrl))} class="w-full h-full rounded-full object-cover" data-v-9995d6e9>`);
            else _push(`<div class="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold" data-v-9995d6e9>${ssrInterpolate(t.name.charAt(0))}</div>`);
            _push(`</div></div>`);
          }
          _push(`<div class="absolute inset-x-0 bottom-14 flex justify-center gap-2 pointer-events-none z-[2]" data-v-9995d6e9><!--[-->`);
          ssrRenderList(tileReactions(t.userId), (r) => {
            _push(`<span class="wb-fly text-3xl drop-shadow-lg" data-v-9995d6e9>${ssrInterpolate(r.emoji)}</span>`);
          });
          _push(`<!--]--></div><div class="absolute bottom-0 inset-x-0 flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent" data-v-9995d6e9><span class="text-white text-sm font-medium truncate" data-v-9995d6e9>${ssrInterpolate(t.name)}</span><span class="flex items-center gap-1.5 shrink-0" data-v-9995d6e9>`);
          if (!t.isSelf && unref(speakerMuted)) _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:volume-x",
            class: "w-4 h-4 text-red-300"
          }, null, _parent));
          else _push(`<!---->`);
          if (unref(muted) && t.isSelf) _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:mic-off",
            class: "w-4 h-4 text-red-400"
          }, null, _parent));
          else if (!t.isSelf) _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:mic",
            class: "w-4 h-4 text-slate-300"
          }, null, _parent));
          else _push(`<!---->`);
          _push(`</span></div></div>`);
        });
        _push(`<!--]--></div></div><div class="absolute bottom-24 right-4 w-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl z-[2] cursor-pointer group" data-v-9995d6e9>`);
        if (unref(screenSharing) && unref(screenStream)) _push(`<video${ssrRenderAttr("srcObject", unref(screenStream))} muted autoplay playsinline webkit-playsinline class="w-full aspect-video object-cover" data-v-9995d6e9></video>`);
        else if (unref(cameraEnabled) && unref(localVideoStream)) _push(`<video${ssrRenderAttr("srcObject", unref(localVideoStream))} muted autoplay playsinline webkit-playsinline class="w-full aspect-video object-cover scale-x-[-1]" data-v-9995d6e9></video>`);
        else {
          _push(`<div class="aspect-video flex items-center justify-center text-slate-500" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:user",
            class: "w-6 h-6"
          }, null, _parent));
          _push(`</div>`);
        }
        if (unref(cameraEnabled)) {
          _push(`<button class="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 hover:bg-black/75 transition flex items-center justify-center" title="\u30AB\u30E1\u30E9\u5207\u66FF\uFF08\u6B63\u9762/\u80CC\u9762\uFF09" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:refresh-ccw",
            class: "w-4 h-4 text-white"
          }, null, _parent));
          _push(`</button>`);
        } else _push(`<!---->`);
        _push(`<div class="px-2 py-1 text-[11px] text-slate-300 flex items-center gap-1.5 bg-slate-900" style="${ssrRenderStyle(avatarPop("me", true))}" data-v-9995d6e9><span class="${ssrRenderClass([unref(muted) ? "bg-red-400" : "bg-emerald-400", "w-1.5 h-1.5 rounded-full"])}" data-v-9995d6e9></span> ${ssrInterpolate((_b = unref(me)) == null ? void 0 : _b.displayName)} `);
        if (unref(muted)) _push(`<span data-v-9995d6e9>(\u30DF\u30E5\u30FC\u30C8)</span>`);
        else _push(`<!---->`);
        _push(`</div></div>`);
        if (unref(whiteboardOpen)) {
          _push(`<div class="absolute inset-0 z-[1] flex flex-col bg-[#0b0f19]/98" data-v-9995d6e9><div class="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800 bg-slate-900/80 flex-wrap" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:presentation",
            class: "w-4 h-4 text-indigo-400 shrink-0"
          }, null, _parent));
          _push(`<span class="text-sm font-bold text-white mr-2" data-v-9995d6e9>\u30DB\u30EF\u30A4\u30C8\u30DC\u30FC\u30C9</span><!--[-->`);
          ssrRenderList(WB_COLORS, (c) => {
            _push(`<button style="${ssrRenderStyle({
              backgroundColor: c,
              opacity: unref(wbColor) === c ? 1 : 0.6
            })}" class="${ssrRenderClass([unref(wbColor) === c ? "border-white scale-110" : "border-transparent", "w-5 h-5 rounded-full border-2 transition shrink-0"])}"${ssrRenderAttr("title", c)} data-v-9995d6e9></button>`);
          });
          _push(`<!--]--><button class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition shrink-0"${ssrRenderAttr("title", unref(wbPanMode) ? "\u63CF\u753B\u30E2\u30FC\u30C9" : "\u79FB\u52D5\u30E2\u30FC\u30C9")} data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: unref(wbPanMode) ? "lucide:pencil" : "lucide:hand",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`</button><button class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition shrink-0" title="\u62E1\u5927" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:zoom-in",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`</button><button class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition shrink-0" title="\u7E2E\u5C0F" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:zoom-out",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`</button><select class="bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 px-1 py-1 shrink-0" data-v-9995d6e9><option${ssrRenderAttr("value", 2)} data-v-9995d6e9${ssrIncludeBooleanAttr(Array.isArray(unref(wbWidth)) ? ssrLooseContain(unref(wbWidth), 2) : ssrLooseEqual(unref(wbWidth), 2)) ? " selected" : ""}>\u7D30</option><option${ssrRenderAttr("value", 4)} data-v-9995d6e9${ssrIncludeBooleanAttr(Array.isArray(unref(wbWidth)) ? ssrLooseContain(unref(wbWidth), 4) : ssrLooseEqual(unref(wbWidth), 4)) ? " selected" : ""}>\u4E2D</option><option${ssrRenderAttr("value", 10)} data-v-9995d6e9${ssrIncludeBooleanAttr(Array.isArray(unref(wbWidth)) ? ssrLooseContain(unref(wbWidth), 10) : ssrLooseEqual(unref(wbWidth), 10)) ? " selected" : ""}>\u592A</option></select><span class="text-[10px] text-slate-500 ml-auto" data-v-9995d6e9>\u30B9\u30AF\u30ED\u30FC\u30EB\u3067\u62E1\u5927/\u7E2E\u5C0F\u30FB2\u672C\u6307\u3067\u79FB\u52D5</span><button class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition shrink-0" title="\u623B\u3059" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:undo-2",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`</button><button class="px-2.5 py-1 rounded bg-red-900/40 hover:bg-red-900/70 text-xs text-red-300 transition shrink-0" data-v-9995d6e9>\u30AF\u30EA\u30A2</button><button class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition shrink-0" data-v-9995d6e9>\u9589\u3058\u308B</button></div><canvas class="${ssrRenderClass([unref(wbPanMode) ? "cursor-grab" : "cursor-crosshair", "flex-1 w-full touch-none"])}" data-v-9995d6e9></canvas></div>`);
        } else _push(`<!---->`);
        if (unref(expandedScreen)) {
          _push(`<div class="absolute inset-0 z-[3] bg-black flex flex-col p-4" data-v-9995d6e9><div class="flex items-center justify-between mb-2 shrink-0" data-v-9995d6e9><span class="text-sm text-slate-300 flex items-center gap-2" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:monitor-up",
            class: "w-4 h-4"
          }, null, _parent));
          _push(` ${ssrInterpolate(unref(expandedScreen) === "self" ? "\u3042\u306A\u305F\u306E\u753B\u9762" : (((_c = unref(screenTiles).find((s) => s.userId === unref(expandedScreen))) == null ? void 0 : _c.name) || "") + "\u306E\u753B\u9762")}</span><button class="w-9 h-9 rounded-full bg-slate-700/60 hover:bg-slate-600 transition flex items-center justify-center" title="\u9589\u3058\u308B" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:x",
            class: "w-5 h-5 text-white"
          }, null, _parent));
          _push(`</button></div><div class="flex-1 min-h-0 flex items-center justify-center" data-v-9995d6e9>`);
          if (unref(expandedScreen) === "self") _push(`<video${ssrRenderAttr("srcObject", unref(screenStream))} muted autoplay playsinline webkit-playsinline class="max-w-full max-h-full object-contain rounded-lg bg-slate-950" data-v-9995d6e9></video>`);
          else _push(`<video${ssrRenderAttr("srcObject", unref(remoteScreenStreams)[unref(expandedScreen)])} muted autoplay playsinline webkit-playsinline class="max-w-full max-h-full object-contain rounded-lg bg-slate-950" data-v-9995d6e9></video>`);
          _push(`</div></div>`);
        } else _push(`<!---->`);
        _push(`<div class="shrink-0 px-4 py-4 flex items-center justify-center gap-3 border-t border-slate-800/60 relative flex-wrap z-[2]" data-v-9995d6e9>`);
        if (unref(showReactions)) {
          _push(`<div class="absolute bottom-full mb-3 flex items-center gap-1 bg-[#151a24] border border-slate-700 rounded-full px-3 py-2 shadow-2xl" data-v-9995d6e9><!--[-->`);
          ssrRenderList(EMOJIS, (e) => {
            _push(`<button class="text-2xl hover:scale-125 transition" data-v-9995d6e9>${ssrInterpolate(e)}</button>`);
          });
          _push(`<!--]--></div>`);
        } else _push(`<!---->`);
        _push(`<button class="${ssrRenderClass([unref(muted) ? "ctrl-active-red" : "ctrl-ghost", "ctrl-btn"])}"${ssrRenderAttr("title", unref(muted) ? "\u30DF\u30E5\u30FC\u30C8\u89E3\u9664" : "\u30DF\u30E5\u30FC\u30C8")} data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: unref(muted) ? "lucide:mic-off" : "lucide:mic",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button><button class="${ssrRenderClass([unref(speakerMuted) ? "ctrl-active-red" : "ctrl-ghost", "ctrl-btn"])}"${ssrRenderAttr("title", unref(speakerMuted) ? "\u30B9\u30D4\u30FC\u30AB\u30FC\u30DF\u30E5\u30FC\u30C8\u89E3\u9664" : "\u30B9\u30D4\u30FC\u30AB\u30FC\u30DF\u30E5\u30FC\u30C8")} data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: unref(speakerMuted) ? "lucide:volume-x" : "lucide:volume-2",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button><button class="${ssrRenderClass([unref(cameraEnabled) ? "ctrl-active" : "ctrl-ghost", "ctrl-btn"])}"${ssrRenderAttr("title", unref(cameraEnabled) ? "\u30AB\u30E1\u30E9\u3092\u5207\u308B" : "\u30AB\u30E1\u30E9\u3092\u4ED8\u3051\u308B")} data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: unref(cameraEnabled) ? "lucide:video" : "lucide:video-off",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button><button class="${ssrRenderClass([unref(screenSharing) ? "ctrl-active" : "ctrl-ghost", "ctrl-btn"])}"${ssrRenderAttr("title", unref(screenSharing) ? "\u5171\u6709\u3092\u505C\u6B62" : "\u753B\u9762\u3092\u5171\u6709")} data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: unref(screenSharing) ? "lucide:monitor-off" : "lucide:monitor-up",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button><button class="${ssrRenderClass([unref(whiteboardOpen) ? "ctrl-active" : "ctrl-ghost", "ctrl-btn"])}" title="\u30DB\u30EF\u30A4\u30C8\u30DC\u30FC\u30C9" data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:presentation",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button><button class="ctrl-btn ctrl-ghost" title="\u30EA\u30A2\u30AF\u30B7\u30E7\u30F3" data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:smile",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button><button class="ctrl-btn ctrl-ghost" title="\u901A\u8A71\u306B\u62DB\u5F85" data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:user-plus",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button><button class="ctrl-btn ctrl-leave" title="\u9000\u51FA" data-v-9995d6e9>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:phone-off",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`<span class="text-xs font-bold" data-v-9995d6e9>\u9000\u51FA</span></button></div>`);
        if (unref(inviteOpen)) {
          _push(`<div class="absolute inset-0 z-[4] bg-black/60 flex items-center justify-center" data-v-9995d6e9><div class="bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-sm mx-4 p-5 shadow-2xl" data-v-9995d6e9><div class="flex items-center justify-between mb-3" data-v-9995d6e9><h3 class="font-bold text-white flex items-center gap-2" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:user-plus",
            class: "w-4 h-4 text-indigo-400"
          }, null, _parent));
          _push(` \u901A\u8A71\u306B\u62DB\u5F85</h3><button class="text-slate-500 hover:text-white transition" data-v-9995d6e9>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:x",
            class: "w-5 h-5"
          }, null, _parent));
          _push(`</button></div><p class="text-sm text-slate-400 mb-3" data-v-9995d6e9>\u3053\u306E\u30EA\u30F3\u30AF\u3092\u9001\u3063\u3066\u3001\u901A\u8A71\u306B\u53C2\u52A0\u3057\u3066\u3082\u3089\u3044\u307E\u3057\u3087\u3046\u3002</p><div class="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2" data-v-9995d6e9><span class="text-xs text-slate-300 truncate flex-1" data-v-9995d6e9>${ssrInterpolate(unref(inviteLink))}</span><button class="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0" data-v-9995d6e9>${ssrInterpolate(unref(copied) ? "\u30B3\u30D4\u30FC\u6E08\u307F" : "\u30B3\u30D4\u30FC")}</button></div></div></div>`);
        } else _push(`<!---->`);
        _push(`</div>`);
      } else _push(`<!---->`);
      if (unref(callOpen) && unref(minimized)) {
        _push(`<div class="fixed z-[98] w-20 h-20 rounded-2xl bg-[#151a24]/95 border border-slate-700 shadow-2xl backdrop-blur flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing select-none touch-none" style="${ssrRenderStyle({
          left: unref(miniPos).x + "px",
          top: unref(miniPos).y + "px"
        })}" data-v-9995d6e9><div class="relative" data-v-9995d6e9>`);
        if (unref(miniPeer)) {
          _push(`<div class="${ssrRenderClass(["relative w-11 h-11 rounded-full overflow-hidden", speakingGlow(unref(miniPeer).userId, unref(miniPeer).userId === ((_d = unref(me)) == null ? void 0 : _d.userId))])}" data-v-9995d6e9>`);
          if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(miniPeer).avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(miniPeer).avatarUrl))} class="w-full h-full object-cover" data-v-9995d6e9>`);
          else _push(`<div class="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold" data-v-9995d6e9>${ssrInterpolate((unref(miniPeer).displayName || unref(miniPeer).username || "?").charAt(0))}</div>`);
          _push(`</div>`);
        } else _push(`<!---->`);
        _push(`<span class="absolute -bottom-0.5 -right-0.5 flex w-3 h-3" data-v-9995d6e9><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" data-v-9995d6e9></span><span class="relative inline-flex rounded-full w-3 h-3 bg-emerald-500" data-v-9995d6e9></span></span></div>`);
        if (unref(status) === "active") _push(`<span class="text-[10px] text-slate-300 tabular-nums" data-v-9995d6e9>${ssrInterpolate(unref(callTime))}</span>`);
        else _push(`<!---->`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:phone",
          class: "w-3 h-3 text-emerald-400"
        }, null, _parent));
        _push(`</div>`);
      } else _push(`<!---->`);
      if (unref(callOpen)) {
        _push(`<!--[-->`);
        ssrRenderList(unref(remoteStreams), (stream, uid) => {
          _push(`<audio${ssrRenderAttr("srcObject", stream)}${ssrIncludeBooleanAttr(unref(speakerMuted)) ? " muted" : ""} autoplay playsinline webkit-playsinline class="vc-aud vc-aud-absolute" data-v-9995d6e9></audio>`);
        });
        _push(`<!--]-->`);
      } else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup$9 = VoiceCallDock_vue_vue_type_script_setup_true_lang_default.setup;
VoiceCallDock_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/VoiceCallDock.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
var VoiceCallDock_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(VoiceCallDock_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-9995d6e9"]]), { __name: "VoiceCallDock" });
var ClockWidget_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "ClockWidget",
  __ssrInlineRender: true,
  setup(__props) {
    const now = ref(/* @__PURE__ */ new Date());
    const mode = ref("analog");
    const theme = ref("dark");
    const accent = ref("#8b5cf6");
    const accentOpen = ref(false);
    const ACCENTS = [
      "#8b5cf6",
      "#6366f1",
      "#0ea5e9",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#ec4899"
    ];
    const pad = (n) => String(n).padStart(2, "0");
    const hm = computed(() => `${pad(now.value.getHours())}:${pad(now.value.getMinutes())}`);
    const ss = computed(() => pad(now.value.getSeconds()));
    const date = computed(() => now.value.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short"
    }));
    const dayNumber = computed(() => now.value.getDate());
    const rawSeconds = computed(() => now.value.getSeconds() + now.value.getMilliseconds() / 1e3);
    const rawMinutes = computed(() => now.value.getMinutes() + rawSeconds.value / 60);
    const rawHours = computed(() => now.value.getHours() + rawMinutes.value / 60);
    const secDeg = computed(() => Math.floor(rawSeconds.value * 5) / 5 * 6);
    const minDeg = computed(() => rawMinutes.value * 6);
    const hourDeg = computed(() => rawHours.value % 12 * 30);
    const sub9Deg = computed(() => Math.floor(rawHours.value) / 24 * 360);
    const sub3Deg = computed(() => now.value.getDay() / 7 * 360);
    const sub6Deg = computed(() => Math.floor(rawSeconds.value) * 6);
    const hourIndices = Array.from({ length: 12 }, (_, k) => k + 1);
    const minuteIndices = Array.from({ length: 60 }, (_, k) => k + 1).filter((k) => k % 5 !== 0);
    const fifthIndices = Array.from({ length: 300 }, (_, k) => k + 1).filter((k) => k % 5 !== 0);
    const sub9Indices = Array.from({ length: 12 }, (_, i) => ({
      i,
      major: i % 6 === 0
    }));
    const sub3Indices = Array.from({ length: 7 }, (_, i) => ({
      i,
      major: true
    }));
    const sub6Indices = Array.from({ length: 12 }, (_, i) => ({
      i,
      major: i % 3 === 0
    }));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["clock-widget h-full w-full flex items-center justify-center overflow-hidden", unref(theme)],
        style: { "--accent-color": unref(accent) }
      }, _attrs))} data-v-f9bc318a><div class="scale-box flex flex-col items-center" style="${ssrRenderStyle({ "--s-h": unref(accentOpen) ? "215px" : "195px" })}" data-v-f9bc318a>`);
      if (unref(mode) === "digital") _push(`<div class="clock-digital" data-v-f9bc318a><p class="d-time" data-v-f9bc318a><span class="t-hm" data-v-f9bc318a>${ssrInterpolate(unref(hm))}</span><span class="t-sec" data-v-f9bc318a>:${ssrInterpolate(unref(ss))}</span></p><p class="d-date" data-v-f9bc318a>${ssrInterpolate(unref(date))}</p></div>`);
      else {
        _push(`<div class="analog-clock" data-v-f9bc318a><div class="clock-face" data-v-f9bc318a><!--[-->`);
        ssrRenderList(unref(hourIndices), (v) => {
          _push(`<span class="clock-index hour" style="${ssrRenderStyle({ "--i": v })}" data-v-f9bc318a></span>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(unref(minuteIndices), (v) => {
          _push(`<span class="clock-index minute" style="${ssrRenderStyle({ "--i": v })}" data-v-f9bc318a></span>`);
        });
        _push(`<!--]--><!--[-->`);
        ssrRenderList(unref(fifthIndices), (v) => {
          _push(`<span class="clock-index fifth" style="${ssrRenderStyle({ "--i": v })}" data-v-f9bc318a></span>`);
        });
        _push(`<!--]--><span class="clock-logo" data-v-f9bc318a>${ssrInterpolate("SYCS")}</span><div class="sub-dial sub-9" data-v-f9bc318a><!--[-->`);
        ssrRenderList(unref(sub9Indices), (t) => {
          _push(`<span class="${ssrRenderClass([{ major: t.major }, "sub-index"])}" style="${ssrRenderStyle({
            "--si": t.i,
            "--sa": "30deg"
          })}" data-v-f9bc318a></span>`);
        });
        _push(`<!--]--><span class="sub-hand" style="${ssrRenderStyle({ "--sub-angle": `${unref(sub9Deg)}deg` })}" data-v-f9bc318a></span><span class="sub-center-dot" data-v-f9bc318a></span><span class="sub-label" data-v-f9bc318a>24h</span></div><div class="sub-dial sub-3" data-v-f9bc318a><!--[-->`);
        ssrRenderList(unref(sub3Indices), (t) => {
          _push(`<span class="sub-index major" style="${ssrRenderStyle({
            "--si": t.i,
            "--sa": "51.42857142857143deg"
          })}" data-v-f9bc318a></span>`);
        });
        _push(`<!--]--><span class="sub-hand" style="${ssrRenderStyle({ "--sub-angle": `${unref(sub3Deg)}deg` })}" data-v-f9bc318a></span><span class="sub-center-dot" data-v-f9bc318a></span><span class="sub-label" data-v-f9bc318a>\u65E5</span></div><div class="sub-dial sub-6" data-v-f9bc318a><!--[-->`);
        ssrRenderList(unref(sub6Indices), (t) => {
          _push(`<span class="${ssrRenderClass([{ major: t.major }, "sub-index"])}" style="${ssrRenderStyle({
            "--si": t.i,
            "--sa": "30deg"
          })}" data-v-f9bc318a></span>`);
        });
        _push(`<!--]--><span class="sub-hand" style="${ssrRenderStyle({ "--sub-angle": `${unref(sub6Deg)}deg` })}" data-v-f9bc318a></span><span class="sub-center-dot" data-v-f9bc318a></span><span class="sub-label" data-v-f9bc318a>\u79D2</span></div><span class="sub-indi1" data-v-f9bc318a>A</span><span class="sub-indi2" data-v-f9bc318a>P</span><div class="date-window" data-v-f9bc318a><span data-v-f9bc318a>${ssrInterpolate(unref(dayNumber))}</span></div><span class="hand hour-hand" style="${ssrRenderStyle({ transform: `rotate(${unref(hourDeg)}deg)` })}" data-v-f9bc318a></span><span class="hand minute-hand" style="${ssrRenderStyle({ transform: `rotate(${unref(minDeg)}deg)` })}" data-v-f9bc318a></span><span class="hand second-hand" style="${ssrRenderStyle({ transform: `rotate(${unref(secDeg)}deg)` })}" data-v-f9bc318a></span><span class="center-dot" data-v-f9bc318a></span></div></div>`);
      }
      _push(`<div class="clock-controls" data-v-f9bc318a><div class="switch-label" data-v-f9bc318a><span class="mode-text" data-v-f9bc318a>${ssrInterpolate(unref(mode) === "analog" ? "\u30A2\u30CA\u30ED\u30B0" : "\u30C7\u30B8\u30BF\u30EB")}</span><label class="switch" data-v-f9bc318a><input type="checkbox"${ssrIncludeBooleanAttr(unref(mode) === "analog") ? " checked" : ""} data-v-f9bc318a><span class="slider" data-v-f9bc318a></span></label></div><div class="accent-picker" data-v-f9bc318a><button type="button" class="accent-dot" style="${ssrRenderStyle({ background: unref(accent) })}"${ssrRenderAttr("title", unref(accentOpen) ? "\u9589\u3058\u308B" : "\u30A4\u30E1\u30FC\u30B8\u30AB\u30E9\u30FC\u3092\u9078\u629E")} data-v-f9bc318a></button>`);
      if (unref(accentOpen)) {
        _push(`<div class="accent-pop" data-v-f9bc318a><!--[-->`);
        ssrRenderList(ACCENTS, (c) => {
          _push(`<button type="button" class="${ssrRenderClass([{ active: unref(accent) === c }, "accent-opt"])}" style="${ssrRenderStyle({ background: c })}" data-v-f9bc318a></button>`);
        });
        _push(`<!--]--></div>`);
      } else _push(`<!---->`);
      _push(`</div></div></div></div>`);
    };
  }
});
var _sfc_setup$8 = ClockWidget_vue_vue_type_script_setup_true_lang_default.setup;
ClockWidget_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/extensions/ClockWidget.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
var ClockWidget_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(ClockWidget_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-f9bc318a"]]), { __name: "ExtensionsClockWidget" });
var NOTES_KEY = "sycs:quick-notes";
var NotesWidget_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "NotesWidget",
  __ssrInlineRender: true,
  setup(__props) {
    const text = ref("");
    const saved = ref(false);
    let savedTimer = null;
    watch(text, (value) => {
      localStorage.setItem(NOTES_KEY, value);
      saved.value = true;
      if (savedTimer) clearTimeout(savedTimer);
      savedTimer = setTimeout(() => {
        saved.value = false;
      }, 1200);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full flex flex-col" }, _attrs))}><textarea placeholder="\u30E1\u30E2\u3092\u5165\u529B..." class="flex-1 min-h-0 w-full bg-transparent resize-none border-none focus:ring-0 text-sm text-slate-200 placeholder-slate-600 p-3 leading-relaxed">${ssrInterpolate(unref(text))}</textarea><div class="px-3 py-1.5 border-t border-slate-800/70 flex items-center justify-between shrink-0"><span class="text-[10px] text-slate-500">${ssrInterpolate(unref(text).length)} \u6587\u5B57</span><span class="${ssrRenderClass([unref(saved) ? "opacity-100" : "opacity-0", "text-[10px] text-emerald-400 flex items-center gap-1 transition"])}">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:check",
        class: "w-3 h-3"
      }, null, _parent));
      _push(` \u4FDD\u5B58\u3057\u307E\u3057\u305F </span></div></div>`);
    };
  }
});
var _sfc_setup$7 = NotesWidget_vue_vue_type_script_setup_true_lang_default.setup;
NotesWidget_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/extensions/NotesWidget.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
var NotesWidget_default = Object.assign(NotesWidget_vue_vue_type_script_setup_true_lang_default, { __name: "ExtensionsNotesWidget" });
var TrendingWidget_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "TrendingWidget",
  __ssrInlineRender: true,
  setup(__props) {
    const posts = ref([]);
    const loading = ref(true);
    const error = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full flex flex-col" }, _attrs))}><div class="px-3 py-2 border-b border-slate-800/70 flex items-center gap-2 shrink-0"><span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex-1">\u3044\u307E\u4EBA\u6C17</span><button class="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition" title="\u66F4\u65B0">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:refresh-ccw",
        class: ["w-3.5 h-3.5", { "animate-spin": unref(loading) }]
      }, null, _parent));
      _push(`</button></div><div class="flex-1 overflow-y-auto min-h-0 p-2 space-y-1">`);
      if (unref(loading)) {
        _push(`<div class="space-y-2 p-1"><!--[-->`);
        ssrRenderList(5, (i) => {
          _push(`<div class="h-9 rounded-lg bg-slate-800/50 animate-pulse"></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(error)) _push(`<p class="text-xs text-slate-500 text-center py-6">\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F</p>`);
      else if (!unref(posts).length) _push(`<p class="text-xs text-slate-500 text-center py-6">\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093</p>`);
      else {
        _push(`<!--[-->`);
        ssrRenderList(unref(posts), (p, i) => {
          var _a;
          _push(`<div class="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition"><span class="text-xs font-bold text-slate-600 w-4 shrink-0 text-right mt-0.5">${ssrInterpolate(i + 1)}</span><div class="min-w-0 flex-1"><p class="text-xs text-slate-200 line-clamp-2 break-words">${ssrInterpolate(p.content || "\uFF08\u30E1\u30C7\u30A3\u30A2\u6295\u7A3F\uFF09")}</p><p class="text-[10px] text-slate-500 truncate mt-0.5">${ssrInterpolate((_a = p.user) == null ? void 0 : _a.displayName)} \xB7 \u{1F600} ${ssrInterpolate((p.reactions || []).reduce((n, r) => n + (r.count || 0), 0))}</p></div></div>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</div></div>`);
    };
  }
});
var _sfc_setup$6 = TrendingWidget_vue_vue_type_script_setup_true_lang_default.setup;
TrendingWidget_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/extensions/TrendingWidget.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
var TrendingWidget_default = Object.assign(TrendingWidget_vue_vue_type_script_setup_true_lang_default, { __name: "ExtensionsTrendingWidget" });
var EXTENSION_CATALOG = [
  {
    id: "clock",
    name: "\u6642\u8A08",
    description: "\u73FE\u5728\u306E\u6642\u523B\u3068\u65E5\u4ED8\u3092\u8868\u793A\u3057\u307E\u3059",
    icon: "lucide:clock",
    accent: "from-sky-500/20 to-indigo-500/10",
    size: {
      w: 240,
      h: 240
    }
  },
  {
    id: "notes",
    name: "\u30AF\u30A4\u30C3\u30AF\u30E1\u30E2",
    description: "\u601D\u3044\u3064\u3044\u305F\u3053\u3068\u3092\u3059\u3050\u66F8\u304D\u7559\u3081\u307E\u3059",
    icon: "lucide:sticky-note",
    accent: "from-amber-500/20 to-orange-500/10",
    size: {
      w: 280,
      h: 260
    }
  },
  {
    id: "trending",
    name: "\u30C8\u30EC\u30F3\u30C9",
    description: "\u3044\u307E\u4EBA\u6C17\u306E\u6295\u7A3F\u3092\u30EA\u30A2\u30EB\u30BF\u30A4\u30E0\u8868\u793A\u3057\u307E\u3059",
    icon: "lucide:trending-up",
    accent: "from-fuchsia-500/20 to-rose-500/10",
    size: {
      w: 320,
      h: 380
    }
  }
];
function defaultState() {
  return {
    installed: [],
    windows: [],
    layout: {
      sidebar: true,
      mediaPane: true
    },
    zTop: 100
  };
}
function loadState() {
  return defaultState();
}
function catalogOf(extId) {
  return EXTENSION_CATALOG.find((e) => e.id === extId);
}
function useWorkbench() {
  const initial = loadState();
  const installed = useState("wb:installed", () => initial.installed);
  const windows = useState("wb:windows", () => initial.windows);
  const layout = useState("wb:layout", () => initial.layout);
  const zTop = useState("wb:ztop", () => initial.zTop);
  function isInstalled(extId) {
    return installed.value.includes(extId);
  }
  function isOpen(extId) {
    return windows.value.some((w) => w.extId === extId && !w.minimized);
  }
  function nextZ() {
    zTop.value += 1;
    return zTop.value;
  }
  function openWindow(extId) {
    var _a;
    const existing = windows.value.find((w) => w.extId === extId);
    if (existing) windows.value = windows.value.map((w) => w.id === existing.id ? {
      ...w,
      minimized: false,
      z: nextZ()
    } : w);
    else {
      const size = ((_a = catalogOf(extId)) == null ? void 0 : _a.size) || {
        w: 280,
        h: 240
      };
      const offset = windows.value.length % 6 * 28;
      let x = 96 + offset;
      let y = 96 + offset;
      windows.value = [...windows.value, {
        id: `${extId}-${Date.now().toString(36)}`,
        extId,
        x,
        y,
        w: size.w,
        h: size.h,
        z: nextZ(),
        minimized: false
      }];
    }
  }
  function install(extId) {
    if (!isInstalled(extId)) installed.value = [...installed.value, extId];
    openWindow(extId);
  }
  function uninstall(extId) {
    installed.value = installed.value.filter((id) => id !== extId);
    windows.value = windows.value.filter((w) => w.extId !== extId);
  }
  function closeWindow(winId) {
    windows.value = windows.value.filter((w) => w.id !== winId);
  }
  function minimizeWindow(winId) {
    windows.value = windows.value.map((w) => w.id === winId ? {
      ...w,
      minimized: true
    } : w);
  }
  function focusWindow(winId) {
    windows.value = windows.value.map((w) => w.id === winId ? {
      ...w,
      z: nextZ()
    } : w);
  }
  function moveWindow(winId, x, y) {
    windows.value = windows.value.map((w) => w.id === winId ? {
      ...w,
      x,
      y
    } : w);
  }
  function resizeWindow(winId, w, h) {
    windows.value = windows.value.map((win) => win.id === winId ? {
      ...win,
      w,
      h
    } : win);
  }
  function commit() {
  }
  function setLayout(patch) {
    layout.value = {
      ...layout.value,
      ...patch
    };
  }
  function resetAll() {
    installed.value = [];
    windows.value = [];
    layout.value = {
      sidebar: true,
      mediaPane: true
    };
    zTop.value = 100;
  }
  return {
    installed,
    windows,
    layout,
    EXTENSION_CATALOG,
    isInstalled,
    isOpen,
    install,
    uninstall,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    commit,
    setLayout,
    resetAll
  };
}
var ExtensionWindow_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "ExtensionWindow",
  __ssrInlineRender: true,
  props: { win: {} },
  setup(__props) {
    const props = __props;
    useWorkbench();
    const WIDGETS = {
      clock: ClockWidget_default,
      notes: NotesWidget_default,
      trending: TrendingWidget_default
    };
    const ACCENTS = {
      clock: "bg-gradient-to-br from-sky-500/40 to-indigo-500/10",
      notes: "bg-gradient-to-br from-amber-500/40 to-orange-500/10",
      trending: "bg-gradient-to-br from-fuchsia-500/40 to-rose-500/10"
    };
    const def = computed(() => EXTENSION_CATALOG.find((e) => e.id === props.win.extId) || null);
    const widget = computed(() => WIDGETS[props.win.extId] || null);
    const dragging = ref(false);
    const resizing = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["fixed flex flex-col rounded-xl border border-slate-700 bg-[#121826]/95 backdrop-blur-md shadow-2xl overflow-hidden", unref(dragging) || unref(resizing) ? "select-none" : ""],
        style: {
          left: __props.win.x + "px",
          top: __props.win.y + "px",
          width: __props.win.w + "px",
          height: __props.win.h + "px",
          zIndex: __props.win.z
        }
      }, _attrs))}><div class="h-9 px-2.5 flex items-center gap-2 border-b border-slate-800 cursor-move shrink-0 bg-slate-900/60"><div class="${ssrRenderClass([ACCENTS[__props.win.extId] || "bg-slate-700", "w-5 h-5 rounded-md flex items-center justify-center shrink-0"])}">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: ((_a = unref(def)) == null ? void 0 : _a.icon) || "lucide:puzzle",
        class: "w-3 h-3 text-white"
      }, null, _parent));
      _push(`</div><span class="text-xs font-bold text-white truncate flex-1">${ssrInterpolate(((_b = unref(def)) == null ? void 0 : _b.name) || "\u30A6\u30A3\u30F3\u30C9\u30A6")}</span><button type="button" class="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-700 transition" title="\u6700\u5C0F\u5316">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:minus",
        class: "w-3.5 h-3.5"
      }, null, _parent));
      _push(`</button><button type="button" class="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition" title="\u9589\u3058\u308B">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:x",
        class: "w-3.5 h-3.5"
      }, null, _parent));
      _push(`</button></div><div class="flex-1 min-h-0">`);
      if (unref(widget)) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(widget)), null, null), _parent);
      else _push(`<p class="text-xs text-slate-500 text-center py-6">\u3053\u306E\u62E1\u5F35\u6A5F\u80FD\u306F\u5229\u7528\u3067\u304D\u307E\u305B\u3093</p>`);
      _push(`</div><div class="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"></div></div>`);
    };
  }
});
var _sfc_setup$5 = ExtensionWindow_vue_vue_type_script_setup_true_lang_default.setup;
ExtensionWindow_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ExtensionWindow.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
var ExtensionWindow_default = Object.assign(ExtensionWindow_vue_vue_type_script_setup_true_lang_default, { __name: "ExtensionWindow" });
var WorkbenchFooter_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "WorkbenchFooter",
  __ssrInlineRender: true,
  setup(__props) {
    const wb = useWorkbench();
    const { windows, layout, isInstalled } = wb;
    const { width: paneWidth} = useMediaPane();
    const open = ref(false);
    const ACCENTS = {
      clock: "bg-gradient-to-br from-sky-500/40 to-indigo-500/10",
      notes: "bg-gradient-to-br from-amber-500/40 to-orange-500/10",
      trending: "bg-gradient-to-br from-fuchsia-500/40 to-rose-500/10"
    };
    const installedCount = computed(() => wb.installed.value.length);
    const openCount = computed(() => windows.value.filter((w) => !w.minimized).length);
    const dockItems = computed(() => wb.installed.value.map((id) => EXTENSION_CATALOG.find((e) => e.id === id)).filter(Boolean));
    function windowOf(extId) {
      return windows.value.find((w) => w.extId === extId);
    }
    function isActive(extId) {
      return !!windowOf(extId) && !windowOf(extId).minimized;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_ExtensionWindow = ExtensionWindow_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "hidden min-[681px]:block" }, _attrs))} data-v-630b61b2><div class="fixed bottom-0 left-0 right-0 h-[30px] bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-800 z-[60] flex items-center px-3" data-v-630b61b2><div class="w-48 min-[1024px]:w-60 shrink-0 flex items-center gap-2 text-[10px] text-slate-600" data-v-630b61b2>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:layout-grid",
        class: "w-3 h-3"
      }, null, _parent));
      _push(`<span data-v-630b61b2>\u30EF\u30FC\u30AF\u30D9\u30F3\u30C1</span></div><div class="flex-1 flex items-center justify-center gap-1.5 min-w-0" data-v-630b61b2><div${ssrRenderAttrs({
        name: "deck",
        class: "flex items-center gap-1.5 min-w-0 overflow-x-auto"
      })} data-v-630b61b2>`);
      ssrRenderList(unref(dockItems), (ext) => {
        _push(`<button class="${ssrRenderClass([isActive(ext.id) ? "bg-indigo-600/40 ring-1 ring-indigo-400/60" : "bg-slate-800/70 hover:bg-slate-700", "group relative h-[24px] w-[30px] rounded-md flex items-center justify-center transition shrink-0"])}"${ssrRenderAttr("title", `${ext.name}${isActive(ext.id) ? "\uFF08\u8868\u793A\u4E2D\uFF09" : ""}`)} data-v-630b61b2>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: ext.icon,
          class: ["w-3.5 h-3.5", isActive(ext.id) ? "text-white" : "text-slate-400 group-hover:text-white"]
        }, null, _parent));
        _push(`<span class="${ssrRenderClass([windowOf(ext.id) ? isActive(ext.id) ? "w-4 bg-indigo-400" : "w-2 bg-slate-500" : "w-0", "absolute -bottom-px left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all"])}" data-v-630b61b2></span></button>`);
      });
      _push(`</div><button class="group relative h-[30px] w-[54px] flex items-center justify-center wb-hex shrink-0"${ssrRenderAttr("title", unref(open) ? "\u30E1\u30CB\u30E5\u30FC\u3092\u9589\u3058\u308B" : "\u62E1\u5F35\u6A5F\u80FD\u30FB\u30A6\u30A3\u30F3\u30C9\u30A6")} data-v-630b61b2><span class="wb-hex-inner absolute inset-0 flex items-center justify-center" data-v-630b61b2>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:plus",
        class: ["w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-300", unref(open) ? "rotate-45 text-indigo-400" : "group-hover:scale-110"]
      }, null, _parent));
      _push(`</span></button></div><div class="w-48 min-[1024px]:w-60 shrink-0 flex items-center justify-end gap-3 text-[10px] text-slate-600" data-v-630b61b2>`);
      if (unref(installedCount)) _push(`<span data-v-630b61b2>\u62E1\u5F35 ${ssrInterpolate(unref(installedCount))}</span>`);
      else _push(`<!---->`);
      if (unref(openCount)) _push(`<span data-v-630b61b2>\u30A6\u30A3\u30F3\u30C9\u30A6 ${ssrInterpolate(unref(openCount))}</span>`);
      else _push(`<!---->`);
      _push(`</div></div>`);
      if (unref(open)) _push(`<div class="fixed inset-0 z-[199]" data-v-630b61b2></div>`);
      else _push(`<!---->`);
      if (unref(open)) {
        _push(`<div class="fixed bottom-[38px] left-1/2 -translate-x-1/2 w-[440px] max-w-[92vw] max-h-[70vh] overflow-y-auto bg-[#151a24] border border-slate-700 rounded-2xl shadow-2xl z-[200]" data-v-630b61b2><div class="px-4 py-3 border-b border-slate-800 flex items-center gap-2" data-v-630b61b2>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:blocks",
          class: "w-4 h-4 text-indigo-400"
        }, null, _parent));
        _push(`<h3 class="text-sm font-bold text-white flex-1" data-v-630b61b2>\u30EF\u30FC\u30AF\u30D9\u30F3\u30C1</h3><button class="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition" data-v-630b61b2>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button></div><div class="p-4 border-b border-slate-800" data-v-630b61b2><p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3" data-v-630b61b2>\u30A6\u30A3\u30F3\u30C9\u30A6\u306E\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA</p><div class="space-y-1.5" data-v-630b61b2><button class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition text-left" data-v-630b61b2>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:panel-left",
          class: "w-4 h-4 text-slate-400 shrink-0"
        }, null, _parent));
        _push(`<span class="text-sm text-slate-200 flex-1" data-v-630b61b2>\u5DE6\u30B5\u30A4\u30C9\u30D0\u30FC</span><span class="${ssrRenderClass([unref(layout).sidebar ? "bg-indigo-600" : "bg-slate-700", "w-9 h-5 rounded-full transition relative shrink-0"])}" data-v-630b61b2><span class="${ssrRenderClass([unref(layout).sidebar ? "left-[18px]" : "left-0.5", "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"])}" data-v-630b61b2></span></span></button><button class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition text-left" data-v-630b61b2>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:panel-right",
          class: "w-4 h-4 text-slate-400 shrink-0"
        }, null, _parent));
        _push(`<span class="text-sm text-slate-200 flex-1" data-v-630b61b2>\u30E1\u30C7\u30A3\u30A2\u30D1\u30CD\u30EB</span><span class="${ssrRenderClass([unref(layout).mediaPane ? "bg-indigo-600" : "bg-slate-700", "w-9 h-5 rounded-full transition relative shrink-0"])}" data-v-630b61b2><span class="${ssrRenderClass([unref(layout).mediaPane ? "left-[18px]" : "left-0.5", "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"])}" data-v-630b61b2></span></span></button><div class="${ssrRenderClass([unref(layout).mediaPane ? "" : "opacity-40 pointer-events-none", "px-3 py-2"])}" data-v-630b61b2><div class="flex items-center justify-between mb-1.5" data-v-630b61b2><span class="text-xs text-slate-400" data-v-630b61b2>\u30E1\u30C7\u30A3\u30A2\u30D1\u30CD\u30EB\u306E\u5E45</span><span class="text-xs text-slate-500 tabular-nums" data-v-630b61b2>${ssrInterpolate(unref(paneWidth))}px</span></div><input type="range" min="320" max="900" step="10"${ssrRenderAttr("value", unref(paneWidth))} class="w-full accent-indigo-500" data-v-630b61b2></div><button class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition text-left" data-v-630b61b2>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:rotate-ccw",
          class: "w-4 h-4 text-slate-400 shrink-0"
        }, null, _parent));
        _push(`<span class="text-sm text-slate-400 flex-1" data-v-630b61b2>\u3059\u3079\u3066\u65E2\u5B9A\u306B\u623B\u3059</span></button></div></div><div class="p-4" data-v-630b61b2><p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3" data-v-630b61b2>\u62E1\u5F35\u6A5F\u80FD</p><div class="space-y-1" data-v-630b61b2><!--[-->`);
        ssrRenderList(unref(EXTENSION_CATALOG), (ext) => {
          _push(`<div class="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800/40 transition" data-v-630b61b2><div class="${ssrRenderClass([ACCENTS[ext.id] || "bg-slate-700", "w-8 h-8 rounded-lg flex items-center justify-center shrink-0"])}" data-v-630b61b2>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: ext.icon,
            class: "w-4 h-4 text-white"
          }, null, _parent));
          _push(`</div><div class="min-w-0 flex-1" data-v-630b61b2><p class="text-sm text-white font-medium truncate" data-v-630b61b2>${ssrInterpolate(ext.name)}</p><p class="text-[11px] text-slate-500 truncate" data-v-630b61b2>${ssrInterpolate(ext.description)}</p></div>`);
          if (unref(isInstalled)(ext.id)) _push(`<button class="text-[11px] text-slate-500 hover:text-red-400 transition shrink-0" data-v-630b61b2> \u524A\u9664 </button>`);
          else _push(`<!---->`);
          _push(`<button class="${ssrRenderClass([unref(isInstalled)(ext.id) ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-indigo-600 text-white hover:bg-indigo-700", "px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0"])}" data-v-630b61b2>${ssrInterpolate(unref(isInstalled)(ext.id) ? "\u958B\u304F" : "\u8FFD\u52A0")}</button></div>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else _push(`<!---->`);
      _push(`<!--[-->`);
      ssrRenderList(unref(windows), (w) => {
        _push(ssrRenderComponent(_component_ExtensionWindow, {
          style: !w.minimized ? null : { display: "none" },
          key: w.id,
          win: w
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});
var _sfc_setup$4 = WorkbenchFooter_vue_vue_type_script_setup_true_lang_default.setup;
WorkbenchFooter_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/WorkbenchFooter.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
var WorkbenchFooter_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(WorkbenchFooter_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-630b61b2"]]), { __name: "WorkbenchFooter" });
var AddToPlaylistModal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "AddToPlaylistModal",
  __ssrInlineRender: true,
  setup(__props) {
    const { playlists, addTarget, fetchList} = usePlaylists();
    const newName = ref("");
    const busyId = ref("");
    const creating = ref(false);
    const error = ref("");
    watch(addTarget, async (post) => {
      if (!post) return;
      newName.value = "";
      error.value = "";
      await fetchList(true, post.id);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(addTarget)) {
          _push2(`<div class="fixed inset-0 z-[300] flex items-end min-[681px]:items-center justify-center bg-black/60 p-0 min-[681px]:p-4"><div class="w-full min-[681px]:max-w-sm bg-slate-900 border border-slate-800 rounded-t-2xl min-[681px]:rounded-2xl shadow-2xl max-h-[80vh] flex flex-col"><div class="flex items-center justify-between px-4 py-3 border-b border-slate-800"><h3 class="font-bold text-white">\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u306B\u8FFD\u52A0</h3><button class="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:x",
            class: "w-5 h-5"
          }, null, _parent));
          _push2(`</button></div><div class="flex-1 overflow-y-auto p-2">`);
          if (!unref(playlists).length) _push2(`<p class="text-center text-slate-500 text-sm py-6">\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u304C\u3042\u308A\u307E\u305B\u3093</p>`);
          else _push2(`<!---->`);
          _push2(`<!--[-->`);
          ssrRenderList(unref(playlists), (list) => {
            _push2(`<button${ssrIncludeBooleanAttr(unref(busyId) === list.id) ? " disabled" : ""} class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition text-left disabled:opacity-50"><span class="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">`);
            if (list.coverUrl) _push2(`<img${ssrRenderAttr("src", list.coverUrl)} class="w-full h-full object-cover">`);
            else _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:list-video",
              class: "w-5 h-5 text-slate-500"
            }, null, _parent));
            _push2(`</span><span class="flex-1 min-w-0"><span class="block text-sm text-white truncate">${ssrInterpolate(list.name)}</span><span class="block text-xs text-slate-500">${ssrInterpolate(list.count)} \u4EF6</span></span><span class="${ssrRenderClass([list.contains ? "bg-indigo-600 border-indigo-500" : "border-slate-600", "w-5 h-5 rounded-md border flex items-center justify-center shrink-0"])}">`);
            if (list.contains) _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:check",
              class: "w-3.5 h-3.5 text-white"
            }, null, _parent));
            else _push2(`<!---->`);
            _push2(`</span></button>`);
          });
          _push2(`<!--]--></div><div class="border-t border-slate-800 p-3 space-y-2"><div class="flex items-center gap-2"><input${ssrRenderAttr("value", unref(newName))} placeholder="\u65B0\u3057\u3044\u30D7\u30EC\u30A4\u30EA\u30B9\u30C8" maxlength="60" class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0"><button${ssrIncludeBooleanAttr(unref(creating) || !unref(newName).trim()) ? " disabled" : ""} class="px-3 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50 shrink-0">${ssrInterpolate(unref(creating) ? "..." : "\u4F5C\u6210")}</button></div>`);
          if (unref(error)) _push2(`<p class="text-xs text-red-400">${ssrInterpolate(unref(error))}</p>`);
          else _push2(`<!---->`);
          _push2(`</div></div></div>`);
        } else _push2(`<!---->`);
      }, "body", false, _parent);
    };
  }
});
var _sfc_setup$3 = AddToPlaylistModal_vue_vue_type_script_setup_true_lang_default.setup;
AddToPlaylistModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AddToPlaylistModal.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var AddToPlaylistModal_default = Object.assign(AddToPlaylistModal_vue_vue_type_script_setup_true_lang_default, { __name: "AddToPlaylistModal" });
var QuoteComposerModal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "QuoteComposerModal",
  __ssrInlineRender: true,
  setup(__props) {
    const { closeQuote} = useQuoteComposer();
    useMediaPane();
    const route = useRoute();
    watch(() => route.fullPath, () => closeQuote());
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = ClientOnly;
      ssrRenderTeleport(_push, (_push2) => {
        _push2(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      }, "body", false, _parent);
    };
  }
});
var _sfc_setup$2 = QuoteComposerModal_vue_vue_type_script_setup_true_lang_default.setup;
QuoteComposerModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/QuoteComposerModal.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var QuoteComposerModal_default = Object.assign(QuoteComposerModal_vue_vue_type_script_setup_true_lang_default, { __name: "QuoteComposerModal" });
var AccountSwitcher_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "AccountSwitcher",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const { accounts} = useAccounts();
    useRouter();
    const currentUserId = ref(void 0);
    const switching = ref(null);
    ref(false);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      ssrRenderTeleport(_push, (_push2) => {
        _push2(`<div class="fixed inset-0 z-[180] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/60"></div><div class="relative bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden"><div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between"><h3 class="font-bold text-white flex items-center gap-2">`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "lucide:user-round-cog",
          class: "w-5 h-5 text-indigo-400"
        }, null, _parent));
        _push2(` \u30A2\u30AB\u30A6\u30F3\u30C8\u5207\u308A\u66FF\u3048 </h3><button class="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition">`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-4 h-4"
        }, null, _parent));
        _push2(`</button></div><div class="p-3 max-h-[60vh] overflow-y-auto space-y-1.5">`);
        if (unref(error)) _push2(`<p class="px-3 py-2 text-sm text-red-400">${ssrInterpolate(unref(error))}</p>`);
        else _push2(`<!---->`);
        _push2(`<!--[-->`);
        ssrRenderList(unref(accounts), (acc) => {
          var _a;
          _push2(`<button class="${ssrRenderClass([acc.id === unref(currentUserId) ? "bg-indigo-600/15 ring-1 ring-indigo-500/50" : "hover:bg-slate-800/50", "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left"])}">`);
          if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(acc.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(acc.avatarUrl))} class="w-9 h-9 rounded-full object-cover shrink-0">`);
          else _push2(`<div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">${ssrInterpolate(((_a = acc.displayName) == null ? void 0 : _a.charAt(0)) || "?")}</div>`);
          _push2(`<div class="flex-1 min-w-0"><p class="text-sm font-bold text-white truncate flex items-center gap-2">${ssrInterpolate(acc.displayName)} `);
          if (acc.id === unref(currentUserId)) _push2(`<span class="text-[10px] font-bold text-indigo-300 bg-indigo-600/20 px-1.5 py-0.5 rounded-full">\u73FE\u5728</span>`);
          else _push2(`<!---->`);
          _push2(`</p><p class="text-xs text-slate-500 truncate">@${ssrInterpolate(acc.username)}</p></div>`);
          if (unref(switching) === acc.id) _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:loader-2",
            class: "w-4 h-4 text-indigo-400 animate-spin shrink-0"
          }, null, _parent));
          else if (acc.id !== unref(currentUserId)) _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:repeat-2",
            class: "w-4 h-4 text-slate-600 shrink-0"
          }, null, _parent));
          else _push2(`<!---->`);
          if (acc.id !== unref(currentUserId)) {
            _push2(`<button class="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition shrink-0" title="\u3053\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u524A\u9664">`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:trash-2",
              class: "w-3.5 h-3.5"
            }, null, _parent));
            _push2(`</button>`);
          } else _push2(`<!---->`);
          _push2(`</button>`);
        });
        _push2(`<!--]--><button class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800/50 transition border border-dashed border-slate-700"><div class="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0">`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "lucide:plus",
          class: "w-4 h-4"
        }, null, _parent));
        _push2(`</div><span class="text-sm font-medium">\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u8FFD\u52A0</span></button></div><div class="px-5 py-3 border-t border-slate-800 text-[11px] text-slate-600"> \u4FDD\u5B58\u3055\u308C\u305F\u30A2\u30AB\u30A6\u30F3\u30C8\u306F\u3053\u306E\u30D6\u30E9\u30A6\u30B6\u5185\u306B\u306E\u307F\u4FDD\u7BA1\u3055\u308C\u307E\u3059 </div></div></div>`);
      }, "body", false, _parent);
    };
  }
});
var _sfc_setup$1 = AccountSwitcher_vue_vue_type_script_setup_true_lang_default.setup;
AccountSwitcher_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AccountSwitcher.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var AccountSwitcher_default = Object.assign(AccountSwitcher_vue_vue_type_script_setup_true_lang_default, { __name: "AccountSwitcher" });
function useMediaQuery(query) {
  return ref(false);
}
function useIsDesktop() {
  return useMediaQuery();
}
var default_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const isServerPage = computed(() => route.path.startsWith("/servers/") && !!route.params.id);
    const isDesktop = useIsDesktop();
    const workbench = useWorkbench();
    const { layout } = workbench;
    const serverCache = ref(null);
    watch(useMediaPane().selected, (post) => {
      if (post && !workbench.layout.value.mediaPane) workbench.setLayout({ mediaPane: true });
    });
    async function loadServerHeader() {
      if (!isServerPage.value) {
        serverCache.value = null;
        return;
      }
      const id = route.params.id;
      try {
        const data = await $fetch$1(`/api/servers/${id}`);
        serverCache.value = data.server;
      } catch {
        serverCache.value = null;
      }
    }
    watch(isServerPage, loadServerHeader, { immediate: true });
    watch(() => route.params.id, loadServerHeader);
    const { on } = useRealtime();
    let offRealtime = [];
    const { switcherOpen, closeSwitcher } = useAccounts();
    const customEmojis = useCustomEmojis();
    on("emoji.new", () => customEmojis.refresh()), on("emoji.deleted", () => customEmojis.refresh());
    watch(isServerPage, (v) => {
      offRealtime.forEach((off) => off());
      offRealtime = [];
      if (v) offRealtime = [on("server.updated", (p) => {
        if (route.params.id && p.serverId === route.params.id) loadServerHeader();
      }), on("server.deleted", (p) => {
        if (route.params.id && p.serverId === route.params.id) serverCache.value = null;
      })];
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppHeader = AppHeader_default;
      const _component_SidebarLeft = SidebarLeft_default;
      const _component_MediaDetailPane = MediaDetailPane_default;
      const _component_MobileNav = MobileNav_default;
      const _component_MediaMiniPlayer = MediaMiniPlayer_default;
      const _component_VoiceCallDock = VoiceCallDock_default;
      const _component_WorkbenchFooter = WorkbenchFooter_default;
      const _component_AddToPlaylistModal = AddToPlaylistModal_default;
      const _component_QuoteComposerModal = QuoteComposerModal_default;
      const _component_AccountSwitcher = AccountSwitcher_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#0b0f19] text-slate-100 [--app-footer-h:0px] min-[681px]:[--app-footer-h:30px]" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AppHeader, {
        "is-server-page": unref(isServerPage),
        server: unref(serverCache),
        class: "sticky top-0 z-50 bg-[#0b0f19] border-b border-slate-800"
      }, null, _parent));
      _push(`<div class="flex">`);
      if (unref(layout).sidebar) _push(ssrRenderComponent(_component_SidebarLeft, { class: "hidden min-[681px]:flex w-48 min-[1024px]:w-60 border-r border-slate-800 sticky top-14" }, null, _parent));
      else _push(`<!---->`);
      _push(`<main class="flex-1 min-w-0 h-[calc(100vh-56px-var(--app-footer-h))] overflow-y-auto">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      if (unref(isDesktop) && unref(layout).mediaPane) _push(ssrRenderComponent(_component_MediaDetailPane, null, null, _parent));
      else _push(`<!---->`);
      _push(`</div>`);
      _push(ssrRenderComponent(_component_MobileNav, { class: "min-[681px]:hidden" }, null, _parent));
      if (!unref(isDesktop)) _push(ssrRenderComponent(_component_MediaMiniPlayer, null, null, _parent));
      else _push(`<!---->`);
      _push(ssrRenderComponent(_component_VoiceCallDock, null, null, _parent));
      _push(ssrRenderComponent(_component_WorkbenchFooter, null, null, _parent));
      _push(ssrRenderComponent(_component_AddToPlaylistModal, null, null, _parent));
      _push(ssrRenderComponent(_component_QuoteComposerModal, null, null, _parent));
      if (unref(switcherOpen)) _push(ssrRenderComponent(_component_AccountSwitcher, { onClose: unref(closeSwitcher) }, null, _parent));
      else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup = default_vue_vue_type_script_setup_true_lang_default.setup;
default_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var default_default = default_vue_vue_type_script_setup_true_lang_default;

export { default_default as default };
//# sourceMappingURL=default-4UAR5yJt.mjs.map
