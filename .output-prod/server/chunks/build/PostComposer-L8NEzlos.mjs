import { m as useState, c as components_default } from '../virtual/entry.mjs';
import { a as avatarSrc } from './avatar-BGDIRQ_Q.mjs';
import { u as useAccounts, E as EmojiTextarea_default, M as ModelViewer_default } from './ModelViewer-Ciluudu5.mjs';
import { u as useCustomEmojis, r as renderRichText } from './richText-C23QsgTl.mjs';
import { a as useDropdownPosition } from './useQuoteComposer-aC9wgnjC.mjs';
import { Q as QuotedPostCard_default } from './PostItem-B40v-dca.mjs';
import { defineComponent, ref, watch, computed, mergeProps, unref, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderTeleport, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderStyle } from 'vue/server-renderer';

var MAX_FILES = 8;
var PostComposer_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "PostComposer",
  __ssrInlineRender: true,
  props: {
    mediaKind: {},
    placeholder: {},
    quotedPost: {}
  },
  emits: ["submit"],
  setup(__props, { emit: __emit }) {
    const { map: customEmojiMap } = useCustomEmojis();
    const me = useState("current-user", () => null);
    useAccounts();
    const props = __props;
    const content = ref("");
    const pendingFiles = ref([]);
    const uploading = ref(false);
    ref(null);
    const dragging = ref(false);
    const activePreview = ref(null);
    const showPrivacy = ref(false);
    const { style: visStyle } = useDropdownPosition(200);
    watch(showPrivacy, (v) => {
    });
    const visibility = ref("public");
    ref([]);
    const visibilityOptions = [
      {
        key: "public",
        label: "\u3059\u3079\u3066\u306E\u4EBA\u306B\u516C\u958B",
        icon: "lucide:globe"
      },
      {
        key: "followers",
        label: "\u30D5\u30A9\u30ED\u30EF\u30FC\u306E\u307F",
        icon: "lucide:users"
      },
      {
        key: "close_friends",
        label: "\u89AA\u3057\u3044\u53CB\u9054\u306E\u307F",
        icon: "lucide:heart"
      },
      {
        key: "specific",
        label: "\u7279\u5B9A\u306E\u4EBA",
        icon: "lucide:user-check"
      }
    ];
    const selectedVis = computed(() => visibilityOptions.find((o) => o.key === visibility.value));
    const KINDS = {
      image: {
        mimes: [
          "image/png",
          "image/jpeg",
          "image/gif",
          "image/webp"
        ],
        exts: [
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".webp"
        ]
      },
      video: {
        mimes: ["video/webm", "video/mp4"],
        exts: [".webm", ".mp4"]
      },
      audio: {
        mimes: [
          "audio/mpeg",
          "audio/ogg",
          "audio/wav",
          "audio/mp4"
        ],
        exts: [
          ".mp3",
          ".ogg",
          ".wav",
          ".m4a"
        ]
      },
      model: {
        mimes: [
          "model/gltf-binary",
          "model/gltf+json",
          "model/obj"
        ],
        exts: [
          ".glb",
          ".gltf",
          ".obj",
          ".fbx",
          ".stl"
        ]
      },
      file: {
        mimes: [
          "application/pdf",
          "application/zip",
          "text/plain",
          "text/markdown",
          "application/json",
          "text/csv"
        ],
        exts: [
          ".pdf",
          ".zip",
          ".txt",
          ".md",
          ".json",
          ".csv"
        ]
      }
    };
    const ALL_KINDS = [
      "image",
      "video",
      "audio",
      "model",
      "file"
    ];
    const allowedKinds = computed(() => {
      const k = String(props.mediaKind || "");
      return KINDS[k] ? [k] : ALL_KINDS;
    });
    const acceptAttr = computed(() => allowedKinds.value.flatMap((k) => KINDS[k].exts).join(","));
    const previewVisible = computed(() => !!content.value.trim() || pendingFiles.value.length > 0);
    function activeFile() {
      return activePreview.value !== null ? pendingFiles.value[activePreview.value] : null;
    }
    function fileIcon(mime) {
      if (mime.startsWith("image/")) return "lucide:image";
      if (mime.startsWith("video/")) return "lucide:video";
      if (mime.startsWith("audio/")) return "lucide:music";
      if (mime.startsWith("model/")) return "lucide:box";
      return "lucide:file";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      const _component_Icon = components_default;
      const _component_EmojiTextarea = EmojiTextarea_default;
      const _component_QuotedPostCard = QuotedPostCard_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: ["flex gap-3 rounded-2xl transition p-1 -m-1", unref(dragging) ? "ring-2 ring-indigo-500 bg-indigo-600/10" : ""] }, _attrs))}><button type="button" class="w-10 h-10 rounded-full shrink-0 overflow-hidden bg-indigo-600 ring-1 ring-slate-700/60 hover:ring-indigo-500 transition relative group" title="\u30A2\u30AB\u30A6\u30F3\u30C8\u5207\u308A\u66FF\u3048">`);
      if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a = unref(me)) == null ? void 0 : _a.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_b = unref(me)) == null ? void 0 : _b.avatarUrl))} class="w-full h-full object-cover">`);
      else {
        _push(`<div class="w-full h-full flex items-center justify-center text-white">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:user",
          class: "w-5 h-5"
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`<span class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:user-round-cog",
        class: "w-4 h-4 text-white"
      }, null, _parent));
      _push(`</span></button><div class="flex-1 space-y-2">`);
      _push(ssrRenderComponent(_component_EmojiTextarea, {
        modelValue: unref(content),
        "onUpdate:modelValue": ($event) => isRef(content) ? content.value = $event : null,
        rows: 2,
        "auto-resize": "",
        "textarea-class": "w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 resize-none text-sm leading-5",
        placeholder: __props.placeholder || "\u306A\u306B\u304B\u3042\u3063\u305F\uFF1F"
      }, null, _parent));
      if (__props.quotedPost) _push(ssrRenderComponent(_component_QuotedPostCard, {
        post: __props.quotedPost,
        class: "mt-1"
      }, null, _parent));
      else _push(`<!---->`);
      if (unref(previewVisible)) {
        _push(`<div class="mt-2 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-3"><p class="text-[11px] text-slate-500 mb-2 flex items-center gap-1">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:eye",
          class: "w-3 h-3"
        }, null, _parent));
        _push(` \u30D7\u30EC\u30D3\u30E5\u30FC </p><div class="flex gap-3">`);
        if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_c = unref(me)) == null ? void 0 : _c.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_d = unref(me)) == null ? void 0 : _d.avatarUrl))} class="w-9 h-9 rounded-full object-cover shrink-0">`);
        else {
          _push(`<div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:user",
            class: "w-4 h-4"
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`<div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="font-bold text-white text-sm truncate">${ssrInterpolate(((_e = unref(me)) == null ? void 0 : _e.displayName) || "\u3042\u306A\u305F")}</span><span class="text-slate-500 text-xs shrink-0">@${ssrInterpolate(((_f = unref(me)) == null ? void 0 : _f.username) || "")} \xB7 \u305F\u3063\u305F\u4ECA</span></div>`);
        if (unref(content).trim()) _push(`<p class="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap break-words">${(_g = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(unref(content), { custom: unref(customEmojiMap) })) != null ? _g : ""}</p>`);
        else _push(`<!---->`);
        if (unref(pendingFiles).length) {
          _push(`<div class="flex flex-wrap gap-1.5 mt-1"><!--[-->`);
          ssrRenderList(unref(pendingFiles).filter((x) => x.type === "image"), (f) => {
            _push(`<img${ssrRenderAttr("src", f.preview)} class="w-16 h-16 rounded-lg object-cover">`);
          });
          _push(`<!--]-->`);
          if (unref(pendingFiles).some((x) => x.type !== "image")) {
            _push(`<span class="flex items-center gap-1 text-xs text-slate-500 px-2 py-1 rounded-lg bg-slate-800/60">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: fileIcon(unref(pendingFiles).find((x) => x.type !== "image").mime),
              class: "w-3.5 h-3.5"
            }, null, _parent));
            _push(` ${ssrInterpolate(unref(pendingFiles).filter((x) => x.type !== "image").length)} \u30D5\u30A1\u30A4\u30EB </span>`);
          } else _push(`<!---->`);
          _push(`</div>`);
        } else _push(`<!---->`);
        if (__props.quotedPost) _push(ssrRenderComponent(_component_QuotedPostCard, {
          post: __props.quotedPost,
          class: "mt-1"
        }, null, _parent));
        else _push(`<!---->`);
        _push(`</div></div></div>`);
      } else _push(`<!---->`);
      if (unref(pendingFiles).length) {
        _push(`<div class="flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(unref(pendingFiles), (f, i) => {
          _push(`<button class="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-900/70 border border-slate-700 hover:border-indigo-500 transition shrink-0">`);
          if (f.type === "image") _push(`<img${ssrRenderAttr("src", f.preview)} class="w-full h-full object-cover">`);
          else {
            _push(`<div class="w-full h-full flex items-center justify-center text-slate-500">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: fileIcon(f.mime),
              class: "w-5 h-5"
            }, null, _parent));
            _push(`</div>`);
          }
          _push(`<button class="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:x",
            class: "w-2.5 h-2.5"
          }, null, _parent));
          _push(`</button></button>`);
        });
        _push(`<!--]--></div>`);
      } else _push(`<!---->`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(activePreview) !== null && activeFile()) {
          _push2(`<div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70"><div class="bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"><div class="relative bg-black rounded-t-2xl min-h-[200px] flex items-center justify-center">`);
          if (activeFile().type === "image") _push2(`<img${ssrRenderAttr("src", activeFile().preview)} class="max-w-full max-h-[50vh] object-contain rounded-t-2xl">`);
          else if (activeFile().type === "video") _push2(`<video${ssrRenderAttr("src", activeFile().preview)} controls autoplay muted loop class="max-w-full max-h-[50vh] rounded-t-2xl"></video>`);
          else if (activeFile().type === "audio") _push2(`<audio${ssrRenderAttr("src", activeFile().preview)} controls class="w-full m-4"></audio>`);
          else if (activeFile().type === "model") _push2(ssrRenderComponent(ModelViewer_default, {
            src: activeFile().preview,
            class: "w-full"
          }, null, _parent));
          else {
            _push2(`<div class="text-slate-500 p-8">`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: fileIcon(activeFile().mime),
              class: "w-12 h-12 mx-auto"
            }, null, _parent));
            _push2(`</div>`);
          }
          _push2(`<button class="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:x",
            class: "w-4 h-4"
          }, null, _parent));
          _push2(`</button></div><div class="p-4 space-y-3"><p class="text-xs text-slate-500 truncate">${ssrInterpolate(activeFile().file.name)}</p>`);
          if (activeFile().type === "image") _push2(`<label class="${ssrRenderClass([activeFile().blur ? "bg-indigo-600/20" : "bg-slate-800/30 hover:bg-slate-800/50", "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"])}"><input type="checkbox"${ssrIncludeBooleanAttr(activeFile().blur) ? " checked" : ""} class="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"><div><p class="text-sm font-medium text-white">\u307C\u304B\u3057\u3092\u304B\u3051\u308B</p><p class="text-xs text-slate-500">\u95B2\u89A7\u8005\u304C\u30AF\u30EA\u30C3\u30AF\u3067\u8868\u793A\u3067\u304D\u308B\u307C\u304B\u3057\u3092\u9069\u7528</p></div></label>`);
          else _push2(`<!---->`);
          if (activeFile().type === "image") _push2(`<label class="${ssrRenderClass([activeFile().watermark ? "bg-indigo-600/20" : "bg-slate-800/30 hover:bg-slate-800/50", "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"])}"><input type="checkbox"${ssrIncludeBooleanAttr(activeFile().watermark) ? " checked" : ""} class="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500"><div><p class="text-sm font-medium text-white">\u30A6\u30A9\u30FC\u30BF\u30FC\u30DE\u30FC\u30AF</p><p class="text-xs text-slate-500">\u753B\u50CF\u306B@\u30E6\u30FC\u30B6\u30FC\u540D\u3092\u900F\u304B\u3057\u3068\u3057\u3066\u57CB\u3081\u8FBC\u307F</p></div></label>`);
          else _push2(`<!---->`);
          _push2(`</div></div></div>`);
        } else _push2(`<!---->`);
      }, "body", false, _parent);
      _push(`<div class="flex items-center justify-between flex-wrap gap-2"><div class="flex items-center gap-2"><button${ssrIncludeBooleanAttr(unref(pendingFiles).length >= MAX_FILES || unref(uploading)) ? " disabled" : ""} class="p-1.5 rounded-full text-slate-500 hover:text-indigo-400 hover:bg-slate-800/50 transition disabled:opacity-30"${ssrRenderAttr("title", `\u30D5\u30A1\u30A4\u30EB\u6DFB\u4ED8 (${unref(pendingFiles).length}/${MAX_FILES})`)}>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:paperclip",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button>`);
      if (unref(pendingFiles).length) _push(`<span class="text-[11px] text-slate-600">${ssrInterpolate(unref(pendingFiles).length)}/${ssrInterpolate(MAX_FILES)}</span>`);
      else _push(`<!---->`);
      _push(`<button class="p-1.5 rounded-full text-slate-500 hover:text-indigo-400 hover:bg-slate-800/50 transition text-xs flex items-center gap-1">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: ((_h = unref(selectedVis)) == null ? void 0 : _h.icon) || "lucide:globe",
        class: "w-3.5 h-3.5"
      }, null, _parent));
      _push(`<span class="hidden sm:inline">${ssrInterpolate(((_i = unref(selectedVis)) == null ? void 0 : _i.label) || "\u516C\u958B")}</span></button>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(showPrivacy)) _push2(`<div class="fixed inset-0 z-[298]"></div>`);
        else _push2(`<!---->`);
        if (unref(showPrivacy)) {
          _push2(`<div class="fixed z-[299] bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl overflow-y-auto" style="${ssrRenderStyle(unref(visStyle))}"><!--[-->`);
          ssrRenderList(visibilityOptions, (opt) => {
            _push2(`<button class="${ssrRenderClass([unref(visibility) === opt.key ? "text-indigo-400 bg-slate-800/50" : "text-slate-400 hover:text-white hover:bg-slate-800/30", "w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition"])}">`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: opt.icon,
              class: "w-4 h-4"
            }, null, _parent));
            _push2(` ${ssrInterpolate(opt.label)}</button>`);
          });
          _push2(`<!--]--></div>`);
        } else _push2(`<!---->`);
      }, "body", false, _parent);
      _push(`</div><button${ssrIncludeBooleanAttr(!unref(content).trim() && !unref(pendingFiles).length && !__props.quotedPost || unref(uploading)) ? " disabled" : ""} class="px-5 py-1.5 rounded-full bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5">`);
      if (unref(uploading)) _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:loader-2",
        class: "w-3.5 h-3.5 animate-spin"
      }, null, _parent));
      else _push(`<!---->`);
      _push(` ${ssrInterpolate(unref(uploading) ? "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u4E2D..." : "\u30DD\u30B9\u30C8\u3059\u308B")}</button></div><input type="file" multiple${ssrRenderAttr("accept", unref(acceptAttr))} class="hidden"></div></div>`);
    };
  }
});
var _sfc_setup = PostComposer_vue_vue_type_script_setup_true_lang_default.setup;
PostComposer_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PostComposer.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PostComposer_default = Object.assign(PostComposer_vue_vue_type_script_setup_true_lang_default, { __name: "PostComposer" });

export { PostComposer_default as P };
//# sourceMappingURL=PostComposer-L8NEzlos.mjs.map
