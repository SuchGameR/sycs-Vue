import { _ as _plugin_vue_export_helper_default, a as useRoute, c as components_default, $ as $fetch$1, n as navigateTo } from '../virtual/entry.mjs';
import { N as NuxtLink } from './nuxt-link-1Qo3YrhL.mjs';
import { B as BottomSheet_default } from './BottomSheet-lvIleqFE.mjs';
import { a as avatarSrc } from './avatar-Dl3G3V3K.mjs';
import { u as useMediaPane } from './useMediaPane-Dnqhkp4f.mjs';
import { u as useInfiniteScroll } from './useInfiniteScroll-BXxYHd5b.mjs';
import { u as useVoiceCall } from './useVoiceCall-C9ngEm_a.mjs';
import { P as PostItem_default } from './PostItem-D-q__o2O.mjs';
import { P as PostComposer_default } from './PostComposer-Dff3WYeI.mjs';
import { defineComponent, computed, ref, watch, mergeProps, unref, withCtx, createTextVNode, reactive, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, createCommentVNode, withDirectives, vModelText, isRef, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
import './interval-Br1BrDTv.mjs';
import './UserBadges-BDdpg7rV.mjs';
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
var inputCls = "w-full bg-surface-container border border-outline rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none";
var labelCls = "text-xs text-on-surface-variant font-medium block mb-1";
var btnPrimary = "px-4 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50";
var btnGhost = "px-4 py-2 rounded-lg border border-outline text-sm text-on-surface-variant hover:text-white transition";
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
    const open = ref(true);
    const emit = __emit;
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
    function flash(msg, isError2 = false) {
      if (isError2) {
        noticeError.value = msg;
        notice.value = null;
      } else {
        notice.value = msg;
        noticeError.value = null;
      }
      setTimeout(() => {
        notice.value = null;
        noticeError.value = null;
      }, 3e3);
    }
    async function api(path, opts = {}) {
      var _a;
      try {
        const res = await $fetch$1(path, opts);
        emit("refresh");
        return res;
      } catch (e) {
        flash(((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F", true);
        return null;
      }
    }
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
    async function saveOverview() {
      var _a;
      saving.value = true;
      try {
        await $fetch$1(`/api/servers/${props.serverId}`, {
          method: "PUT",
          body: {
            name: form.name,
            description: form.description,
            isPublic: form.isPublic
          }
        });
        emit("refresh");
        flash("\u30B5\u30FC\u30D0\u30FC\u8A2D\u5B9A\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F");
      } catch (e) {
        flash(((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F", true);
      } finally {
        saving.value = false;
      }
    }
    async function uploadImage(kind, file) {
      var _a;
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      saving.value = true;
      try {
        await $fetch$1(`/api/upload/server/${props.serverId}/${kind}`, {
          method: "POST",
          body: fd
        });
        emit("refresh");
        flash(kind === "icon" ? "\u30A2\u30A4\u30B3\u30F3\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F" : "\u30D0\u30CA\u30FC\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F");
      } catch (e) {
        flash(((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306B\u5931\u6557\u3057\u307E\u3057\u305F", true);
      } finally {
        saving.value = false;
      }
    }
    async function deleteServer() {
      if (!confirm("\u672C\u5F53\u306B\u3053\u306E\u30B5\u30FC\u30D0\u30FC\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F\n\u3053\u306E\u64CD\u4F5C\u306F\u53D6\u308A\u6D88\u305B\u307E\u305B\u3093\u3002")) return;
      await $fetch$1(`/api/servers/${props.serverId}`, { method: "DELETE" });
      emit("deleted");
    }
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
    async function createChannel() {
      if (!newChannel.name.trim()) return;
      await api(`/api/servers/${props.serverId}/channels`, {
        method: "POST",
        body: {
          name: newChannel.name,
          description: newChannel.description,
          type: newChannel.type
        }
      });
      newChannel.name = "";
      newChannel.description = "";
    }
    async function saveChannel(ch) {
      const d = draftOf(ch);
      if (await api(`/api/servers/${props.serverId}/channels/${ch.id}`, {
        method: "PUT",
        body: {
          name: d.name,
          description: d.description,
          type: d.type,
          slowModeSeconds: d.slowModeSeconds,
          nsfw: d.nsfw
        }
      })) flash("\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F");
    }
    async function deleteChannel(ch) {
      if (!confirm(`\u30C1\u30E3\u30F3\u30CD\u30EB #${ch.name} \u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F`)) return;
      if (await api(`/api/servers/${props.serverId}/channels/${ch.id}`, { method: "DELETE" })) {
        expandedChannelId.value = null;
        flash("\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u524A\u9664\u3057\u307E\u3057\u305F");
      }
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
    function selectRole(role) {
      selectedRoleId.value = role.id;
      roleDraft.name = role.name;
      roleDraft.color = role.color || "#99aab5";
      roleDraft.mask = typeof role.permissionsMask === "number" ? role.permissionsMask : 0;
      roleDraft.isAdmin = !!role.isAdmin || role.permissions === "all";
    }
    function togglePerm(perm) {
      roleDraft.mask ^= perm;
    }
    async function addRole() {
      if (!newRoleName.value.trim()) return;
      const res = await api(`/api/servers/${props.serverId}/roles`, {
        method: "POST",
        body: {
          name: newRoleName.value,
          color: newRoleColor.value
        }
      });
      if (res) {
        newRoleName.value = "";
        selectRole(res.role);
      }
    }
    async function saveRole() {
      if (!roleDraft.name.trim()) return;
      if (await api(`/api/servers/${props.serverId}/roles/${selectedRoleId.value}`, {
        method: "PUT",
        body: {
          name: roleDraft.name,
          color: roleDraft.color,
          permissionsMask: roleDraft.mask
        }
      })) flash("\u30ED\u30FC\u30EB\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F");
    }
    async function removeRole() {
      if (!selectedRole.value) return;
      if (!confirm(`\u30ED\u30FC\u30EB\u300C${selectedRole.value.name}\u300D\u3092\u524A\u9664\u3057\u307E\u3059\u304B\uFF1F`)) return;
      if (await api(`/api/servers/${props.serverId}/roles/${selectedRole.value.id}`, { method: "DELETE" })) {
        selectedRoleId.value = null;
        flash("\u30ED\u30FC\u30EB\u3092\u524A\u9664\u3057\u307E\u3057\u305F");
      }
    }
    const memberDrafts = reactive({});
    function memberDraftOf(member) {
      if (!memberDrafts[member.userId]) memberDrafts[member.userId] = {
        nickname: member.nickname || "",
        roleId: member.roleId || ""
      };
      return memberDrafts[member.userId];
    }
    const assignableRoles = computed(() => props.roles.filter((r) => !r.isAdmin));
    async function saveMember(member) {
      const d = memberDraftOf(member);
      if (await api(`/api/servers/${props.serverId}/members/${member.userId}`, {
        method: "PUT",
        body: {
          nickname: d.nickname,
          roleId: d.roleId || null
        }
      })) flash("\u30E1\u30F3\u30D0\u30FC\u8A2D\u5B9A\u3092\u4FDD\u5B58\u3057\u307E\u3057\u305F");
    }
    async function kickMember(member) {
      var _a;
      if (!confirm(`${((_a = member.user) == null ? void 0 : _a.displayName) || member.nickname || "\u3053\u306E\u30E1\u30F3\u30D0\u30FC"}\u3092\u30AD\u30C3\u30AF\u3057\u307E\u3059\u304B\uFF1F`)) return;
      if (await api(`/api/servers/${props.serverId}/members/${member.userId}`, { method: "DELETE" })) flash("\u30E1\u30F3\u30D0\u30FC\u3092\u30AD\u30C3\u30AF\u3057\u307E\u3057\u305F");
    }
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
    async function createInvite() {
      if (await api(`/api/servers/${props.serverId}/invites`, {
        method: "POST",
        body: {
          maxUses: inviteForm.maxUses,
          expiresInHours: inviteForm.expiresInHours
        }
      })) {
        await loadInvites();
        flash("\u62DB\u5F85\u3092\u4F5C\u6210\u3057\u307E\u3057\u305F");
      }
    }
    async function revokeInvite(invite) {
      if (await api(`/api/servers/${props.serverId}/invites/${invite.id}`, { method: "DELETE" })) {
        await loadInvites();
        flash("\u62DB\u5F85\u3092\u53D6\u308A\u6D88\u3057\u307E\u3057\u305F");
      }
    }
    async function copyInvite(invite) {
      const link = `${(void 0).location.origin}/invite/${invite.code}`;
      try {
        await (void 0).clipboard.writeText(link);
        copiedCode.value = invite.code;
        setTimeout(() => {
          copiedCode.value = null;
        }, 2e3);
      } catch {
        flash("\u30B3\u30D4\u30FC\u306B\u5931\u6557\u3057\u307E\u3057\u305F", true);
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
      const _component_BottomSheet = BottomSheet_default;
      const _component_Icon = components_default;
      _push(ssrRenderComponent(_component_BottomSheet, mergeProps({
        open: unref(open),
        height: "min(88dvh, 44rem)",
        "dismiss-on-backdrop": true,
        onClose: ($event) => emit("close")
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f, _g, _h;
          if (_push2) {
            _push2(`<div class="flex flex-col h-full"${_scopeId}><div class="flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0"${_scopeId}><h2 class="text-lg font-bold text-white"${_scopeId}>\u30B5\u30FC\u30D0\u30FC\u8A2D\u5B9A</h2><button class="text-on-surface-variant hover:text-white transition"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:x",
              class: "w-5 h-5"
            }, null, _parent2, _scopeId));
            _push2(`</button></div><div class="flex flex-1 min-h-0"${_scopeId}><div class="w-44 shrink-0 border-r border-outline-variant p-3 space-y-1 overflow-y-auto"${_scopeId}><!--[-->`);
            ssrRenderList(tabs, (t) => {
              _push2(`<button class="${ssrRenderClass([unref(tab) === t.key ? "bg-surface-container text-white" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50", "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition"])}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: t.icon,
                class: "w-4 h-4"
              }, null, _parent2, _scopeId));
              _push2(` ${ssrInterpolate(t.label)}</button>`);
            });
            _push2(`<!--]--></div><div class="flex-1 min-w-0 overflow-y-auto p-5"${_scopeId}>`);
            if (unref(notice)) _push2(`<div class="mb-4 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-sm text-green-400"${_scopeId}>${ssrInterpolate(unref(notice))}</div>`);
            else _push2(`<!---->`);
            if (unref(noticeError)) _push2(`<div class="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400"${_scopeId}>${ssrInterpolate(unref(noticeError))}</div>`);
            else _push2(`<!---->`);
            if (unref(tab) === "overview") {
              _push2(`<!--[--><h3 class="text-lg font-bold text-white mb-1"${_scopeId}>\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u8A2D\u5B9A</h3><p class="text-sm text-on-surface-variant mb-5"${_scopeId}>\u30B5\u30FC\u30D0\u30FC\u306E\u57FA\u672C\u60C5\u5831\u3068\u516C\u958B\u8A2D\u5B9A\u3092\u7BA1\u7406\u3057\u307E\u3059\u3002</p><div class="flex items-center gap-5 mb-6"${_scopeId}><div class="relative w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden shrink-0"${_scopeId}>`);
              if ((_a = __props.server) == null ? void 0 : _a.iconUrl) _push2(`<img${ssrRenderAttr("src", __props.server.iconUrl)} class="w-full h-full object-cover"${_scopeId}>`);
              else _push2(`<!--[-->${ssrInterpolate((_c = (_b = __props.server) == null ? void 0 : _b.name) == null ? void 0 : _c.charAt(0))}<!--]-->`);
              _push2(`</div><div class="flex flex-col gap-2"${_scopeId}>`);
              if (can.server()) {
                _push2(`<label class="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline text-xs text-on-surface hover:bg-surface-container-high transition w-fit"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "lucide:image",
                  class: "w-3.5 h-3.5"
                }, null, _parent2, _scopeId));
                _push2(` \u30A2\u30A4\u30B3\u30F3\u3092\u5909\u66F4 <input type="file" accept="image/*" class="hidden"${_scopeId}></label>`);
              } else _push2(`<!---->`);
              _push2(`<span class="text-[11px] text-slate-600"${_scopeId}>\u6B63\u65B9\u5F62\u753B\u50CF\uFF08256\xD7256\uFF09</span></div></div><div class="${ssrRenderClass([can.server() ? "" : "pointer-events-none opacity-60", "space-y-4"])}"${_scopeId}><div${_scopeId}><label class="labelCls"${_scopeId}>\u30B5\u30FC\u30D0\u30FC\u540D</label><input${ssrRenderAttr("value", unref(form).name)} class="${ssrRenderClass(inputCls)}" maxlength="100"${_scopeId}></div><div${_scopeId}><label class="labelCls"${_scopeId}>\u8AAC\u660E</label><textarea rows="3" class="${ssrRenderClass(inputCls)}" placeholder="\u30B5\u30FC\u30D0\u30FC\u306E\u8AAC\u660E" maxlength="500"${_scopeId}>${ssrInterpolate(unref(form).description)}</textarea></div><div class="flex items-center justify-between bg-surface-container/50 border border-outline-variant rounded-lg px-4 py-3"${_scopeId}><div${_scopeId}><p class="text-sm font-bold text-white"${_scopeId}>\u516C\u958B\u30B5\u30FC\u30D0\u30FC</p><p class="text-xs text-on-surface-variant mt-0.5"${_scopeId}>\u30AA\u30F3\u306B\u3059\u308B\u3068\u30B5\u30FC\u30D0\u30FC\u3092\u516C\u958B\u3057\u3001\u8AB0\u3067\u3082\u62DB\u5F85\u30EA\u30F3\u30AF\u304B\u3089\u53C2\u52A0\u3067\u304D\u307E\u3059</p></div><button type="button" role="switch"${ssrRenderAttr("aria-checked", unref(form).isPublic)} class="${ssrRenderClass([unref(form).isPublic ? "bg-indigo-600" : "bg-surface-container-high", "w-11 h-6 rounded-full transition relative shrink-0"])}"${_scopeId}><span class="${ssrRenderClass([unref(form).isPublic ? "left-[22px]" : "left-0.5", "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"])}"${_scopeId}></span></button></div><div${_scopeId}><label class="labelCls"${_scopeId}>\u30D0\u30CA\u30FC\u753B\u50CF</label><div class="relative h-24 rounded-xl overflow-hidden border border-outline-variant"${_scopeId}>`);
              if ((_d = __props.server) == null ? void 0 : _d.bannerUrl) _push2(`<img${ssrRenderAttr("src", __props.server.bannerUrl)} class="w-full h-full object-cover"${_scopeId}>`);
              else _push2(`<div class="w-full h-full flex items-center justify-center text-slate-600 text-xs bg-surface-container/40"${_scopeId}>\u30D0\u30CA\u30FC\u672A\u8A2D\u5B9A</div>`);
              _push2(`<label class="absolute bottom-2 right-2 cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-xs text-white hover:bg-black/80 transition"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:upload",
                class: "w-3.5 h-3.5"
              }, null, _parent2, _scopeId));
              _push2(` \u5909\u66F4 <input type="file" accept="image/*" class="hidden"${_scopeId}></label></div><p class="text-[11px] text-slate-600 mt-1"${_scopeId}>\u6A2A\u9577\u753B\u50CF\uFF081600\xD7450\uFF09\u304C\u304A\u3059\u3059\u3081\u3067\u3059</p></div></div>`);
              if (can.server()) _push2(`<div class="flex justify-end gap-2 mt-6"${_scopeId}><button class="${ssrRenderClass(btnGhost)}"${_scopeId}>\u30AD\u30E3\u30F3\u30BB\u30EB</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="${ssrRenderClass(btnPrimary)}"${_scopeId}>\u4FDD\u5B58</button></div>`);
              else _push2(`<!---->`);
              if (__props.isOwner) _push2(`<div class="border-t border-outline-variant mt-8 pt-5"${_scopeId}><h4 class="text-sm font-bold text-red-400 mb-2"${_scopeId}>\u5371\u967A\u30BE\u30FC\u30F3</h4><p class="text-xs text-on-surface-variant mb-3"${_scopeId}>\u30B5\u30FC\u30D0\u30FC\u3092\u524A\u9664\u3059\u308B\u3068\u3001\u3059\u3079\u3066\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u30FB\u30E1\u30C3\u30BB\u30FC\u30B8\u30FB\u30E1\u30F3\u30D0\u30FC\u60C5\u5831\u304C\u524A\u9664\u3055\u308C\u307E\u3059\u3002</p><button class="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 text-sm hover:bg-red-600/30 transition border border-red-600/30"${_scopeId}> \u30B5\u30FC\u30D0\u30FC\u3092\u524A\u9664 </button></div>`);
              else _push2(`<!---->`);
              _push2(`<!--]-->`);
            } else _push2(`<!---->`);
            if (unref(tab) === "channels") {
              _push2(`<!--[--><h3 class="text-lg font-bold text-white mb-1"${_scopeId}>\u30C1\u30E3\u30F3\u30CD\u30EB\u8A2D\u5B9A</h3><p class="text-sm text-on-surface-variant mb-5"${_scopeId}>\u30C1\u30E3\u30F3\u30CD\u30EB\u306E\u4F5C\u6210\u30FB\u7DE8\u96C6\u30FB\u524A\u9664\u304C\u3067\u304D\u307E\u3059\u3002</p>`);
              if (can.channels()) {
                _push2(`<div class="bg-surface-container/30 border border-outline-variant rounded-xl p-4 mb-4 space-y-2.5"${_scopeId}><p class="text-sm font-bold text-on-surface-variant"${_scopeId}>\u65B0\u3057\u3044\u30C1\u30E3\u30F3\u30CD\u30EB</p><div class="flex gap-2"${_scopeId}><input${ssrRenderAttr("value", unref(newChannel).name)} class="${ssrRenderClass(inputCls)}" placeholder="\u30C1\u30E3\u30F3\u30CD\u30EB\u540D" maxlength="50"${_scopeId}></div><div class="flex items-center gap-2"${_scopeId}><div class="flex rounded-lg bg-surface-container border border-outline p-0.5"${_scopeId}><!--[-->`);
                ssrRenderList(channelTypes, (t) => {
                  _push2(`<button type="button" class="${ssrRenderClass([unref(newChannel).type === t.key ? "bg-indigo-600 text-white" : "text-on-surface-variant hover:text-on-surface", "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition"])}"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_Icon, {
                    name: t.icon,
                    class: "w-3.5 h-3.5"
                  }, null, _parent2, _scopeId));
                  _push2(` ${ssrInterpolate(t.label)}</button>`);
                });
                _push2(`<!--]--></div><input${ssrRenderAttr("value", unref(newChannel).description)} class="${ssrRenderClass(inputCls)}" placeholder="\u8AAC\u660E\uFF08\u4EFB\u610F\uFF09" maxlength="200"${_scopeId}><button${ssrIncludeBooleanAttr(!unref(newChannel).name.trim()) ? " disabled" : ""} class="${ssrRenderClass([btnPrimary, "shrink-0"])}"${_scopeId}>\u4F5C\u6210</button></div></div>`);
              } else _push2(`<!---->`);
              _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
              ssrRenderList(__props.channels, (ch) => {
                _push2(`<div class="bg-surface-container/40 border border-outline-variant rounded-xl overflow-hidden"${_scopeId}><div class="flex items-center gap-2 px-4 py-3"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: channelTypeIcon(ch.type),
                  class: "w-4 h-4 text-on-surface-variant shrink-0"
                }, null, _parent2, _scopeId));
                _push2(`<span class="text-sm font-bold text-white flex-1 truncate"${_scopeId}>${ssrInterpolate(ch.name)}</span>`);
                if (channelTypeLabel(ch.type)) _push2(`<span class="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded px-1.5 py-0.5"${_scopeId}>${ssrInterpolate(channelTypeLabel(ch.type))}</span>`);
                else _push2(`<!---->`);
                if (ch.nsfw) _push2(`<span class="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded px-1.5 py-0.5"${_scopeId}>NSFW</span>`);
                else _push2(`<!---->`);
                if (ch.slowModeSeconds > 0) _push2(`<span class="text-[10px] text-on-surface-variant"${_scopeId}>\u30B9\u30ED\u30FC\u30E2\u30FC\u30C9 ${ssrInterpolate(ch.slowModeSeconds)}s</span>`);
                else _push2(`<!---->`);
                if (can.channels()) {
                  _push2(`<button class="text-on-surface-variant hover:text-white transition"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_Icon, {
                    name: unref(expandedChannelId) === ch.id ? "lucide:chevron-up" : "lucide:settings-2",
                    class: "w-4 h-4"
                  }, null, _parent2, _scopeId));
                  _push2(`</button>`);
                } else _push2(`<!---->`);
                _push2(`</div>`);
                if (unref(expandedChannelId) === ch.id && can.channels()) {
                  _push2(`<div class="border-t border-outline-variant p-4 space-y-3"${_scopeId}><div${_scopeId}><label class="${ssrRenderClass(labelCls)}"${_scopeId}>\u30C1\u30E3\u30F3\u30CD\u30EB\u540D</label><input${ssrRenderAttr("value", draftOf(ch).name)} class="${ssrRenderClass(inputCls)}" maxlength="50"${_scopeId}></div><div${_scopeId}><label class="${ssrRenderClass(labelCls)}"${_scopeId}>\u30C1\u30E3\u30F3\u30CD\u30EB\u30BF\u30A4\u30D7</label><div class="flex rounded-lg bg-surface-container border border-outline p-0.5 w-fit"${_scopeId}><!--[-->`);
                  ssrRenderList(channelTypes, (t) => {
                    _push2(`<button type="button" class="${ssrRenderClass([draftOf(ch).type === t.key ? "bg-indigo-600 text-white" : "text-on-surface-variant hover:text-on-surface", "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition"])}"${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_Icon, {
                      name: t.icon,
                      class: "w-3.5 h-3.5"
                    }, null, _parent2, _scopeId));
                    _push2(` ${ssrInterpolate(t.label)}</button>`);
                  });
                  _push2(`<!--]--></div>`);
                  if (draftOf(ch).type === "voice") _push2(`<p class="text-[11px] text-emerald-500 mt-1"${_scopeId}>\u97F3\u58F0\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F\u901A\u8A71\u306B\u53C2\u52A0\u3067\u304D\u307E\u3059\u3002\u30E1\u30C3\u30BB\u30FC\u30B8\u306F\u8868\u793A\u3055\u308C\u307E\u305B\u3093\u3002</p>`);
                  else if (draftOf(ch).type === "video") _push2(`<p class="text-[11px] text-indigo-400 mt-1"${_scopeId}>\u52D5\u753B\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F\u52D5\u753B\u3092\u4E2D\u5FC3\u306B\u6295\u7A3F\u3067\u304D\u307E\u3059\u3002</p>`);
                  else if (draftOf(ch).type === "music") _push2(`<p class="text-[11px] text-indigo-400 mt-1"${_scopeId}>\u97F3\u697D\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F\u97F3\u58F0\u30D5\u30A1\u30A4\u30EB\u3092\u4E2D\u5FC3\u306B\u6295\u7A3F\u3067\u304D\u307E\u3059\u3002</p>`);
                  else if (draftOf(ch).type === "gallery") _push2(`<p class="text-[11px] text-indigo-400 mt-1"${_scopeId}>\u753B\u50CF\u30AE\u30E3\u30E9\u30EA\u30FC\u3067\u306F\u753B\u50CF\u3092\u4E2D\u5FC3\u306B\u6295\u7A3F\u3067\u304D\u307E\u3059\u3002</p>`);
                  else if (draftOf(ch).type === "model") _push2(`<p class="text-[11px] text-indigo-400 mt-1"${_scopeId}>3D\u30E2\u30C7\u30EB\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F .glb / .gltf \u306A\u3069\u306E3D\u30E2\u30C7\u30EB\u3092\u6295\u7A3F\u30FB\u95B2\u89A7\u3067\u304D\u307E\u3059\u3002</p>`);
                  else if (draftOf(ch).type === "file") _push2(`<p class="text-[11px] text-indigo-400 mt-1"${_scopeId}>\u30D5\u30A1\u30A4\u30EB\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F PDF\u30FBZIP \u306A\u3069\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u5171\u6709\u3067\u304D\u307E\u3059\u3002</p>`);
                  else _push2(`<!---->`);
                  _push2(`</div><div${_scopeId}><label class="${ssrRenderClass(labelCls)}"${_scopeId}>\u8AAC\u660E</label><input${ssrRenderAttr("value", draftOf(ch).description)} class="${ssrRenderClass(inputCls)}" maxlength="200"${_scopeId}></div><div class="grid grid-cols-2 gap-3"${_scopeId}><div${_scopeId}><label class="${ssrRenderClass(labelCls)}"${_scopeId}>\u30B9\u30ED\u30FC\u30E2\u30FC\u30C9\uFF08\u79D2\uFF09</label><input${ssrRenderAttr("value", draftOf(ch).slowModeSeconds)} type="number" min="0" max="21600" class="${ssrRenderClass(inputCls)}"${_scopeId}></div><div class="flex items-end pb-1"${_scopeId}><button type="button" role="switch"${ssrRenderAttr("aria-checked", draftOf(ch).nsfw)} class="${ssrRenderClass([draftOf(ch).nsfw ? "bg-red-600" : "bg-surface-container-high", "w-11 h-6 rounded-full transition relative"])}"${_scopeId}><span class="${ssrRenderClass([draftOf(ch).nsfw ? "left-[22px]" : "left-0.5", "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"])}"${_scopeId}></span></button><span class="text-sm text-on-surface-variant ml-2"${_scopeId}>NSFW\u30C1\u30E3\u30F3\u30CD\u30EB</span></div></div><div class="flex justify-end gap-2 pt-1"${_scopeId}><button class="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-xs hover:bg-red-600/30 transition border border-red-600/30"${_scopeId}> \u524A\u9664 </button><button class="px-4 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition"${_scopeId}>\u4FDD\u5B58</button></div></div>`);
                } else _push2(`<!---->`);
                _push2(`</div>`);
              });
              _push2(`<!--]-->`);
              if (!__props.channels.length) _push2(`<p class="text-sm text-on-surface-variant text-center py-6"${_scopeId}>\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u3042\u308A\u307E\u305B\u3093</p>`);
              else _push2(`<!---->`);
              _push2(`</div><!--]-->`);
            } else _push2(`<!---->`);
            if (unref(tab) === "roles") {
              _push2(`<!--[--><h3 class="text-lg font-bold text-white mb-1"${_scopeId}>\u30ED\u30FC\u30EB\u3068\u6A29\u9650</h3><p class="text-sm text-on-surface-variant mb-5"${_scopeId}>\u30ED\u30FC\u30EB\u3092\u4F5C\u6210\u3057\u3001\u8A73\u7D30\u306A\u6A29\u9650\u3092\u8A2D\u5B9A\u3067\u304D\u307E\u3059\u3002</p><div class="grid grid-cols-[180px_1fr] gap-4"${_scopeId}><div class="space-y-1"${_scopeId}><!--[-->`);
              ssrRenderList(__props.roles, (role) => {
                _push2(`<div class="${ssrRenderClass([unref(selectedRoleId) === role.id ? "bg-surface-container text-white" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50", "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition"])}"${_scopeId}><span class="w-3 h-3 rounded-full shrink-0" style="${ssrRenderStyle({ backgroundColor: role.color || "#6366f1" })}"${_scopeId}></span><span class="text-sm truncate"${_scopeId}>${ssrInterpolate(role.name)}</span></div>`);
              });
              _push2(`<!--]-->`);
              if (can.roles()) _push2(`<div class="border-t border-outline-variant pt-3 mt-3 space-y-2"${_scopeId}><input${ssrRenderAttr("value", unref(newRoleName))} class="${ssrRenderClass(inputCls)}" placeholder="\u65B0\u3057\u3044\u30ED\u30FC\u30EB\u540D" maxlength="30"${_scopeId}><div class="flex gap-2 items-center"${_scopeId}><input${ssrRenderAttr("value", unref(newRoleColor))} type="color" class="w-9 h-9 rounded-lg bg-surface-container border border-outline cursor-pointer"${_scopeId}><button${ssrIncludeBooleanAttr(!unref(newRoleName).trim()) ? " disabled" : ""} class="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"${_scopeId}>\u30ED\u30FC\u30EB\u3092\u4F5C\u6210</button></div></div>`);
              else _push2(`<!---->`);
              _push2(`</div><div class="bg-surface-container/30 border border-outline-variant rounded-xl p-4 min-h-[300px]"${_scopeId}>`);
              if (unref(selectedRole)) {
                _push2(`<!--[--><div class="flex items-center justify-between mb-4"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><span class="w-4 h-4 rounded-full" style="${ssrRenderStyle({ backgroundColor: unref(roleDraft).color })}"${_scopeId}></span><span class="font-bold text-white"${_scopeId}>${ssrInterpolate(unref(roleDraft).name)}</span></div>`);
                if (can.roles()) {
                  _push2(`<div class="flex gap-2"${_scopeId}>`);
                  if (!unref(roleDraft).isAdmin) {
                    _push2(`<button class="text-on-surface-variant hover:text-red-400 transition"${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_Icon, {
                      name: "lucide:trash-2",
                      class: "w-4 h-4"
                    }, null, _parent2, _scopeId));
                    _push2(`</button>`);
                  } else _push2(`<!---->`);
                  _push2(`<button class="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition"${_scopeId}>\u4FDD\u5B58</button></div>`);
                } else _push2(`<!---->`);
                _push2(`</div>`);
                if (can.roles()) _push2(`<div class="grid grid-cols-2 gap-3 mb-4"${_scopeId}><div${_scopeId}><label class="${ssrRenderClass(labelCls)}"${_scopeId}>\u30ED\u30FC\u30EB\u540D</label><input${ssrRenderAttr("value", unref(roleDraft).name)} class="${ssrRenderClass(inputCls)}" maxlength="30"${_scopeId}></div><div${_scopeId}><label class="${ssrRenderClass(labelCls)}"${_scopeId}>\u8272</label><input${ssrRenderAttr("value", unref(roleDraft).color)} type="color" class="w-full h-10 rounded-lg bg-surface-container border border-outline cursor-pointer"${_scopeId}></div></div>`);
                else _push2(`<!---->`);
                if (unref(roleDraft).isAdmin) {
                  _push2(`<p class="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-3"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_Icon, {
                    name: "lucide:crown",
                    class: "w-3.5 h-3.5 inline mr-1"
                  }, null, _parent2, _scopeId));
                  _push2(` \u7BA1\u7406\u8005\u30ED\u30FC\u30EB\u306F\u3059\u3079\u3066\u306E\u6A29\u9650\u3092\u6301\u3061\u3001\u6A29\u9650\u3092\u7DE8\u96C6\u3067\u304D\u307E\u305B\u3093\u3002 </p>`);
                } else _push2(`<!---->`);
                if (can.roles() && !unref(roleDraft).isAdmin) {
                  _push2(`<div${_scopeId}><!--[-->`);
                  ssrRenderList(unref(PERMISSION_GROUPS), (group) => {
                    _push2(`<div class="mb-4"${_scopeId}><p class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2"${_scopeId}>${ssrInterpolate(group.label)}</p><div class="space-y-1"${_scopeId}><!--[-->`);
                    ssrRenderList(group.permissions, (p) => {
                      _push2(`<button class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container/50 transition text-left"${_scopeId}><span class="${ssrRenderClass([(unref(roleDraft).mask & unref(PERMISSIONS)[p.key]) === unref(PERMISSIONS)[p.key] ? "bg-indigo-600 border-indigo-500" : "border-slate-600", "w-5 h-5 rounded-md border flex items-center justify-center shrink-0"])}"${_scopeId}>`);
                      if ((unref(roleDraft).mask & unref(PERMISSIONS)[p.key]) === unref(PERMISSIONS)[p.key]) _push2(ssrRenderComponent(_component_Icon, {
                        name: "lucide:check",
                        class: "w-3.5 h-3.5 text-white"
                      }, null, _parent2, _scopeId));
                      else _push2(`<!---->`);
                      _push2(`</span><span${_scopeId}><span class="block text-sm text-on-surface"${_scopeId}>${ssrInterpolate(p.label)}</span><span class="block text-xs text-on-surface-variant"${_scopeId}>${ssrInterpolate(p.description)}</span></span></button>`);
                    });
                    _push2(`<!--]--></div></div>`);
                  });
                  _push2(`<!--]--></div>`);
                } else _push2(`<!---->`);
                if (!can.roles() && !unref(roleDraft).isAdmin) _push2(`<p class="text-xs text-on-surface-variant"${_scopeId}> \u30ED\u30FC\u30EB\u3092\u7DE8\u96C6\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u73FE\u5728\u306E\u6A29\u9650\u306F\u8AAD\u307F\u53D6\u308A\u5C02\u7528\u3067\u3059\u3002 </p>`);
                else _push2(`<!---->`);
                _push2(`<!--]-->`);
              } else _push2(`<p class="text-sm text-on-surface-variant text-center py-10"${_scopeId}>\u30ED\u30FC\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044</p>`);
              _push2(`</div></div><!--]-->`);
            } else _push2(`<!---->`);
            if (unref(tab) === "members") {
              _push2(`<!--[--><h3 class="text-lg font-bold text-white mb-1"${_scopeId}>\u30E1\u30F3\u30D0\u30FC\u7BA1\u7406</h3><p class="text-sm text-on-surface-variant mb-5"${_scopeId}>${ssrInterpolate(__props.members.length)} \u4EBA\u306E\u30E1\u30F3\u30D0\u30FC</p><div class="space-y-2"${_scopeId}><!--[-->`);
              ssrRenderList(__props.members, (member) => {
                var _a2, _b2, _c2, _d2, _e2, _f2, _g2;
                _push2(`<div class="bg-surface-container/40 border border-outline-variant rounded-xl p-3"${_scopeId}><div class="flex items-center gap-3"${_scopeId}><div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden"${_scopeId}>`);
                if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = member.user) == null ? void 0 : _a2.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(member.user.avatarUrl))} class="w-full h-full object-cover"${_scopeId}>`);
                else _push2(`<!--[-->${ssrInterpolate(((_c2 = (_b2 = member.user) == null ? void 0 : _b2.displayName) == null ? void 0 : _c2.charAt(0)) || "?")}<!--]-->`);
                _push2(`</div><div class="flex-1 min-w-0"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><span class="text-sm font-bold text-white truncate"${_scopeId}>${ssrInterpolate(((_d2 = member.user) == null ? void 0 : _d2.displayName) || member.nickname || "\u4E0D\u660E")}</span>`);
                if (member.role) _push2(`<span class="text-[11px] px-2 py-0.5 rounded-full" style="${ssrRenderStyle({
                  color: member.role.color || "#99aab5",
                  backgroundColor: (member.role.color || "#99aab5") + "22"
                })}"${_scopeId}>${ssrInterpolate(member.role.name)}</span>`);
                else _push2(`<!---->`);
                if (((_e2 = __props.server) == null ? void 0 : _e2.ownerId) === member.userId) _push2(`<span class="text-[11px] text-amber-400"${_scopeId}>\u6240\u6709\u8005</span>`);
                else _push2(`<!---->`);
                _push2(`</div><p class="text-xs text-on-surface-variant truncate"${_scopeId}>@${ssrInterpolate((_f2 = member.user) == null ? void 0 : _f2.username)}</p></div></div>`);
                if (can.members() && ((_g2 = __props.server) == null ? void 0 : _g2.ownerId) !== member.userId) {
                  _push2(`<div class="flex flex-wrap items-end gap-2 mt-3 pt-3 border-t border-outline-variant"${_scopeId}><div class="flex-1 min-w-[140px]"${_scopeId}><label class="${ssrRenderClass(labelCls)}"${_scopeId}>\u30CB\u30C3\u30AF\u30CD\u30FC\u30E0</label><input${ssrRenderAttr("value", memberDraftOf(member).nickname)} class="${ssrRenderClass(inputCls)}" placeholder="\u30B5\u30FC\u30D0\u30FC\u5185\u30CB\u30C3\u30AF\u30CD\u30FC\u30E0" maxlength="30"${_scopeId}></div><div class="min-w-[140px]"${_scopeId}><label class="${ssrRenderClass(labelCls)}"${_scopeId}>\u30ED\u30FC\u30EB</label><select class="${ssrRenderClass(inputCls)}"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(memberDraftOf(member).roleId) ? ssrLooseContain(memberDraftOf(member).roleId, "") : ssrLooseEqual(memberDraftOf(member).roleId, "")) ? " selected" : ""}${_scopeId}>\uFF08\u30ED\u30FC\u30EB\u306A\u3057\uFF09</option><!--[-->`);
                  ssrRenderList(unref(assignableRoles), (r) => {
                    _push2(`<option${ssrRenderAttr("value", r.id)}${ssrIncludeBooleanAttr(Array.isArray(memberDraftOf(member).roleId) ? ssrLooseContain(memberDraftOf(member).roleId, r.id) : ssrLooseEqual(memberDraftOf(member).roleId, r.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(r.name)}</option>`);
                  });
                  _push2(`<!--]--></select></div><button class="px-3 py-2 rounded-lg bg-red-600/20 text-red-400 text-xs hover:bg-red-600/30 transition border border-red-600/30 shrink-0"${_scopeId}> \u30AD\u30C3\u30AF </button><button class="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0"${_scopeId}>\u4FDD\u5B58</button></div>`);
                } else _push2(`<!---->`);
                _push2(`</div>`);
              });
              _push2(`<!--]--></div><!--]-->`);
            } else _push2(`<!---->`);
            if (unref(tab) === "invites") {
              _push2(`<!--[--><h3 class="text-lg font-bold text-white mb-1"${_scopeId}>\u62DB\u5F85</h3><p class="text-sm text-on-surface-variant mb-5"${_scopeId}>\u62DB\u5F85\u30EA\u30F3\u30AF\u3092\u4F5C\u6210\u30FB\u7BA1\u7406\u3067\u304D\u307E\u3059\u3002</p>`);
              if (can.invites()) {
                _push2(`<div class="bg-surface-container/30 border border-outline-variant rounded-xl p-4 mb-4 space-y-3"${_scopeId}><div class="grid grid-cols-2 gap-3"${_scopeId}><div${_scopeId}><label class="${ssrRenderClass(labelCls)}"${_scopeId}>\u6700\u5927\u4F7F\u7528\u56DE\u6570\uFF080 = \u7121\u5236\u9650\uFF09</label><input${ssrRenderAttr("value", unref(inviteForm).maxUses)} type="number" min="0" class="${ssrRenderClass(inputCls)}"${_scopeId}></div><div${_scopeId}><label class="${ssrRenderClass(labelCls)}"${_scopeId}>\u6709\u52B9\u6642\u9593\uFF08\u6642\u9593 / 0 = \u7121\u671F\u9650\uFF09</label><input${ssrRenderAttr("value", unref(inviteForm).expiresInHours)} type="number" min="0" class="${ssrRenderClass(inputCls)}"${_scopeId}></div></div><button class="${ssrRenderClass([btnPrimary, "w-full flex items-center justify-center gap-1.5"])}"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "lucide:plus",
                  class: "w-4 h-4"
                }, null, _parent2, _scopeId));
                _push2(` \u62DB\u5F85\u30EA\u30F3\u30AF\u3092\u4F5C\u6210 </button></div>`);
              } else _push2(`<!---->`);
              _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
              ssrRenderList(unref(invites), (invite) => {
                _push2(`<div class="bg-surface-container/40 border border-outline-variant rounded-xl p-3 flex items-center gap-3"${_scopeId}><div class="flex-1 min-w-0"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><code class="bg-surface border border-outline px-2 py-0.5 rounded text-indigo-400 text-sm"${_scopeId}>${ssrInterpolate(invite.code)}</code>`);
                if (invite.useCount >= invite.maxUses && invite.maxUses > 0) _push2(`<span class="text-[10px] font-bold text-red-400"${_scopeId}>\u6E80\u4E86</span>`);
                else _push2(`<!---->`);
                _push2(`</div><p class="text-xs text-on-surface-variant mt-1.5"${_scopeId}> \u4F7F\u7528: ${ssrInterpolate(invite.useCount)}${ssrInterpolate(invite.maxUses > 0 ? ` / ${invite.maxUses}` : "")} \u56DE \xB7 ${ssrInterpolate(expiresLabel(invite))}</p></div><button class="px-3 py-1.5 rounded-lg border border-outline text-xs text-on-surface hover:bg-surface-container-high transition shrink-0"${_scopeId}>${ssrInterpolate(unref(copiedCode) === invite.code ? "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F" : "\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC")}</button>`);
                if (can.invites()) {
                  _push2(`<button class="text-on-surface-variant hover:text-red-400 transition shrink-0"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_Icon, {
                    name: "lucide:trash-2",
                    class: "w-4 h-4"
                  }, null, _parent2, _scopeId));
                  _push2(`</button>`);
                } else _push2(`<!---->`);
                _push2(`</div>`);
              });
              _push2(`<!--]-->`);
              if (!unref(invites).length) _push2(`<p class="text-sm text-on-surface-variant text-center py-6"${_scopeId}>\u62DB\u5F85\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093</p>`);
              else _push2(`<!---->`);
              _push2(`</div><!--]-->`);
            } else _push2(`<!---->`);
            _push2(`</div></div></div>`);
          } else return [createVNode("div", { class: "flex flex-col h-full" }, [createVNode("div", { class: "flex items-center justify-between px-5 py-4 border-b border-outline-variant shrink-0" }, [createVNode("h2", { class: "text-lg font-bold text-white" }, "\u30B5\u30FC\u30D0\u30FC\u8A2D\u5B9A"), createVNode("button", {
            onClick: ($event) => emit("close"),
            class: "text-on-surface-variant hover:text-white transition"
          }, [createVNode(_component_Icon, {
            name: "lucide:x",
            class: "w-5 h-5"
          })], 8, ["onClick"])]), createVNode("div", { class: "flex flex-1 min-h-0" }, [createVNode("div", { class: "w-44 shrink-0 border-r border-outline-variant p-3 space-y-1 overflow-y-auto" }, [(openBlock(), createBlock(Fragment, null, renderList(tabs, (t) => {
            return createVNode("button", {
              key: t.key,
              onClick: ($event) => tab.value = t.key,
              class: ["w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition", unref(tab) === t.key ? "bg-surface-container text-white" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"]
            }, [createVNode(_component_Icon, {
              name: t.icon,
              class: "w-4 h-4"
            }, null, 8, ["name"]), createTextVNode(" " + toDisplayString(t.label), 1)], 10, ["onClick"]);
          }), 64))]), createVNode("div", { class: "flex-1 min-w-0 overflow-y-auto p-5" }, [
            unref(notice) ? (openBlock(), createBlock("div", {
              key: 0,
              class: "mb-4 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-sm text-green-400"
            }, toDisplayString(unref(notice)), 1)) : createCommentVNode("", true),
            unref(noticeError) ? (openBlock(), createBlock("div", {
              key: 1,
              class: "mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400"
            }, toDisplayString(unref(noticeError)), 1)) : createCommentVNode("", true),
            unref(tab) === "overview" ? (openBlock(), createBlock(Fragment, { key: 2 }, [
              createVNode("h3", { class: "text-lg font-bold text-white mb-1" }, "\u30B3\u30DF\u30E5\u30CB\u30C6\u30A3\u8A2D\u5B9A"),
              createVNode("p", { class: "text-sm text-on-surface-variant mb-5" }, "\u30B5\u30FC\u30D0\u30FC\u306E\u57FA\u672C\u60C5\u5831\u3068\u516C\u958B\u8A2D\u5B9A\u3092\u7BA1\u7406\u3057\u307E\u3059\u3002"),
              createVNode("div", { class: "flex items-center gap-5 mb-6" }, [createVNode("div", { class: "relative w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden shrink-0" }, [((_e = __props.server) == null ? void 0 : _e.iconUrl) ? (openBlock(), createBlock("img", {
                key: 0,
                src: __props.server.iconUrl,
                class: "w-full h-full object-cover"
              }, null, 8, ["src"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString((_g = (_f = __props.server) == null ? void 0 : _f.name) == null ? void 0 : _g.charAt(0)), 1)], 64))]), createVNode("div", { class: "flex flex-col gap-2" }, [can.server() ? (openBlock(), createBlock("label", {
                key: 0,
                class: "cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline text-xs text-on-surface hover:bg-surface-container-high transition w-fit"
              }, [
                createVNode(_component_Icon, {
                  name: "lucide:image",
                  class: "w-3.5 h-3.5"
                }),
                createTextVNode(" \u30A2\u30A4\u30B3\u30F3\u3092\u5909\u66F4 "),
                createVNode("input", {
                  type: "file",
                  accept: "image/*",
                  class: "hidden",
                  onChange: (e) => uploadImage("icon", e.target.files[0])
                }, null, 40, ["onChange"])
              ])) : createCommentVNode("", true), createVNode("span", { class: "text-[11px] text-slate-600" }, "\u6B63\u65B9\u5F62\u753B\u50CF\uFF08256\xD7256\uFF09")])]),
              createVNode("div", { class: ["space-y-4", can.server() ? "" : "pointer-events-none opacity-60"] }, [
                createVNode("div", null, [createVNode("label", { class: "labelCls" }, "\u30B5\u30FC\u30D0\u30FC\u540D"), withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => unref(form).name = $event,
                  class: inputCls,
                  maxlength: "100"
                }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).name]])]),
                createVNode("div", null, [createVNode("label", { class: "labelCls" }, "\u8AAC\u660E"), withDirectives(createVNode("textarea", {
                  "onUpdate:modelValue": ($event) => unref(form).description = $event,
                  rows: "3",
                  class: inputCls,
                  placeholder: "\u30B5\u30FC\u30D0\u30FC\u306E\u8AAC\u660E",
                  maxlength: "500"
                }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).description]])]),
                createVNode("div", { class: "flex items-center justify-between bg-surface-container/50 border border-outline-variant rounded-lg px-4 py-3" }, [createVNode("div", null, [createVNode("p", { class: "text-sm font-bold text-white" }, "\u516C\u958B\u30B5\u30FC\u30D0\u30FC"), createVNode("p", { class: "text-xs text-on-surface-variant mt-0.5" }, "\u30AA\u30F3\u306B\u3059\u308B\u3068\u30B5\u30FC\u30D0\u30FC\u3092\u516C\u958B\u3057\u3001\u8AB0\u3067\u3082\u62DB\u5F85\u30EA\u30F3\u30AF\u304B\u3089\u53C2\u52A0\u3067\u304D\u307E\u3059")]), createVNode("button", {
                  type: "button",
                  role: "switch",
                  "aria-checked": unref(form).isPublic,
                  onClick: ($event) => unref(form).isPublic = !unref(form).isPublic,
                  class: ["w-11 h-6 rounded-full transition relative shrink-0", unref(form).isPublic ? "bg-indigo-600" : "bg-surface-container-high"]
                }, [createVNode("span", { class: ["absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", unref(form).isPublic ? "left-[22px]" : "left-0.5"] }, null, 2)], 10, ["aria-checked", "onClick"])]),
                createVNode("div", null, [
                  createVNode("label", { class: "labelCls" }, "\u30D0\u30CA\u30FC\u753B\u50CF"),
                  createVNode("div", { class: "relative h-24 rounded-xl overflow-hidden border border-outline-variant" }, [((_h = __props.server) == null ? void 0 : _h.bannerUrl) ? (openBlock(), createBlock("img", {
                    key: 0,
                    src: __props.server.bannerUrl,
                    class: "w-full h-full object-cover"
                  }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "w-full h-full flex items-center justify-center text-slate-600 text-xs bg-surface-container/40"
                  }, "\u30D0\u30CA\u30FC\u672A\u8A2D\u5B9A")), createVNode("label", { class: "absolute bottom-2 right-2 cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur text-xs text-white hover:bg-black/80 transition" }, [
                    createVNode(_component_Icon, {
                      name: "lucide:upload",
                      class: "w-3.5 h-3.5"
                    }),
                    createTextVNode(" \u5909\u66F4 "),
                    createVNode("input", {
                      type: "file",
                      accept: "image/*",
                      class: "hidden",
                      onChange: (e) => uploadImage("banner", e.target.files[0])
                    }, null, 40, ["onChange"])
                  ])]),
                  createVNode("p", { class: "text-[11px] text-slate-600 mt-1" }, "\u6A2A\u9577\u753B\u50CF\uFF081600\xD7450\uFF09\u304C\u304A\u3059\u3059\u3081\u3067\u3059")
                ])
              ], 2),
              can.server() ? (openBlock(), createBlock("div", {
                key: 0,
                class: "flex justify-end gap-2 mt-6"
              }, [createVNode("button", {
                onClick: ($event) => emit("close"),
                class: btnGhost
              }, "\u30AD\u30E3\u30F3\u30BB\u30EB", 8, ["onClick"]), createVNode("button", {
                onClick: saveOverview,
                disabled: unref(saving),
                class: btnPrimary
              }, "\u4FDD\u5B58", 8, ["disabled"])])) : createCommentVNode("", true),
              __props.isOwner ? (openBlock(), createBlock("div", {
                key: 1,
                class: "border-t border-outline-variant mt-8 pt-5"
              }, [
                createVNode("h4", { class: "text-sm font-bold text-red-400 mb-2" }, "\u5371\u967A\u30BE\u30FC\u30F3"),
                createVNode("p", { class: "text-xs text-on-surface-variant mb-3" }, "\u30B5\u30FC\u30D0\u30FC\u3092\u524A\u9664\u3059\u308B\u3068\u3001\u3059\u3079\u3066\u306E\u30C1\u30E3\u30F3\u30CD\u30EB\u30FB\u30E1\u30C3\u30BB\u30FC\u30B8\u30FB\u30E1\u30F3\u30D0\u30FC\u60C5\u5831\u304C\u524A\u9664\u3055\u308C\u307E\u3059\u3002"),
                createVNode("button", {
                  onClick: deleteServer,
                  class: "px-4 py-2 rounded-lg bg-red-600/20 text-red-400 text-sm hover:bg-red-600/30 transition border border-red-600/30"
                }, " \u30B5\u30FC\u30D0\u30FC\u3092\u524A\u9664 ")
              ])) : createCommentVNode("", true)
            ], 64)) : createCommentVNode("", true),
            unref(tab) === "channels" ? (openBlock(), createBlock(Fragment, { key: 3 }, [
              createVNode("h3", { class: "text-lg font-bold text-white mb-1" }, "\u30C1\u30E3\u30F3\u30CD\u30EB\u8A2D\u5B9A"),
              createVNode("p", { class: "text-sm text-on-surface-variant mb-5" }, "\u30C1\u30E3\u30F3\u30CD\u30EB\u306E\u4F5C\u6210\u30FB\u7DE8\u96C6\u30FB\u524A\u9664\u304C\u3067\u304D\u307E\u3059\u3002"),
              can.channels() ? (openBlock(), createBlock("div", {
                key: 0,
                class: "bg-surface-container/30 border border-outline-variant rounded-xl p-4 mb-4 space-y-2.5"
              }, [
                createVNode("p", { class: "text-sm font-bold text-on-surface-variant" }, "\u65B0\u3057\u3044\u30C1\u30E3\u30F3\u30CD\u30EB"),
                createVNode("div", { class: "flex gap-2" }, [withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => unref(newChannel).name = $event,
                  class: inputCls,
                  placeholder: "\u30C1\u30E3\u30F3\u30CD\u30EB\u540D",
                  maxlength: "50"
                }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(newChannel).name]])]),
                createVNode("div", { class: "flex items-center gap-2" }, [
                  createVNode("div", { class: "flex rounded-lg bg-surface-container border border-outline p-0.5" }, [(openBlock(), createBlock(Fragment, null, renderList(channelTypes, (t) => {
                    return createVNode("button", {
                      key: t.key,
                      type: "button",
                      onClick: ($event) => unref(newChannel).type = t.key,
                      class: ["flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition", unref(newChannel).type === t.key ? "bg-indigo-600 text-white" : "text-on-surface-variant hover:text-on-surface"]
                    }, [createVNode(_component_Icon, {
                      name: t.icon,
                      class: "w-3.5 h-3.5"
                    }, null, 8, ["name"]), createTextVNode(" " + toDisplayString(t.label), 1)], 10, ["onClick"]);
                  }), 64))]),
                  withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => unref(newChannel).description = $event,
                    class: inputCls,
                    placeholder: "\u8AAC\u660E\uFF08\u4EFB\u610F\uFF09",
                    maxlength: "200"
                  }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(newChannel).description]]),
                  createVNode("button", {
                    onClick: createChannel,
                    disabled: !unref(newChannel).name.trim(),
                    class: [btnPrimary, "shrink-0"]
                  }, "\u4F5C\u6210", 8, ["disabled"])
                ])
              ])) : createCommentVNode("", true),
              createVNode("div", { class: "space-y-2" }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.channels, (ch) => {
                return openBlock(), createBlock("div", {
                  key: ch.id,
                  class: "bg-surface-container/40 border border-outline-variant rounded-xl overflow-hidden"
                }, [createVNode("div", { class: "flex items-center gap-2 px-4 py-3" }, [
                  createVNode(_component_Icon, {
                    name: channelTypeIcon(ch.type),
                    class: "w-4 h-4 text-on-surface-variant shrink-0"
                  }, null, 8, ["name"]),
                  createVNode("span", { class: "text-sm font-bold text-white flex-1 truncate" }, toDisplayString(ch.name), 1),
                  channelTypeLabel(ch.type) ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded px-1.5 py-0.5"
                  }, toDisplayString(channelTypeLabel(ch.type)), 1)) : createCommentVNode("", true),
                  ch.nsfw ? (openBlock(), createBlock("span", {
                    key: 1,
                    class: "text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded px-1.5 py-0.5"
                  }, "NSFW")) : createCommentVNode("", true),
                  ch.slowModeSeconds > 0 ? (openBlock(), createBlock("span", {
                    key: 2,
                    class: "text-[10px] text-on-surface-variant"
                  }, "\u30B9\u30ED\u30FC\u30E2\u30FC\u30C9 " + toDisplayString(ch.slowModeSeconds) + "s", 1)) : createCommentVNode("", true),
                  can.channels() ? (openBlock(), createBlock("button", {
                    key: 3,
                    onClick: ($event) => expandedChannelId.value = unref(expandedChannelId) === ch.id ? null : ch.id,
                    class: "text-on-surface-variant hover:text-white transition"
                  }, [createVNode(_component_Icon, {
                    name: unref(expandedChannelId) === ch.id ? "lucide:chevron-up" : "lucide:settings-2",
                    class: "w-4 h-4"
                  }, null, 8, ["name"])], 8, ["onClick"])) : createCommentVNode("", true)
                ]), unref(expandedChannelId) === ch.id && can.channels() ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "border-t border-outline-variant p-4 space-y-3"
                }, [
                  createVNode("div", null, [createVNode("label", { class: labelCls }, "\u30C1\u30E3\u30F3\u30CD\u30EB\u540D"), withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => draftOf(ch).name = $event,
                    class: inputCls,
                    maxlength: "50"
                  }, null, 8, ["onUpdate:modelValue"]), [[vModelText, draftOf(ch).name]])]),
                  createVNode("div", null, [
                    createVNode("label", { class: labelCls }, "\u30C1\u30E3\u30F3\u30CD\u30EB\u30BF\u30A4\u30D7"),
                    createVNode("div", { class: "flex rounded-lg bg-surface-container border border-outline p-0.5 w-fit" }, [(openBlock(), createBlock(Fragment, null, renderList(channelTypes, (t) => {
                      return createVNode("button", {
                        key: t.key,
                        type: "button",
                        onClick: ($event) => draftOf(ch).type = t.key,
                        class: ["flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition", draftOf(ch).type === t.key ? "bg-indigo-600 text-white" : "text-on-surface-variant hover:text-on-surface"]
                      }, [createVNode(_component_Icon, {
                        name: t.icon,
                        class: "w-3.5 h-3.5"
                      }, null, 8, ["name"]), createTextVNode(" " + toDisplayString(t.label), 1)], 10, ["onClick"]);
                    }), 64))]),
                    draftOf(ch).type === "voice" ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-[11px] text-emerald-500 mt-1"
                    }, "\u97F3\u58F0\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F\u901A\u8A71\u306B\u53C2\u52A0\u3067\u304D\u307E\u3059\u3002\u30E1\u30C3\u30BB\u30FC\u30B8\u306F\u8868\u793A\u3055\u308C\u307E\u305B\u3093\u3002")) : draftOf(ch).type === "video" ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "text-[11px] text-indigo-400 mt-1"
                    }, "\u52D5\u753B\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F\u52D5\u753B\u3092\u4E2D\u5FC3\u306B\u6295\u7A3F\u3067\u304D\u307E\u3059\u3002")) : draftOf(ch).type === "music" ? (openBlock(), createBlock("p", {
                      key: 2,
                      class: "text-[11px] text-indigo-400 mt-1"
                    }, "\u97F3\u697D\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F\u97F3\u58F0\u30D5\u30A1\u30A4\u30EB\u3092\u4E2D\u5FC3\u306B\u6295\u7A3F\u3067\u304D\u307E\u3059\u3002")) : draftOf(ch).type === "gallery" ? (openBlock(), createBlock("p", {
                      key: 3,
                      class: "text-[11px] text-indigo-400 mt-1"
                    }, "\u753B\u50CF\u30AE\u30E3\u30E9\u30EA\u30FC\u3067\u306F\u753B\u50CF\u3092\u4E2D\u5FC3\u306B\u6295\u7A3F\u3067\u304D\u307E\u3059\u3002")) : draftOf(ch).type === "model" ? (openBlock(), createBlock("p", {
                      key: 4,
                      class: "text-[11px] text-indigo-400 mt-1"
                    }, "3D\u30E2\u30C7\u30EB\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F .glb / .gltf \u306A\u3069\u306E3D\u30E2\u30C7\u30EB\u3092\u6295\u7A3F\u30FB\u95B2\u89A7\u3067\u304D\u307E\u3059\u3002")) : draftOf(ch).type === "file" ? (openBlock(), createBlock("p", {
                      key: 5,
                      class: "text-[11px] text-indigo-400 mt-1"
                    }, "\u30D5\u30A1\u30A4\u30EB\u30C1\u30E3\u30F3\u30CD\u30EB\u3067\u306F PDF\u30FBZIP \u306A\u3069\u306E\u30D5\u30A1\u30A4\u30EB\u3092\u5171\u6709\u3067\u304D\u307E\u3059\u3002")) : createCommentVNode("", true)
                  ]),
                  createVNode("div", null, [createVNode("label", { class: labelCls }, "\u8AAC\u660E"), withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => draftOf(ch).description = $event,
                    class: inputCls,
                    maxlength: "200"
                  }, null, 8, ["onUpdate:modelValue"]), [[vModelText, draftOf(ch).description]])]),
                  createVNode("div", { class: "grid grid-cols-2 gap-3" }, [createVNode("div", null, [createVNode("label", { class: labelCls }, "\u30B9\u30ED\u30FC\u30E2\u30FC\u30C9\uFF08\u79D2\uFF09"), withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => draftOf(ch).slowModeSeconds = $event,
                    type: "number",
                    min: "0",
                    max: "21600",
                    class: inputCls
                  }, null, 8, ["onUpdate:modelValue"]), [[
                    vModelText,
                    draftOf(ch).slowModeSeconds,
                    void 0,
                    { number: true }
                  ]])]), createVNode("div", { class: "flex items-end pb-1" }, [createVNode("button", {
                    type: "button",
                    role: "switch",
                    "aria-checked": draftOf(ch).nsfw,
                    onClick: ($event) => draftOf(ch).nsfw = !draftOf(ch).nsfw,
                    class: ["w-11 h-6 rounded-full transition relative", draftOf(ch).nsfw ? "bg-red-600" : "bg-surface-container-high"]
                  }, [createVNode("span", { class: ["absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all", draftOf(ch).nsfw ? "left-[22px]" : "left-0.5"] }, null, 2)], 10, ["aria-checked", "onClick"]), createVNode("span", { class: "text-sm text-on-surface-variant ml-2" }, "NSFW\u30C1\u30E3\u30F3\u30CD\u30EB")])]),
                  createVNode("div", { class: "flex justify-end gap-2 pt-1" }, [createVNode("button", {
                    onClick: ($event) => deleteChannel(ch),
                    class: "px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-xs hover:bg-red-600/30 transition border border-red-600/30"
                  }, " \u524A\u9664 ", 8, ["onClick"]), createVNode("button", {
                    onClick: ($event) => saveChannel(ch),
                    class: "px-4 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition"
                  }, "\u4FDD\u5B58", 8, ["onClick"])])
                ])) : createCommentVNode("", true)]);
              }), 128)), !__props.channels.length ? (openBlock(), createBlock("p", {
                key: 0,
                class: "text-sm text-on-surface-variant text-center py-6"
              }, "\u30C1\u30E3\u30F3\u30CD\u30EB\u304C\u3042\u308A\u307E\u305B\u3093")) : createCommentVNode("", true)])
            ], 64)) : createCommentVNode("", true),
            unref(tab) === "roles" ? (openBlock(), createBlock(Fragment, { key: 4 }, [
              createVNode("h3", { class: "text-lg font-bold text-white mb-1" }, "\u30ED\u30FC\u30EB\u3068\u6A29\u9650"),
              createVNode("p", { class: "text-sm text-on-surface-variant mb-5" }, "\u30ED\u30FC\u30EB\u3092\u4F5C\u6210\u3057\u3001\u8A73\u7D30\u306A\u6A29\u9650\u3092\u8A2D\u5B9A\u3067\u304D\u307E\u3059\u3002"),
              createVNode("div", { class: "grid grid-cols-[180px_1fr] gap-4" }, [createVNode("div", { class: "space-y-1" }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.roles, (role) => {
                return openBlock(), createBlock("div", {
                  key: role.id,
                  onClick: ($event) => selectRole(role),
                  class: ["flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition", unref(selectedRoleId) === role.id ? "bg-surface-container text-white" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"]
                }, [createVNode("span", {
                  class: "w-3 h-3 rounded-full shrink-0",
                  style: { backgroundColor: role.color || "#6366f1" }
                }, null, 4), createVNode("span", { class: "text-sm truncate" }, toDisplayString(role.name), 1)], 10, ["onClick"]);
              }), 128)), can.roles() ? (openBlock(), createBlock("div", {
                key: 0,
                class: "border-t border-outline-variant pt-3 mt-3 space-y-2"
              }, [withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => isRef(newRoleName) ? newRoleName.value = $event : null,
                class: inputCls,
                placeholder: "\u65B0\u3057\u3044\u30ED\u30FC\u30EB\u540D",
                maxlength: "30"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(newRoleName)]]), createVNode("div", { class: "flex gap-2 items-center" }, [withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => isRef(newRoleColor) ? newRoleColor.value = $event : null,
                type: "color",
                class: "w-9 h-9 rounded-lg bg-surface-container border border-outline cursor-pointer"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(newRoleColor)]]), createVNode("button", {
                onClick: addRole,
                disabled: !unref(newRoleName).trim(),
                class: "flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"
              }, "\u30ED\u30FC\u30EB\u3092\u4F5C\u6210", 8, ["disabled"])])])) : createCommentVNode("", true)]), createVNode("div", { class: "bg-surface-container/30 border border-outline-variant rounded-xl p-4 min-h-[300px]" }, [unref(selectedRole) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                createVNode("div", { class: "flex items-center justify-between mb-4" }, [createVNode("div", { class: "flex items-center gap-2" }, [createVNode("span", {
                  class: "w-4 h-4 rounded-full",
                  style: { backgroundColor: unref(roleDraft).color }
                }, null, 4), createVNode("span", { class: "font-bold text-white" }, toDisplayString(unref(roleDraft).name), 1)]), can.roles() ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "flex gap-2"
                }, [!unref(roleDraft).isAdmin ? (openBlock(), createBlock("button", {
                  key: 0,
                  onClick: removeRole,
                  class: "text-on-surface-variant hover:text-red-400 transition"
                }, [createVNode(_component_Icon, {
                  name: "lucide:trash-2",
                  class: "w-4 h-4"
                })])) : createCommentVNode("", true), createVNode("button", {
                  onClick: saveRole,
                  class: "px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition"
                }, "\u4FDD\u5B58")])) : createCommentVNode("", true)]),
                can.roles() ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "grid grid-cols-2 gap-3 mb-4"
                }, [createVNode("div", null, [createVNode("label", { class: labelCls }, "\u30ED\u30FC\u30EB\u540D"), withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => unref(roleDraft).name = $event,
                  class: inputCls,
                  maxlength: "30"
                }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(roleDraft).name]])]), createVNode("div", null, [createVNode("label", { class: labelCls }, "\u8272"), withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => unref(roleDraft).color = $event,
                  type: "color",
                  class: "w-full h-10 rounded-lg bg-surface-container border border-outline cursor-pointer"
                }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(roleDraft).color]])])])) : createCommentVNode("", true),
                unref(roleDraft).isAdmin ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-3"
                }, [createVNode(_component_Icon, {
                  name: "lucide:crown",
                  class: "w-3.5 h-3.5 inline mr-1"
                }), createTextVNode(" \u7BA1\u7406\u8005\u30ED\u30FC\u30EB\u306F\u3059\u3079\u3066\u306E\u6A29\u9650\u3092\u6301\u3061\u3001\u6A29\u9650\u3092\u7DE8\u96C6\u3067\u304D\u307E\u305B\u3093\u3002 ")])) : createCommentVNode("", true),
                can.roles() && !unref(roleDraft).isAdmin ? (openBlock(), createBlock("div", { key: 2 }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(PERMISSION_GROUPS), (group) => {
                  return openBlock(), createBlock("div", {
                    key: group.label,
                    class: "mb-4"
                  }, [createVNode("p", { class: "text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2" }, toDisplayString(group.label), 1), createVNode("div", { class: "space-y-1" }, [(openBlock(true), createBlock(Fragment, null, renderList(group.permissions, (p) => {
                    return openBlock(), createBlock("button", {
                      key: p.key,
                      onClick: ($event) => togglePerm(unref(PERMISSIONS)[p.key]),
                      class: "w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container/50 transition text-left"
                    }, [createVNode("span", { class: ["w-5 h-5 rounded-md border flex items-center justify-center shrink-0", (unref(roleDraft).mask & unref(PERMISSIONS)[p.key]) === unref(PERMISSIONS)[p.key] ? "bg-indigo-600 border-indigo-500" : "border-slate-600"] }, [(unref(roleDraft).mask & unref(PERMISSIONS)[p.key]) === unref(PERMISSIONS)[p.key] ? (openBlock(), createBlock(_component_Icon, {
                      key: 0,
                      name: "lucide:check",
                      class: "w-3.5 h-3.5 text-white"
                    })) : createCommentVNode("", true)], 2), createVNode("span", null, [createVNode("span", { class: "block text-sm text-on-surface" }, toDisplayString(p.label), 1), createVNode("span", { class: "block text-xs text-on-surface-variant" }, toDisplayString(p.description), 1)])], 8, ["onClick"]);
                  }), 128))])]);
                }), 128))])) : createCommentVNode("", true),
                !can.roles() && !unref(roleDraft).isAdmin ? (openBlock(), createBlock("p", {
                  key: 3,
                  class: "text-xs text-on-surface-variant"
                }, " \u30ED\u30FC\u30EB\u3092\u7DE8\u96C6\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u73FE\u5728\u306E\u6A29\u9650\u306F\u8AAD\u307F\u53D6\u308A\u5C02\u7528\u3067\u3059\u3002 ")) : createCommentVNode("", true)
              ], 64)) : (openBlock(), createBlock("p", {
                key: 1,
                class: "text-sm text-on-surface-variant text-center py-10"
              }, "\u30ED\u30FC\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044"))])])
            ], 64)) : createCommentVNode("", true),
            unref(tab) === "members" ? (openBlock(), createBlock(Fragment, { key: 5 }, [
              createVNode("h3", { class: "text-lg font-bold text-white mb-1" }, "\u30E1\u30F3\u30D0\u30FC\u7BA1\u7406"),
              createVNode("p", { class: "text-sm text-on-surface-variant mb-5" }, toDisplayString(__props.members.length) + " \u4EBA\u306E\u30E1\u30F3\u30D0\u30FC", 1),
              createVNode("div", { class: "space-y-2" }, [(openBlock(true), createBlock(Fragment, null, renderList(__props.members, (member) => {
                var _a2, _b2, _c2, _d2, _e2, _f2, _g2;
                return openBlock(), createBlock("div", {
                  key: member.userId,
                  class: "bg-surface-container/40 border border-outline-variant rounded-xl p-3"
                }, [createVNode("div", { class: "flex items-center gap-3" }, [createVNode("div", { class: "w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden" }, [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = member.user) == null ? void 0 : _a2.avatarUrl) ? (openBlock(), createBlock("img", {
                  key: 0,
                  src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(member.user.avatarUrl),
                  class: "w-full h-full object-cover"
                }, null, 8, ["src"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(((_c2 = (_b2 = member.user) == null ? void 0 : _b2.displayName) == null ? void 0 : _c2.charAt(0)) || "?"), 1)], 64))]), createVNode("div", { class: "flex-1 min-w-0" }, [createVNode("div", { class: "flex items-center gap-2" }, [
                  createVNode("span", { class: "text-sm font-bold text-white truncate" }, toDisplayString(((_d2 = member.user) == null ? void 0 : _d2.displayName) || member.nickname || "\u4E0D\u660E"), 1),
                  member.role ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-[11px] px-2 py-0.5 rounded-full",
                    style: {
                      color: member.role.color || "#99aab5",
                      backgroundColor: (member.role.color || "#99aab5") + "22"
                    }
                  }, toDisplayString(member.role.name), 5)) : createCommentVNode("", true),
                  ((_e2 = __props.server) == null ? void 0 : _e2.ownerId) === member.userId ? (openBlock(), createBlock("span", {
                    key: 1,
                    class: "text-[11px] text-amber-400"
                  }, "\u6240\u6709\u8005")) : createCommentVNode("", true)
                ]), createVNode("p", { class: "text-xs text-on-surface-variant truncate" }, "@" + toDisplayString((_f2 = member.user) == null ? void 0 : _f2.username), 1)])]), can.members() && ((_g2 = __props.server) == null ? void 0 : _g2.ownerId) !== member.userId ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "flex flex-wrap items-end gap-2 mt-3 pt-3 border-t border-outline-variant"
                }, [
                  createVNode("div", { class: "flex-1 min-w-[140px]" }, [createVNode("label", { class: labelCls }, "\u30CB\u30C3\u30AF\u30CD\u30FC\u30E0"), withDirectives(createVNode("input", {
                    "onUpdate:modelValue": ($event) => memberDraftOf(member).nickname = $event,
                    class: inputCls,
                    placeholder: "\u30B5\u30FC\u30D0\u30FC\u5185\u30CB\u30C3\u30AF\u30CD\u30FC\u30E0",
                    maxlength: "30"
                  }, null, 8, ["onUpdate:modelValue"]), [[vModelText, memberDraftOf(member).nickname]])]),
                  createVNode("div", { class: "min-w-[140px]" }, [createVNode("label", { class: labelCls }, "\u30ED\u30FC\u30EB"), withDirectives(createVNode("select", {
                    "onUpdate:modelValue": ($event) => memberDraftOf(member).roleId = $event,
                    class: inputCls
                  }, [createVNode("option", { value: "" }, "\uFF08\u30ED\u30FC\u30EB\u306A\u3057\uFF09"), (openBlock(true), createBlock(Fragment, null, renderList(unref(assignableRoles), (r) => {
                    return openBlock(), createBlock("option", {
                      key: r.id,
                      value: r.id
                    }, toDisplayString(r.name), 9, ["value"]);
                  }), 128))], 8, ["onUpdate:modelValue"]), [[vModelSelect, memberDraftOf(member).roleId]])]),
                  createVNode("button", {
                    onClick: ($event) => kickMember(member),
                    class: "px-3 py-2 rounded-lg bg-red-600/20 text-red-400 text-xs hover:bg-red-600/30 transition border border-red-600/30 shrink-0"
                  }, " \u30AD\u30C3\u30AF ", 8, ["onClick"]),
                  createVNode("button", {
                    onClick: ($event) => saveMember(member),
                    class: "px-4 py-2 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0"
                  }, "\u4FDD\u5B58", 8, ["onClick"])
                ])) : createCommentVNode("", true)]);
              }), 128))])
            ], 64)) : createCommentVNode("", true),
            unref(tab) === "invites" ? (openBlock(), createBlock(Fragment, { key: 6 }, [
              createVNode("h3", { class: "text-lg font-bold text-white mb-1" }, "\u62DB\u5F85"),
              createVNode("p", { class: "text-sm text-on-surface-variant mb-5" }, "\u62DB\u5F85\u30EA\u30F3\u30AF\u3092\u4F5C\u6210\u30FB\u7BA1\u7406\u3067\u304D\u307E\u3059\u3002"),
              can.invites() ? (openBlock(), createBlock("div", {
                key: 0,
                class: "bg-surface-container/30 border border-outline-variant rounded-xl p-4 mb-4 space-y-3"
              }, [createVNode("div", { class: "grid grid-cols-2 gap-3" }, [createVNode("div", null, [createVNode("label", { class: labelCls }, "\u6700\u5927\u4F7F\u7528\u56DE\u6570\uFF080 = \u7121\u5236\u9650\uFF09"), withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => unref(inviteForm).maxUses = $event,
                type: "number",
                min: "0",
                class: inputCls
              }, null, 8, ["onUpdate:modelValue"]), [[
                vModelText,
                unref(inviteForm).maxUses,
                void 0,
                { number: true }
              ]])]), createVNode("div", null, [createVNode("label", { class: labelCls }, "\u6709\u52B9\u6642\u9593\uFF08\u6642\u9593 / 0 = \u7121\u671F\u9650\uFF09"), withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => unref(inviteForm).expiresInHours = $event,
                type: "number",
                min: "0",
                class: inputCls
              }, null, 8, ["onUpdate:modelValue"]), [[
                vModelText,
                unref(inviteForm).expiresInHours,
                void 0,
                { number: true }
              ]])])]), createVNode("button", {
                onClick: createInvite,
                class: [btnPrimary, "w-full flex items-center justify-center gap-1.5"]
              }, [createVNode(_component_Icon, {
                name: "lucide:plus",
                class: "w-4 h-4"
              }), createTextVNode(" \u62DB\u5F85\u30EA\u30F3\u30AF\u3092\u4F5C\u6210 ")])])) : createCommentVNode("", true),
              createVNode("div", { class: "space-y-2" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(invites), (invite) => {
                return openBlock(), createBlock("div", {
                  key: invite.id,
                  class: "bg-surface-container/40 border border-outline-variant rounded-xl p-3 flex items-center gap-3"
                }, [
                  createVNode("div", { class: "flex-1 min-w-0" }, [createVNode("div", { class: "flex items-center gap-2" }, [createVNode("code", { class: "bg-surface border border-outline px-2 py-0.5 rounded text-indigo-400 text-sm" }, toDisplayString(invite.code), 1), invite.useCount >= invite.maxUses && invite.maxUses > 0 ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-[10px] font-bold text-red-400"
                  }, "\u6E80\u4E86")) : createCommentVNode("", true)]), createVNode("p", { class: "text-xs text-on-surface-variant mt-1.5" }, " \u4F7F\u7528: " + toDisplayString(invite.useCount) + toDisplayString(invite.maxUses > 0 ? ` / ${invite.maxUses}` : "") + " \u56DE \xB7 " + toDisplayString(expiresLabel(invite)), 1)]),
                  createVNode("button", {
                    onClick: ($event) => copyInvite(invite),
                    class: "px-3 py-1.5 rounded-lg border border-outline text-xs text-on-surface hover:bg-surface-container-high transition shrink-0"
                  }, toDisplayString(unref(copiedCode) === invite.code ? "\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F" : "\u30EA\u30F3\u30AF\u3092\u30B3\u30D4\u30FC"), 9, ["onClick"]),
                  can.invites() ? (openBlock(), createBlock("button", {
                    key: 0,
                    onClick: ($event) => revokeInvite(invite),
                    class: "text-on-surface-variant hover:text-red-400 transition shrink-0"
                  }, [createVNode(_component_Icon, {
                    name: "lucide:trash-2",
                    class: "w-4 h-4"
                  })], 8, ["onClick"])) : createCommentVNode("", true)
                ]);
              }), 128)), !unref(invites).length ? (openBlock(), createBlock("p", {
                key: 0,
                class: "text-sm text-on-surface-variant text-center py-6"
              }, "\u62DB\u5F85\u306F\u307E\u3060\u3042\u308A\u307E\u305B\u3093")) : createCommentVNode("", true)])
            ], 64)) : createCommentVNode("", true)
          ])])])];
        }),
        _: 1
      }, _parent));
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full flex bg-surface text-on-surface overflow-hidden" }, _attrs))} data-v-d38ac582><aside class="w-56 bg-surface/60 flex flex-col shrink-0 border-r border-outline-variant" data-v-d38ac582><div class="h-12 px-3 flex items-center justify-between border-b border-outline-variant shrink-0" data-v-d38ac582><h2 class="font-bold text-white truncate text-sm flex items-center gap-2 min-w-0" data-v-d38ac582><div class="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden" data-v-d38ac582>`);
      if ((_a = unref(server)) == null ? void 0 : _a.iconUrl) _push(`<img${ssrRenderAttr("src", unref(server).iconUrl)} class="w-full h-full object-cover" data-v-d38ac582>`);
      else _push(`<!--[-->${ssrInterpolate(((_c = (_b = unref(server)) == null ? void 0 : _b.name) == null ? void 0 : _c.charAt(0)) || "?")}<!--]-->`);
      _push(`</div><span class="truncate" data-v-d38ac582>${ssrInterpolate(((_d = unref(server)) == null ? void 0 : _d.name) || "\u30B5\u30FC\u30D0\u30FC")}</span></h2>`);
      if (unref(canManage)) {
        _push(`<button class="text-on-surface-variant hover:text-white transition" data-v-d38ac582>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:settings",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      _push(`</div><div class="flex-1 overflow-y-auto p-2 space-y-0.5" data-v-d38ac582><!--[-->`);
      ssrRenderList(unref(groupedChannels), (group) => {
        _push(`<!--[--><div class="flex items-center justify-between px-2 py-1 mt-2 first:mt-0" data-v-d38ac582><span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" data-v-d38ac582>${ssrInterpolate(group.label)}</span>`);
        if (unref(canManage)) {
          _push(`<button class="text-on-surface-variant hover:text-white transition" data-v-d38ac582>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:plus",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`</button>`);
        } else _push(`<!---->`);
        _push(`</div><!--[-->`);
        ssrRenderList(group.channels, (ch) => {
          _push(`<button class="${ssrRenderClass(["w-full text-left px-2 py-1.5 rounded-md transition flex items-center gap-1.5 text-sm", unref(activeChannelId) === ch.id ? "bg-surface-container-high/60 text-white" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"])}" data-v-d38ac582>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: channelIcon(ch.type),
            class: "w-3.5 h-3.5 text-on-surface-variant shrink-0"
          }, null, _parent));
          _push(`<span class="truncate flex-1" data-v-d38ac582>${ssrInterpolate(ch.name)}</span>`);
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
        _push(`<!--[--><div class="flex items-center justify-between px-2 py-1 mt-2" data-v-d38ac582><span class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider" data-v-d38ac582>\u97F3\u58F0\u30C1\u30E3\u30F3\u30CD\u30EB</span>`);
        if (unref(canManage)) {
          _push(`<button class="text-on-surface-variant hover:text-white transition" data-v-d38ac582>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:plus",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`</button>`);
        } else _push(`<!---->`);
        _push(`</div><!--[-->`);
        ssrRenderList(unref(voiceChannels), (ch) => {
          _push(`<button class="${ssrRenderClass(["w-full text-left px-2 py-1.5 rounded-md transition flex items-center gap-1.5 text-sm", unref(voiceChannelId) === ch.id ? "bg-emerald-700/40 text-white" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50"])}" data-v-d38ac582>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:volume-2",
            class: "w-3.5 h-3.5 text-on-surface-variant shrink-0"
          }, null, _parent));
          _push(`<span class="truncate flex-1" data-v-d38ac582>${ssrInterpolate(ch.name)}</span>`);
          if (unref(voicePresence)[`server:${unref(serverId)}:${ch.id}`]) _push(`<span class="text-[10px] text-emerald-400" data-v-d38ac582>${ssrInterpolate(unref(voicePresence)[`server:${unref(serverId)}:${ch.id}`])}</span>`);
          else _push(`<!---->`);
          _push(`</button>`);
        });
        _push(`<!--]--><!--]-->`);
      } else _push(`<!---->`);
      _push(`</div><div class="p-3 border-t border-outline-variant shrink-0" data-v-d38ac582><button class="w-full flex items-center gap-2 text-sm text-on-surface-variant hover:text-white transition" data-v-d38ac582>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:users",
        class: "w-4 h-4"
      }, null, _parent));
      _push(` \u30E1\u30F3\u30D0\u30FC ${ssrInterpolate(unref(members).length)}</button></div></aside><div class="flex-1 flex flex-col min-w-0" data-v-d38ac582><div class="h-12 px-4 flex items-center border-b border-outline-variant shrink-0 gap-2" data-v-d38ac582>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: channelIcon((_e = unref(activeChannel)) == null ? void 0 : _e.type),
        class: "w-4 h-4 text-on-surface-variant shrink-0"
      }, null, _parent));
      _push(`<span class="font-bold text-white text-sm truncate" data-v-d38ac582>${ssrInterpolate(((_f = unref(activeChannel)) == null ? void 0 : _f.name) || "\u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u9078\u629E")}</span>`);
      if ((_g = unref(activeChannel)) == null ? void 0 : _g.description) _push(`<span class="text-xs text-on-surface-variant truncate hidden sm:inline" data-v-d38ac582>\u2014 ${ssrInterpolate(unref(activeChannel).description)}</span>`);
      else _push(`<!---->`);
      if (unref(activeChannel) && unref(canManage)) {
        _push(`<button class="ml-1 text-on-surface-variant hover:text-white transition" title="\u30C1\u30E3\u30F3\u30CD\u30EB\u8A2D\u5B9A" data-v-d38ac582>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:settings-2",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      _push(`<button class="ml-auto lg:hidden text-on-surface-variant hover:text-white transition" title="\u30E1\u30F3\u30D0\u30FC" data-v-d38ac582>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:users",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button></div><div class="flex-1 overflow-y-auto p-4 space-y-3" data-v-d38ac582>`);
      if (!unref(activeChannelId)) _push(`<div class="flex items-center justify-center h-full text-on-surface-variant" data-v-d38ac582> \u30C1\u30E3\u30F3\u30CD\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044 </div>`);
      else {
        _push(`<!--[--><div class="rounded-xl border border-outline-variant overflow-hidden bg-surface/20" data-v-d38ac582><!--[-->`);
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
        if (!unref(posts).length) _push(`<p class="text-center text-on-surface-variant py-8 text-sm" data-v-d38ac582>\u307E\u3060\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u6700\u521D\u306E\u30E1\u30C7\u30A3\u30A2\u3092\u6295\u7A3F\u3057\u307E\u3057\u3087\u3046</p>`);
        else _push(`<!---->`);
        _push(`</div><div class="h-1" aria-hidden="true" data-v-d38ac582></div>`);
        if (unref(loadingMorePosts)) _push(`<div class="text-center text-on-surface-variant py-4 text-sm" data-v-d38ac582>\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
        else if (unref(posts).length && !unref(postHasMore)) _push(`<p class="text-center text-slate-600 py-4 text-xs" data-v-d38ac582>\u3059\u3079\u3066\u8868\u793A\u3057\u307E\u3057\u305F</p>`);
        else _push(`<!---->`);
        _push(`<!--]-->`);
      }
      _push(`</div>`);
      if (unref(activeChannelId) && unref(canSend)) {
        _push(`<div class="px-4 pb-4 shrink-0" data-v-d38ac582><div class="bg-surface/70 border border-outline-variant rounded-xl p-3" data-v-d38ac582>`);
        _push(ssrRenderComponent(_component_PostComposer, {
          "media-kind": unref(composerMediaKind),
          placeholder: `${((_h = unref(activeChannel)) == null ? void 0 : _h.name) || ""} \u306B\u6295\u7A3F`,
          onSubmit: submitPost
        }, null, _parent));
        _push(`</div></div>`);
      } else if (unref(activeChannelId)) _push(`<div class="px-4 pb-4 shrink-0 text-center text-sm text-on-surface-variant" data-v-d38ac582> \u3053\u306E\u30B5\u30FC\u30D0\u30FC\u3067\u6295\u7A3F\u3059\u308B\u6A29\u9650\u304C\u3042\u308A\u307E\u305B\u3093 </div>`);
      else _push(`<!---->`);
      _push(`</div>`);
      if (unref(showMemberList)) {
        _push(`<div class="fixed inset-0 z-[80] flex justify-end" data-v-d38ac582><div class="absolute inset-0 bg-black/50" data-v-d38ac582></div><aside class="relative w-64 bg-surface border-l border-outline-variant h-full flex flex-col" data-v-d38ac582><div class="h-12 px-4 flex items-center border-b border-outline-variant shrink-0" data-v-d38ac582><span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider" data-v-d38ac582>\u30E1\u30F3\u30D0\u30FC \u2014 ${ssrInterpolate(unref(members).length)}</span><button class="ml-auto text-on-surface-variant hover:text-white transition" data-v-d38ac582>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button></div><div class="flex-1 overflow-y-auto p-3 space-y-1" data-v-d38ac582><!--[-->`);
        ssrRenderList(unref(members), (member) => {
          var _a2, _b2;
          _push(`<div class="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-surface-container/50 transition" data-v-d38ac582>`);
          if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = member.user) == null ? void 0 : _a2.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(member.user.avatarUrl))} class="w-8 h-8 rounded-full object-cover" data-v-d38ac582>`);
          else _push(`<div class="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-white font-bold text-xs" data-v-d38ac582>${ssrInterpolate(memberName(member).charAt(0))}</div>`);
          _push(`<div class="min-w-0 flex-1" data-v-d38ac582><p class="text-sm text-on-surface truncate" data-v-d38ac582>${ssrInterpolate(memberName(member))}</p>`);
          if (member.role) _push(`<p class="text-[10px] truncate" style="${ssrRenderStyle({ color: member.role.color || "#99aab5" })}" data-v-d38ac582>${ssrInterpolate(((_b2 = unref(server)) == null ? void 0 : _b2.ownerId) === member.userId ? "\u6240\u6709\u8005" : member.role.name)}</p>`);
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
      if (unref(loading)) _push(`<div class="fixed inset-0 z-40 flex items-center justify-center bg-surface/80" data-v-d38ac582><div class="text-on-surface-variant" data-v-d38ac582>\u8AAD\u307F\u8FBC\u307F\u4E2D...</div></div>`);
      else _push(`<!---->`);
      if (unref(loadError) && !unref(loading)) {
        _push(`<div class="fixed inset-0 z-40 flex items-center justify-center bg-surface/90" data-v-d38ac582><div class="text-center space-y-3" data-v-d38ac582>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:alert-circle",
          class: "w-10 h-10 text-red-500 mx-auto"
        }, null, _parent));
        _push(`<p class="text-on-surface-variant text-sm" data-v-d38ac582>${ssrInterpolate(unref(loadError))}</p>`);
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
var _id__default = /* @__PURE__ */ _plugin_vue_export_helper_default(_id__vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-d38ac582"]]);

export { _id__default as default };
//# sourceMappingURL=_id_-CGmyy-Sc.mjs.map
