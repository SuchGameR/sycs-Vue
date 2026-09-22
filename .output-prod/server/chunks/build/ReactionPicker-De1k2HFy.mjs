import { _ as _plugin_vue_export_helper_default, m as useState, c as components_default } from '../virtual/entry.mjs';
import { u as useCustomEmojis, E as EMOJI_LIST, s as searchEmoji } from './richText-BaJfyDxJ.mjs';
import { defineComponent, computed, unref, mergeProps, ref, watch, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderComponent, ssrRenderTeleport, ssrRenderStyle, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';

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
    const prefs = useReactionPrefs();
    const custom = useCustomEmojis();
    const { palette, recent } = prefs;
    const me = useState("current-user", () => null);
    const open = ref(false);
    const query = ref("");
    const customText = ref("");
    const customError = ref("");
    const { style: panelStyle } = useDropdownPosition(336);
    const emojiName = ref("");
    const emojiFile = ref(null);
    ref(null);
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
    watch(open, (v) => {
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_EmojiIcon = EmojiIcon_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative inline-flex" }, _attrs))} data-v-8dcc2970><button type="button" class="${ssrRenderClass([unref(open) ? "bg-indigo-600/25 border-indigo-500/50 text-indigo-200" : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500", "flex items-center gap-1 px-2 py-1 rounded-full text-sm border transition"])}" title="\u30EA\u30A2\u30AF\u30B7\u30E7\u30F3\u3092\u8FFD\u52A0" data-v-8dcc2970>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:smile-plus",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(open)) _push2(`<div class="fixed inset-0 z-[298]" data-v-8dcc2970></div>`);
        else _push2(`<!---->`);
        if (unref(open)) {
          _push2(`<div class="fixed z-[299] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 overflow-y-auto" style="${ssrRenderStyle(unref(panelStyle))}" data-v-8dcc2970>`);
          if (unref(recent).length) {
            _push2(`<div class="mb-2" data-v-8dcc2970><div class="flex items-center justify-between mb-1" data-v-8dcc2970><span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider" data-v-8dcc2970>\u3088\u304F\u4F7F\u3046</span></div><div class="flex flex-wrap gap-1" data-v-8dcc2970><!--[-->`);
            ssrRenderList(unref(recent), (e) => {
              _push2(`<button type="button" class="w-8 h-8 rounded-lg hover:bg-slate-800 text-lg transition flex items-center justify-center" data-v-8dcc2970>`);
              _push2(ssrRenderComponent(_component_EmojiIcon, { emoji: e }, null, _parent));
              _push2(`</button>`);
            });
            _push2(`<!--]--></div></div>`);
          } else _push2(`<!---->`);
          _push2(`<div class="mb-2" data-v-8dcc2970><div class="flex items-center justify-between mb-1" data-v-8dcc2970><span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider" data-v-8dcc2970>\u30D1\u30EC\u30C3\u30C8</span><button type="button" class="text-[10px] text-slate-500 hover:text-indigo-400 transition" data-v-8dcc2970>\u30EA\u30BB\u30C3\u30C8</button></div><div class="flex flex-wrap gap-1" data-v-8dcc2970><!--[-->`);
          ssrRenderList(unref(palette), (e) => {
            _push2(`<div class="relative group" data-v-8dcc2970><button type="button" class="w-8 h-8 rounded-lg hover:bg-slate-800 text-lg transition flex items-center justify-center" data-v-8dcc2970>`);
            _push2(ssrRenderComponent(_component_EmojiIcon, { emoji: e }, null, _parent));
            _push2(`</button><button type="button" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition" data-v-8dcc2970>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:x",
              class: "w-2.5 h-2.5"
            }, null, _parent));
            _push2(`</button></div>`);
          });
          _push2(`<!--]--></div></div><div class="flex items-center gap-2 mb-2" data-v-8dcc2970><div class="flex-1 flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 focus-within:border-indigo-500 transition" data-v-8dcc2970>`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:search",
            class: "w-3.5 h-3.5 text-slate-500 shrink-0"
          }, null, _parent));
          _push2(`<input${ssrRenderAttr("value", unref(query))} placeholder="\u691C\u7D22 (happy, :cat:)" class="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder-slate-500 min-w-0 p-0" data-v-8dcc2970></div></div><div class="max-h-44 overflow-y-auto" data-v-8dcc2970>`);
          if (unref(customResults).length) {
            _push2(`<!--[--><div class="flex items-center justify-between mb-1" data-v-8dcc2970><span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider" data-v-8dcc2970>\u30AB\u30B9\u30BF\u30E0</span><button type="button" class="text-[10px] text-slate-500 hover:text-indigo-400 transition" data-v-8dcc2970>${ssrInterpolate(unref(manage) ? "\u5B8C\u4E86" : "\u7BA1\u7406")}</button></div><div class="grid grid-cols-8 gap-0.5 mb-2" data-v-8dcc2970><!--[-->`);
            ssrRenderList(unref(customResults), (e) => {
              _push2(`<div class="relative group" data-v-8dcc2970><button type="button" class="aspect-square w-full rounded-lg hover:bg-slate-800 transition flex items-center justify-center"${ssrRenderAttr("title", ":" + e.name + ":")} data-v-8dcc2970><img${ssrRenderAttr("src", e.url)}${ssrRenderAttr("alt", ":" + e.name + ":")} class="sycs-emoji sycs-emoji--lg" draggable="false" data-v-8dcc2970></button>`);
              if (unref(manage) && owns(e)) {
                _push2(`<button type="button" class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center" data-v-8dcc2970>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "lucide:x",
                  class: "w-2.5 h-2.5"
                }, null, _parent));
                _push2(`</button>`);
              } else _push2(`<!---->`);
              _push2(`</div>`);
            });
            _push2(`<!--]--></div><!--]-->`);
          } else _push2(`<!---->`);
          _push2(`<div class="grid grid-cols-8 gap-0.5" data-v-8dcc2970><!--[-->`);
          ssrRenderList(unref(unicodeResults), (e) => {
            _push2(`<button type="button" class="aspect-square rounded-lg hover:bg-slate-800 text-lg transition flex items-center justify-center"${ssrRenderAttr("title", ":" + e.name + ":")} data-v-8dcc2970>${ssrInterpolate(e.char)}</button>`);
          });
          _push2(`<!--]--></div></div><div class="mt-2 pt-2 border-t border-slate-800 space-y-2" data-v-8dcc2970><div class="flex items-center gap-1.5" data-v-8dcc2970><input${ssrRenderAttr("value", unref(emojiName))} placeholder="\u753B\u50CF\u7D75\u6587\u5B57\u306E\u540D\u524D" class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0" maxlength="32" data-v-8dcc2970><button type="button" class="px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:border-slate-500 transition shrink-0"${ssrRenderAttr("title", unref(emojiFile) ? unref(emojiFile).name : "\u753B\u50CF\u3092\u9078\u629E")} data-v-8dcc2970>`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:image-plus",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push2(`</button><button type="button"${ssrIncludeBooleanAttr(unref(uploading)) ? " disabled" : ""} class="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition shrink-0 disabled:opacity-50" data-v-8dcc2970>${ssrInterpolate(unref(uploading) ? "..." : "\u8FFD\u52A0")}</button><input type="file" accept="image/png,image/gif,image/webp,image/jpeg" class="hidden" data-v-8dcc2970></div>`);
          if (unref(emojiFile)) _push2(`<p class="text-[10px] text-slate-500 truncate" data-v-8dcc2970>\u9078\u629E\u4E2D: ${ssrInterpolate(unref(emojiFile).name)}\uFF08GIF\u5BFE\u5FDC\uFF09</p>`);
          else _push2(`<!---->`);
          if (unref(uploadError)) _push2(`<p class="text-[10px] text-red-400" data-v-8dcc2970>${ssrInterpolate(unref(uploadError))}</p>`);
          else _push2(`<!---->`);
          _push2(`<div class="flex items-center gap-1.5" data-v-8dcc2970><input${ssrRenderAttr("value", unref(customText))} placeholder="\u30D1\u30EC\u30C3\u30C8\u306B\u8FFD\u52A0 (\u76F4\u63A5 or :name:)" class="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-w-0" data-v-8dcc2970><button type="button" class="px-2.5 py-1.5 rounded-lg bg-slate-700 text-xs font-bold text-white hover:bg-slate-600 transition shrink-0" data-v-8dcc2970>\u8FFD\u52A0</button></div>`);
          if (unref(customError)) _push2(`<p class="text-[10px] text-red-400" data-v-8dcc2970>${ssrInterpolate(unref(customError))}</p>`);
          else _push2(`<!---->`);
          _push2(`</div></div>`);
        } else _push2(`<!---->`);
      }, "body", false, _parent);
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
var ReactionPicker_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(ReactionPicker_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-8dcc2970"]]), { __name: "ReactionPicker" });

export { EmojiIcon_default as E, ReactionPicker_default as R, useDropdownPosition as u };
//# sourceMappingURL=ReactionPicker-De1k2HFy.mjs.map
