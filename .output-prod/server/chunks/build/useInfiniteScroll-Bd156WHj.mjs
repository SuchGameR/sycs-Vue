import { c as components_default } from '../virtual/entry.mjs';
import { u as useMediaPane } from './useMediaPane-BrRmAswF.mjs';
import { ref, watch, defineComponent, mergeProps, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderComponent, ssrInterpolate, ssrRenderTeleport, ssrRenderStyle } from 'vue/server-renderer';

var UserBadges_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "UserBadges",
  __ssrInlineRender: true,
  props: {
    badges: {},
    size: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_Icon = components_default;
      if ((_a = __props.badges) == null ? void 0 : _a.length) {
        _push(`<span${ssrRenderAttrs(mergeProps({ class: "inline-flex items-center gap-1 align-middle shrink-0" }, _attrs))}><!--[-->`);
        ssrRenderList(__props.badges, (b, i) => {
          _push(`<span${ssrRenderAttr("title", b.label || "")} class="inline-flex">`);
          if (b.kind === "image") _push(`<img${ssrRenderAttr("src", b.value)}${ssrRenderAttr("alt", b.label || "badge")} class="${ssrRenderClass([__props.size === "md" ? "w-5 h-5" : "w-4 h-4", "rounded object-contain"])}">`);
          else _push(ssrRenderComponent(_component_Icon, {
            name: b.value,
            class: ["text-amber-400", __props.size === "md" ? "w-5 h-5" : "w-4 h-4"]
          }, null, _parent));
          _push(`</span>`);
        });
        _push(`<!--]--></span>`);
      } else _push(`<!---->`);
    };
  }
});
var _sfc_setup$3 = UserBadges_vue_vue_type_script_setup_true_lang_default.setup;
UserBadges_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UserBadges.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var UserBadges_default = Object.assign(UserBadges_vue_vue_type_script_setup_true_lang_default, { __name: "UserBadges" });
var UserTitle_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "UserTitle",
  __ssrInlineRender: true,
  props: { title: {} },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.title) _push(`<span${ssrRenderAttrs(mergeProps({ class: "px-1.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-bold text-indigo-300 shrink-0 align-middle" }, _attrs))}>${ssrInterpolate(__props.title)}</span>`);
      else _push(`<!---->`);
    };
  }
});
var _sfc_setup$2 = UserTitle_vue_vue_type_script_setup_true_lang_default.setup;
UserTitle_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UserTitle.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var UserTitle_default = Object.assign(UserTitle_vue_vue_type_script_setup_true_lang_default, { __name: "UserTitle" });
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
        color: "text-slate-400",
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition" }, _attrs))}><div class="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: unref(meta).icon,
        class: ["w-5 h-5", unref(meta).color]
      }, null, _parent));
      _push(`</div><div class="min-w-0 flex-1"><p class="text-sm text-white font-medium truncate"${ssrRenderAttr("title", unref(displayName))}>${ssrInterpolate(unref(displayName))}</p><p class="text-[11px] text-slate-500">${ssrInterpolate(unref(meta).label)}`);
      if (unref(sizeLabel)) _push(`<!--[--> \xB7 ${ssrInterpolate(unref(sizeLabel))}<!--]-->`);
      else _push(`<!---->`);
      _push(`</p></div>`);
      if (unref(downloadable)) {
        _push(`<a${ssrRenderAttr("href", __props.url)}${ssrRenderAttr("download", unref(displayName))} class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition shrink-0" title="\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:download",
          class: "w-4 h-4"
        }, null, _parent));
        _push(`</a>`);
      } else _push(`<!---->`);
      if (unref(downloadable)) {
        _push(`<a${ssrRenderAttr("href", __props.url)} target="_blank" rel="noopener noreferrer" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition shrink-0" title="\u65B0\u3057\u3044\u30BF\u30D6\u3067\u958B\u304F">`);
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
var _sfc_setup$1 = FileCard_vue_vue_type_script_setup_true_lang_default.setup;
FileCard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/media/FileCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var FileCard_default = Object.assign(FileCard_vue_vue_type_script_setup_true_lang_default, { __name: "MediaFileCard" });
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
    function imageClass(count) {
      if (count === 1) return "max-h-96";
      return "h-48";
    }
    const modalOpen = ref(false);
    const modalIndex = ref(0);
    const zoomLevel = ref(1);
    const pan = ref({
      x: 0,
      y: 0
    });
    let isDragging = false;
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      _push(`<!--[-->`);
      if (__props.attachments.length) {
        _push(`<div class="${ssrRenderClass([gridClass(__props.attachments.length), "mt-2 grid gap-1.5"])}"><!--[-->`);
        ssrRenderList(__props.attachments, (att, i) => {
          _push(`<div class="relative group rounded-lg overflow-hidden bg-slate-900/50">`);
          if (isImage(att.mime)) {
            _push(`<!--[--><img${ssrRenderAttr("src", displayUrl(att))} class="${ssrRenderClass(["w-full object-cover cursor-pointer transition duration-300", imageClass(__props.attachments.length)])}">`);
            if (isBlurred(att)) {
              _push(`<div class="absolute inset-0 flex items-center justify-center cursor-pointer"><div class="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-bold flex items-center gap-2">`);
              _push(ssrRenderComponent(_component_Icon, {
                name: "lucide:eye-off",
                class: "w-4 h-4"
              }, null, _parent));
              _push(` \u95B2\u89A7\u3059\u308B\u306B\u306F\u30AF\u30EA\u30C3\u30AF </div></div>`);
            } else _push(`<!---->`);
            _push(`<!--]-->`);
          } else if (isVideo(att.mime)) {
            _push(`<!--[--><video${ssrRenderAttr("src", att.url)} controls preload="metadata" class="w-full h-48 object-cover bg-black"></video>`);
            if (props.interactive) {
              _push(`<button type="button" class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition">`);
              _push(ssrRenderComponent(_component_Icon, {
                name: "lucide:maximize-2",
                class: "w-3 h-3"
              }, null, _parent));
              _push(` \u8A73\u7D30 </button>`);
            } else _push(`<!---->`);
            _push(`<!--]-->`);
          } else if (isAudio(att.mime)) {
            _push(`<div class="flex items-center gap-2 mt-4 px-2 w-full"><audio${ssrRenderAttr("src", att.url)} controls class="flex-1 h-12"></audio>`);
            if (props.interactive) {
              _push(`<button type="button" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition shrink-0" title="\u8A73\u7D30\u3092\u958B\u304F">`);
              _push(ssrRenderComponent(_component_Icon, {
                name: "lucide:maximize-2",
                class: "w-4 h-4"
              }, null, _parent));
              _push(`</button>`);
            } else _push(`<!---->`);
            _push(`</div>`);
          } else if (isModel(att)) {
            _push(`<div class="relative"><div class="h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-fuchsia-900/40 to-slate-900">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:box",
              class: "w-8 h-8 text-fuchsia-400"
            }, null, _parent));
            _push(`<span class="text-[11px] text-slate-400">3D\u30E2\u30C7\u30EB</span></div>`);
            if (props.interactive) {
              _push(`<button type="button" class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition">`);
              _push(ssrRenderComponent(_component_Icon, {
                name: "lucide:maximize-2",
                class: "w-3 h-3"
              }, null, _parent));
              _push(` \u8A73\u7D30 </button>`);
            } else _push(`<!---->`);
            _push(`</div>`);
          } else {
            _push(`<!--[-->`);
            _push(ssrRenderComponent(FileCard_default, {
              url: att.url,
              mime: att.mime
            }, null, _parent));
            if (props.interactive) {
              _push(`<button type="button" class="absolute top-2 right-2 flex items-center gap-1 bg-black/70 hover:bg-black/90 text-white text-xs font-bold rounded-full px-2.5 py-1 transition">`);
              _push(ssrRenderComponent(_component_Icon, {
                name: "lucide:maximize-2",
                class: "w-3 h-3"
              }, null, _parent));
              _push(` \u8A73\u7D30 </button>`);
            } else _push(`<!---->`);
            _push(`<!--]-->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      } else _push(`<!---->`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(modalOpen)) {
          _push2(`<div class="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 select-none"><div class="relative w-full h-full flex items-center justify-center overflow-hidden">`);
          if (__props.attachments[unref(modalIndex)]) _push2(`<img${ssrRenderAttr("src", __props.attachments[unref(modalIndex)].url)} class="${ssrRenderClass([{
            "cursor-grab": unref(zoomLevel) > 1,
            "cursor-grabbing": unref(isDragging)
          }, "max-w-none"])}" style="${ssrRenderStyle({
            transform: `translate(${unref(pan).x}px, ${unref(pan).y}px) scale(${unref(zoomLevel)})`,
            maxWidth: unref(zoomLevel) <= 1 ? "90%" : "none",
            maxHeight: unref(zoomLevel) <= 1 ? "90vh" : "none"
          })}" draggable="false">`);
          else _push2(`<!---->`);
          _push2(`<div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 rounded-full px-4 py-2"><button class="text-white hover:text-indigo-400 transition p-1" title="\u7E2E\u5C0F">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:zoom-out",
            class: "w-5 h-5"
          }, null, _parent));
          _push2(`</button><span class="text-white text-sm min-w-[3rem] text-center">${ssrInterpolate(Math.round(unref(zoomLevel) * 100))}%</span><button class="text-white hover:text-indigo-400 transition p-1" title="\u62E1\u5927">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:zoom-in",
            class: "w-5 h-5"
          }, null, _parent));
          _push2(`</button><span class="w-px h-6 bg-white/20"></span><button class="text-white hover:text-indigo-400 transition p-1" title="\u30EA\u30BB\u30C3\u30C8">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:rotate-ccw",
            class: "w-4 h-4"
          }, null, _parent));
          _push2(`</button><button class="text-white hover:text-indigo-400 transition p-1" title="\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:download",
            class: "w-5 h-5"
          }, null, _parent));
          _push2(`</button></div><button class="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition">`);
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
var PostAttachments_default = Object.assign(PostAttachments_vue_vue_type_script_setup_true_lang_default, { __name: "PostAttachments" });
function useInfiniteScroll(onLoad, options = {}) {
  const sentinel = ref(null);
  const loading = ref(false);
  const done = ref(false);
  let observer = null;
  async function loadMore() {
    if (loading.value || done.value) return;
    loading.value = true;
    try {
      const result = await onLoad();
      const hasMore = result && typeof result === "object" && "hasMore" in result ? !!result.hasMore : result !== false;
      done.value = !hasMore;
    } finally {
      loading.value = false;
    }
  }
  function reset() {
    done.value = false;
  }
  function observe(el) {
    observer == null ? void 0 : observer.disconnect();
    observer = null;
  }
  watch(sentinel, (el) => observe(), { immediate: true });
  return {
    sentinel,
    loading,
    done,
    loadMore,
    reset,
    observe
  };
}

export { FileCard_default as F, PostAttachments_default as P, UserBadges_default as U, UserTitle_default as a, useInfiniteScroll as u };
//# sourceMappingURL=useInfiniteScroll-Bd156WHj.mjs.map
