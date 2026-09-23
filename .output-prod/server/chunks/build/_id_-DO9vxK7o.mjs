import { _ as _plugin_vue_export_helper_default, a as useRoute, c as components_default, $ as $fetch$1, n as navigateTo } from '../virtual/entry.mjs';
import { N as NuxtLink } from './nuxt-link-DHTgvg7C.mjs';
import { a as avatarSrc } from './avatar-BGDIRQ_Q.mjs';
import { u as useMediaPane } from './useMediaPane-CJDvgIq6.mjs';
import { u as useInfiniteScroll } from './useInfiniteScroll-pgXZQZjZ.mjs';
import { u as useVoiceCall } from './useVoiceCall-c99S1h1A.mjs';
import { P as PostItem_default } from './PostItem-B40v-dca.mjs';
import { P as PostComposer_default } from './PostComposer-L8NEzlos.mjs';
import { defineComponent, computed, ref, watch, mergeProps, unref, withCtx, createTextVNode, reactive, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderTeleport, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
import './interval-T_Je0Yfm.mjs';
import './UserTitle-CTUBxh5l.mjs';
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

var PERMISSIONS = {
  VIEW_CHANNEL: 1,
  SEND_MESSAGES: 2,
  MANAGE_MESSAGES: 4,
  CREATE_INVITE: 8,
  MANAGE_INVITES: 16,
  KICK_MEMBERS: 32,
  MANAGE_MEMBERS: 64,
  MANAGE_CHANNELS: 128,
  MANAGE_ROLES: 256,
  MANAGE_SERVER: 512,
  ADMINISTRATOR: 1024
};
function hasPermission(mask, perm) {
  return (mask != null ? mask : 0) > 0 && (mask & perm) === perm;
}
var PERMISSION_GROUPS = [
  {
    label: "\u4E00\u822C",
    permissions: [
      {
        key: "VIEW_CHANNEL",
        label: "\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u898B\u308B",
        description: "\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u95B2\u89A7\u3067\u304D\u307E\u3059"
      },
      {
        key: "SEND_MESSAGES",
        label: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1",
        description: "\u30C1\u30E3\u30F3\u30CD\u30EB\u306B\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3067\u304D\u307E\u3059"
      },
      {
        key: "MANAGE_MESSAGES",
        label: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u7BA1\u7406",
        description: "\u30E1\u30C3\u30BB\u30FC\u30B8\u306E\u524A\u9664\u30FB\u7DE8\u96C6\u304C\u3067\u304D\u307E\u3059"
      }
    ]
  },
  {
    label: "\u30E1\u30F3\u30D0\u30FC\u7BA1\u7406",
    permissions: [
      {
        key: "CREATE_INVITE",
        label: "\u62DB\u5F85\u3092\u4F5C\u6210",
        description: "\u62DB\u5F85\u30EA\u30F3\u30AF\u3092\u4F5C\u6210\u3067\u304D\u307E\u3059"
      },
      {
        key: "MANAGE_INVITES",
        label: "\u62DB\u5F85\u3092\u7BA1\u7406",
        description: "\u62DB\u5F85\u30EA\u30F3\u30AF\u306E\u4F5C\u6210\u30FB\u524A\u9664\u304C\u3067\u304D\u307E\u3059"
      },
      {
        key: "KICK_MEMBERS",
        label: "\u30E1\u30F3\u30D0\u30FC\u3092\u30AD\u30C3\u30AF",
        description: "\u30E1\u30F3\u30D0\u30FC\u3092\u30B5\u30FC\u30D0\u30FC\u304B\u3089\u9000\u51FA\u3055\u305B\u3089\u308C\u307E\u3059"
      },
      {
        key: "MANAGE_MEMBERS",
        label: "\u30E1\u30F3\u30D0\u30FC\u3092\u7BA1\u7406",
        description: "\u30ED\u30FC\u30EB\u306E\u4ED8\u4E0E\u3084\u30CB\u30C3\u30AF\u30CD\u30FC\u30E0\u306E\u5909\u66F4\u304C\u3067\u304D\u307E\u3059"
      }
    ]
  },
  {
    label: "\u30B5\u30FC\u30D0\u30FC\u7BA1\u7406",
    permissions: [
      {
        key: "MANAGE_CHANNELS",
        label: "\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u7BA1\u7406",
        description: "\u30C1\u30E3\u30F3\u30CD\u30EB\u306E\u4F5C\u6210\u30FB\u7DE8\u96C6\u30FB\u524A\u9664\u304C\u3067\u304D\u307E\u3059"
      },
      {
        key: "MANAGE_ROLES",
        label: "\u30ED\u30FC\u30EB\u3092\u7BA1\u7406",
        description: "\u30ED\u30FC\u30EB\u306E\u4F5C\u6210\u30FB\u7DE8\u96C6\u30FB\u524A\u9664\u304C\u3067\u304D\u307E\u3059"
      },
      {
        key: "MANAGE_SERVER",
        label: "\u30B5\u30FC\u30D0\u30FC\u3092\u7BA1\u7406",
        description: "\u30B5\u30FC\u30D0\u30FC\u8A2D\u5B9A\u3084\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u8A2D\u5B9A\u3092\u5909\u66F4\u3067\u304D\u307E\u3059"
      },
      {
        key: "ADMINISTRATOR",
        label: "\u7BA1\u7406\u8005",
        description: "\u3053\u306E\u30ED\u30FC\u30EB\u306B\u3059\u3079\u3066\u306E\u6A29\u9650\u3092\u4E0E\u3048\u307E\u3059"
      }
    ]
  }
];
var inputCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none";
var labelCls = "text-xs text-slate-500 font-medium block mb-1";
var btnPrimary = "px-4 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50";
var btnGhost = "px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white transition";
var ServerSettingsModal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "ServerSettingsModal",
  __ssrInlineRender: true,
  props: {
    serverId: {},
    server: {},
    channels: {},
    roles: {},
    members: {},
    myPermissions: {},
    isOwner: { type: Boolean },
    initialTab: {},
    initialChannelId: {}
  },
  emits: [
    "close",
    "refresh",
    "deleted"
  ],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const tab = ref(props.initialTab || "overview");
    const tabs = [
      {
        key: "overview",
        label: "\u6982\u8981",
        icon: "lucide:settings"
      },
      {
        key: "channels",
        label: "\u30C1\u30E3\u30F3\u30CD\u30EB",
        icon: "lucide:hash"
      },
      {
        key: "roles",
        label: "\u30ED\u30FC\u30EB",
        icon: "lucide:shield"
      },
      {
        key: "members",
        label: "\u30E1\u30F3\u30D0\u30FC",
        icon: "lucide:users"
      },
      {
        key: "invites",
        label: "\u62DB\u5F85",
        icon: "lucide:link"
      }
    ];
    const can = {
      server: () => props.isOwner || hasPermission(props.myPermissions, PERMISSIONS.MANAGE_SERVER),
      channels: () => props.isOwner || hasPermission(props.myPermissions, PERMISSIONS.MANAGE_CHANNELS),
      roles: () => props.isOwner || hasPermission(props.myPermissions, PERMISSIONS.MANAGE_ROLES),
      members: () => props.isOwner || hasPermission(props.myPermissions, PERMISSIONS.MANAGE_MEMBERS),
      invites: () => props.isOwner || hasPermission(props.myPermissions, PERMISSIONS.MANAGE_INVITES)
    };
    const saving = ref(false);
    const notice = ref(null);
    const noticeError = ref(null);
    watch(() => props.serverId, () => {
      if (props.initialTab) tab.value = props.initialTab;
    });
    const form = reactive({
      name: "",
      description: "",
      isPublic: true
    });
    watch(() => props.server, (s) => {
      if (s) {
        form.name = s.name || "";
        form.description = s.description || "";
        form.isPublic = s.isPublic !== false;
      }
    }, { immediate: true });
    const newChannel = reactive({
      name: "",
      description: "",
      type: "text"
    });
    const expandedChannelId = ref(null);
    const channelDrafts = reactive({});
    const channelTypes = [
      {
        key: "text",
        label: "\u30C6\u30AD\u30B9\u30C8",
        icon: "lucide:hash"
      },
      {
        key: "video",
        label: "\u52D5\u753B",
        icon: "lucide:video"
      },
      {
        key: "music",
        label: "\u97F3\u697D",
        icon: "lucide:music"
      },
      {
        key: "gallery",
        label: "\u753B\u50CF",
        icon: "lucide:image"
      },
      {
        key: "model",
        label: "3D\u30E2\u30C7\u30EB",
        icon: "lucide:box"
      },
      {
        key: "file",
        label: "\u30D5\u30A1\u30A4\u30EB",
        icon: "lucide:paperclip"
      },
      {
        key: "voice",
        label: "\u97F3\u58F0",
        icon: "lucide:volume-2"
      }
    ];
    const CHANNEL_ICONS = {
      text: "lucide:hash",
      video: "lucide:video",
      music: "lucide:music",
      gallery: "lucide:image",
      model: "lucide:box",
      file: "lucide:paperclip",
      voice: "lucide:volume-2"
    };
    function channelTypeIcon(type) {
      return CHANNEL_ICONS[type || "text"] || "lucide:hash";
    }
    const CHANNEL_TYPE_LABEL = {
      video: "\u52D5\u753B",
      music: "\u97F3\u697D",
      gallery: "\u753B\u50CF",
      model: "3D\u30E2\u30C7\u30EB",
      file: "\u30D5\u30A1\u30A4\u30EB",
      voice: "\u97F3\u58F0"
    };
    function channelTypeLabel(type) {
      return CHANNEL_TYPE_LABEL[type || "text"] || "";
    }
    function draftOf(ch) {
      if (!channelDrafts[ch.id]) channelDrafts[ch.id] = {
        name: ch.name,
        type: ch.type || "text",
        description: ch.description || "",
        slowModeSeconds: ch.slowModeSeconds || 0,
        nsfw: !!ch.nsfw
      };
      return channelDrafts[ch.id];
    }
    const newRoleName = ref("");
    const newRoleColor = ref("#6366f1");
    const selectedRoleId = ref(null);
    const roleDraft = reactive({
      name: "",
      color: "#99aab5",
      mask: 0,
      isAdmin: false
    });
    const selectedRole = computed(() => props.roles.find((r) => r.id === selectedRoleId.value) || null);
    const memberDrafts = reactive({});
    function memberDraftOf(member) {
      if (!memberDrafts[member.userId]) memberDrafts[member.userId] = {
        nickname: member.nickname || "",
        roleId: member.roleId || ""
      };
      return memberDrafts[member.userId];
    }
    const assignableRoles = computed(() => props.roles.filter((r) => !r.isAdmin));
    const invites = ref([]);
    const inviteForm = reactive({
      maxUses: 0,
      expiresInHours: 0
    });
    const copiedCode = ref(null);
    async function loadInvites() {
      try {
        const res = await $fetch$1(`/api/servers/${props.serverId}/invites`);
        invites.value = res.invites;
      } catch {
        invites.value = [];
      }
    }
    function expiresLabel(invite) {
      if (!invite.expiresAt) return "\u671F\u9650\u306A\u3057";
      return `\u301C ${new Date(invite.expiresAt).toLocaleDateString("ja-JP")}`;
    }
    watch(tab, async (t) => {
      if (t === "invites") await loadInvites();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      ssrRenderTeleport(_push, (_push2) => {
        var _a, _b, _c, _d;
        _push2(`<div class="fixed inset-0 z-[90] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/60"></div><div class="relative bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden"><div class="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0"><h2 class="text-lg font-bold text-white">\u30B5\u30FC\u30D0\u30FC\u8A2D\u5B9A</h2><button class="text-slate-500 hover:text-white transition">`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-5 h-5"
        }, null, _parent));
        _push2(`</button></div><div class="flex flex-1 min-h-0"><div class="w-44 shrink-0 border-r border-slate-800 p-3 space-y-1 overflow-y-auto"><!--[-->`);
        ssrRenderList(tabs, (t) => {
          _push2(`<button class="${ssrRenderClass([unref(tab) === t.key ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50", "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition"])}">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: t.icon,
            class: "w-4 h-4"
          }, null, _parent));
          _push2(` ${ssrInterpolate(t.label)}</button>`);
        });
        _push2(`<!--]--></div><div class="flex-1 min-w-0 overflow-y-auto p-5">`);
        if (unref(notice)) _push2(`<div class="mb-4 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-sm text-green-400">${ssrInterpolate(unref(notice))}</div>`);
        else _push2(`<!---->`);
        if (unref(noticeError)) _push2(`<div class="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">${ssrInterpolate(unref(noticeError))}</div>`);
        else _push2(`<!---->`);
        if (unref(tab) === "overview") {
          _push2(`<!--[--><h3 class="text-lg font-bold text-white mb-1">\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u8A2D\u5B9A</h3><p class="text-sm text-slate-500 mb-5">\u30B5\u30FC\u30D0\u30FC\u306E\u57FA\u672C\u60C5\u5831\u3068\u516C\u958B\u8A2D\u5B9A\u3092\u7BA1\u7406\u3057\u307E\u3059\u3002</p><div class="flex items-center gap-5 mb-6"><div class="relative w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden shrink-0">`);
          if ((_a = __props.server) == null ? void 0 : _a.iconUrl) _push2(`<img${ssrRenderAttr("src", __props.server.iconUrl)} class="w-full h-full object-cover">`);
          else _push2(`<!--[-->${ssrInterpolate((_c = (_b = __props.server) == null ? void 0 : _b.name) == null ? void 0 : _c.charAt(0))}<!--]-->`);
          _push2(`</div><div class="flex flex-col gap-2">`);
          if (can.server()) {
            _push2(`<label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 transition w-fit">`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:image",
              class: "w-3.5 h-3.5"
            }, null, _parent));
            _push2(` \u30A2\u30A4\u30B3\u30F3\u3092\u5909\u66F4 <input type="file" accept="image/*" class="hidden"></label>`);
          } else _push2(`<!---->`);
          _push2(`<span class="text-[11px] text-slate-600">\u6B63\u65B9\u5F62\u753B\u50CF\uFF08256\xD7256\uFF09</span></div></div><div class="${ssrRenderClass([can.server() ? "" : "pointer-events-none opacity-60", "space-y-4"])}"><div><label class="labelCls">\u30B5\u30FC\u30D0\u30FC\u540D</label><input${ssrRenderAttr("value", unref(form).name)} class="${ssrRenderClass(inputCls)}" maxlength="100"></div><div><label class="labelCls">\u8AAC\u660E</label><textarea rows="3" class="${ssrRenderClass(inputCls)}" placeholder="\u30B5\u30FC\u30D0\u30FC\u306E\u8AAC\u660E" maxlength="500">${ssrInterpolate(unref(form).description)}</textarea></div><div class="flex items-center justify-between bg-slate-800/50 border border-slate-800 rounded-lg px-4 py-3"><div><p class="text-sm font-bold text-white">\u516C\u958B\u30B5\u30FC\u30D0\u30FC</p><p class="text-xs text-slate-500 mt-0.5">\u30AA\u30F3\u306B\u3059\u308B\u3068\u30B5\u30FC\u30D0\u30FC\u3092\u516C\u958B\u3057\u3001\u8AB0\u3067\u3082\u62DB\u5F85\u30EA\u30F3\u30AF\u304B\u3089\u53C2\u52A0\u3067\u304D\u307E\u3059</p></div><button type="button" role="switch"${ssrRenderAttr("aria-checked", unref(form).isPublic)} class="${ssrRenderClass([unref(form).isPublic ? "bg-indigo-600" : "bg-slate-700", "w-11 h-6 rounded-full transition relative shrink-0"])}"><span class="${ssrRenderClass([unref(form).isPublic ? "left-[22px]" : "left-0.5", "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"])}"></span></button></div><div><label class="labelCls">\u30D0\u30CA\u30FC\u753B\u50CF</label><div class="relative h-24 rounded-xl overflow-hidden border border-slate-800">`);
          if ((_d = __props.server) == null ? void 0 : _d.bannerUrl) _push2(`<img${ssrRenderAttr("src", __props.server.bannerUrl)} class="w-full h-full object-cover">`);
          else _push2(`<div class="w-full h-full flex items-center justify-center text-slate-600 text-xs bg-slate-800/40">\u30D0\u30CA\u30FC\u672A\u8A2D\u5B9A</div>`);
          _push2(`<label class="absolute bottom-2 right-2 cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-xs text-white hover:bg-black/80 transition">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:upload",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push2(` \u5909\u66F4 <input type="file" accept="image/*" class="hidden"></label></div><p class="text-[11px] text-slate-600 mt-1">\u6A2A\u9577\u753B\u50CF\uFF081600\xD7450\uFF09\u304C\u304A\u3059\u3059\u3081\u3067\u3059</p></div></div>`);
          if (can.server()) _push2(`<div class="flex justify-end gap-2 mt-6"><button class="${ssrRenderClass(btnGhost)}">\u30AD\u30E3\u30F3\u30BB\u30EB</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="${ssrRenderClass(btnPrimary)}">\u4FDD\u5B58</button></div>`);
          else _push2(`<!---->`);
          if (__props.isOwner) _push2(`<div class="border-t border-slate-800 mt-8 pt-5"><h4 class="text-sm font-bold text-red-400 mb-2">\u5371\u967A\u30BE\u30FC\u30F3</h4><p class="text-xs text-slate-500 mb-3">\u30B5\u30FC\u30D0\u30FC\u3092\u524A\u9664\u3059\u308B\u3068\u3001\u3059\u3079\u3066\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u30FB\u30E1\u30C3\u30BB\u30FC\u30B8\u30FB\u30E1\u30F3\u30D0\u30FC\u60C5\u5831\u304C\u524A\u9664\u3055\u308C\u307E\u3059\u3002</p><button class="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 text-sm hover:bg-red-600/30 transition border border-red-600/30"> \u30B5\u30FC\u30D0\u30FC\u3092\u524A\u9664 </button></div>`);
          else _push2(`<!---->`);
          _push2(`<!--]-->`);
        } else _push2(`<!---->`);
        if (unref(tab) === "channels") {
          _push2(`<!--[--><h3 class="text-lg font-bold text-white mb-1">\u30C1\u30E3\u30F3\u30CD\u30EB\u8A2D\u5B9A</h3><p class="text-sm text-slate-500 mb-5">\u30C1\u30E3\u30F3\u30CD\u30EB\u306E\u4F5C\u6210\u30FB\u7DE8\u96C6\u30FB\u524A\u9664\u304C\u3067\u304D\u307E\u3059\u3002</p>`);
          if (can.channels()) {
            _push2(`<div class="bg-slate-800/30 border border-slate-800 rounded-xl p-4 mb-4 space-y-2.5"><p class="text-sm font-bold text-slate-400">\u65B0\u3057\u3044\u30C1\u30E3\u30F3\u30CD\u30EB</p><div class="flex gap-2"><input${ssrRenderAttr("value", unref(newChannel).name)} class="${ssrRenderClass(inputCls)}" placeholder="\u30C1\u30E3\u30F3\u30CD\u30EB\u540D" maxlength="50"></div><div class="flex items-center gap-2"><div class="flex rounded-lg bg-slate-800 border border-slate-700 p-0.5"><!--[-->`);
            ssrRenderList(channelTypes, (t) => {
              _push2(`<button type="button" class="${ssrRenderClass([unref(newChannel).type === t.key ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200", "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition"])}">`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: t.icon,
                class: "w-3.5 h-3.5"
              }, null, _parent));
              _push2(` ${ssrInterpolate(t.label)}</button>`);
            });
            _push2(`<!--]--></div><input${ssrRenderAttr("value", unref(newChannel).description)} class="${ssrRenderClass(inputCls)}" placeholder="\u8AAC\u660E\uFF08\u4EFB\u610F\uFF09" maxlength="200"><button${ssrIncludeBooleanAttr(!unref(newChannel).name.trim()) ? " disabled" : ""} class="${ssrRenderClass([btnPrimary, "shrink-0"])}">\u4F5C\u6210</button></div></div>`);
          } else _push2(`<!---->`);
          _push2(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(__props.channels, (ch) => {
            _push2(`<div class="bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden"><div class="flex items-center gap-2 px-4 py-3">`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: channelTypeIcon(ch.type),
              class: "w-4 h-4 text-slate-500 shrink-0"
            }, null, _parent));
            _push2(`<span class="text-sm font-bold text-white flex-1 truncate">${ssrInterpolate(ch.name)}</span>`);
            if (channelTypeLabel(ch.type)) _push2(`<span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded px-1.5 py-0.5">${ssrInterpolate(channelTypeLabel(ch.type))}</span>`);
            else _push2(`<!---->`);
            if (ch.nsfw) _push2(`<span class="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded px-1.5 py-0.5">NSFW</span>`);
            else _push2(`<!---->`);
            if (ch.slowModeSeconds > 0) _push2(`<span class="text-[10px] text-slate-500">\u30B9\u30ED\u30FC\u30E2\u30FC\u30C9 ${ssrInterpolate(ch.slowModeSeconds)}s</span>`);
            else _push2(`<!---->`);
            if (can.channels()) {
              _push2(`<button class="text-slate-500 hover:text-white transition">`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: unref(expandedChannelId) === ch.id ? "lucide:chevron-up" : "lucide:settings-2",
                class: "w-4 h-4"
              }, null, _parent));
              _push2(`</button>`);
            } else _push2(`<!---->`);
            _push2(`</div>`);
            if (unref(expandedChannelId) === ch.id && can.channels()) {
              _push2(`<div class="border-t border-slate-800 p-4 space-y-3"><div><label class="${ssrRenderClass(labelCls)}">\u30C1\u30E3\u30F3\u30CD\u30EB\u540D</label><input${ssrRenderAttr("value", draftOf(ch).name)} class="${ssrRenderClass(inputCls)}" maxlength="50"></div><div><label class="${ssrRenderClass(labelCls)}">\u30C1\u30E3\u30F3\u30CD\u30EB\u30BF\u30A4\u30D7</label><div class="flex rounded-lg bg-slate-800 border border-slate-700 p-0.5 w-fit"><!--[-->`);
              ssrRenderList(channelTypes, (t) => {
                _push2(`<button type="button" class="${ssrRenderClass([draftOf(ch).type === t.key ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200", "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition"])}">`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: t.icon,
                  class: "w-3.5 h-3.5"
                }, null, _parent));
                _push2(` ${ssrInterpolate(t.label)}</button>`);
              });
              _push2(`<!--]--></div>`);
              if (draftOf(ch).type === "voice") _push2(`<p class="text-[11px] text-emerald-500 mt-1">\u97F3\u58F0\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F\u901A\u8A71\u306B\u53C2\u52A0\u3067\u304D\u307E\u3059\u3002\u30E1\u30C3\u30BB\u30FC\u30B8\u306F\u8868\u793A\u3055\u308C\u307E\u305B\u3093\u3002</p>`);
              else if (draftOf(ch).type === "video") _push2(`<p class="text-[11px] text-indigo-400 mt-1">\u52D5\u753B\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F\u52D5\u753B\u3092\u4E2D\u5FC3\u306B\u6295\u7A3F\u3067\u304D\u307E\u3059\u3002</p>`);
              else if (draftOf(ch).type === "music") _push2(`<p class="text-[11px] text-indigo-400 mt-1">\u97F3\u697D\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F\u97F3\u58F0\u30D5\u30A1\u30A4\u30EB\u3092\u4E2D\u5FC3\u306B\u6295\u7A3F\u3067\u304D\u307E\u3059\u3002</p>`);
              else if (draftOf(ch).type === "gallery") _push2(`<p class="text-[11px] text-indigo-400 mt-1">\u753B\u50CF\u30AE\u30E3\u30E9\u30EA\u30FC\u3067\u306F\u753B\u50CF\u3092\u4E2D\u5FC3\u306B\u6295\u7A3F\u3067\u304D\u307E\u3059\u3002</p>`);
              else if (draftOf(ch).type === "model") _push2(`<p class="text-[11px] text-indigo-400 mt-1">3D\u30E2\u30C7\u30EB\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F .glb / .gltf \u306A\u3069\u306E3D\u30E2\u30C7\u30EB\u3092\u6295\u7A3F\u30FB\u95B2\u89A7\u3067\u304D\u307E\u3059\u3002</p>`);
              else if (draftOf(ch).type === "file") _push2(`<p class="text-[11px] text-indigo-400 mt-1">\u30D5\u30A1\u30A4\u30EB\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F PDF\u30FBZIP \u306A\u3069\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u5171\u6709\u3067\u304D\u307E\u3059\u3002</p>`);
              else _push2(`<!---->`);
              _push2(`</div><div><label class="${ssrRenderClass(labelCls)}">\u8AAC\u660E</label><input${ssrRenderAttr("value", draftOf(ch).description)} class="${ssrRenderClass(inputCls)}" maxlength="200"></div><div class="grid grid-cols-2 gap-3"><div><label class="${ssrRenderClass(labelCls)}">\u30B9\u30ED\u30FC\u30E2\u30FC\u30C9\uFF08\u79D2\uFF09</label><input${ssrRenderAttr("value", draftOf(ch).slowModeSeconds)} type="number" min="0" max="21600" class="${ssrRenderClass(inputCls)}"></div><div class="flex items-end pb-1"><button type="button" role="switch"${ssrRenderAttr("aria-checked", draftOf(ch).nsfw)} class="${ssrRenderClass([draftOf(ch).nsfw ? "bg-red-600" : "bg-slate-700", "w-11 h-6 rounded-full transition relative"])}"><span class="${ssrRenderClass([draftOf(ch).nsfw ? "left-[22px]" : "left-0.5", "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"])}"></span></button><span class="text-sm text-slate-400 ml-2">NSFW\u30C1\u30E3\u30F3\u30CD\u30EB</span></div></div><div class="flex justify-end gap-2 pt-1"><button class="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-xs hover:bg-red-600/30 transition border border-red-600/30"> \u524A\u9664 </button><button class="px-4 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition">\u4FDD\u5B58</button></div></div>`);
            } else _push2(`<!---->`);
            _push2(`</div>`);
          });
          _push2(`<!--]-->`);
          if (!__props.channels.length) _push2(`<p class="text-sm text-slate-500 text-center py-6">\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u3042\u308A\u307E\u305B\u3093</p>`);
          else _push2(`<!---->`);
          _push2(`</div><!--]-->`);
        } else _push2(`<!---->`);
        if (unref(tab) === "roles") {
          _push2(`<!--[--><h3 class="text-lg font-bold text-white mb-1">\u30ED\u30FC\u30EB\u3068\u6A29\u9650</h3><p class="text-sm text-slate-500 mb-5">\u30ED\u30FC\u30EB\u3092\u4F5C\u6210\u3057\u3001\u8A73\u7D30\u306A\u6A29\u9650\u3092\u8A2D\u5B9A\u3067\u304D\u307E\u3059\u3002</p><div class="grid grid-cols-[180px_1fr] gap-4"><div class="space-y-1"><!--[-->`);
          ssrRenderList(__props.roles, (role) => {
            _push2(`<div class="${ssrRenderClass([unref(selectedRoleId) === role.id ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50", "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition"])}"><span class="w-3 h-3 rounded-full shrink-0" style="${ssrRenderStyle({ backgroundColor: role.color || "#6366f1" })}"></span><span class="text-sm truncate">${ssrInterpolate(role.name)}</span></div>`);
          });
          _push2(`<!--]-->`);
          if (can.roles()) _push2(`<div class="border-t border-slate-800 pt-3 mt-3 space-y-2"><input${ssrRenderAttr("value", unref(newRoleName))} class="${ssrRenderClass(inputCls)}" placeholder="\u65B0\u3057\u3044\u30ED\u30FC\u30EB\u540D" maxlength="30"><div class="flex gap-2 items-center"><input${ssrRenderAttr("value", unref(newRoleColor))} type="color" class="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"><button${ssrIncludeBooleanAttr(!unref(newRoleName).trim()) ? " disabled" : ""} class="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50">\u30ED\u30FC\u30EB\u3092\u4F5C\u6210</button></div></div>`);
          else _push2(`<!---->`);
          _push2(`</div><div class="bg-slate-800/30 border border-slate-800 rounded-xl p-4 min-h-[300px]">`);
          if (unref(selectedRole)) {
            _push2(`<!--[--><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><span class="w-4 h-4 rounded-full" style="${ssrRenderStyle({ backgroundColor: unref(roleDraft).color })}"></span><span class="font-bold text-white">${ssrInterpolate(unref(roleDraft).name)}</span></div>`);
            if (can.roles()) {
              _push2(`<div class="flex gap-2">`);
              if (!unref(roleDraft).isAdmin) {
                _push2(`<button class="text-slate-500 hover:text-red-400 transition">`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "lucide:trash-2",
                  class: "w-4 h-4"
                }, null, _parent));
                _push2(`</button>`);
              } else _push2(`<!---->`);
              _push2(`<button class="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition">\u4FDD\u5B58</button></div>`);
            } else _push2(`<!---->`);
            _push2(`</div>`);
            if (can.roles()) _push2(`<div class="grid grid-cols-2 gap-3 mb-4"><div><label class="${ssrRenderClass(labelCls)}">\u30ED\u30FC\u30EB\u540D</label><input${ssrRenderAttr("value", unref(roleDraft).name)} class="${ssrRenderClass(inputCls)}" maxlength="30"></div><div><label class="${ssrRenderClass(labelCls)}">\u8272</label><input${ssrRenderAttr("value", unref(roleDraft).color)} type="color" class="w-full h-10 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"></div></div>`);
            else _push2(`<!---->`);
            if (unref(roleDraft).isAdmin) {
              _push2(`<p class="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-3">`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:crown",
                class: "w-3.5 h-3.5 inline mr-1"
              }, null, _parent));
              _push2(` \u7BA1\u7406\u8005\u30ED\u30FC\u30EB\u306F\u3059\u3079\u3066\u306E\u6A29\u9650\u3092\u6301\u3061\u3001\u6A29\u9650\u3092\u7DE8\u96C6\u3067\u304D\u307E\u305B\u3093\u3002 </p>`);
            } else _push2(`<!---->`);
            if (can.roles() && !unref(roleDraft).isAdmin) {
              _push2(`<div><!--[-->`);
              ssrRenderList(unref(PERMISSION_GROUPS), (group) => {
                _push2(`<div class="mb-4"><p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">${ssrInterpolate(group.label)}</p><div class="space-y-1"><!--[-->`);
                ssrRenderList(group.permissions, (p) => {
                  _push2(`<button class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition text-left"><span class="${ssrRenderClass([(unref(roleDraft).mask & unref(PERMISSIONS)[p.key]) === unref(PERMISSIONS)[p.key] ? "bg-indigo-600 border-indigo-500" : "border-slate-600", "w-5 h-5 rounded-md border flex items-center justify-center shrink-0"])}">`);
                  if ((unref(roleDraft).mask & unref(PERMISSIONS)[p.key]) === unref(PERMISSIONS)[p.key]) _push2(ssrRenderComponent(_component_Icon, {
                    name: "lucide:check",
                    class: "w-3.5 h-3.5 text-white"
                  }, null, _parent));
                  else _push2(`<!---->`);
                  _push2(`</span><span><span class="block text-sm text-slate-200">${ssrInterpolate(p.label)}</span><span class="block text-xs text-slate-500">${ssrInterpolate(p.description)}</span></span></button>`);
                });
                _push2(`<!--]--></div></div>`);
              });
              _push2(`<!--]--></div>`);
            } else _push2(`<!---->`);
            if (!can.roles() && !unref(roleDraft).isAdmin) _push2(`<p class="text-xs text-slate-500"> \u30ED\u30FC\u30EB\u3092\u7DE8\u96C6\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u73FE\u5728\u306E\u6A29\u9650\u306F\u8AAD\u307F\u53D6\u308A\u5C02\u7528\u3067\u3059\u3002 </p>`);
            else _push2(`<!---->`);
            _push2(`<!--]-->`);
          } else _push2(`<p class="text-sm text-slate-500 text-center py-10">\u30ED\u30FC\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044</p>`);
          _push2(`</div></div><!--]-->`);
        } else _push2(`<!---->`);
        if (unref(tab) === "members") {
          _push2(`<!--[--><h3 class="text-lg font-bold text-white mb-1">\u30E1\u30F3\u30D0\u30FC\u7BA1\u7406</h3><p class="text-sm text-slate-500 mb-5">${ssrInterpolate(__props.members.length)} \u4EBA\u306E\u30E1\u30F3\u30D0\u30FC</p><div class="space-y-2"><!--[-->`);
          ssrRenderList(__props.members, (member) => {
            var _a2, _b2, _c2, _d2, _e, _f, _g;
            _push2(`<div class="bg-slate-800/40 border border-slate-800 rounded-xl p-3"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">`);
            if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = member.user) == null ? void 0 : _a2.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(member.user.avatarUrl))} class="w-full h-full object-cover">`);
            else _push2(`<!--[-->${ssrInterpolate(((_c2 = (_b2 = member.user) == null ? void 0 : _b2.displayName) == null ? void 0 : _c2.charAt(0)) || "?")}<!--]-->`);
            _push2(`</div><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="text-sm font-bold text-white truncate">${ssrInterpolate(((_d2 = member.user) == null ? void 0 : _d2.displayName) || member.nickname || "\u4E0D\u660E")}</span>`);
            if (member.role) _push2(`<span class="text-[11px] px-2 py-0.5 rounded-full" style="${ssrRenderStyle({
              color: member.role.color || "#99aab5",
              backgroundColor: (member.role.color || "#99aab5") + "22"
            })}">${ssrInterpolate(member.role.name)}</span>`);
            else _push2(`<!---->`);
            if (((_e = __props.server) == null ? void 0 : _e.ownerId) === member.userId) _push2(`<span class="text-[11px] text-amber-400">\u6240\u6709\u8005</span>`);
            else _push2(`<!---->`);
            _push2(`</div><p class="text-xs text-slate-500 truncate">@${ssrInterpolate((_f = member.user) == null ? void 0 : _f.username)}</p></div></div>`);
            if (can.members() && ((_g = __props.server) == null ? void 0 : _g.ownerId) !== member.userId) {
              _push2(`<div class="flex flex-wrap items-end gap-2 mt-3 pt-3 border-t border-slate-800"><div class="flex-1 min-w-[140px]"><label class="${ssrRenderClass(labelCls)}">\u30CB\u30C3\u30AF\u30CD\u30FC\u30E0</label><input${ssrRenderAttr("value", memberDraftOf(member).nickname)} class="${ssrRenderClass(inputCls)}" placeholder="\u30B5\u30FC\u30D0\u30FC\u5185\u30CB\u30C3\u30AF\u30CD\u30FC\u30E0" maxlength="30"></div><div class="min-w-[140px]"><label class="${ssrRenderClass(labelCls)}">\u30ED\u30FC\u30EB</label><select class="${ssrRenderClass(inputCls)}"><option value=""${ssrIncludeBooleanAttr(Array.isArray(memberDraftOf(member).roleId) ? ssrLooseContain(memberDraftOf(member).roleId, "") : ssrLooseEqual(memberDraftOf(member).roleId, "")) ? " selected" : ""}>\uFF08\u30ED\u30FC\u30EB\u306A\u3057\uFF09</option><!--[-->`);
              ssrRenderList(unref(assignableRoles), (r) => {
                _push2(`<option${ssrRenderAttr("value", r.id)}${ssrIncludeBooleanAttr(Array.isArray(memberDraftOf(member).roleId) ? ssrLooseContain(memberDraftOf(member).roleId, r.id) : ssrLooseEqual(memberDraftOf(member).roleId, r.id)) ? " selected" : ""}>${ssrInterpolate(r.name)}</option>`);
              });
              _push2(`<!--]--></select></div><button class="px-3 py-2 rounded-lg bg-red-600/20 text-red-400 text-xs hover:bg-red-600/30 transition border border-red-600/30 shrink-0"> \u30AD\u30C3\u30AF </button><button class="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0">\u4FDD\u5B58</button></div>`);
            } else _push2(`<!---->`);
            _push2(`</div>`);
          });
          _push2(`<!--]--></div><!--]-->`);
        } else _push2(`<!---->`);
        if (unref(tab) === "invites") {
          _push2(`<!--[--><h3 class="text-lg font-bold text-white mb-1">\u62DB\u5F85</h3><p class="text-sm text-slate-500 mb-5">\u62DB\u5F85\u30EA\u30F3\u30AF\u3092\u4F5C\u6210\u30FB\u7BA1\u7406\u3067\u304D\u307E\u3059\u3002</p>`);
          if (can.invites()) {
            _push2(`<div class="bg-slate-800/30 border border-slate-800 rounded-xl p-4 mb-4 space-y-3"><div class="grid grid-cols-2 gap-3"><div><label class="${ssrRenderClass(labelCls)}">\u6700\u5927\u4F7F\u7528\u56DE\u6570\uFF080 = \u7121\u5236\u9650\uFF09</label><input${ssrRenderAttr("value", unref(inviteForm).maxUses)} type="number" min="0" class="${ssrRenderClass(inputCls)}"></div><div><label class="${ssrRenderClass(labelCls)}">\u6709\u52B9\u6642\u9593\uFF08\u6642\u9593 / 0 = \u7121\u671F\u9650\uFF09</label><input${ssrRenderAttr("value", unref(inviteForm).expiresInHours)} type="number" min="0" class="${ssrRenderClass(inputCls)}"></div></div><button class="${ssrRenderClass([btnPrimary, "w-full flex items-center justify-center gap-1.5"])}">`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:plus",
              class: "w-4 h-4"
            }, null, _parent));
            _push2(` \u62DB\u5F85\u30EA\u30F3\u30AF\u3092\u4F5C\u6210 </button></div>`);
          } else _push2(`<!---->`);
          _push2(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(invites), (invite) => {
            _push2(`<div class="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-center gap-3"><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><code class="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-indigo-400 text-sm">${ssrInterpolate(invite.code)}</code>`);
            if (invite.useCount >= invite.maxUses && invite.maxUses > 0) _push2(`<span class="text-[10px] font-bold text-red-400">\u6E80\u4E86</span>`);
            else _push2(`<!---->`);
            _push2(`</div><p class="text-xs text-slate-500 mt-1.5"> \u4F7F\u7528: ${ssrInterpolate(invite.useCount)}${ssrInterpolate(invite.maxUses > 0 ? ` / ${invite.maxUses}` : "")} \u56DE \xB7 ${ssrInterpolate(expiresLabel(invite))}</p></div><button class="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 transition shrink-0">${ssrInterpolate(unref(copiedCode) === invite.code ? "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F" : "\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC")}</button>`);
            if (can.invites()) {
              _push2(`<button class="text-slate-500 hover:text-red-400 transition shrink-0">`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:trash-2",
                class: "w-4 h-4"
              }, null, _parent));
              _push2(`</button>`);
            } else _push2(`<!---->`);
            _push2(`</div>`);
          });
          _push2(`<!--]-->`);
          if (!unref(invites).length) _push2(`<p class="text-sm text-slate-500 text-center py-6">\u62DB\u5F85\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093</p>`);
          else _push2(`<!---->`);
          _push2(`</div><!--]-->`);
        } else _push2(`<!---->`);
        _push2(`</div></div></div></div>`);
      }, "body", false, _parent);
    };
  }
});
var _sfc_setup$1 = ServerSettingsModal_vue_vue_type_script_setup_true_lang_default.setup;
ServerSettingsModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ServerSettingsModal.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var ServerSettingsModal_default = Object.assign(ServerSettingsModal_vue_vue_type_script_setup_true_lang_default, { __name: "ServerSettingsModal" });
var _id__vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const serverId = computed(() => route.params.id);
    const server = ref(null);
    const channels = ref([]);
    const members = ref([]);
    const roles = ref([]);
    const posts = ref([]);
    const loading = ref(true);
    const loadError = ref(null);
    const activeChannelId = ref(null);
    const showMemberList = ref(false);
    const showSettings = ref(false);
    const settingsTab = ref("overview");
    const settingsChannelId = ref(null);
    const posting = ref(false);
    const postOffset = ref(0);
    const postHasMore = ref(true);
    const { loading: loadingMorePosts, reset: resetPostScroll } = useInfiniteScroll(async () => {
      return await loadPosts(false);
    });
    const mediaPane = useMediaPane();
    const voice = useVoiceCall();
    const { presence: voicePresence } = voice;
    const voiceChannelId = ref(null);
    const CHANNEL_META = {
      text: {
        label: "\u30C6\u30AD\u30B9\u30C8\u30C1\u30E3\u30F3\u30CD\u30EB",
        icon: "lucide:hash"
      },
      video: {
        label: "\u52D5\u753B\u30C1\u30E3\u30F3\u30CD\u30EB",
        icon: "lucide:video"
      },
      music: {
        label: "\u97F3\u697D\u30C1\u30E3\u30F3\u30CD\u30EB",
        icon: "lucide:music"
      },
      gallery: {
        label: "\u753B\u50CF\u30AE\u30E3\u30E9\u30EA\u30FC",
        icon: "lucide:image"
      },
      model: {
        label: "3D\u30E2\u30C7\u30EB\u30C1\u30E3\u30F3\u30CD\u30EB",
        icon: "lucide:box"
      },
      file: {
        label: "\u30D5\u30A1\u30A4\u30EB\u30C1\u30E3\u30F3\u30CD\u30EB",
        icon: "lucide:paperclip"
      }
    };
    const textChannels = computed(() => channels.value.filter((c) => c.type !== "voice"));
    const voiceChannels = computed(() => channels.value.filter((c) => c.type === "voice"));
    const groupedChannels = computed(() => {
      const groups = [];
      for (const type of [
        "text",
        "video",
        "music",
        "gallery",
        "model",
        "file"
      ]) {
        const list = channels.value.filter((c) => (c.type || "text") === type);
        if (list.length) groups.push({
          type,
          ...CHANNEL_META[type] || CHANNEL_META.text,
          channels: list
        });
      }
      return groups;
    });
    const myPermissions = ref(0);
    const isOwner = ref(false);
    const activeChannel = computed(() => channels.value.find((c) => c.id === activeChannelId.value));
    const canSend = computed(() => isOwner.value || hasPermission(myPermissions.value, PERMISSIONS.SEND_MESSAGES));
    const canManage = computed(() => isOwner.value || hasPermission(myPermissions.value, PERMISSIONS.MANAGE_CHANNELS) || hasPermission(myPermissions.value, PERMISSIONS.MANAGE_ROLES) || hasPermission(myPermissions.value, PERMISSIONS.MANAGE_MEMBERS) || hasPermission(myPermissions.value, PERMISSIONS.MANAGE_INVITES) || hasPermission(myPermissions.value, PERMISSIONS.MANAGE_SERVER));
    const composerMediaKind = computed(() => {
      var _a;
      const t = (_a = activeChannel.value) == null ? void 0 : _a.type;
      if (t === "video") return "video";
      if (t === "gallery") return "image";
      if (t === "music") return "audio";
      if (t === "model") return "model";
      if (t === "file") return "file";
      return "any";
    });
    function channelIcon(type) {
      var _a;
      return ((_a = CHANNEL_META[type || "text"]) == null ? void 0 : _a.icon) || "lucide:hash";
    }
    async function fetchServerData() {
      const data = await $fetch$1(`/api/servers/${serverId.value}`);
      server.value = data.server;
      channels.value = data.channels;
      members.value = data.members;
      roles.value = data.roles;
      myPermissions.value = data.myPermissions || 0;
      isOwner.value = !!data.isOwner;
      if (textChannels.value.length && !textChannels.value.some((c) => c.id === activeChannelId.value)) activeChannelId.value = textChannels.value[0].id;
      if (activeChannelId.value) await loadPosts();
      if (voiceChannelId.value && !voiceChannels.value.some((c) => c.id === voiceChannelId.value)) {
        voiceChannelId.value = null;
        voice.leave();
      }
    }
    async function loadServer() {
      var _a;
      loading.value = true;
      loadError.value = null;
      try {
        await fetchServerData();
      } catch (e) {
        loadError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u30B5\u30FC\u30D0\u30FC\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3067\u3057\u305F";
      } finally {
        loading.value = false;
      }
    }
    async function loadPosts(reset = true) {
      var _a, _b;
      if (!activeChannelId.value) return { hasMore: false };
      if (reset) {
        postOffset.value = 0;
        postHasMore.value = true;
        resetPostScroll();
      }
      if (!postHasMore.value) return { hasMore: false };
      try {
        const pageSize = reset ? 10 : 5;
        const data = await $fetch$1("/api/posts", { params: {
          serverId: serverId.value,
          channelId: activeChannelId.value,
          limit: pageSize,
          offset: postOffset.value
        } });
        const incoming = data.posts || [];
        postOffset.value = (_a = data.nextOffset) != null ? _a : postOffset.value + incoming.length;
        postHasMore.value = (_b = data.hasMore) != null ? _b : incoming.length === pageSize;
        if (reset) posts.value = incoming;
        else {
          const seen = new Set(posts.value.map((p) => p.id));
          posts.value = [...posts.value, ...incoming.filter((p) => !seen.has(p.id))];
        }
        return { hasMore: postHasMore.value };
      } catch (e) {
        if (reset) posts.value = [];
        return { hasMore: false };
      }
    }
    async function submitPost(content, attachments, visibility, visibleTo) {
      var _a;
      if (!activeChannelId.value) return;
      posting.value = true;
      try {
        await $fetch$1("/api/posts", {
          method: "POST",
          body: {
            content,
            attachments,
            visibility: visibility || "public",
            visibleTo,
            serverId: serverId.value,
            channelId: activeChannelId.value
          }
        });
        await loadPosts();
      } catch (e) {
        alert(((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u6295\u7A3F\u306B\u5931\u6557\u3057\u307E\u3057\u305F");
      } finally {
        posting.value = false;
      }
    }
    function openMedia(post) {
      var _a, _b;
      const label = ((_a = activeChannel.value) == null ? void 0 : _a.name) ? `#${activeChannel.value.name}` : (_b = server.value) == null ? void 0 : _b.name;
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
    function memberName(member) {
      var _a, _b;
      return member.nickname || ((_a = member.user) == null ? void 0 : _a.displayName) || ((_b = member.user) == null ? void 0 : _b.username) || "\u4E0D\u660E";
    }
    function deleteServerSafe() {
      navigateTo("/home");
    }
    watch(serverId, () => {
      if (voiceChannelId.value) {
        voiceChannelId.value = null;
        voice.leave();
      }
      server.value = null;
      channels.value = [];
      members.value = [];
      roles.value = [];
      posts.value = [];
      activeChannelId.value = null;
      loadError.value = null;
      loadServer();
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const _component_Icon = components_default;
      const _component_PostItem = PostItem_default;
      const _component_PostComposer = PostComposer_default;
      const _component_ServerSettingsModal = ServerSettingsModal_default;
      const _component_NuxtLink = NuxtLink;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full flex bg-[#0b0f19] text-slate-200 overflow-hidden" }, _attrs))} data-v-ea81a6fb><aside class="w-56 bg-slate-900/60 flex flex-col shrink-0 border-r border-slate-800" data-v-ea81a6fb><div class="h-12 px-3 flex items-center justify-between border-b border-slate-800 shrink-0" data-v-ea81a6fb><h2 class="font-bold text-white truncate text-sm flex items-center gap-2 min-w-0" data-v-ea81a6fb><div class="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden" data-v-ea81a6fb>`);
      if ((_a = unref(server)) == null ? void 0 : _a.iconUrl) _push(`<img${ssrRenderAttr("src", unref(server).iconUrl)} class="w-full h-full object-cover" data-v-ea81a6fb>`);
      else _push(`<!--[-->${ssrInterpolate(((_c = (_b = unref(server)) == null ? void 0 : _b.name) == null ? void 0 : _c.charAt(0)) || "?")}<!--]-->`);
      _push(`</div><span class="truncate" data-v-ea81a6fb>${ssrInterpolate(((_d = unref(server)) == null ? void 0 : _d.name) || "\u30B5\u30FC\u30D0\u30FC")}</span></h2>`);
      if (unref(canManage)) {
        _push(`<button class="text-slate-500 hover:text-white transition" data-v-ea81a6fb>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:settings",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      _push(`</div><div class="flex-1 overflow-y-auto p-2 space-y-0.5" data-v-ea81a6fb><!--[-->`);
      ssrRenderList(unref(groupedChannels), (group) => {
        _push(`<!--[--><div class="flex items-center justify-between px-2 py-1 mt-2 first:mt-0" data-v-ea81a6fb><span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider" data-v-ea81a6fb>${ssrInterpolate(group.label)}</span>`);
        if (unref(canManage)) {
          _push(`<button class="text-slate-500 hover:text-white transition" data-v-ea81a6fb>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:plus",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`</button>`);
        } else _push(`<!---->`);
        _push(`</div><!--[-->`);
        ssrRenderList(group.channels, (ch) => {
          _push(`<button class="${ssrRenderClass(["w-full text-left px-2 py-1.5 rounded-md transition flex items-center gap-1.5 text-sm", unref(activeChannelId) === ch.id ? "bg-slate-700/60 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"])}" data-v-ea81a6fb>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: channelIcon(ch.type),
            class: "w-3.5 h-3.5 text-slate-500 shrink-0"
          }, null, _parent));
          _push(`<span class="truncate flex-1" data-v-ea81a6fb>${ssrInterpolate(ch.name)}</span>`);
          if (ch.nsfw) _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:alert-triangle",
            class: "w-3 h-3 text-red-500"
          }, null, _parent));
          else _push(`<!---->`);
          _push(`</button>`);
        });
        _push(`<!--]--><!--]-->`);
      });
      _push(`<!--]-->`);
      if (unref(voiceChannels).length) {
        _push(`<!--[--><div class="flex items-center justify-between px-2 py-1 mt-2" data-v-ea81a6fb><span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider" data-v-ea81a6fb>\u97F3\u58F0\u30C1\u30E3\u30F3\u30CD\u30EB</span>`);
        if (unref(canManage)) {
          _push(`<button class="text-slate-500 hover:text-white transition" data-v-ea81a6fb>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:plus",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`</button>`);
        } else _push(`<!---->`);
        _push(`</div><!--[-->`);
        ssrRenderList(unref(voiceChannels), (ch) => {
          _push(`<button class="${ssrRenderClass(["w-full text-left px-2 py-1.5 rounded-md transition flex items-center gap-1.5 text-sm", unref(voiceChannelId) === ch.id ? "bg-emerald-700/40 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"])}" data-v-ea81a6fb>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:volume-2",
            class: "w-3.5 h-3.5 text-slate-500 shrink-0"
          }, null, _parent));
          _push(`<span class="truncate flex-1" data-v-ea81a6fb>${ssrInterpolate(ch.name)}</span>`);
          if (unref(voicePresence)[`server:${unref(serverId)}:${ch.id}`]) _push(`<span class="text-[10px] text-emerald-400" data-v-ea81a6fb>${ssrInterpolate(unref(voicePresence)[`server:${unref(serverId)}:${ch.id}`])}</span>`);
          else _push(`<!---->`);
          _push(`</button>`);
        });
        _push(`<!--]--><!--]-->`);
      } else _push(`<!---->`);
      _push(`</div><div class="p-3 border-t border-slate-800 shrink-0" data-v-ea81a6fb><button class="w-full flex items-center gap-2 text-sm text-slate-400 hover:text-white transition" data-v-ea81a6fb>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:users",
        class: "w-4 h-4"
      }, null, _parent));
      _push(` \u30E1\u30F3\u30D0\u30FC ${ssrInterpolate(unref(members).length)}</button></div></aside><div class="flex-1 flex flex-col min-w-0" data-v-ea81a6fb><div class="h-12 px-4 flex items-center border-b border-slate-800 shrink-0 gap-2" data-v-ea81a6fb>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: channelIcon((_e = unref(activeChannel)) == null ? void 0 : _e.type),
        class: "w-4 h-4 text-slate-500 shrink-0"
      }, null, _parent));
      _push(`<span class="font-bold text-white text-sm truncate" data-v-ea81a6fb>${ssrInterpolate(((_f = unref(activeChannel)) == null ? void 0 : _f.name) || "\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u9078\u629E")}</span>`);
      if ((_g = unref(activeChannel)) == null ? void 0 : _g.description) _push(`<span class="text-xs text-slate-500 truncate hidden sm:inline" data-v-ea81a6fb>\u2014 ${ssrInterpolate(unref(activeChannel).description)}</span>`);
      else _push(`<!---->`);
      if (unref(activeChannel) && unref(canManage)) {
        _push(`<button class="ml-1 text-slate-500 hover:text-white transition" title="\u30C1\u30E3\u30F3\u30CD\u30EB\u8A2D\u5B9A" data-v-ea81a6fb>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:settings-2",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      _push(`<button class="ml-auto lg:hidden text-slate-500 hover:text-white transition" title="\u30E1\u30F3\u30D0\u30FC" data-v-ea81a6fb>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:users",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button></div><div class="flex-1 overflow-y-auto p-4 space-y-3" data-v-ea81a6fb>`);
      if (!unref(activeChannelId)) _push(`<div class="flex items-center justify-center h-full text-slate-500" data-v-ea81a6fb> \u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044 </div>`);
      else {
        _push(`<!--[--><div class="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/20" data-v-ea81a6fb><!--[-->`);
        ssrRenderList(unref(posts), (post) => {
          _push(ssrRenderComponent(_component_PostItem, {
            key: post.id,
            post,
            "show-view-count": false,
            "current-user-id": void 0,
            onToggleRepost: toggleRepost,
            onToggleBookmark: toggleBookmark,
            onOpenMedia: openMedia
          }, null, _parent));
        });
        _push(`<!--]-->`);
        if (!unref(posts).length) _push(`<p class="text-center text-slate-500 py-8 text-sm" data-v-ea81a6fb>\u307E\u3060\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u6700\u521D\u306E\u30E1\u30C7\u30A3\u30A2\u3092\u6295\u7A3F\u3057\u307E\u3057\u3087\u3046</p>`);
        else _push(`<!---->`);
        _push(`</div><div class="h-1" aria-hidden="true" data-v-ea81a6fb></div>`);
        if (unref(loadingMorePosts)) _push(`<div class="text-center text-slate-500 py-4 text-sm" data-v-ea81a6fb>\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
        else if (unref(posts).length && !unref(postHasMore)) _push(`<p class="text-center text-slate-600 py-4 text-xs" data-v-ea81a6fb>\u3059\u3079\u3066\u8868\u793A\u3057\u307E\u3057\u305F</p>`);
        else _push(`<!---->`);
        _push(`<!--]-->`);
      }
      _push(`</div>`);
      if (unref(activeChannelId) && unref(canSend)) {
        _push(`<div class="px-4 pb-4 shrink-0" data-v-ea81a6fb><div class="bg-slate-900/70 border border-slate-800 rounded-xl p-3" data-v-ea81a6fb>`);
        _push(ssrRenderComponent(_component_PostComposer, {
          "media-kind": unref(composerMediaKind),
          placeholder: `${((_h = unref(activeChannel)) == null ? void 0 : _h.name) || ""} \u306B\u6295\u7A3F`,
          onSubmit: submitPost
        }, null, _parent));
        _push(`</div></div>`);
      } else if (unref(activeChannelId)) _push(`<div class="px-4 pb-4 shrink-0 text-center text-sm text-slate-500" data-v-ea81a6fb> \u3053\u306E\u30B5\u30FC\u30D0\u30FC\u3067\u6295\u7A3F\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093 </div>`);
      else _push(`<!---->`);
      _push(`</div>`);
      if (unref(showMemberList)) {
        _push(`<div class="fixed inset-0 z-[80] flex justify-end" data-v-ea81a6fb><div class="absolute inset-0 bg-black/50" data-v-ea81a6fb></div><aside class="relative w-64 bg-slate-900 border-l border-slate-800 h-full flex flex-col" data-v-ea81a6fb><div class="h-12 px-4 flex items-center border-b border-slate-800 shrink-0" data-v-ea81a6fb><span class="text-xs font-bold text-slate-500 uppercase tracking-wider" data-v-ea81a6fb>\u30E1\u30F3\u30D0\u30FC \u2014 ${ssrInterpolate(unref(members).length)}</span><button class="ml-auto text-slate-500 hover:text-white transition" data-v-ea81a6fb>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button></div><div class="flex-1 overflow-y-auto p-3 space-y-1" data-v-ea81a6fb><!--[-->`);
        ssrRenderList(unref(members), (member) => {
          var _a2, _b2;
          _push(`<div class="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-slate-800/50 transition" data-v-ea81a6fb>`);
          if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = member.user) == null ? void 0 : _a2.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(member.user.avatarUrl))} class="w-8 h-8 rounded-full object-cover" data-v-ea81a6fb>`);
          else _push(`<div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs" data-v-ea81a6fb>${ssrInterpolate(memberName(member).charAt(0))}</div>`);
          _push(`<div class="min-w-0 flex-1" data-v-ea81a6fb><p class="text-sm text-slate-300 truncate" data-v-ea81a6fb>${ssrInterpolate(memberName(member))}</p>`);
          if (member.role) _push(`<p class="text-[10px] truncate" style="${ssrRenderStyle({ color: member.role.color || "#99aab5" })}" data-v-ea81a6fb>${ssrInterpolate(((_b2 = unref(server)) == null ? void 0 : _b2.ownerId) === member.userId ? "\u6240\u6709\u8005" : member.role.name)}</p>`);
          else _push(`<!---->`);
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></aside></div>`);
      } else _push(`<!---->`);
      if (unref(showSettings)) _push(ssrRenderComponent(_component_ServerSettingsModal, {
        "server-id": unref(serverId),
        server: unref(server),
        channels: unref(channels),
        roles: unref(roles),
        members: unref(members),
        "my-permissions": unref(myPermissions),
        "is-owner": unref(isOwner),
        "initial-tab": unref(settingsTab),
        "initial-channel-id": unref(settingsChannelId),
        onClose: ($event) => {
          showSettings.value = false;
          settingsChannelId.value = null;
        },
        onRefresh: loadServer,
        onDeleted: deleteServerSafe
      }, null, _parent));
      else _push(`<!---->`);
      if (unref(loading)) _push(`<div class="fixed inset-0 z-40 flex items-center justify-center bg-[#0b0f19]/80" data-v-ea81a6fb><div class="text-slate-500" data-v-ea81a6fb>\u8AAD\u307F\u8FBC\u307F\u4E2D...</div></div>`);
      else _push(`<!---->`);
      if (unref(loadError) && !unref(loading)) {
        _push(`<div class="fixed inset-0 z-40 flex items-center justify-center bg-[#0b0f19]/90" data-v-ea81a6fb><div class="text-center space-y-3" data-v-ea81a6fb>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:alert-circle",
          class: "w-10 h-10 text-red-500 mx-auto"
        }, null, _parent));
        _push(`<p class="text-slate-400 text-sm" data-v-ea81a6fb>${ssrInterpolate(unref(loadError))}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/home",
          class: "inline-block px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) _push2(` \u30DB\u30FC\u30E0\u3078\u623B\u308B `);
            else return [createTextVNode(" \u30DB\u30FC\u30E0\u3078\u623B\u308B ")];
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup = _id__vue_vue_type_script_setup_true_lang_default.setup;
_id__vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/servers/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _id__default = /* @__PURE__ */ _plugin_vue_export_helper_default(_id__vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-ea81a6fb"]]);

export { _id__default as default };
//# sourceMappingURL=_id_-DO9vxK7o.mjs.map
