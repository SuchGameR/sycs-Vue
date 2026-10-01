import { f as useState, $ as $fetch$1, c as components_default } from '../virtual/entry.mjs';
import { B as BottomSheet_default } from './BottomSheet-lvIleqFE.mjs';
import { u as useCustomEmojis, E as EMOJI_LIST, s as searchEmoji, a as EMOJI_MAP, i as isEmojiText } from './richText-ohg8QsVE.mjs';
import { defineComponent, computed, unref, mergeProps, ref, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, createCommentVNode, withModifiers, withDirectives, isRef, vModelText, toDisplayString, withKeys, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';

var EmojiIcon_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "EmojiIcon",
  __ssrInlineRender: true,
  props: {
    emoji: {},
    size: {}
  },
  setup(__props) {
    const props = __props;
    const { byName } = useCustomEmojis();
    const custom = computed(() => {
      const v = props.emoji;
      if (/^:[a-z0-9_+-]+:$/i.test(v)) return byName.value[v.slice(1, -1).toLowerCase()] || null;
      return null;
    });
    const SIZES = {};
    const dim = computed(() => SIZES[props.size || "md"]);
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(custom)) _push(`<img${ssrRenderAttrs(mergeProps({
        src: unref(custom).url,
        alt: __props.emoji,
        title: __props.emoji,
        class: "sycs-emoji",
        style: {
          width: unref(dim),
          height: unref(dim),
          maxWidth: unref(dim),
          maxHeight: unref(dim)
        },
        draggable: "false"
      }, _attrs))}>`);
      else _push(`<span${ssrRenderAttrs(mergeProps({ class: "leading-none" }, _attrs))}>${ssrInterpolate(__props.emoji)}</span>`);
    };
  }
});
var _sfc_setup$1 = EmojiIcon_vue_vue_type_script_setup_true_lang_default.setup;
EmojiIcon_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EmojiIcon.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var EmojiIcon_default = Object.assign(EmojiIcon_vue_vue_type_script_setup_true_lang_default, { __name: "EmojiIcon" });
var PALETTE_KEY = "sycs:reaction-palette";
var RECENT_KEY = "sycs:reaction-recent";
var DEFAULT_PALETTE = [
  "\u{1F44D}",
  "\u2764\uFE0F",
  "\u{1F525}",
  "\u{1F602}",
  "\u{1F62E}",
  "\u{1F440}"
];
function loadList(key, fallback) {
  return fallback;
}
function useReactionPrefs() {
  const palette = useState("reaction:palette", () => loadList(PALETTE_KEY, DEFAULT_PALETTE));
  const recent = useState("reaction:recent", () => loadList(RECENT_KEY, []));
  function persist() {
    palette.value;
    recent.value;
  }
  function addToPalette(emoji) {
    if (!emoji || palette.value.includes(emoji)) return;
    palette.value = [...palette.value, emoji].slice(-24);
    persist();
  }
  function removeFromPalette(emoji) {
    palette.value = palette.value.filter((e) => e !== emoji);
    persist();
  }
  function pushRecent(emoji) {
    if (!emoji) return;
    recent.value = [emoji, ...recent.value.filter((e) => e !== emoji)].slice(0, 12);
    persist();
  }
  function resetPalette() {
    palette.value = [...DEFAULT_PALETTE];
    persist();
  }
  return {
    palette,
    recent,
    addToPalette,
    removeFromPalette,
    pushRecent,
    resetPalette
  };
}
function useDropdownPosition(defaultWidth = 288, gap = 8) {
  const trigger = ref(null);
  const pos = ref({
    left: gap,
    top: gap,
    width: defaultWidth,
    maxHeight: 400,
    up: false
  });
  const style = computed(() => ({
    left: `${pos.value.left}px`,
    top: `${pos.value.top}px`,
    width: `${pos.value.width}px`,
    maxHeight: `${pos.value.maxHeight}px`,
    transform: pos.value.up ? "translateY(-100%)" : "none"
  }));
  function update(estimatedHeight = 360) {
  }
  return {
    trigger,
    pos,
    style,
    update
  };
}
var ReactionPicker_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "ReactionPicker",
  __ssrInlineRender: true,
  emits: ["select"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const prefs = useReactionPrefs();
    const custom = useCustomEmojis();
    const { palette, recent } = prefs;
    const me = useState("current-user", () => null);
    const open = ref(false);
    const query = ref("");
    const customText = ref("");
    const customError = ref("");
    useDropdownPosition(336);
    const emojiName = ref("");
    const emojiFile = ref(null);
    const fileInput = ref(null);
    const uploading = ref(false);
    const uploadError = ref("");
    const manage = ref(false);
    const unicodeResults = computed(() => {
      const q = query.value.trim();
      if (!q) return EMOJI_LIST.slice(0, 100);
      return searchEmoji(q, 100);
    });
    const customResults = computed(() => {
      const q = query.value.trim().toLowerCase().replace(/^:/, "");
      const list = custom.emojis.value;
      if (!q) return list;
      return list.filter((e) => e.name.includes(q));
    });
    const owns = (e) => {
      var _a;
      return e.creatorId && ((_a = me.value) == null ? void 0 : _a.id) === e.creatorId;
    };
    function choose(emoji) {
      prefs.pushRecent(emoji);
      emit("select", emoji);
      open.value = false;
    }
    function pickCustom(e) {
      choose(":" + e.name + ":");
    }
    function addToPaletteText() {
      const raw = customText.value.trim();
      if (!raw) return;
      let char = raw;
      if (raw.startsWith(":") && raw.endsWith(":")) {
        const key = raw.slice(1, -1).toLowerCase();
        if (custom.byName.value[key]) char = ":" + key + ":";
        else char = EMOJI_MAP[key] || "";
        if (!char) {
          customError.value = "\u305D\u306E\u7D75\u6587\u5B57\u540D\u306F\u898B\u3064\u304B\u308A\u307E\u305B\u3093";
          return;
        }
      }
      if (!isEmojiText(char) && !char.startsWith(":")) {
        customError.value = "\u7D75\u6587\u5B57\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
        return;
      }
      prefs.addToPalette(char);
      customText.value = "";
      customError.value = "";
      choose(char);
    }
    function onPickFile(e) {
      var _a;
      const input = e.target;
      emojiFile.value = ((_a = input.files) == null ? void 0 : _a[0]) || null;
      uploadError.value = "";
      if (emojiFile.value && !emojiName.value) emojiName.value = emojiFile.value.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 32);
    }
    async function uploadEmoji() {
      var _a;
      const name = emojiName.value.trim().replace(/^:|:$/g, "").toLowerCase();
      if (!/^[a-z0-9_]{2,32}$/.test(name)) {
        uploadError.value = "\u540D\u524D\u306F\u82F1\u6570\u5B57\u3068_\u30672\u301C32\u6587\u5B57";
        return;
      }
      if (!emojiFile.value) {
        uploadError.value = "\u753B\u50CF\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044";
        return;
      }
      uploading.value = true;
      uploadError.value = "";
      try {
        const created = await custom.upload(name, emojiFile.value);
        emojiName.value = "";
        emojiFile.value = "";
        if (fileInput.value) fileInput.value.value = "";
        choose(":" + created.name + ":");
      } catch (e) {
        uploadError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
      } finally {
        uploading.value = false;
      }
    }
    async function removeEmoji(id) {
      try {
        await custom.remove(id);
      } catch {
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_BottomSheet = BottomSheet_default;
      const _component_EmojiIcon = EmojiIcon_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative inline-flex" }, _attrs))}><button type="button" class="${ssrRenderClass([unref(open) ? "bg-indigo-600/25 border-indigo-500/50 text-indigo-200" : "border-outline bg-surface-container/50 text-on-surface-variant hover:border-slate-500", "flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition"])}" title="\u30EA\u30A2\u30AF\u30B7\u30E7\u30F3\u3092\u8FFD\u52A0">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:smile-plus",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button>`);
      _push(ssrRenderComponent(_component_BottomSheet, {
        open: unref(open),
        height: "min(78dvh, 34rem)",
        onClose: ($event) => open.value = false
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center justify-between px-4 pt-3 pb-2 shrink-0"${_scopeId}><h3 class="text-sm font-bold"${_scopeId}>\u30EA\u30A2\u30AF\u30B7\u30E7\u30F3</h3><button class="p-1 -mr-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:x",
              class: "w-4 h-4"
            }, null, _parent2, _scopeId));
            _push2(`</button></div><div class="px-3 pb-3"${_scopeId}>`);
            if (unref(recent).length) {
              _push2(`<div class="mb-2"${_scopeId}><div class="flex items-center justify-between mb-1"${_scopeId}><span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"${_scopeId}>\u3088\u304F\u4F7F\u3046</span></div><div class="flex flex-wrap gap-1"${_scopeId}><!--[-->`);
              ssrRenderList(unref(recent), (e) => {
                _push2(`<button type="button" class="w-8 h-8 rounded-lg hover:bg-surface-container text-lg transition flex items-center justify-center"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_EmojiIcon, { emoji: e }, null, _parent2, _scopeId));
                _push2(`</button>`);
              });
              _push2(`<!--]--></div></div>`);
            } else _push2(`<!---->`);
            _push2(`<div class="mb-2"${_scopeId}><div class="flex items-center justify-between mb-1"${_scopeId}><span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"${_scopeId}>\u30D1\u30EC\u30C3\u30C8</span><button type="button" class="text-[10px] text-on-surface-variant hover:text-indigo-400 transition"${_scopeId}>\u30EA\u30BB\u30C3\u30C8</button></div><div class="flex flex-wrap gap-1"${_scopeId}><!--[-->`);
            ssrRenderList(unref(palette), (e) => {
              _push2(`<div class="relative group"${_scopeId}><button type="button" class="w-8 h-8 rounded-lg hover:bg-surface-container text-lg transition flex items-center justify-center"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_EmojiIcon, { emoji: e }, null, _parent2, _scopeId));
              _push2(`</button><button type="button" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:x",
                class: "w-2.5 h-2.5"
              }, null, _parent2, _scopeId));
              _push2(`</button></div>`);
            });
            _push2(`<!--]--></div></div><div class="flex items-center gap-2 mb-2"${_scopeId}><div class="flex-1 flex items-center gap-1.5 bg-surface-container border border-outline rounded-lg px-2 py-1.5 focus-within:border-indigo-500 transition"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:search",
              class: "w-3.5 h-3.5 text-on-surface-variant shrink-0"
            }, null, _parent2, _scopeId));
            _push2(`<input${ssrRenderAttr("value", unref(query))} placeholder="\u691C\u7D22 (happy, :cat:)" class="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder-slate-500 min-w-0 p-0"${_scopeId}></div></div><div class="max-h-44 overflow-y-auto"${_scopeId}>`);
            if (unref(customResults).length) {
              _push2(`<!--[--><div class="flex items-center justify-between mb-1"${_scopeId}><span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"${_scopeId}>\u30AB\u30B9\u30BF\u30E0</span><button type="button" class="text-[10px] text-on-surface-variant hover:text-indigo-400 transition"${_scopeId}>${ssrInterpolate(unref(manage) ? "\u5B8C\u4E86" : "\u7BA1\u7406")}</button></div><div class="grid grid-cols-8 gap-0.5 mb-2"${_scopeId}><!--[-->`);
              ssrRenderList(unref(customResults), (e) => {
                _push2(`<div class="relative group"${_scopeId}><button type="button" class="aspect-square w-full rounded-lg hover:bg-surface-container transition flex items-center justify-center"${ssrRenderAttr("title", ":" + e.name + ":")}${_scopeId}><img${ssrRenderAttr("src", e.url)}${ssrRenderAttr("alt", ":" + e.name + ":")} class="sycs-emoji sycs-emoji--lg" draggable="false"${_scopeId}></button>`);
                if (unref(manage) && owns(e)) {
                  _push2(`<button type="button" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_Icon, {
                    name: "lucide:x",
                    class: "w-2.5 h-2.5"
                  }, null, _parent2, _scopeId));
                  _push2(`</button>`);
                } else _push2(`<!---->`);
                _push2(`</div>`);
              });
              _push2(`<!--]--></div><!--]-->`);
            } else _push2(`<!---->`);
            _push2(`<div class="grid grid-cols-8 gap-0.5"${_scopeId}><!--[-->`);
            ssrRenderList(unref(unicodeResults), (e) => {
              _push2(`<button type="button" class="aspect-square rounded-lg hover:bg-surface-container text-lg transition flex items-center justify-center"${ssrRenderAttr("title", ":" + e.name + ":")}${_scopeId}>${ssrInterpolate(e.char)}</button>`);
            });
            _push2(`<!--]--></div></div><div class="mt-2 pt-2 border-t border-outline-variant space-y-2"${_scopeId}><div class="flex items-center gap-1.5"${_scopeId}><input${ssrRenderAttr("value", unref(emojiName))} placeholder="\u753B\u50CF\u7D75\u6587\u5B57\u306E\u540D\u524D" class="flex-1 bg-surface-container border border-outline rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0" maxlength="32"${_scopeId}><button type="button" class="px-2 py-1.5 rounded-lg bg-surface-container border border-outline text-xs text-on-surface hover:border-slate-500 transition shrink-0"${ssrRenderAttr("title", unref(emojiFile) ? unref(emojiFile).name : "\u753B\u50CF\u3092\u9078\u629E")}${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:image-plus",
              class: "w-3.5 h-3.5"
            }, null, _parent2, _scopeId));
            _push2(`</button><button type="button"${ssrIncludeBooleanAttr(unref(uploading)) ? " disabled" : ""} class="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0 disabled:opacity-50"${_scopeId}>${ssrInterpolate(unref(uploading) ? "..." : "\u8FFD\u52A0")}</button><input type="file" accept="image/png,image/gif,image/webp,image/jpeg" class="hidden"${_scopeId}></div>`);
            if (unref(emojiFile)) _push2(`<p class="text-[10px] text-on-surface-variant truncate"${_scopeId}>\u9078\u629E\u4E2D: ${ssrInterpolate(unref(emojiFile).name)}\uFF08GIF\u5BFE\u5FDC\uFF09</p>`);
            else _push2(`<!---->`);
            if (unref(uploadError)) _push2(`<p class="text-[10px] text-red-400"${_scopeId}>${ssrInterpolate(unref(uploadError))}</p>`);
            else _push2(`<!---->`);
            _push2(`<div class="flex items-center gap-1.5"${_scopeId}><input${ssrRenderAttr("value", unref(customText))} placeholder="\u30D1\u30EC\u30C3\u30C8\u306B\u8FFD\u52A0 (\u76F4\u63A5 or :name:)" class="flex-1 bg-surface-container border border-outline rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0"${_scopeId}><button type="button" class="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-xs font-bold text-white hover:bg-surface-container-highest transition shrink-0"${_scopeId}>\u8FFD\u52A0</button></div>`);
            if (unref(customError)) _push2(`<p class="text-[10px] text-red-400"${_scopeId}>${ssrInterpolate(unref(customError))}</p>`);
            else _push2(`<!---->`);
            _push2(`</div></div>`);
          } else return [createVNode("div", { class: "flex items-center justify-between px-4 pt-3 pb-2 shrink-0" }, [createVNode("h3", { class: "text-sm font-bold" }, "\u30EA\u30A2\u30AF\u30B7\u30E7\u30F3"), createVNode("button", {
            onClick: ($event) => open.value = false,
            class: "p-1 -mr-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition"
          }, [createVNode(_component_Icon, {
            name: "lucide:x",
            class: "w-4 h-4"
          })], 8, ["onClick"])]), createVNode("div", { class: "px-3 pb-3" }, [
            unref(recent).length ? (openBlock(), createBlock("div", {
              key: 0,
              class: "mb-2"
            }, [createVNode("div", { class: "flex items-center justify-between mb-1" }, [createVNode("span", { class: "text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" }, "\u3088\u304F\u4F7F\u3046")]), createVNode("div", { class: "flex flex-wrap gap-1" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(recent), (e) => {
              return openBlock(), createBlock("button", {
                key: "r-" + e,
                type: "button",
                onClick: ($event) => choose(e),
                class: "w-8 h-8 rounded-lg hover:bg-surface-container text-lg transition flex items-center justify-center"
              }, [createVNode(_component_EmojiIcon, { emoji: e }, null, 8, ["emoji"])], 8, ["onClick"]);
            }), 128))])])) : createCommentVNode("", true),
            createVNode("div", { class: "mb-2" }, [createVNode("div", { class: "flex items-center justify-between mb-1" }, [createVNode("span", { class: "text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" }, "\u30D1\u30EC\u30C3\u30C8"), createVNode("button", {
              type: "button",
              onClick: ($event) => unref(prefs).resetPalette(),
              class: "text-[10px] text-on-surface-variant hover:text-indigo-400 transition"
            }, "\u30EA\u30BB\u30C3\u30C8", 8, ["onClick"])]), createVNode("div", { class: "flex flex-wrap gap-1" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(palette), (e) => {
              return openBlock(), createBlock("div", {
                key: "p-" + e,
                class: "relative group"
              }, [createVNode("button", {
                type: "button",
                onClick: ($event) => choose(e),
                class: "w-8 h-8 rounded-lg hover:bg-surface-container text-lg transition flex items-center justify-center"
              }, [createVNode(_component_EmojiIcon, { emoji: e }, null, 8, ["emoji"])], 8, ["onClick"]), createVNode("button", {
                type: "button",
                onClick: withModifiers(($event) => unref(prefs).removeFromPalette(e), ["stop"]),
                class: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              }, [createVNode(_component_Icon, {
                name: "lucide:x",
                class: "w-2.5 h-2.5"
              })], 8, ["onClick"])]);
            }), 128))])]),
            createVNode("div", { class: "flex items-center gap-2 mb-2" }, [createVNode("div", { class: "flex-1 flex items-center gap-1.5 bg-surface-container border border-outline rounded-lg px-2 py-1.5 focus-within:border-indigo-500 transition" }, [createVNode(_component_Icon, {
              name: "lucide:search",
              class: "w-3.5 h-3.5 text-on-surface-variant shrink-0"
            }), withDirectives(createVNode("input", {
              "onUpdate:modelValue": ($event) => isRef(query) ? query.value = $event : null,
              placeholder: "\u691C\u7D22 (happy, :cat:)",
              class: "flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder-slate-500 min-w-0 p-0"
            }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(query)]])])]),
            createVNode("div", { class: "max-h-44 overflow-y-auto" }, [unref(customResults).length ? (openBlock(), createBlock(Fragment, { key: 0 }, [createVNode("div", { class: "flex items-center justify-between mb-1" }, [createVNode("span", { class: "text-[10px] font-bold text-on-surface-variant uppercase tracking-wider" }, "\u30AB\u30B9\u30BF\u30E0"), createVNode("button", {
              type: "button",
              onClick: ($event) => manage.value = !unref(manage),
              class: "text-[10px] text-on-surface-variant hover:text-indigo-400 transition"
            }, toDisplayString(unref(manage) ? "\u5B8C\u4E86" : "\u7BA1\u7406"), 9, ["onClick"])]), createVNode("div", { class: "grid grid-cols-8 gap-0.5 mb-2" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(customResults), (e) => {
              return openBlock(), createBlock("div", {
                key: e.id,
                class: "relative group"
              }, [createVNode("button", {
                type: "button",
                onClick: ($event) => unref(manage) ? null : pickCustom(e),
                class: "aspect-square w-full rounded-lg hover:bg-surface-container transition flex items-center justify-center",
                title: ":" + e.name + ":"
              }, [createVNode("img", {
                src: e.url,
                alt: ":" + e.name + ":",
                class: "sycs-emoji sycs-emoji--lg",
                draggable: "false"
              }, null, 8, ["src", "alt"])], 8, ["onClick", "title"]), unref(manage) && owns(e) ? (openBlock(), createBlock("button", {
                key: 0,
                type: "button",
                onClick: withModifiers(($event) => removeEmoji(e.id), ["stop"]),
                class: "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center"
              }, [createVNode(_component_Icon, {
                name: "lucide:x",
                class: "w-2.5 h-2.5"
              })], 8, ["onClick"])) : createCommentVNode("", true)]);
            }), 128))])], 64)) : createCommentVNode("", true), createVNode("div", { class: "grid grid-cols-8 gap-0.5" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(unicodeResults), (e) => {
              return openBlock(), createBlock("button", {
                key: e.name,
                type: "button",
                onClick: ($event) => choose(e.char),
                class: "aspect-square rounded-lg hover:bg-surface-container text-lg transition flex items-center justify-center",
                title: ":" + e.name + ":"
              }, toDisplayString(e.char), 9, ["onClick", "title"]);
            }), 128))])]),
            createVNode("div", { class: "mt-2 pt-2 border-t border-outline-variant space-y-2" }, [
              createVNode("div", { class: "flex items-center gap-1.5" }, [
                withDirectives(createVNode("input", {
                  "onUpdate:modelValue": ($event) => isRef(emojiName) ? emojiName.value = $event : null,
                  placeholder: "\u753B\u50CF\u7D75\u6587\u5B57\u306E\u540D\u524D",
                  class: "flex-1 bg-surface-container border border-outline rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0",
                  maxlength: "32"
                }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(emojiName)]]),
                createVNode("button", {
                  type: "button",
                  onClick: ($event) => {
                    var _a;
                    return (_a = unref(fileInput)) == null ? void 0 : _a.click();
                  },
                  class: "px-2 py-1.5 rounded-lg bg-surface-container border border-outline text-xs text-on-surface hover:border-slate-500 transition shrink-0",
                  title: unref(emojiFile) ? unref(emojiFile).name : "\u753B\u50CF\u3092\u9078\u629E"
                }, [createVNode(_component_Icon, {
                  name: "lucide:image-plus",
                  class: "w-3.5 h-3.5"
                })], 8, ["onClick", "title"]),
                createVNode("button", {
                  type: "button",
                  onClick: uploadEmoji,
                  disabled: unref(uploading),
                  class: "px-2.5 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0 disabled:opacity-50"
                }, toDisplayString(unref(uploading) ? "..." : "\u8FFD\u52A0"), 9, ["disabled"]),
                createVNode("input", {
                  ref_key: "fileInput",
                  ref: fileInput,
                  type: "file",
                  accept: "image/png,image/gif,image/webp,image/jpeg",
                  class: "hidden",
                  onChange: onPickFile
                }, null, 544)
              ]),
              unref(emojiFile) ? (openBlock(), createBlock("p", {
                key: 0,
                class: "text-[10px] text-on-surface-variant truncate"
              }, "\u9078\u629E\u4E2D: " + toDisplayString(unref(emojiFile).name) + "\uFF08GIF\u5BFE\u5FDC\uFF09", 1)) : createCommentVNode("", true),
              unref(uploadError) ? (openBlock(), createBlock("p", {
                key: 1,
                class: "text-[10px] text-red-400"
              }, toDisplayString(unref(uploadError)), 1)) : createCommentVNode("", true),
              createVNode("div", { class: "flex items-center gap-1.5" }, [withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => isRef(customText) ? customText.value = $event : null,
                placeholder: "\u30D1\u30EC\u30C3\u30C8\u306B\u8FFD\u52A0 (\u76F4\u63A5 or :name:)",
                class: "flex-1 bg-surface-container border border-outline rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0",
                onKeydown: withKeys(withModifiers(addToPaletteText, ["prevent"]), ["enter"])
              }, null, 40, ["onUpdate:modelValue", "onKeydown"]), [[vModelText, unref(customText)]]), createVNode("button", {
                type: "button",
                onClick: addToPaletteText,
                class: "px-2.5 py-1.5 rounded-lg bg-surface-container-high text-xs font-bold text-white hover:bg-surface-container-highest transition shrink-0"
              }, "\u8FFD\u52A0")]),
              unref(customError) ? (openBlock(), createBlock("p", {
                key: 2,
                class: "text-[10px] text-red-400"
              }, toDisplayString(unref(customError)), 1)) : createCommentVNode("", true)
            ])
          ])];
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
var _sfc_setup = ReactionPicker_vue_vue_type_script_setup_true_lang_default.setup;
ReactionPicker_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReactionPicker.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ReactionPicker_default = Object.assign(ReactionPicker_vue_vue_type_script_setup_true_lang_default, { __name: "ReactionPicker" });
function useQuoteComposer() {
  const target = useState("quote-composer:target", () => null);
  const busy = useState("quote-composer:busy", () => false);
  const _error = useState("quote-composer:error", () => null);
  function openQuote(post) {
    if (!post) return;
    target.value = post;
    _error.value = null;
  }
  function closeQuote() {
    target.value = null;
    busy.value = false;
    _error.value = null;
  }
  async function submitQuote(content, attachments, visibility, visibleTo) {
    var _a;
    const quotedPost = target.value;
    if (!quotedPost) return;
    busy.value = true;
    _error.value = null;
    try {
      await $fetch$1("/api/posts", {
        method: "POST",
        body: {
          content,
          attachments,
          visibility: visibility || "public",
          visibleTo,
          quotedPostId: quotedPost.id
        }
      });
      target.value = null;
      return true;
    } catch (e) {
      _error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u5F15\u7528\u30EA\u30DD\u30B9\u30C8\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
      return false;
    } finally {
      busy.value = false;
    }
  }
  return {
    target,
    busy,
    error: _error,
    openQuote,
    closeQuote,
    submitQuote
  };
}

export { EmojiIcon_default as E, ReactionPicker_default as R, useDropdownPosition as a, useQuoteComposer as u };
//# sourceMappingURL=useQuoteComposer-JMdDuHrs.mjs.map
