import { _ as _plugin_vue_export_helper_default, c as components_default } from '../virtual/entry.mjs';
import { u as useMediaPane } from './useMediaPane-Dnqhkp4f.mjs';
import { defineComponent, watch, computed, ref, unref, withCtx, createVNode, withModifiers, openBlock, createBlock, createTextVNode, createCommentVNode, Fragment, watchEffect, mergeProps, useSSRContext } from 'vue';
import { ssrRenderList, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderTeleport, ssrRenderStyle, ssrRenderAttrs, ssrRenderSlot, ssrIncludeBooleanAttr } from 'vue/server-renderer';

function onLongPress(handler, options = {}) {
  var _a, _b;
  const delay = (_a = options.delay) != null ? _a : 500;
  const tolerance = (_b = options.moveTolerance) != null ? _b : 10;
  const el = ref(null);
  let timer = null;
  let startX = 0;
  let startY = 0;
  let pointerId = null;
  let fired = false;
  const api = {
    ref: el,
    el,
    event: void 0,
    cancel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel
  };
  return api;
  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
  function cancel() {
    var _a2;
    const wasActive = timer !== null;
    clear();
    pointerId = null;
    if (wasActive && !fired) (_a2 = options.onCancel) == null ? void 0 : _a2.call(options);
  }
  function onPointerDown(e) {
    var _a2, _b2;
    if (e.button !== 0 && e.pointerType === "mouse") return;
    fired = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    if ("vibrate" in void 0) try {
      (_a2 = (void 0).vibrate) == null ? void 0 : _a2.call(void 0, 8);
    } catch {
    }
    (_b2 = options.onStart) == null ? void 0 : _b2.call(options);
    clear();
    timer = setTimeout(() => {
      var _a3;
      timer = null;
      fired = true;
      api.event = e;
      if ("vibrate" in void 0) try {
        (_a3 = (void 0).vibrate) == null ? void 0 : _a3.call(void 0, [
          12,
          40,
          18
        ]);
      } catch {
      }
      handler(e);
    }, delay);
  }
  function onPointerMove(e) {
    if (timer === null) return;
    if (pointerId !== null && e.pointerId !== pointerId) return;
    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > tolerance || dy > tolerance) cancel();
  }
  function onPointerUp(e) {
    var _a2;
    if (pointerId !== null && e.pointerId !== pointerId) return;
    const wasFiring = fired;
    clear();
    pointerId = null;
    if (!wasFiring) (_a2 = options.onCancel) == null ? void 0 : _a2.call(options);
  }
  function onPointerCancel(e) {
    if (e && pointerId !== null && e.pointerId !== pointerId) return;
    cancel();
  }
}
var LongPress_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "LongPress",
  __ssrInlineRender: true,
  props: {
    delay: { default: 500 },
    moveTolerance: { default: 10 }
  },
  emits: ["longpress"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const pressing = ref(false);
    const handlers = onLongPress(() => {
      pressing.value = false;
      emit("longpress", handlers.event);
    }, {
      delay: props.delay,
      moveTolerance: props.moveTolerance,
      onStart: () => {
        pressing.value = true;
      },
      onCancel: () => {
        pressing.value = false;
      }
    });
    watchEffect(() => {
      const el = handlers.el.value;
      if (!el) return;
      if (pressing.value) el.dataset.pressing = "";
      else delete el.dataset.pressing;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ ref: "handlers.ref" }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
var _sfc_setup$3 = LongPress_vue_vue_type_script_setup_true_lang_default.setup;
LongPress_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LongPress.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var LongPress_default = Object.assign(LongPress_vue_vue_type_script_setup_true_lang_default, { __name: "LongPress" });
var FileCard_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "FileCard",
  __ssrInlineRender: true,
  props: {
    url: {},
    name: {},
    mime: {},
    size: {}
  },
  setup(__props) {
    const props = __props;
    const ext = computed(() => {
      const m = (props.name || props.url).split("?")[0].match(/\.([a-z0-9]+)$/i);
      return (m ? m[1] : "").toLowerCase();
    });
    const displayName = computed(() => props.name || props.url.split("/").pop() || "\u30D5\u30A1\u30A4\u30EB");
    const meta = computed(() => {
      const e = ext.value;
      if (["pdf"].includes(e)) return {
        icon: "lucide:file-text",
        color: "text-red-400",
        label: "PDF"
      };
      if ([
        "zip",
        "rar",
        "7z",
        "tar",
        "gz"
      ].includes(e)) return {
        icon: "lucide:file-archive",
        color: "text-amber-400",
        label: "\u30A2\u30FC\u30AB\u30A4\u30D6"
      };
      if ([
        "doc",
        "docx",
        "txt",
        "md",
        "rtf"
      ].includes(e)) return {
        icon: "lucide:file-text",
        color: "text-sky-400",
        label: "\u30C9\u30AD\u30E5\u30E1\u30F3\u30C8"
      };
      if ([
        "xls",
        "xlsx",
        "csv"
      ].includes(e)) return {
        icon: "lucide:file-spreadsheet",
        color: "text-emerald-400",
        label: "\u8868\u8A08\u7B97"
      };
      if (["ppt", "pptx"].includes(e)) return {
        icon: "lucide:file-presentation",
        color: "text-orange-400",
        label: "\u30D7\u30EC\u30BC\u30F3"
      };
      if ([
        "glb",
        "gltf",
        "obj",
        "fbx",
        "stl",
        "3ds"
      ].includes(e)) return {
        icon: "lucide:box",
        color: "text-fuchsia-400",
        label: "3D\u30E2\u30C7\u30EB"
      };
      if ([
        "mp3",
        "wav",
        "ogg",
        "flac",
        "m4a"
      ].includes(e)) return {
        icon: "lucide:music",
        color: "text-pink-400",
        label: "\u30AA\u30FC\u30C7\u30A3\u30AA"
      };
      if ([
        "mp4",
        "webm",
        "mov",
        "mkv"
      ].includes(e)) return {
        icon: "lucide:video",
        color: "text-indigo-400",
        label: "\u52D5\u753B"
      };
      if ([
        "js",
        "ts",
        "json",
        "html",
        "css",
        "py",
        "rs",
        "go"
      ].includes(e)) return {
        icon: "lucide:file-code",
        color: "text-cyan-400",
        label: "\u30B3\u30FC\u30C9"
      };
      return {
        icon: "lucide:file",
        color: "text-on-surface-variant",
        label: e ? e.toUpperCase() : "\u30D5\u30A1\u30A4\u30EB"
      };
    });
    const sizeLabel = computed(() => {
      const bytes = props.size;
      if (!bytes || bytes <= 0) return "";
      const units = [
        "B",
        "KB",
        "MB",
        "GB"
      ];
      let v = bytes;
      let i = 0;
      while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
      }
      return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
    });
    const downloadable = computed(() => props.url.startsWith("/uploads/") || props.url.startsWith("http"));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-3 p-3 rounded-xl bg-surface-container/50 border border-outline hover:border-slate-600 transition" }, _attrs))}><div class="w-11 h-11 rounded-xl bg-surface flex items-center justify-center shrink-0">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: unref(meta).icon,
        class: ["w-5 h-5", unref(meta).color]
      }, null, _parent));
      _push(`</div><div class="min-w-0 flex-1"><p class="text-sm text-white font-medium truncate"${ssrRenderAttr("title", unref(displayName))}>${ssrInterpolate(unref(displayName))}</p><p class="text-[11px] text-on-surface-variant">${ssrInterpolate(unref(meta).label)}`);
      if (unref(sizeLabel)) _push(`<!--[--> \xB7 ${ssrInterpolate(unref(sizeLabel))}<!--]-->`);
      else _push(`<!---->`);
      _push(`</p></div>`);
      if (unref(downloadable)) {
        _push(`<a${ssrRenderAttr("href", __props.url)}${ssrRenderAttr("download", unref(displayName))} class="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition shrink-0" title="\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:download",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</a>`);
      } else _push(`<!---->`);
      if (unref(downloadable)) {
        _push(`<a${ssrRenderAttr("href", __props.url)} target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container-high transition shrink-0" title="\u65B0\u3057\u3044\u30BF\u30D6\u3067\u958B\u304F">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:external-link",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</a>`);
      } else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup$2 = FileCard_vue_vue_type_script_setup_true_lang_default.setup;
FileCard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/media/FileCard.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var FileCard_default = Object.assign(FileCard_vue_vue_type_script_setup_true_lang_default, { __name: "MediaFileCard" });
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
    const muted = ref(false);
    const loop = ref(false);
    const seeking = ref(false);
    ref(0);
    ref(null);
    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }
    function fmt(t) {
      if (!isFinite(t) || t < 0) return "0:00";
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    }
    const progress = computed(() => {
      const d = duration.value;
      if (!d || d <= 0) return 0;
      return clamp(current.value / d * 100, 0, 100);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "rounded-2xl bg-surface-container p-3 sm:p-4 border border-outline-variant shadow-m3-1" }, _attrs))} data-v-26bcff05><audio${ssrRenderAttr("src", __props.src)}${ssrIncludeBooleanAttr(__props.autoplay !== false) ? " autoplay" : ""} data-v-26bcff05></audio><div class="mp-shell" data-v-26bcff05><div class="mp-main" data-v-26bcff05><div class="relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center shadow-m3-1" data-v-26bcff05>`);
      if (__props.cover) _push(`<img${ssrRenderAttr("src", __props.cover)} class="w-full h-full object-cover" data-v-26bcff05>`);
      else _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:music",
        class: ["w-6 h-6 sm:w-8 sm:h-8 text-on-surface-variant", unref(playing) ? "animate-pulse" : ""]
      }, null, _parent));
      if (unref(playing)) _push(`<div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-outline-variant flex items-end justify-center gap-0.5 pb-1" data-v-26bcff05><span class="w-0.5 bg-indigo-400 animate-[eq_0.9s_ease-in-out_infinite] h-3" data-v-26bcff05></span><span class="w-0.5 bg-indigo-400 animate-[eq_1.1s_ease-in-out_infinite] h-2" data-v-26bcff05></span><span class="w-0.5 bg-indigo-400 animate-[eq_0.8s_ease-in-out_infinite] h-3.5" data-v-26bcff05></span></div>`);
      else _push(`<!---->`);
      _push(`</div><div class="min-w-0 flex-1" data-v-26bcff05><p class="text-sm font-bold text-on-surface truncate" data-v-26bcff05>${ssrInterpolate(__props.title || "\u30AA\u30FC\u30C7\u30A3\u30AA")}</p><p class="text-[11px] text-on-surface-variant truncate" data-v-26bcff05>${ssrInterpolate(__props.artist || "")}</p></div></div><div class="mp-ctl" data-v-26bcff05><div class="mp-progress" data-v-26bcff05><span class="text-[10px] text-on-surface-variant tabular-nums w-8 text-right shrink-0" data-v-26bcff05>${ssrInterpolate(fmt(unref(current)))}</span><div class="mp-track" role="slider"${ssrRenderAttr("aria-label", "\u518D\u751F\u4F4D\u7F6E")}${ssrRenderAttr("aria-valuenow", Math.round(unref(current)))}${ssrRenderAttr("aria-valuemin", 0)}${ssrRenderAttr("aria-valuemax", Math.round(unref(duration)) || 0)}${ssrRenderAttr("aria-valuetext", fmt(unref(current)) + " / " + fmt(unref(duration)))} tabindex="0" data-v-26bcff05><div class="mp-fill" style="${ssrRenderStyle({ width: unref(progress) + "%" })}" data-v-26bcff05></div><div class="${ssrRenderClass([{ "is-active": unref(seeking) }, "mp-thumb"])}" style="${ssrRenderStyle({ left: "calc(" + unref(progress) + "% - 6px)" })}" data-v-26bcff05></div></div><span class="text-[10px] text-on-surface-variant tabular-nums w-8 shrink-0" data-v-26bcff05>${ssrInterpolate(fmt(unref(duration)))}</span></div><div class="mp-row" data-v-26bcff05><div class="flex items-center gap-1 shrink-0" data-v-26bcff05><button class="${ssrRenderClass([unref(loop) ? "is-on" : "", "mp-btn"])}" title="\u30EA\u30D4\u30FC\u30C8" data-v-26bcff05>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:repeat",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button></div><div class="flex items-center justify-center gap-2 sm:gap-3" data-v-26bcff05><button class="mp-btn" title="15\u79D2\u623B\u3059" data-v-26bcff05>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:rotate-ccw",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><button class="mp-play" data-v-26bcff05>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: unref(playing) ? "lucide:pause" : "lucide:play",
        class: ["w-5 h-5", !unref(playing) ? "ml-0.5" : ""]
      }, null, _parent));
      _push(`</button><button class="mp-btn" title="15\u79D2\u9032\u3081\u308B" data-v-26bcff05>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:rotate-cw",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button></div><div class="flex items-center shrink-0" data-v-26bcff05><div class="group flex items-center gap-1" data-v-26bcff05><button class="mp-btn" title="\u30DF\u30E5\u30FC\u30C8\u5207\u66FF" data-v-26bcff05>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: unref(muted) || unref(volume) <= 0 ? "lucide:volume-x" : unref(volume) < 0.5 ? "lucide:volume-1" : "lucide:volume-2",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button><input type="range" min="0" max="1" step="0.05"${ssrRenderAttr("value", unref(volume))} class="mp-vol" data-v-26bcff05></div></div></div></div></div></div>`);
    };
  }
});
var _sfc_setup$1 = MusicPlayer_vue_vue_type_script_setup_true_lang_default.setup;
MusicPlayer_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/media/MusicPlayer.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var MusicPlayer_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(MusicPlayer_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-26bcff05"]]), { __name: "MediaMusicPlayer" });
var PostAttachments_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "PostAttachments",
  __ssrInlineRender: true,
  props: {
    attachments: {},
    interactive: { type: Boolean },
    imageLightbox: { type: Boolean },
    postId: {}
  },
  emits: ["open"],
  setup(__props, { emit: __emit }) {
    const MODEL_EXT = /\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i;
    const props = __props;
    const emit = __emit;
    const pane = useMediaPane();
    watch(computed(() => {
      var _a;
      return !!props.postId && ((_a = pane.selected.value) == null ? void 0 : _a.id) === props.postId;
    }), (pause) => {
      if (!pause || !el.value) return;
      el.value.querySelectorAll("video,audio").forEach((node) => node.pause());
    });
    const blurredMap = ref({});
    for (const att of props.attachments) blurredMap.value[att.id] = !!att.blurUrl;
    function reveal(id) {
      blurredMap.value[id] = false;
    }
    function displayUrl(att) {
      if (att.blurUrl && blurredMap.value[att.id]) return att.blurUrl;
      return att.url;
    }
    function isBlurred(att) {
      return att.blurUrl && blurredMap.value[att.id];
    }
    function isImage(mime) {
      return mime.startsWith("image/");
    }
    function isVideo(mime) {
      return mime.startsWith("video/");
    }
    function isAudio(mime) {
      return mime.startsWith("audio/");
    }
    function isModel(att) {
      return String((att == null ? void 0 : att.mime) || (att == null ? void 0 : att.type) || "").toLowerCase().startsWith("model/") || MODEL_EXT.test(String((att == null ? void 0 : att.url) || ""));
    }
    const el = ref(null);
    function gridClass(count) {
      if (props.attachments.some((a) => !isImage(a.mime) && !isVideo(a.mime) && !isAudio(a.mime))) return "grid-cols-1";
      if (count === 1) return "grid-cols-1";
      if (count <= 4) return "grid-cols-2";
      return "grid-cols-3";
    }
    function mediaClass(count) {
      if (count === 1) return "mx-auto block w-auto h-auto max-w-full max-h-[600px] object-contain";
      return "w-full h-48 object-cover";
    }
    function splitBy(pred) {
      const out = [];
      props.attachments.forEach((att, index) => {
        if (pred(att)) out.push({
          att,
          index
        });
      });
      return out;
    }
    const imageItems = computed(() => splitBy((att) => isImage(att.mime)));
    const otherItems = computed(() => splitBy((att) => !isImage(att.mime)));
    const carousel = computed(() => imageItems.value.length > 1);
    const gridItems = computed(() => carousel.value ? otherItems.value : props.attachments.map((att, index) => ({
      att,
      index
    })));
    ref(null);
    const slideIndex = ref(0);
    const modalOpen = ref(false);
    const modalIndex = ref(0);
    const zoomLevel = ref(1);
    const pan = ref({
      x: 0,
      y: 0
    });
    let isDragging = false;
    ref(null);
    function onLongPressAtt(att, index) {
      if (props.interactive && !props.imageLightbox) {
        emit("open", index);
        return;
      }
      openModal(index);
    }
    function openModal(index) {
      modalIndex.value = index;
      zoomLevel.value = 1;
      pan.value = {
        x: 0,
        y: 0
      };
      modalOpen.value = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LongPress = LongPress_default;
      const _component_Icon = components_default;
      _push(`<!--[-->`);
      if (__props.attachments.length) {
        _push(`<div class="mt-2" data-v-033b5374>`);
        if (unref(carousel)) {
          _push(`<div class="relative group rounded-lg overflow-hidden bg-surface/50" data-v-033b5374><div class="sycs-hscroll flex overflow-x-auto snap-x snap-mandatory" data-v-033b5374><!--[-->`);
          ssrRenderList(unref(imageItems), (item) => {
            _push(ssrRenderComponent(_component_LongPress, {
              key: item.att.id,
              delay: 420,
              "move-tolerance": 24,
              class: "sycs-pressable snap-center shrink-0 w-full",
              onLongpress: ($event) => onLongPressAtt(item.att, item.index)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="relative w-full flex items-center justify-center" data-v-033b5374${_scopeId}><img${ssrRenderAttr("src", displayUrl(item.att))} loading="lazy" draggable="false" class="w-full max-h-[600px] object-contain select-none cursor-pointer transition duration-300" data-v-033b5374${_scopeId}>`);
                  if (isBlurred(item.att)) {
                    _push2(`<div class="absolute inset-0 flex items-center justify-center cursor-pointer" data-v-033b5374${_scopeId}><div class="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-bold flex items-center gap-2" data-v-033b5374${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_Icon, {
                      name: "lucide:eye-off",
                      class: "w-4 h-4"
                    }, null, _parent2, _scopeId));
                    _push2(` \u95B2\u89A7\u3059\u308B\u306B\u306F\u30AF\u30EA\u30C3\u30AF </div></div>`);
                  } else _push2(`<!---->`);
                  _push2(`</div>`);
                } else return [createVNode("div", { class: "relative w-full flex items-center justify-center" }, [createVNode("img", {
                  src: displayUrl(item.att),
                  loading: "lazy",
                  draggable: "false",
                  class: "w-full max-h-[600px] object-contain select-none cursor-pointer transition duration-300",
                  onClick: withModifiers(($event) => isBlurred(item.att) ? reveal(item.att.id) : props.interactive && !props.imageLightbox ? emit("open", item.index) : openModal(item.index), ["stop"]),
                  onDblclick: ($event) => !props.interactive && openModal(item.index)
                }, null, 40, [
                  "src",
                  "onClick",
                  "onDblclick"
                ]), isBlurred(item.att) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "absolute inset-0 flex items-center justify-center cursor-pointer",
                  onClick: ($event) => reveal(item.att.id)
                }, [createVNode("div", { class: "bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-bold flex items-center gap-2" }, [createVNode(_component_Icon, {
                  name: "lucide:eye-off",
                  class: "w-4 h-4"
                }), createTextVNode(" \u95B2\u89A7\u3059\u308B\u306B\u306F\u30AF\u30EA\u30C3\u30AF ")])], 8, ["onClick"])) : createCommentVNode("", true)])];
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div><div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] text-white/80 tabular-nums pointer-events-none" data-v-033b5374>${ssrInterpolate(unref(slideIndex) + 1)} / ${ssrInterpolate(unref(imageItems).length)}</div>`);
          if (unref(slideIndex) > 0) {
            _push(`<button title="\u524D\u306E\u753B\u50CF" class="hidden min-[1024px]:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white items-center justify-center transition opacity-0 group-hover:opacity-100 focus-visible:opacity-100" data-v-033b5374>`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:chevron-left",
              class: "w-5 h-5"
            }, null, _parent));
            _push(`</button>`);
          } else _push(`<!---->`);
          if (unref(slideIndex) < unref(imageItems).length - 1) {
            _push(`<button title="\u6B21\u306E\u753B\u50CF" class="hidden min-[1024px]:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white items-center justify-center transition opacity-0 group-hover:opacity-100 focus-visible:opacity-100" data-v-033b5374>`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:chevron-right",
              class: "w-5 h-5"
            }, null, _parent));
            _push(`</button>`);
          } else _push(`<!---->`);
          _push(`</div>`);
        } else _push(`<!---->`);
        if (unref(gridItems).length) {
          _push(`<div class="${ssrRenderClass([[gridClass(__props.attachments.length), unref(carousel) ? "mt-1.5" : ""], "grid gap-1.5"])}" data-v-033b5374><!--[-->`);
          ssrRenderList(unref(gridItems), (item) => {
            _push(ssrRenderComponent(_component_LongPress, {
              key: item.att.id,
              delay: 420,
              class: "sycs-pressable",
              onLongpress: ($event) => onLongPressAtt(item.att, item.index)
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="${ssrRenderClass([__props.attachments.length === 1 ? "w-fit mx-auto max-w-full" : "", "relative group rounded-lg overflow-hidden bg-surface/50"])}" data-v-033b5374${_scopeId}>`);
                  if (isImage(item.att.mime)) {
                    _push2(`<!--[--><img${ssrRenderAttr("src", displayUrl(item.att))} loading="lazy" class="${ssrRenderClass(["cursor-pointer transition duration-300", mediaClass(__props.attachments.length)])}" data-v-033b5374${_scopeId}>`);
                    if (isBlurred(item.att)) {
                      _push2(`<div class="absolute inset-0 flex items-center justify-center cursor-pointer" data-v-033b5374${_scopeId}><div class="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-bold flex items-center gap-2" data-v-033b5374${_scopeId}>`);
                      _push2(ssrRenderComponent(_component_Icon, {
                        name: "lucide:eye-off",
                        class: "w-4 h-4"
                      }, null, _parent2, _scopeId));
                      _push2(` \u95B2\u89A7\u3059\u308B\u306B\u306F\u30AF\u30EA\u30C3\u30AF </div></div>`);
                    } else _push2(`<!---->`);
                    _push2(`<!--]-->`);
                  } else if (isVideo(item.att.mime)) {
                    _push2(`<!--[--><video${ssrRenderAttr("src", item.att.url)} controls preload="metadata" class="${ssrRenderClass([mediaClass(__props.attachments.length), "bg-black"])}" data-v-033b5374${_scopeId}></video>`);
                    if (props.interactive) {
                      _push2(`<button type="button" class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition" data-v-033b5374${_scopeId}>`);
                      _push2(ssrRenderComponent(_component_Icon, {
                        name: "lucide:maximize-2",
                        class: "w-3 h-3"
                      }, null, _parent2, _scopeId));
                      _push2(` \u8A73\u7D30 </button>`);
                    } else _push2(`<!---->`);
                    _push2(`<!--]-->`);
                  } else if (isAudio(item.att.mime)) {
                    _push2(`<div class="flex flex-col gap-2 mt-2 px-2 w-full" data-v-033b5374${_scopeId}>`);
                    _push2(ssrRenderComponent(MusicPlayer_default, { src: item.att.url }, null, _parent2, _scopeId));
                    if (props.interactive) {
                      _push2(`<button type="button" class="self-end p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition shrink-0" title="\u8A73\u7D30\u3092\u958B\u304F" data-v-033b5374${_scopeId}>`);
                      _push2(ssrRenderComponent(_component_Icon, {
                        name: "lucide:maximize-2",
                        class: "w-4 h-4"
                      }, null, _parent2, _scopeId));
                      _push2(`</button>`);
                    } else _push2(`<!---->`);
                    _push2(`</div>`);
                  } else if (isModel(item.att)) {
                    _push2(`<div class="relative" data-v-033b5374${_scopeId}><div class="h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-fuchsia-900/40 to-slate-900" data-v-033b5374${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_Icon, {
                      name: "lucide:box",
                      class: "w-8 h-8 text-fuchsia-400"
                    }, null, _parent2, _scopeId));
                    _push2(`<span class="text-[11px] text-on-surface-variant" data-v-033b5374${_scopeId}>3D\u30E2\u30C7\u30EB</span></div>`);
                    if (props.interactive) {
                      _push2(`<button type="button" class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition" data-v-033b5374${_scopeId}>`);
                      _push2(ssrRenderComponent(_component_Icon, {
                        name: "lucide:maximize-2",
                        class: "w-3 h-3"
                      }, null, _parent2, _scopeId));
                      _push2(` \u8A73\u7D30 </button>`);
                    } else _push2(`<!---->`);
                    _push2(`</div>`);
                  } else {
                    _push2(`<!--[-->`);
                    _push2(ssrRenderComponent(FileCard_default, {
                      url: item.att.url,
                      mime: item.att.mime
                    }, null, _parent2, _scopeId));
                    if (props.interactive) {
                      _push2(`<button type="button" class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition" data-v-033b5374${_scopeId}>`);
                      _push2(ssrRenderComponent(_component_Icon, {
                        name: "lucide:maximize-2",
                        class: "w-3 h-3"
                      }, null, _parent2, _scopeId));
                      _push2(` \u8A73\u7D30 </button>`);
                    } else _push2(`<!---->`);
                    _push2(`<!--]-->`);
                  }
                  _push2(`</div>`);
                } else return [createVNode("div", { class: ["relative group rounded-lg overflow-hidden bg-surface/50", __props.attachments.length === 1 ? "w-fit mx-auto max-w-full" : ""] }, [isImage(item.att.mime) ? (openBlock(), createBlock(Fragment, { key: 0 }, [createVNode("img", {
                  src: displayUrl(item.att),
                  loading: "lazy",
                  class: ["cursor-pointer transition duration-300", mediaClass(__props.attachments.length)],
                  onClick: withModifiers(($event) => isBlurred(item.att) ? reveal(item.att.id) : props.interactive && !props.imageLightbox ? emit("open", item.index) : openModal(item.index), ["stop"]),
                  onDblclick: ($event) => !props.interactive && openModal(item.index)
                }, null, 42, [
                  "src",
                  "onClick",
                  "onDblclick"
                ]), isBlurred(item.att) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "absolute inset-0 flex items-center justify-center cursor-pointer",
                  onClick: ($event) => reveal(item.att.id)
                }, [createVNode("div", { class: "bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-bold flex items-center gap-2" }, [createVNode(_component_Icon, {
                  name: "lucide:eye-off",
                  class: "w-4 h-4"
                }), createTextVNode(" \u95B2\u89A7\u3059\u308B\u306B\u306F\u30AF\u30EA\u30C3\u30AF ")])], 8, ["onClick"])) : createCommentVNode("", true)], 64)) : isVideo(item.att.mime) ? (openBlock(), createBlock(Fragment, { key: 1 }, [createVNode("video", {
                  src: item.att.url,
                  controls: "",
                  preload: "metadata",
                  class: [mediaClass(__props.attachments.length), "bg-black"]
                }, null, 10, ["src"]), props.interactive ? (openBlock(), createBlock("button", {
                  key: 0,
                  type: "button",
                  onClick: withModifiers(($event) => emit("open", item.index), ["stop"]),
                  class: "absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition"
                }, [createVNode(_component_Icon, {
                  name: "lucide:maximize-2",
                  class: "w-3 h-3"
                }), createTextVNode(" \u8A73\u7D30 ")], 8, ["onClick"])) : createCommentVNode("", true)], 64)) : isAudio(item.att.mime) ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "flex flex-col gap-2 mt-2 px-2 w-full"
                }, [createVNode(MusicPlayer_default, { src: item.att.url }, null, 8, ["src"]), props.interactive ? (openBlock(), createBlock("button", {
                  key: 0,
                  type: "button",
                  onClick: withModifiers(($event) => emit("open", item.index), ["stop"]),
                  class: "self-end p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition shrink-0",
                  title: "\u8A73\u7D30\u3092\u958B\u304F"
                }, [createVNode(_component_Icon, {
                  name: "lucide:maximize-2",
                  class: "w-4 h-4"
                })], 8, ["onClick"])) : createCommentVNode("", true)])) : isModel(item.att) ? (openBlock(), createBlock("div", {
                  key: 3,
                  class: "relative"
                }, [createVNode("div", { class: "h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-fuchsia-900/40 to-slate-900" }, [createVNode(_component_Icon, {
                  name: "lucide:box",
                  class: "w-8 h-8 text-fuchsia-400"
                }), createVNode("span", { class: "text-[11px] text-on-surface-variant" }, "3D\u30E2\u30C7\u30EB")]), props.interactive ? (openBlock(), createBlock("button", {
                  key: 0,
                  type: "button",
                  onClick: withModifiers(($event) => emit("open", item.index), ["stop"]),
                  class: "absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition"
                }, [createVNode(_component_Icon, {
                  name: "lucide:maximize-2",
                  class: "w-3 h-3"
                }), createTextVNode(" \u8A73\u7D30 ")], 8, ["onClick"])) : createCommentVNode("", true)])) : (openBlock(), createBlock(Fragment, { key: 4 }, [createVNode(FileCard_default, {
                  url: item.att.url,
                  mime: item.att.mime
                }, null, 8, ["url", "mime"]), props.interactive ? (openBlock(), createBlock("button", {
                  key: 0,
                  type: "button",
                  onClick: withModifiers(($event) => emit("open", item.index), ["stop"]),
                  class: "absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition"
                }, [createVNode(_component_Icon, {
                  name: "lucide:maximize-2",
                  class: "w-3 h-3"
                }), createTextVNode(" \u8A73\u7D30 ")], 8, ["onClick"])) : createCommentVNode("", true)], 64))], 2)];
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else _push(`<!---->`);
        _push(`</div>`);
      } else _push(`<!---->`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(modalOpen)) {
          _push2(`<div class="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 select-none" data-v-033b5374><div class="relative w-full h-full flex items-center justify-center overflow-hidden" data-v-033b5374>`);
          if (__props.attachments[unref(modalIndex)]) _push2(`<img${ssrRenderAttr("src", __props.attachments[unref(modalIndex)].url)} class="${ssrRenderClass([{
            "cursor-grab": unref(zoomLevel) > 1,
            "cursor-grabbing": unref(isDragging)
          }, "max-w-none"])}" style="${ssrRenderStyle({
            transform: `translate(${unref(pan).x}px, ${unref(pan).y}px) scale(${unref(zoomLevel)})`,
            maxWidth: unref(zoomLevel) <= 1 ? "90%" : "none",
            maxHeight: unref(zoomLevel) <= 1 ? "90vh" : "none"
          })}" draggable="false" data-v-033b5374>`);
          else _push2(`<!---->`);
          _push2(`<div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 rounded-full px-4 py-2" data-v-033b5374><button class="text-white hover:text-indigo-400 transition p-1" title="\u7E2E\u5C0F" data-v-033b5374>`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:zoom-out",
            class: "w-5 h-5"
          }, null, _parent));
          _push2(`</button><span class="text-white text-sm min-w-[3rem] text-center" data-v-033b5374>${ssrInterpolate(Math.round(unref(zoomLevel) * 100))}%</span><button class="text-white hover:text-indigo-400 transition p-1" title="\u62E1\u5927" data-v-033b5374>`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:zoom-in",
            class: "w-5 h-5"
          }, null, _parent));
          _push2(`</button><span class="w-px h-6 bg-white/20" data-v-033b5374></span><button class="text-white hover:text-indigo-400 transition p-1" title="\u30EA\u30BB\u30C3\u30C8" data-v-033b5374>`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:rotate-ccw",
            class: "w-4 h-4"
          }, null, _parent));
          _push2(`</button><button class="text-white hover:text-indigo-400 transition p-1" title="\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9" data-v-033b5374>`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:download",
            class: "w-5 h-5"
          }, null, _parent));
          _push2(`</button></div><button class="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition" data-v-033b5374>`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:x",
            class: "w-5 h-5"
          }, null, _parent));
          _push2(`</button></div></div>`);
        } else _push2(`<!---->`);
      }, "body", false, _parent);
      _push(`<!--]-->`);
    };
  }
});
var _sfc_setup = PostAttachments_vue_vue_type_script_setup_true_lang_default.setup;
PostAttachments_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PostAttachments.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PostAttachments_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(PostAttachments_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-033b5374"]]), { __name: "PostAttachments" });

export { FileCard_default as F, MusicPlayer_default as M, PostAttachments_default as P };
//# sourceMappingURL=PostAttachments-6klIUBIU.mjs.map
