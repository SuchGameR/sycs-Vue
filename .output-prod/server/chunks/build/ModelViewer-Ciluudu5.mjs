import { m as useState, $ as $fetch$1, _ as _plugin_vue_export_helper_default, c as components_default } from '../virtual/entry.mjs';
import { u as useCustomEmojis, s as searchEmoji, a as shouldJumboEmoji } from './richText-C23QsgTl.mjs';
import { E as EmojiImage, s as serializeDoc, t as textToDoc } from './richEditor-sKEqCQC9.mjs';
import { defineComponent, ref, watch, mergeProps, unref, computed, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { HardBreak } from '@tiptap/extension-hard-break';

function useAccounts() {
  const accounts = useState("sycs:accounts-list", () => {
    return [];
  });
  function addAccount(user, token) {
    if (!(user == null ? void 0 : user.id) || !token) return;
    const existing = accounts.value.find((a) => a.id === user.id);
    if (existing) {
      existing.token = token;
      existing.username = user.username;
      existing.displayName = user.displayName;
      existing.avatarUrl = user.avatarUrl;
    } else accounts.value.push({
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      avatarUrl: user.avatarUrl || null,
      token,
      savedAt: Date.now()
    });
  }
  async function captureStoredToken() {
  }
  async function switchAccount(account) {
    await $fetch$1("/api/auth/swap", {
      method: "POST",
      body: { token: account.token }
    });
  }
  function removeAccount(id) {
    accounts.value = accounts.value.filter((a) => a.id !== id);
  }
  const switcherOpen = useState("sycs:account-switcher-open", () => false);
  function openSwitcher() {
    switcherOpen.value = true;
  }
  function closeSwitcher() {
    switcherOpen.value = false;
  }
  return {
    accounts,
    addAccount,
    captureStoredToken,
    switchAccount,
    removeAccount,
    switcherOpen,
    openSwitcher,
    closeSwitcher
  };
}
var EmojiTextarea_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "EmojiTextarea",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    placeholder: {},
    rows: {},
    maxlength: {},
    submitOnEnter: { type: Boolean },
    autoResize: { type: Boolean },
    textareaClass: {}
  },
  emits: [
    "update:modelValue",
    "submit",
    "focus",
    "blur"
  ],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const custom = useCustomEmojis();
    const hasContent = ref(false);
    const suggestions = ref([]);
    const activeIdx = ref(0);
    const open = ref(false);
    let matchFrom = -1;
    let matchTo = -1;
    const editableClass = computed(() => [props.textareaClass || "outline-none w-full text-sm text-white placeholder-slate-500", "outline-none overflow-y-auto"].join(" "));
    function minHeight() {
      return `${((props.rows || 1) * 1.5).toFixed(2)}rem`;
    }
    function refreshState(ed) {
      var _a;
      hasContent.value = !ed.isEmpty;
      const text = serializeDoc(ed.state.doc);
      const jumbo = shouldJumboEmoji(text, custom.map.value);
      if ((_a = ed.view) == null ? void 0 : _a.dom) {
        ed.view.dom.style.fontSize = jumbo ? "1.75rem" : "";
        ed.view.dom.style.minHeight = jumbo ? "" : minHeight();
        ed.view.dom.style.maxHeight = props.autoResize ? "200px" : "";
      }
      emit("update:modelValue", text);
    }
    function close() {
      open.value = false;
      suggestions.value = [];
      matchFrom = -1;
      matchTo = -1;
    }
    function refreshSuggestions(ed) {
      const from = ed.state.selection.from;
      const match = ed.state.doc.textBetween(0, from, "\n").match(/:([a-z0-9_+-]+)$/i);
      if (!match) {
        close();
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
        close();
        return;
      }
      matchFrom = from - match[0].length;
      matchTo = from;
      suggestions.value = list;
      activeIdx.value = 0;
      open.value = true;
    }
    function choose(entry) {
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
      close();
    }
    function convertTypedEmoji(ed) {
      var _a;
      if (ed.view.composing || open.value) return;
      const { state } = ed;
      if (!state.selection.empty) return;
      const from = state.selection.from;
      if (from < 3) return;
      const match = state.doc.textBetween(Math.max(0, from - 40), from, "\n", "\0").match(/:([a-z0-9_+-]+):$/);
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
        attributes: { class: "" },
        handleKeyDown: (view, event) => {
          if (open.value) {
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
              choose(suggestions.value[activeIdx.value]);
              return true;
            }
            if (event.key === "Escape") {
              event.preventDefault();
              close();
              return true;
            }
          }
          if (props.submitOnEnter && event.key === "Enter" && !event.shiftKey && !event.isComposing) {
            event.preventDefault();
            emit("submit");
            return true;
          }
          return false;
        }
      },
      onUpdate: ({ editor: editor2 }) => {
        refreshState(editor2);
        convertTypedEmoji(editor2);
        refreshSuggestions(editor2);
      },
      onSelectionUpdate: ({ editor: editor2 }) => {
        if (open.value) refreshSuggestions(editor2);
      },
      onBlur: () => {
        close();
        emit("blur");
      },
      onFocus: () => {
        emit("focus");
      }
    });
    function setFromModel(value) {
      var _a;
      const ed = editor.value;
      if (!ed) return;
      if (serializeDoc(ed.state.doc) === value) return;
      ed.commands.setContent(textToDoc(value, custom.map.value), { emitUpdate: false });
      const text = serializeDoc(ed.state.doc);
      hasContent.value = !ed.isEmpty;
      if ((_a = ed.view) == null ? void 0 : _a.dom) ed.view.dom.style.fontSize = shouldJumboEmoji(text, custom.map.value) ? "1.75rem" : "";
    }
    watch(() => props.modelValue, (v) => setFromModel(String(v != null ? v : "")));
    watch(() => custom.map.value, () => {
      if (!editor.value) return;
      setFromModel(props.modelValue);
    });
    function focus() {
      var _a;
      (_a = editor.value) == null ? void 0 : _a.commands.focus();
    }
    function applyDomConfig() {
      var _a, _b;
      const dom = (_b = (_a = editor.value) == null ? void 0 : _a.view) == null ? void 0 : _b.dom;
      if (!dom) return;
      dom.classList.add(...editableClass.value.split(" ").filter(Boolean));
      dom.style.minHeight = minHeight();
      dom.style.maxHeight = props.autoResize ? "200px" : "";
    }
    __expose({ focus });
    watch(editor, () => {
      if (!editor.value) return;
      nextTick(() => {
        applyDomConfig();
        setFromModel(props.modelValue);
      });
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative w-full min-w-0" }, _attrs))} data-v-c8d11196>`);
      _push(ssrRenderComponent(unref(EditorContent), { editor: unref(editor) }, null, _parent));
      if (!unref(hasContent)) _push(`<div class="absolute top-0 left-0 right-0 pointer-events-none text-sm text-slate-500 select-none overflow-hidden" data-v-c8d11196>${ssrInterpolate(props.placeholder || "")}</div>`);
      else _push(`<!---->`);
      if (unref(open)) {
        _push(`<div class="absolute bottom-full left-0 mb-1 w-full max-w-sm max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-[150]" data-v-c8d11196><div class="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 sticky top-0 bg-slate-900" data-v-c8d11196> \u7D75\u6587\u5B57 </div><!--[-->`);
        ssrRenderList(unref(suggestions), (s, i) => {
          _push(`<button type="button" class="${ssrRenderClass([i === unref(activeIdx) ? "bg-indigo-600/30" : "hover:bg-slate-800", "w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition"])}" data-v-c8d11196>`);
          if (s.url) _push(`<img${ssrRenderAttr("src", s.url)}${ssrRenderAttr("alt", ":" + s.name + ":")} class="sycs-emoji sycs-emoji--lg shrink-0" draggable="false" data-v-c8d11196>`);
          else _push(`<span class="text-lg leading-none shrink-0" data-v-c8d11196>${ssrInterpolate(s.char)}</span>`);
          _push(`<span class="text-xs text-slate-400 truncate" data-v-c8d11196>:${ssrInterpolate(s.name)}:</span>`);
          if (s.url) _push(`<span class="ml-auto text-[10px] text-slate-600 shrink-0" data-v-c8d11196>\u30AB\u30B9\u30BF\u30E0</span>`);
          else _push(`<!---->`);
          _push(`</button>`);
        });
        _push(`<!--]--></div>`);
      } else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup$1 = EmojiTextarea_vue_vue_type_script_setup_true_lang_default.setup;
EmojiTextarea_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EmojiTextarea.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var EmojiTextarea_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(EmojiTextarea_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-c8d11196"]]), { __name: "EmojiTextarea" });
var ModelViewer_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "ModelViewer",
  __ssrInlineRender: true,
  props: {
    src: {},
    name: {}
  },
  setup(__props) {
    const props = __props;
    ref(null);
    const loading = ref(true);
    const progress = ref(0);
    const error = ref("");
    const autoRotate = ref(true);
    ref(true);
    watch(() => props.src, () => {
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative rounded-xl overflow-hidden bg-[#0b0f19] border border-slate-800" }, _attrs))}><div class="w-full h-[52vh] min-h-[280px] touch-none"></div>`);
      if (unref(loading)) {
        _push(`<div class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b0f19]/80">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:loader-2",
          class: "w-7 h-7 text-indigo-400 animate-spin"
        }, null, _parent));
        _push(`<div class="w-40 h-1 rounded-full bg-slate-800 overflow-hidden"><div class="h-full bg-indigo-500 transition-all" style="${ssrRenderStyle({ width: unref(progress) + "%" })}"></div></div><p class="text-[11px] text-slate-500">${ssrInterpolate(unref(progress) ? unref(progress) + "%" : "3D\u30E2\u30C7\u30EB\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D...")}</p></div>`);
      } else _push(`<!---->`);
      if (unref(error)) {
        _push(`<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0b0f19]/90 p-6 text-center">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:box",
          class: "w-8 h-8 text-slate-600"
        }, null, _parent));
        _push(`<p class="text-xs text-slate-400">${ssrInterpolate(unref(error))}</p></div>`);
      } else _push(`<!---->`);
      _push(`<div class="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-1.5 py-1"><button class="${ssrRenderClass([unref(autoRotate) ? "text-indigo-400 bg-white/10" : "text-white/70 hover:text-white hover:bg-white/10", "p-1.5 rounded-full transition"])}" title="\u81EA\u52D5\u56DE\u8EE2">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:rotate-3d",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><button class="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition" title="\u8996\u70B9\u3092\u30EA\u30BB\u30C3\u30C8">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:focus",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><button class="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition" title="\u5168\u753B\u9762">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:maximize",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button></div>`);
      if (__props.name) _push(`<div class="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-[10px] text-white/70 truncate max-w-[70%]">${ssrInterpolate(__props.name)}</div>`);
      else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup = ModelViewer_vue_vue_type_script_setup_true_lang_default.setup;
ModelViewer_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/media/ModelViewer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ModelViewer_default = Object.assign(ModelViewer_vue_vue_type_script_setup_true_lang_default, { __name: "MediaModelViewer" });

export { EmojiTextarea_default as E, ModelViewer_default as M, useAccounts as u };
//# sourceMappingURL=ModelViewer-Ciluudu5.mjs.map
