import { _ as _plugin_vue_export_helper_default, a as useRoute, c as components_default, $ as $fetch$1 } from '../virtual/entry.mjs';
import { u as useFetch } from './fetch-Cq4So9M_.mjs';
import { N as NuxtLink } from './nuxt-link-DHTgvg7C.mjs';
import { a as avatarSrc } from './avatar-BGDIRQ_Q.mjs';
import { u as useCustomEmojis, r as renderRichText, s as searchEmoji, a as shouldJumboEmoji } from './richText-C23QsgTl.mjs';
import { E as EmojiImage, s as serializeDoc } from './richEditor-sKEqCQC9.mjs';
import { u as useVoiceCall } from './useVoiceCall-c99S1h1A.mjs';
import { defineComponent, computed, ref, withAsyncContext, mergeProps, withCtx, createVNode, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { HardBreak } from '@tiptap/extension-hard-break';
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
import '@tiptap/core';
import './interval-T_Je0Yfm.mjs';

var ChatEditor_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "ChatEditor",
  __ssrInlineRender: true,
  props: { placeholder: {} },
  emits: ["submit", "update"],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const custom = useCustomEmojis();
    const hasContent = ref(false);
    const jumbo = ref(false);
    const suggestions = ref([]);
    const activeIdx = ref(0);
    const emojiOpen = ref(false);
    let matchFrom = -1;
    let matchTo = -1;
    function refreshState(ed) {
      var _a;
      hasContent.value = !ed.isEmpty;
      const text = serializeDoc(ed.state.doc);
      jumbo.value = shouldJumboEmoji(text, custom.map.value);
      if ((_a = ed.view) == null ? void 0 : _a.dom) ed.view.dom.style.fontSize = jumbo.value ? "1.75rem" : "";
      emit("update", text);
    }
    function detectQuery(editor2) {
      const from = editor2.state.selection.from;
      const match = editor2.state.doc.textBetween(0, from, "\n").match(/:([a-z0-9_+-]+)$/i);
      if (!match) {
        emojiOpen.value = false;
        return;
      }
      const q = match[1].toLowerCase();
      const customHits = custom.emojis.value.filter((e) => e.name.includes(q)).slice(0, 30).map((e) => ({
        key: "c-" + e.id,
        name: e.name,
        url: e.url,
        insert: ":" + e.name + ":"
      }));
      const unicodeHits = searchEmoji(match[1], 30).map((e) => ({
        key: "u-" + e.name,
        name: e.name,
        char: e.char,
        insert: e.char
      }));
      const list = [...customHits, ...unicodeHits];
      if (!list.length) {
        emojiOpen.value = false;
        return;
      }
      matchFrom = from - match[0].length;
      matchTo = from;
      suggestions.value = list;
      activeIdx.value = 0;
      emojiOpen.value = true;
    }
    function convertTypedEmoji(ed) {
      var _a;
      if (ed.view.composing) return;
      const { state } = ed;
      if (!state.selection.empty) return;
      const from = state.selection.from;
      if (from < 3) return;
      const start = Math.max(0, from - 40);
      const match = state.doc.textBetween(start, from, "\n", "\0").match(/:([a-z0-9_+-]+):$/);
      if (!match) return;
      const name = match[1].toLowerCase();
      const url = (_a = custom.byName.value[name]) == null ? void 0 : _a.url;
      if (!url) return;
      const rangeFrom = from - match[0].length;
      ed.chain().insertContentAt({
        from: rangeFrom,
        to: from
      }, {
        type: "emojiImage",
        attrs: {
          name,
          src: url
        }
      }).run();
    }
    const editor = useEditor({
      extensions: [
        Document,
        Paragraph,
        Text,
        HardBreak,
        EmojiImage
      ],
      editorProps: {
        attributes: { class: "outline-none w-full text-sm text-slate-200 placeholder-slate-500" },
        handleKeyDown: (view, event) => {
          if (emojiOpen.value) {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              activeIdx.value = (activeIdx.value + 1) % suggestions.value.length;
              return true;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              activeIdx.value = (activeIdx.value - 1 + suggestions.value.length) % suggestions.value.length;
              return true;
            }
            if (event.key === "Enter" || event.key === "Tab") {
              event.preventDefault();
              applyEmoji(suggestions.value[activeIdx.value]);
              return true;
            }
            if (event.key === "Escape") {
              emojiOpen.value = false;
              return false;
            }
          }
          if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            const text = serializeDoc(view.state.doc);
            if (text.trim()) emit("submit", text);
            return true;
          }
          return false;
        }
      },
      onUpdate: ({ editor: editor2 }) => {
        refreshState(editor2);
        convertTypedEmoji(editor2);
        detectQuery(editor2);
      },
      onSelectionUpdate: ({ editor: editor2 }) => {
        if (emojiOpen.value) detectQuery(editor2);
      },
      onBlur: () => {
        emojiOpen.value = false;
      }
    });
    function applyEmoji(entry) {
      var _a;
      if (!entry || matchFrom < 0) return;
      const chain = (_a = editor.value) == null ? void 0 : _a.chain().focus().deleteRange({
        from: matchFrom,
        to: matchTo
      });
      if (entry.url) chain == null ? void 0 : chain.insertContent({
        type: "emojiImage",
        attrs: {
          name: entry.name,
          src: entry.url
        }
      }).run();
      else chain == null ? void 0 : chain.insertContent(entry.char || entry.insert).run();
      emojiOpen.value = false;
    }
    function clear() {
      var _a, _b, _c;
      (_a = editor.value) == null ? void 0 : _a.commands.setContent("");
      hasContent.value = false;
      jumbo.value = false;
      if ((_c = (_b = editor.value) == null ? void 0 : _b.view) == null ? void 0 : _c.dom) editor.value.view.dom.style.fontSize = "";
      emit("update", "");
    }
    function focus() {
      var _a;
      (_a = editor.value) == null ? void 0 : _a.commands.focus();
    }
    function getText() {
      return editor.value ? serializeDoc(editor.value.state.doc) : "";
    }
    __expose({
      clear,
      focus,
      getText
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative flex-1 min-w-0" }, _attrs))} data-v-4cb8234c>`);
      if (!unref(hasContent)) _push(`<div class="absolute inset-0 pointer-events-none text-sm text-slate-500 select-none overflow-hidden whitespace-pre-wrap" data-v-4cb8234c>${ssrInterpolate(props.placeholder || "")}</div>`);
      else _push(`<!---->`);
      _push(ssrRenderComponent(unref(EditorContent), {
        editor: unref(editor),
        class: "min-h-0"
      }, null, _parent));
      if (unref(emojiOpen)) {
        _push(`<div class="absolute bottom-full left-0 mb-1 w-72 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-[150]" data-v-4cb8234c><div class="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 sticky top-0 bg-slate-900" data-v-4cb8234c> \u7D75\u6587\u5B57 </div><!--[-->`);
        ssrRenderList(unref(suggestions), (s, i) => {
          _push(`<button type="button" class="${ssrRenderClass([i === unref(activeIdx) ? "bg-indigo-600/30" : "hover:bg-slate-800", "w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition"])}" data-v-4cb8234c>`);
          if (s.url) _push(`<img${ssrRenderAttr("src", s.url)}${ssrRenderAttr("alt", ":" + s.name + ":")} class="sycs-emoji sycs-emoji--lg shrink-0" draggable="false" data-v-4cb8234c>`);
          else _push(`<span class="text-lg leading-none shrink-0" data-v-4cb8234c>${ssrInterpolate(s.char)}</span>`);
          _push(`<span class="text-xs text-slate-400 truncate" data-v-4cb8234c>:${ssrInterpolate(s.name)}:</span>`);
          if (s.url) _push(`<span class="ml-auto text-[10px] text-slate-600 shrink-0" data-v-4cb8234c>\u30AB\u30B9\u30BF\u30E0</span>`);
          else _push(`<!---->`);
          _push(`</button>`);
        });
        _push(`<!--]--></div>`);
      } else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup$1 = ChatEditor_vue_vue_type_script_setup_true_lang_default.setup;
ChatEditor_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ChatEditor.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var ChatEditor_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(ChatEditor_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-4cb8234c"]]), { __name: "ChatEditor" });
var cache = /* @__PURE__ */ new Map();
function useDmCache() {
  function get(channelId) {
    var _a;
    return (_a = cache.get(channelId)) != null ? _a : null;
  }
  function set(channelId, messages) {
    cache.set(channelId, messages);
  }
  function append(channelId, message) {
    const arr = cache.get(channelId);
    if (arr && !arr.some((m) => m.id === message.id)) arr.push(message);
  }
  function update(channelId, message) {
    const arr = cache.get(channelId);
    if (arr) {
      const i = arr.findIndex((m) => m.id === message.id);
      if (i >= 0) arr[i] = message;
    }
  }
  function has(channelId) {
    return cache.has(channelId);
  }
  return {
    get,
    set,
    append,
    update,
    has
  };
}
var TYPING_INTERVAL = 2200;
var _id__vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { map: customEmojiMap } = useCustomEmojis();
    const route = useRoute();
    const channelId = computed(() => route.params.id);
    const dmCache = useDmCache();
    const messages = ref([]);
    const messageDraft = ref("");
    const chatEditor = ref(null);
    const loading = ref(true);
    const voice = useVoiceCall();
    const voiceStatus = voice.status;
    const voiceIncoming = voice.incoming;
    const otherMember = ref(null);
    const blocked = ref(false);
    const blockedBy = ref(false);
    const blockingBusy = ref(false);
    const typingName = ref("");
    const sendError = ref("");
    const cached = dmCache.get(channelId.value);
    if (cached) messages.value = cached;
    let lastTypingSent = 0;
    function onDraftUpdate(text) {
      messageDraft.value = text;
      if (!text.trim() || blocked.value || blockedBy.value) return;
      const now = Date.now();
      if (now - lastTypingSent > TYPING_INTERVAL) {
        lastTypingSent = now;
        $fetch$1(`/api/dm/channels/${channelId.value}/typing`, { method: "POST" }).catch(() => {
        });
      }
    }
    async function sendMessage(text) {
      var _a, _b, _c;
      const content = (text != null ? text : messageDraft.value).trim();
      if (!content) return;
      if (blocked.value || blockedBy.value) return;
      try {
        const data = await $fetch$1(`/api/dm/channels/${channelId.value}/messages`, {
          method: "POST",
          body: { content }
        });
        if (data.message) {
          messages.value.push(data.message);
          dmCache.append(channelId.value, data.message);
        }
        (_a = chatEditor.value) == null ? void 0 : _a.clear();
        (_b = chatEditor.value) == null ? void 0 : _b.focus();
      } catch (e) {
        sendError.value = ((_c = e == null ? void 0 : e.data) == null ? void 0 : _c.message) || "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3067\u304D\u307E\u305B\u3093\u3067\u3057\u305F";
        setTimeout(() => {
          sendError.value = "";
        }, 4e3);
      }
    }
    const { data: me } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/auth/me", { key: "dm-chat-me" }, "$12PxHxv6Dq")), __temp = await __temp, __restore(), __temp);
    const editingId = ref(null);
    const editDraft = ref("");
    const historyMessage = ref(null);
    const historyEdits = ref([]);
    const historyLoading = ref(false);
    function timeAgo(date) {
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 1) return "\u305F\u3063\u305F\u4ECA";
      if (minutes < 60) return `${minutes}\u5206\u524D`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}\u6642\u9593\u524D`;
      return `${Math.floor(hours / 24)}\u65E5\u524D`;
    }
    function formatDateTime(date) {
      const d = new Date(date);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g;
      const _component_NuxtLink = NuxtLink;
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl mx-auto p-4 h-[calc(100vh-56px-32px)] flex flex-col" }, _attrs))} data-v-1729bc1a>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/dm",
        class: "text-sm text-slate-500 hover:text-white transition mb-4 flex items-center gap-1"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:arrow-left",
              class: "w-4 h-4"
            }, null, _parent2, _scopeId));
            _push2(` DM\u4E00\u89A7\u306B\u623B\u308B `);
          } else return [createVNode(_component_Icon, {
            name: "lucide:arrow-left",
            class: "w-4 h-4"
          }), createTextVNode(" DM\u4E00\u89A7\u306B\u623B\u308B ")];
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex items-center justify-between mb-4 shrink-0" data-v-1729bc1a><div class="flex items-center gap-2.5 min-w-0" data-v-1729bc1a><div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden" data-v-1729bc1a>`);
      if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a = unref(otherMember)) == null ? void 0 : _a.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_b = unref(otherMember)) == null ? void 0 : _b.avatarUrl))} loading="lazy" class="w-full h-full object-cover" data-v-1729bc1a>`);
      else _push(`<!--[-->${ssrInterpolate(((_d = (_c = unref(otherMember)) == null ? void 0 : _c.displayName) == null ? void 0 : _d.charAt(0)) || "?")}<!--]-->`);
      _push(`</div><div class="min-w-0" data-v-1729bc1a><div class="flex items-center gap-1.5" data-v-1729bc1a><span class="font-bold text-white truncate block" data-v-1729bc1a>${ssrInterpolate(((_e = unref(otherMember)) == null ? void 0 : _e.displayName) || "DM")}</span>`);
      if (unref(blocked)) _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:ban",
        class: "w-3.5 h-3.5 text-red-400 shrink-0",
        title: "\u30D6\u30ED\u30C3\u30AF\u4E2D"
      }, null, _parent));
      else _push(`<!---->`);
      _push(`</div>`);
      if ((_f = unref(otherMember)) == null ? void 0 : _f.username) _push(`<span class="text-xs text-slate-500 truncate block" data-v-1729bc1a>@${ssrInterpolate(unref(otherMember).username)}</span>`);
      else _push(`<!---->`);
      if ((_g = unref(otherMember)) == null ? void 0 : _g.statusMessage) _push(`<span class="text-[11px] text-emerald-400/90 truncate block flex items-center gap-1" data-v-1729bc1a><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" data-v-1729bc1a></span>${ssrInterpolate(unref(otherMember).statusMessage)}</span>`);
      else if (unref(blockedBy)) _push(`<span class="text-[11px] text-slate-500 truncate block" data-v-1729bc1a>\u3053\u306E\u30E6\u30FC\u30B6\u30FC\u306B\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u3066\u3044\u307E\u3059</span>`);
      else _push(`<!---->`);
      _push(`</div></div><div class="flex items-center gap-1.5 shrink-0" data-v-1729bc1a>`);
      if (unref(otherMember)) {
        _push(`<button${ssrIncludeBooleanAttr(unref(blockingBusy)) ? " disabled" : ""}${ssrRenderAttr("title", unref(blocked) ? "\u30D6\u30ED\u30C3\u30AF\u3092\u89E3\u9664" : "\u30D6\u30ED\u30C3\u30AF")} class="${ssrRenderClass([unref(blocked) ? "text-red-400 hover:text-red-300" : "text-slate-500 hover:text-red-400", "p-2 rounded-lg transition shrink-0 disabled:opacity-50"])}" data-v-1729bc1a>`);
        if (unref(blockingBusy)) _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:loader-2",
          class: "w-4 h-4 animate-spin"
        }, null, _parent));
        else _push(ssrRenderComponent(_component_Icon, {
          name: unref(blocked) ? "lucide:shield-check" : "lucide:ban",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      if (unref(voiceStatus) === "idle" && !unref(voiceIncoming)) {
        _push(`<button class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition shrink-0" data-v-1729bc1a>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:phone",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` \u901A\u8A71 </button>`);
      } else _push(`<!---->`);
      _push(`</div></div><div class="flex-1 overflow-y-auto space-y-3 mb-4" data-v-1729bc1a>`);
      if (unref(loading) && !unref(messages).length) _push(`<div class="text-center text-slate-500 py-8" data-v-1729bc1a>\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
      else if (!unref(messages).length) _push(`<div class="text-center text-slate-500 py-8" data-v-1729bc1a><p data-v-1729bc1a>\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u9001\u4FE1\u3057\u3066\u307F\u307E\u3057\u3087\u3046</p></div>`);
      else _push(`<!---->`);
      _push(`<!--[-->`);
      ssrRenderList(unref(messages), (msg) => {
        var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h, _i, _j, _k, _l;
        _push(`<div class="flex gap-3 group" data-v-1729bc1a><div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5 overflow-hidden" data-v-1729bc1a>`);
        if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = msg.sender) == null ? void 0 : _a2.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_b2 = msg.sender) == null ? void 0 : _b2.avatarUrl))} loading="lazy" class="w-full h-full object-cover" data-v-1729bc1a>`);
        else _push(`<!--[-->${ssrInterpolate(((_d2 = (_c2 = msg.sender) == null ? void 0 : _c2.displayName) == null ? void 0 : _d2.charAt(0)) || "?")}<!--]-->`);
        _push(`</div><div class="flex-1 min-w-0" data-v-1729bc1a><div class="flex items-center gap-2" data-v-1729bc1a><span class="font-bold text-white text-sm" data-v-1729bc1a>${ssrInterpolate(((_e2 = msg.sender) == null ? void 0 : _e2.displayName) || "\u4E0D\u660E")}</span><span class="text-xs text-slate-600" data-v-1729bc1a>${ssrInterpolate(timeAgo(msg.createdAt))}</span>`);
        if (msg.edited) _push(`<span class="text-xs text-slate-500" data-v-1729bc1a>\u7DE8\u96C6\u6E08\u307F</span>`);
        else _push(`<!---->`);
        if (((_f2 = msg.sender) == null ? void 0 : _f2.id) === ((_h = (_g2 = unref(me)) == null ? void 0 : _g2.user) == null ? void 0 : _h.id) && unref(editingId) !== msg.id) {
          _push(`<button class="text-slate-600 hover:text-indigo-400 transition hidden group-hover:inline-flex" title="\u7DE8\u96C6" data-v-1729bc1a>`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:pencil",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(`</button>`);
        } else _push(`<!---->`);
        _push(`</div>`);
        if (unref(editingId) === msg.id) _push(`<!--[--><textarea rows="3" class="w-full bg-slate-800 border border-indigo-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none resize-none" placeholder="\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u7DE8\u96C6\uFF08Enter\u3067\u4FDD\u5B58 / Shift+Enter\u3067\u6539\u884C\uFF09" data-v-1729bc1a>${ssrInterpolate(unref(editDraft))}</textarea><div class="flex gap-2 mt-1.5" data-v-1729bc1a><button class="px-3 py-1 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition" data-v-1729bc1a>\u4FDD\u5B58</button><button class="px-3 py-1 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition" data-v-1729bc1a>\u30AD\u30E3\u30F3\u30BB\u30EB</button></div><!--]-->`);
        else {
          _push(`<!--[--><p class="text-slate-300 text-sm whitespace-pre-wrap break-words" data-v-1729bc1a>${(_i = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(msg.content, { custom: unref(customEmojiMap) })) != null ? _i : ""}</p>`);
          if (msg.edited || ((_j = msg.sender) == null ? void 0 : _j.id) === ((_l = (_k = unref(me)) == null ? void 0 : _k.user) == null ? void 0 : _l.id)) _push(`<button class="text-xs text-slate-600 hover:text-indigo-400 transition mt-0.5" data-v-1729bc1a> \u7DE8\u96C6\u5C65\u6B74\u3092\u898B\u308B </button>`);
          else _push(`<!---->`);
          _push(`<!--]-->`);
        }
        _push(`</div></div>`);
      });
      _push(`<!--]--></div>`);
      if (unref(blocked) || unref(blockedBy)) _push(`<div class="shrink-0 mb-2 text-sm text-center py-2 rounded-lg border bg-slate-900/60 border-red-800/60 text-red-300" data-v-1729bc1a>${ssrInterpolate(unref(blockedBy) ? "\u30D6\u30ED\u30C3\u30AF\u3055\u308C\u3066\u3044\u308B\u305F\u3081\u3001\u3053\u306EDM\u306B\u306F\u9001\u4FE1\u3067\u304D\u307E\u305B\u3093" : "\u30D6\u30ED\u30C3\u30AF\u4E2D\u306E\u305F\u3081\u3001\u3053\u306EDM\u306B\u306F\u9001\u4FE1\u3067\u304D\u307E\u305B\u3093")}</div>`);
      else {
        _push(`<div class="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shrink-0" data-v-1729bc1a><div class="flex-1 min-w-0" data-v-1729bc1a>`);
        _push(ssrRenderComponent(ChatEditor_default, {
          ref_key: "chatEditor",
          ref: chatEditor,
          placeholder: "\u30E1\u30C3\u30BB\u30FC\u30B8\u3092\u5165\u529B\uFF08Enter\u3067\u9001\u4FE1 / Shift+Enter\u3067\u6539\u884C\uFF09",
          onSubmit: sendMessage,
          onUpdate: onDraftUpdate
        }, null, _parent));
        if (unref(typingName)) _push(`<p class="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5" data-v-1729bc1a><span class="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block animate-pulse" data-v-1729bc1a></span>${ssrInterpolate(unref(typingName))}\u3055\u3093\u304C\u5165\u529B\u4E2D... </p>`);
        else _push(`<!---->`);
        _push(`</div><div class="flex flex-col items-end shrink-0" data-v-1729bc1a><button${ssrIncludeBooleanAttr(!unref(messageDraft).trim()) ? " disabled" : ""} class="text-indigo-400 hover:text-indigo-300 transition disabled:opacity-50 shrink-0" data-v-1729bc1a>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:send",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</button>`);
        if (unref(sendError)) _push(`<p class="text-[10px] text-red-400 mt-1 max-w-[180px] truncate"${ssrRenderAttr("title", unref(sendError))} data-v-1729bc1a>${ssrInterpolate(unref(sendError))}</p>`);
        else _push(`<!---->`);
        _push(`</div></div>`);
      }
      if (unref(historyMessage)) {
        _push(`<div class="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]" data-v-1729bc1a><div class="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 p-5 shadow-2xl" data-v-1729bc1a><div class="flex items-center justify-between mb-4" data-v-1729bc1a><h3 class="font-bold text-white flex items-center gap-2" data-v-1729bc1a>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:history",
          class: "w-4 h-4 text-indigo-400"
        }, null, _parent));
        _push(` \u7DE8\u96C6\u5C65\u6B74</h3><button class="text-slate-500 hover:text-white transition" data-v-1729bc1a>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</button></div>`);
        if (unref(historyLoading)) _push(`<p class="text-sm text-slate-500" data-v-1729bc1a>\u8AAD\u307F\u8FBC\u307F\u4E2D...</p>`);
        else {
          _push(`<!--[-->`);
          if (!unref(historyEdits).length) _push(`<div class="text-sm text-slate-400 bg-slate-800/50 border border-slate-800 rounded-lg p-3 mb-2" data-v-1729bc1a> \u3053\u306E\u30E1\u30C3\u30BB\u30FC\u30B8\u306F\u307E\u3060\u7DE8\u96C6\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002 </div>`);
          else _push(`<!---->`);
          _push(`<!--[-->`);
          ssrRenderList(unref(historyEdits), (edit, idx) => {
            _push(`<div class="mb-2" data-v-1729bc1a><p class="text-[11px] text-slate-500 mb-0.5" data-v-1729bc1a>${ssrInterpolate(idx + 1)}\u56DE\u76EE\u306E\u7DE8\u96C6\u30FB${ssrInterpolate(formatDateTime(edit.editedAt))}</p><p class="text-sm text-slate-400 bg-slate-800/50 border border-slate-800 rounded-lg p-3 whitespace-pre-wrap break-words" data-v-1729bc1a>${ssrInterpolate(edit.content)}</p></div>`);
          });
          _push(`<!--]--><div data-v-1729bc1a><p class="text-[11px] text-emerald-500 mb-0.5" data-v-1729bc1a>\u73FE\u5728\u306E\u30E1\u30C3\u30BB\u30FC\u30B8</p><p class="text-sm text-slate-200 bg-indigo-900/30 border border-indigo-800/60 rounded-lg p-3 whitespace-pre-wrap break-words" data-v-1729bc1a>${ssrInterpolate(unref(historyMessage).content)}</p></div><!--]-->`);
        }
        _push(`</div></div>`);
      } else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup = _id__vue_vue_type_script_setup_true_lang_default.setup;
_id__vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/dm/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var _id__default = /* @__PURE__ */ _plugin_vue_export_helper_default(_id__vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-1729bc1a"]]);

export { _id__default as default };
//# sourceMappingURL=_id_-CywJWFDQ.mjs.map
