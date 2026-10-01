import { f as useState, c as components_default, $ as $fetch$1, o as refreshNuxtData } from '../virtual/entry.mjs';
import { u as useFetch } from './fetch-C2pjxSar.mjs';
import { U as UserBadges_default } from './UserBadges-BDdpg7rV.mjs';
import { B as BottomSheet_default } from './BottomSheet-lvIleqFE.mjs';
import { a as avatarSrc } from './avatar-Dl3G3V3K.mjs';
import { U as UserTitle_default } from './UserTitle-CX959JWB.mjs';
import { computed, defineComponent, ref, withAsyncContext, unref, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, createTextVNode, toDisplayString, createCommentVNode, withDirectives, isRef, vModelText, vModelCheckbox, vModelRadio, vModelSelect, withModifiers, mergeProps, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttrs } from 'vue/server-renderer';

function useAppPreferences() {
  const mediaOpenMode = useState("app-preferences:media-open-mode", () => {
    return "sheet";
  });
  function setMediaOpenMode(mode) {
    mediaOpenMode.value = mode;
  }
  return {
    mediaOpenMode,
    setMediaOpenMode
  };
}

var THEME_STYLES = [
  {
    id: "classic",
    label: "\u5F93\u6765\u306E\u30C6\u30FC\u30DE",
    description: "\u4ECA\u306E SYCS \u306E\u30C7\u30B6\u30A4\u30F3\uFF08\u30C0\u30FC\u30AF / \u30E9\u30A4\u30C8\uFF09",
    icon: "lucide:palette",
    seeded: false
  },
  {
    id: "liquid-glass",
    label: "Liquid Glass",
    description: "Apple \u98A8\u306E\u900F\u660E\u30AC\u30E9\u30B9\u3068\u30B9\u30DA\u30AD\u30E5\u30E9",
    icon: "lucide:droplets",
    seeded: true
  },
  {
    id: "material3",
    label: "Material 3",
    description: "Google \u98A8\u306E\u914D\u8272\u3068\u6CE2\u6253\u3064\u30A2\u30CB\u30E1\u30FC\u30B7\u30E7\u30F3",
    icon: "lucide:shapes",
    seeded: true
  }
];
var M3_SEEDS = [
  {
    id: "tonal-spot",
    label: "Baseline",
    swatch: "#6750A4"
  },
  {
    id: "vibrant",
    label: "Vibrant",
    swatch: "#7D5260"
  },
  {
    id: "expressive",
    label: "Expressive",
    swatch: "#635BFF"
  },
  {
    id: "content",
    label: "Content",
    swatch: "#B465F9"
  },
  {
    id: "fruit-salad",
    label: "Fruit Salad",
    swatch: "#B4E549"
  },
  {
    id: "rainbow",
    label: "Rainbow",
    swatch: "#A4C9F0"
  }
];
var LIQUID_GLASS_SEEDS = [
  {
    id: "sky",
    label: "Sky",
    swatch: "#0A84FF"
  },
  {
    id: "indigo",
    label: "Indigo",
    swatch: "#5E5CE6"
  },
  {
    id: "teal",
    label: "Teal",
    swatch: "#30B0C7"
  }
];
var SCHEME_OPTIONS = [
  {
    id: "light",
    label: "\u30E9\u30A4\u30C8",
    icon: "lucide:sun"
  },
  {
    id: "dark",
    label: "\u30C0\u30FC\u30AF",
    icon: "lucide:moon"
  },
  {
    id: "system",
    label: "\u30B7\u30B9\u30C6\u30E0",
    icon: "lucide:monitor"
  }
];
THEME_STYLES.map((s) => s.id);
[...M3_SEEDS, ...LIQUID_GLASS_SEEDS].map((s) => s.id);
var DEFAULT_STYLE = "classic";
var DEFAULT_SCHEME = "dark";
var DEFAULT_SEED = "tonal-spot";
function defaultSeedFor(style) {
  if (style === "liquid-glass") return LIQUID_GLASS_SEEDS[0].id;
  return M3_SEEDS[0].id;
}
function readStored() {
  return {
    style: DEFAULT_STYLE,
    scheme: DEFAULT_SCHEME,
    seed: DEFAULT_SEED
  };
}
function useTheme() {
  const style = useState("theme:style", () => readStored().style);
  const scheme = useState("theme:scheme", () => readStored().scheme);
  const seed = useState("theme:seed", () => readStored().seed);
  const prefersDark = useState("theme:prefers-dark", () => true);
  const resolvedScheme = computed(() => scheme.value === "system" ? prefersDark.value ? "dark" : "light" : scheme.value);
  const definition = computed(() => {
    var _a;
    return (_a = THEME_STYLES.find((s) => s.id === style.value)) != null ? _a : THEME_STYLES[0];
  });
  const seeds = computed(() => style.value === "liquid-glass" ? LIQUID_GLASS_SEEDS : M3_SEEDS);
  function apply() {
  }
  function persist() {
  }
  function withTransition(fn) {
    fn();
  }
  function setStyle(next) {
    withTransition(() => {
      style.value = next;
      seed.value = defaultSeedFor(next);
    });
  }
  function setScheme(next) {
    withTransition(() => {
      scheme.value = next;
    });
  }
  function setSeed(next) {
    withTransition(() => {
      seed.value = next;
    });
  }
  function hydrateFromServer(settings) {
  }
  function init() {
  }
  return {
    style,
    scheme,
    seed,
    resolvedScheme,
    prefersDark,
    definition,
    seeds,
    setStyle,
    setScheme,
    setSeed,
    apply,
    persist,
    init,
    hydrateFromServer
  };
}
var ThemePicker_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "ThemePicker",
  __ssrInlineRender: true,
  setup(__props) {
    const { style, scheme, seed, resolvedScheme, definition, seeds} = useTheme();
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_Icon = components_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div><label class="block text-sm text-on-surface-variant mb-2">\u30C6\u30FC\u30DE</label><div class="space-y-2"><!--[-->`);
      ssrRenderList("THEME_STYLES" in _ctx ? _ctx.THEME_STYLES : unref(THEME_STYLES), (s) => {
        _push(`<label class="${ssrRenderClass([unref(style) === s.id ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-surface-container/30 hover:bg-surface-container/60", "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition"])}"><input type="radio" name="sycs-theme-style" class="sr-only"${ssrIncludeBooleanAttr(unref(style) === s.id) ? " checked" : ""}><div class="${ssrRenderClass([unref(style) === s.id ? "bg-indigo-600/30" : "bg-surface-container", "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-outline-variant"])}">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: s.icon,
          class: ["w-5 h-5", unref(style) === s.id ? "text-indigo-300" : "text-on-surface-variant"]
        }, null, _parent));
        _push(`</div><div class="min-w-0 flex-1"><div class="text-sm text-on-surface">${ssrInterpolate(s.label)}</div><div class="text-xs text-on-surface-variant truncate">${ssrInterpolate(s.description)}</div></div>`);
        if (unref(style) === s.id) _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:check",
          class: "w-4 h-4 text-indigo-300 shrink-0"
        }, null, _parent));
        else _push(`<!---->`);
        _push(`</label>`);
      });
      _push(`<!--]--></div></div><div><label class="block text-sm text-on-surface-variant mb-2">\u660E\u308B\u3055</label><div class="grid grid-cols-3 gap-2"><!--[-->`);
      ssrRenderList("SCHEME_OPTIONS" in _ctx ? _ctx.SCHEME_OPTIONS : unref(SCHEME_OPTIONS), (opt) => {
        _push(`<label class="${ssrRenderClass([unref(scheme) === opt.id ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-surface-container/30 hover:bg-surface-container/60", "flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer transition"])}"><input type="radio" name="sycs-theme-scheme" class="sr-only"${ssrIncludeBooleanAttr(unref(scheme) === opt.id) ? " checked" : ""}>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: opt.icon,
          class: ["w-5 h-5", unref(scheme) === opt.id ? "text-indigo-300" : "text-on-surface-variant"]
        }, null, _parent));
        _push(`<span class="${ssrRenderClass([unref(scheme) === opt.id ? "text-on-surface" : "text-on-surface-variant", "text-xs"])}">${ssrInterpolate(opt.label)}</span></label>`);
      });
      _push(`<!--]--></div>`);
      if (unref(scheme) === "system") _push(`<p class="text-xs text-on-surface-variant mt-2"> \u73FE\u5728\u306E\u7AEF\u672B\u8A2D\u5B9A: <span class="text-on-surface-variant">${ssrInterpolate(unref(resolvedScheme) === "dark" ? "\u30C0\u30FC\u30AF" : "\u30E9\u30A4\u30C8")}</span></p>`);
      else _push(`<!---->`);
      _push(`</div>`);
      if (unref(definition).seeded) {
        _push(`<div><label class="block text-sm text-on-surface-variant mb-2"> \u30AB\u30E9\u30FC <span class="text-xs">\uFF08${ssrInterpolate(unref(definition).label)}\uFF09</span></label><div class="grid grid-cols-3 gap-2"><!--[-->`);
        ssrRenderList(unref(seeds), (sd) => {
          _push(`<label class="${ssrRenderClass([unref(seed) === sd.id ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-surface-container/30 hover:bg-surface-container/60", "flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition"])}"><input type="radio" name="sycs-theme-seed" class="sr-only"${ssrIncludeBooleanAttr(unref(seed) === sd.id) ? " checked" : ""}><span class="w-5 h-5 rounded-full shrink-0 ring-1 ring-inset ring-white/20" style="${ssrRenderStyle({ backgroundColor: sd.swatch })}"></span><span class="${ssrRenderClass([unref(seed) === sd.id ? "text-on-surface" : "text-on-surface-variant", "text-xs truncate"])}">${ssrInterpolate(sd.label)}</span></label>`);
        });
        _push(`<!--]--></div></div>`);
      } else _push(`<!---->`);
      _push(`<div><label class="block text-sm text-on-surface-variant mb-2">\u30D7\u30EC\u30D3\u30E5\u30FC</label><div class="${ssrRenderClass([unref(style) === "liquid-glass" ? "sycs-glass-strong" : "", "rounded-xl overflow-hidden border border-outline-variant"])}"><div class="${ssrRenderClass([unref(style) === "liquid-glass" ? "sycs-glass-thin" : "bg-surface-container", "px-3 py-2 border-b border-outline-variant flex items-center gap-2"])}"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span><span class="ml-2 h-2 w-24 rounded-full bg-surface-container-high"></span></div><div class="p-3 space-y-2.5 bg-surface"><div class="flex items-start gap-2.5"><span class="w-8 h-8 rounded-full bg-surface-container-high shrink-0"></span><div class="flex-1 space-y-1.5 min-w-0"><div class="flex items-center gap-2"><span class="h-2.5 w-20 rounded bg-surface-container-high"></span><span class="h-2 w-10 rounded text-on-surface-variant text-[9px]">2h</span></div><div class="h-2 w-full rounded bg-surface-container"></div><div class="h-2 w-4/5 rounded bg-surface-container"></div></div></div><div class="flex items-center gap-2 pt-1"><span class="h-6 w-14 rounded-md bg-indigo-600 inline-flex items-center justify-center"><span class="text-[9px] text-white">\u6295\u7A3F</span></span><span class="h-6 w-14 rounded-md bg-surface-container border border-outline inline-flex items-center justify-center"><span class="text-[9px] text-on-surface-variant">\u8FD4\u4FE1</span></span><span class="h-6 w-6 rounded-full bg-sky-500 inline-flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:heart",
        class: "w-3 h-3 text-white"
      }, null, _parent));
      _push(`</span><span class="h-6 w-6 rounded-full bg-emerald-500 inline-flex items-center justify-center">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:repeat-2",
        class: "w-3 h-3 text-white"
      }, null, _parent));
      _push(`</span></div></div></div><p class="text-xs text-on-surface-variant mt-2">${ssrInterpolate(unref(definition).label)} / ${ssrInterpolate((_a = ("SCHEME_OPTIONS" in _ctx ? _ctx.SCHEME_OPTIONS : unref(SCHEME_OPTIONS)).find((o) => o.id === unref(scheme))) == null ? void 0 : _a.label)} `);
      if (unref(definition).seeded) _push(`<!--[--> / ${ssrInterpolate((_b = unref(seeds).find((s) => s.id === unref(seed))) == null ? void 0 : _b.label)}<!--]-->`);
      else _push(`<!---->`);
      _push(`</p></div><p class="text-xs text-on-surface-variant"> \u8A2D\u5B9A\u306F\u4FDD\u5B58\u30DC\u30BF\u30F3\u3067\u30B5\u30FC\u30D0\u30FC\u3068\u540C\u671F\u3055\u308C\u307E\u3059\u3002\u672A\u4FDD\u5B58\u306E\u307E\u307E\u9589\u3058\u308B\u3068\u3053\u306E\u7AEF\u672B\u3060\u3051\u304C\u5909\u5316\u3057\u307E\u3059\u3002 </p></div>`);
    };
  }
});
var _sfc_setup$1 = ThemePicker_vue_vue_type_script_setup_true_lang_default.setup;
ThemePicker_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ThemePicker.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var ThemePicker_default = Object.assign(ThemePicker_vue_vue_type_script_setup_true_lang_default, { __name: "ThemePicker" });
function useNavLayout() {
  const desktopNav = useState("nav:desktop-mode", () => "pill");
  const sidebarCollapsed = useState("nav:sidebar-collapsed", () => false);
  const hydrated = useState("nav:hydrated", () => false);
  function hydrate() {
    if (hydrated.value || true) return;
  }
  function setDesktopNav(mode) {
    desktopNav.value = mode;
  }
  function setSidebarCollapsed(collapsed) {
    sidebarCollapsed.value = collapsed;
  }
  function toggleDesktopNav() {
    setDesktopNav(desktopNav.value === "pill" ? "sidebar" : "pill");
  }
  function toggleSidebar() {
    setSidebarCollapsed(!sidebarCollapsed.value);
  }
  return {
    desktopNav,
    sidebarCollapsed,
    hydrated,
    pillActive: computed(() => desktopNav.value === "pill"),
    hydrate,
    setDesktopNav,
    setSidebarCollapsed,
    toggleDesktopNav,
    toggleSidebar
  };
}
var SettingsModal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SettingsModal",
  __ssrInlineRender: true,
  emits: ["close"],
  async setup(__props, { emit: __emit }) {
    var _a, _b, _c, _d, _e, _f, _g;
    let __temp, __restore;
    const emit = __emit;
    const open = ref(true);
    const { data: userData, refresh: refreshUser } = ([__temp, __restore] = withAsyncContext(() => useFetch("/api/auth/me", { key: "settings-user" }, "$pq0RqmssUf")), __temp = await __temp, __restore(), __temp);
    const user = computed(() => {
      var _a2;
      return (_a2 = userData.value) == null ? void 0 : _a2.user;
    });
    const s = computed(() => {
      var _a2;
      return JSON.parse(((_a2 = user.value) == null ? void 0 : _a2.settings) || "{}");
    });
    const displayName = ref(((_a = user.value) == null ? void 0 : _a.displayName) || "");
    const bio = ref(((_b = user.value) == null ? void 0 : _b.bio) || "");
    const statusMessage = ref(((_c = user.value) == null ? void 0 : _c.statusMessage) || "");
    const avatarUrl = ref(((_d = user.value) == null ? void 0 : _d.avatarUrl) || "");
    const bannerUrl = ref(((_e = user.value) == null ? void 0 : _e.bannerUrl) || "");
    const isPrivate = ref(((_f = user.value) == null ? void 0 : _f.isPrivate) || false);
    const birthday = ref(s.value.birthday || "");
    const birthplace = ref(s.value.birthplace || "");
    const language = ref(s.value.language || "ja");
    const { style: themeStyle, scheme: themeScheme, seed: themeSeed } = useTheme();
    const { desktopNav, setDesktopNav } = useNavLayout();
    const navOptions = [{
      value: "pill",
      label: "\u4E0B\u90E8\u30CA\u30D3",
      icon: "lucide:panel-bottom"
    }, {
      value: "sidebar",
      label: "\u30B5\u30A4\u30C9\u30D0\u30FC",
      icon: "lucide:panel-left"
    }];
    const github = ref(s.value.github || "");
    const twitter = ref(s.value.twitter || "");
    const website = ref(s.value.website || "");
    const saving = ref(false);
    const uploadingAvatar = ref(false);
    const uploadingBanner = ref(false);
    const message = ref("");
    const activeCategory = ref("profile");
    const categories = [
      {
        key: "profile",
        label: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB",
        icon: "lucide:user"
      },
      {
        key: "detail",
        label: "\u8A73\u7D30\u60C5\u5831",
        icon: "lucide:info"
      },
      {
        key: "links",
        label: "\u30EA\u30F3\u30AF",
        icon: "lucide:link"
      },
      {
        key: "posts",
        label: "\u6295\u7A3F\u8A2D\u5B9A",
        icon: "lucide:edit-3"
      },
      {
        key: "timeline",
        label: "\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3",
        icon: "lucide:layout"
      },
      {
        key: "media",
        label: "\u30E1\u30C7\u30A3\u30A2\u8868\u793A",
        icon: "lucide:monitor-play"
      },
      {
        key: "appearance",
        label: "\u5916\u89B3",
        icon: "lucide:palette"
      },
      {
        key: "privacy",
        label: "\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC",
        icon: "lucide:shield"
      },
      {
        key: "notifications",
        label: "\u901A\u77E5",
        icon: "lucide:bell"
      }
    ];
    const buttonOrder = ref(s.value.postButtonOrder || [
      "like",
      "repost",
      "bookmark",
      "view"
    ]);
    const showViewCount = ref((_g = s.value.showViewCount) != null ? _g : true);
    const refreshMode = ref(s.value.refreshMode || "auto");
    const mediaOpenMode = ref(s.value.mediaOpenMode || "sheet");
    const { setMediaOpenMode } = useAppPreferences();
    const allButtons = [
      {
        key: "like",
        label: "\u3044\u3044\u306D",
        icon: "lucide:heart"
      },
      {
        key: "repost",
        label: "\u30EA\u30DD\u30B9\u30C8",
        icon: "lucide:repeat-2"
      },
      {
        key: "bookmark",
        label: "\u30D6\u30C3\u30AF\u30DE\u30FC\u30AF",
        icon: "lucide:bookmark"
      },
      {
        key: "view",
        label: "\u95B2\u89A7\u6570",
        icon: "lucide:eye"
      }
    ];
    function moveButton(key, dir) {
      const idx = buttonOrder.value.indexOf(key);
      if (idx === -1) return;
      const n = idx + dir;
      if (n < 0 || n >= buttonOrder.value.length) return;
      const a = [...buttonOrder.value];
      [a[idx], a[n]] = [a[n], a[idx]];
      buttonOrder.value = a;
    }
    const cropMode = ref(null);
    const cropImageUrl = ref("");
    const cropContainerRef = ref(null);
    const cropImageRef = ref(null);
    const cropOffset = ref({
      x: 0,
      y: 0
    });
    const cropZoom = ref(1);
    const isDragging = ref(false);
    let dragStart = {
      x: 0,
      y: 0
    };
    let startOffset = {
      x: 0,
      y: 0
    };
    function startCrop(mode) {
      const input = (void 0).createElement("input");
      input.type = "file";
      input.accept = ".png,.jpeg,.jpg,.gif,.webp";
      input.onchange = () => {
        var _a2;
        const file = (_a2 = input.files) == null ? void 0 : _a2[0];
        if (!file) return;
        cropMode.value = mode;
        cropOffset.value = {
          x: 0,
          y: 0
        };
        cropZoom.value = 1;
        cropImageUrl.value = URL.createObjectURL(file);
      };
      input.click();
    }
    function onCropImageLoad() {
    }
    function onCropMouseDown(e) {
      isDragging.value = true;
      dragStart = {
        x: e.clientX,
        y: e.clientY
      };
      startOffset = { ...cropOffset.value };
    }
    function onCropMouseMove(e) {
      if (!isDragging.value) return;
      cropOffset.value = {
        x: startOffset.x + (e.clientX - dragStart.x),
        y: startOffset.y + (e.clientY - dragStart.y)
      };
    }
    function onCropMouseUp() {
      isDragging.value = false;
    }
    function onCropWheel(e) {
      e.preventDefault();
      cropZoom.value = Math.max(0.1, Math.min(10, cropZoom.value * (e.deltaY > 0 ? 0.9 : 1.1)));
    }
    function zoomIn() {
      cropZoom.value = Math.min(10, cropZoom.value * 1.3);
    }
    function zoomOut() {
      cropZoom.value = Math.max(0.1, cropZoom.value / 1.3);
    }
    async function confirmCrop() {
      var _a2;
      if (!cropMode.value) return;
      const img = cropImageRef.value;
      const c = cropContainerRef.value;
      if (!img || !c) return;
      const cw = c.clientWidth;
      const ch = c.clientHeight;
      const s2 = cropZoom.value;
      const srcX = Math.max(0, -cropOffset.value.x / s2);
      const srcY = Math.max(0, -cropOffset.value.y / s2);
      const srcW = cw / s2;
      const srcH = ch / s2;
      const scale = Math.min((void 0).devicePixelRatio || 1, 2);
      const dw = Math.ceil(cw * scale);
      const dh = Math.ceil(ch * scale);
      const canvas = (void 0).createElement("canvas");
      canvas.width = dw;
      canvas.height = dh;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, dw, dh);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
      if (!blob) return;
      const fd = new FormData();
      fd.append("file", blob, "crop.jpg");
      const loadingRef = cropMode.value === "avatar" ? uploadingAvatar : uploadingBanner;
      const endpoint = cropMode.value === "avatar" ? "/api/upload/avatar" : "/api/upload/banner";
      const targetRef = cropMode.value === "avatar" ? avatarUrl : bannerUrl;
      loadingRef.value = true;
      try {
        targetRef.value = (await $fetch$1(endpoint, {
          method: "POST",
          body: fd
        })).url;
        cancelCrop();
      } catch (e) {
        message.value = ((_a2 = e.data) == null ? void 0 : _a2.message) || "\u30A2\u30C3\u30D7\u30ED\u30FC\u30C9\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
      } finally {
        loadingRef.value = false;
      }
    }
    function cancelCrop() {
      if (cropImageUrl.value) URL.revokeObjectURL(cropImageUrl.value);
      cropMode.value = null;
      cropImageUrl.value = "";
      cropOffset.value = {
        x: 0,
        y: 0
      };
      cropZoom.value = 1;
    }
    async function save() {
      var _a2;
      saving.value = true;
      message.value = "";
      try {
        await $fetch$1("/api/users/profile", {
          method: "PUT",
          body: {
            displayName: displayName.value,
            bio: bio.value,
            statusMessage: statusMessage.value,
            avatarUrl: avatarUrl.value || null,
            bannerUrl: bannerUrl.value || null,
            isPrivate: isPrivate.value
          }
        });
        await $fetch$1("/api/users/settings", {
          method: "PUT",
          body: {
            postButtonOrder: buttonOrder.value,
            showViewCount: showViewCount.value,
            refreshMode: refreshMode.value,
            mediaOpenMode: mediaOpenMode.value,
            birthday: birthday.value,
            birthplace: birthplace.value,
            themeStyle: themeStyle.value,
            themeScheme: themeScheme.value,
            themeSeed: themeSeed.value,
            language: language.value,
            github: github.value,
            twitter: twitter.value,
            website: website.value
          }
        });
        setMediaOpenMode(mediaOpenMode.value);
        message.value = "\u4FDD\u5B58\u3057\u307E\u3057\u305F";
        await refreshUser();
        await refreshNuxtData();
      } catch (e) {
        message.value = ((_a2 = e.data) == null ? void 0 : _a2.message) || "\u4FDD\u5B58\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BottomSheet = BottomSheet_default;
      const _component_Icon = components_default;
      const _component_UserBadges = UserBadges_default;
      const _component_UserTitle = UserTitle_default;
      const _component_ThemePicker = ThemePicker_default;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_BottomSheet, {
        open: unref(open),
        height: "min(85dvh, 44rem)",
        "dismiss-on-backdrop": true,
        onClose: ($event) => emit("close")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h, _i, _j, _k, _l;
          if (_push2) {
            _push2(`<div class="flex h-full"${_scopeId}><div class="w-44 shrink-0 border-r border-outline-variant p-3 space-y-1 overflow-y-auto"${_scopeId}><!--[-->`);
            ssrRenderList(categories, (cat) => {
              _push2(`<button class="${ssrRenderClass([unref(activeCategory) === cat.key ? "bg-indigo-600/20 text-indigo-400" : "text-on-surface-variant hover:text-white hover:bg-surface-container/30", "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left"])}"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: cat.icon,
                class: "w-4 h-4 shrink-0"
              }, null, _parent2, _scopeId));
              _push2(` ${ssrInterpolate(cat.label)}</button>`);
            });
            _push2(`<!--]--></div><div class="flex-1 min-w-0 p-6 overflow-y-auto space-y-5"${_scopeId}><div class="flex items-center justify-between mb-2"${_scopeId}><h2 class="text-xl font-bold text-white"${_scopeId}>${ssrInterpolate(((_a2 = categories.find((c) => c.key === unref(activeCategory))) == null ? void 0 : _a2.label) || "\u8A2D\u5B9A")}</h2><button class="text-on-surface-variant hover:text-white transition"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:x",
              class: "w-5 h-5"
            }, null, _parent2, _scopeId));
            _push2(`</button></div>`);
            if (unref(message)) _push2(`<div class="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 text-sm text-indigo-400"${_scopeId}>${ssrInterpolate(unref(message))}</div>`);
            else _push2(`<!---->`);
            if (unref(activeCategory) === "profile") {
              _push2(`<div class="space-y-4"${_scopeId}><div class="bg-surface-container/30 border border-outline-variant rounded-xl overflow-hidden"${_scopeId}>`);
              if (unref(bannerUrl)) _push2(`<div class="h-16" style="${ssrRenderStyle(`background-image: url(${unref(bannerUrl)}); background-size: cover; background-position: center; aspect-ratio: 3/1 !important; width: 100%; height: fit-content !important`)}"${_scopeId}></div>`);
              else _push2(`<div class="h-16 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"${_scopeId}></div>`);
              _push2(`<div class="px-4 pb-3"${_scopeId}><div class="flex items-end -mt-8 mb-2"${_scopeId}>`);
              if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(avatarUrl))) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(avatarUrl)))} class="w-14 h-14 rounded-full border-4 border-surface-container object-cover"${_scopeId}>`);
              else _push2(`<div class="w-14 h-14 rounded-full border-4 border-surface-container bg-indigo-600 flex items-center justify-center text-lg font-bold text-white"${_scopeId}>${ssrInterpolate(((_b2 = unref(displayName)) == null ? void 0 : _b2.charAt(0)) || "?")}</div>`);
              _push2(`</div><p class="font-bold text-white"${_scopeId}>${ssrInterpolate(unref(displayName) || "\u8868\u793A\u540D")}</p><p class="text-xs text-on-surface-variant"${_scopeId}>@${ssrInterpolate((_c2 = unref(user)) == null ? void 0 : _c2.username)}</p>`);
              if (unref(bio)) _push2(`<p class="text-xs text-on-surface-variant mt-1"${_scopeId}>${ssrInterpolate(unref(bio))}</p>`);
              else _push2(`<!---->`);
              if (unref(statusMessage)) _push2(`<p class="text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1"${_scopeId}><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"${_scopeId}></span>${ssrInterpolate(unref(statusMessage))}</p>`);
              else _push2(`<!---->`);
              _push2(`</div></div><div class="flex gap-3"${_scopeId}><button${ssrIncludeBooleanAttr(unref(uploadingAvatar)) ? " disabled" : ""} class="flex-1 py-2 rounded-lg bg-surface-container text-xs text-on-surface hover:bg-surface-container-high transition flex items-center justify-center gap-1.5 disabled:opacity-50"${_scopeId}>`);
              if (unref(uploadingAvatar)) _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:loader-2",
                class: "w-3.5 h-3.5 animate-spin"
              }, null, _parent2, _scopeId));
              else _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:camera",
                class: "w-3.5 h-3.5"
              }, null, _parent2, _scopeId));
              _push2(` \u30A2\u30D0\u30BF\u30FC </button><button${ssrIncludeBooleanAttr(unref(uploadingBanner)) ? " disabled" : ""} class="flex-1 py-2 rounded-lg bg-surface-container text-xs text-on-surface hover:bg-surface-container-high transition flex items-center justify-center gap-1.5 disabled:opacity-50"${_scopeId}>`);
              if (unref(uploadingBanner)) _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:loader-2",
                class: "w-3.5 h-3.5 animate-spin"
              }, null, _parent2, _scopeId));
              else _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:image",
                class: "w-3.5 h-3.5"
              }, null, _parent2, _scopeId));
              _push2(` \u30D0\u30CA\u30FC </button></div><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-1"${_scopeId}>\u8868\u793A\u540D</label><input${ssrRenderAttr("value", unref(displayName))} type="text" class="w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"${_scopeId}></div><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-1"${_scopeId}>\u81EA\u5DF1\u7D39\u4ECB</label><textarea rows="3" class="w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"${_scopeId}>${ssrInterpolate(unref(bio))}</textarea></div><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-1"${_scopeId}>\u30B9\u30C6\u30FC\u30BF\u30B9\u30E1\u30C3\u30BB\u30FC\u30B8</label><div class="relative"${_scopeId}><input${ssrRenderAttr("value", unref(statusMessage))} type="text" maxlength="80" placeholder="\u4ECA\u306A\u306B\u3057\u3066\u308B\uFF1F\uFF08\u4F8B: \u4F5C\u696D\u4E2D\u3001\u30B2\u30FC\u30E0\u4E2D\uFF09" class="w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"${_scopeId}><span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 tabular-nums"${_scopeId}>${ssrInterpolate(unref(statusMessage).length)}/80</span></div></div>`);
              if (((_e2 = (_d2 = unref(user)) == null ? void 0 : _d2.badges) == null ? void 0 : _e2.length) || ((_f2 = unref(user)) == null ? void 0 : _f2.title)) {
                _push2(`<div class="p-3 bg-surface-container/30 rounded-lg"${_scopeId}><p class="text-sm font-medium text-white mb-2"${_scopeId}>\u30D0\u30C3\u30B8\u30FB\u79F0\u53F7</p><div class="flex items-center gap-2 flex-wrap"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_UserBadges, {
                  badges: unref(user).badges,
                  size: "md"
                }, null, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_UserTitle, { title: unref(user).title }, null, _parent2, _scopeId));
                _push2(`</div><p class="text-xs text-on-surface-variant mt-2"${_scopeId}>\u30D0\u30C3\u30B8\u306F\u30B5\u30FC\u30D0\u30FC\u5074\u3067\u4ED8\u4E0E\u3055\u308C\u307E\u3059\u3002\u79F0\u53F7\u306F\u5229\u7528\u72B6\u6CC1\u306B\u5FDC\u3058\u3066\u81EA\u52D5\u3067\u6C7A\u307E\u308A\u307E\u3059\u3002</p></div>`);
              } else _push2(`<!---->`);
              _push2(`</div>`);
            } else _push2(`<!---->`);
            if (unref(activeCategory) === "detail") _push2(`<div class="space-y-4"${_scopeId}><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-1"${_scopeId}>\u8A95\u751F\u65E5</label><input${ssrRenderAttr("value", unref(birthday))} type="date" class="w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"${_scopeId}></div><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-1"${_scopeId}>\u51FA\u8EAB</label><input${ssrRenderAttr("value", unref(birthplace))} type="text" placeholder="\u4F8B: \u6771\u4EAC\u90FD" class="w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"${_scopeId}></div></div>`);
            else _push2(`<!---->`);
            if (unref(activeCategory) === "links") {
              _push2(`<div class="space-y-4"${_scopeId}><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-1"${_scopeId}>GitHub</label><div class="flex items-center gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:github",
                class: "w-4 h-4 text-on-surface-variant shrink-0"
              }, null, _parent2, _scopeId));
              _push2(`<input${ssrRenderAttr("value", unref(github))} type="text" placeholder="\u30E6\u30FC\u30B6\u30FC\u540D" class="w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"${_scopeId}></div></div><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-1"${_scopeId}>Twitter / X</label><div class="flex items-center gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:twitter",
                class: "w-4 h-4 text-on-surface-variant shrink-0"
              }, null, _parent2, _scopeId));
              _push2(`<input${ssrRenderAttr("value", unref(twitter))} type="text" placeholder="@\u30E6\u30FC\u30B6\u30FC\u540D" class="w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"${_scopeId}></div></div><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-1"${_scopeId}>Web\u30B5\u30A4\u30C8</label><div class="flex items-center gap-2"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:globe",
                class: "w-4 h-4 text-on-surface-variant shrink-0"
              }, null, _parent2, _scopeId));
              _push2(`<input${ssrRenderAttr("value", unref(website))} type="url" placeholder="https://" class="w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"${_scopeId}></div></div></div>`);
            } else _push2(`<!---->`);
            if (unref(activeCategory) === "posts") {
              _push2(`<div class="space-y-4"${_scopeId}><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-2"${_scopeId}>\u30DC\u30BF\u30F3\u306E\u8868\u793A\u9806</label><p class="text-xs text-slate-600 mb-3"${_scopeId}> \u5404\u6295\u7A3F\u306E\u4E0B\u306B\u3042\u308B\u30DC\u30BF\u30F3\u306E\u4E26\u3073\u9806\u3092\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA </p><div class="space-y-2"${_scopeId}><!--[-->`);
              ssrRenderList(unref(buttonOrder), (key) => {
                var _a3, _b3;
                _push2(`<div class="flex items-center gap-2 bg-surface-container/50 rounded-lg px-3 py-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: ((_a3 = allButtons.find((b) => b.key === key)) == null ? void 0 : _a3.icon) || "",
                  class: "w-4 h-4 text-on-surface-variant"
                }, null, _parent2, _scopeId));
                _push2(`<span class="flex-1 text-sm text-white"${_scopeId}>${ssrInterpolate((_b3 = allButtons.find((b) => b.key === key)) == null ? void 0 : _b3.label)}</span><button${ssrIncludeBooleanAttr(unref(buttonOrder).indexOf(key) === 0) ? " disabled" : ""} class="p-1 text-on-surface-variant hover:text-white disabled:opacity-30 transition"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "lucide:chevron-up",
                  class: "w-4 h-4"
                }, null, _parent2, _scopeId));
                _push2(`</button><button${ssrIncludeBooleanAttr(unref(buttonOrder).indexOf(key) === unref(buttonOrder).length - 1) ? " disabled" : ""} class="p-1 text-on-surface-variant hover:text-white disabled:opacity-30 transition"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "lucide:chevron-down",
                  class: "w-4 h-4"
                }, null, _parent2, _scopeId));
                _push2(`</button></div>`);
              });
              _push2(`<!--]--></div></div><div class="flex items-center justify-between p-3 bg-surface-container/30 rounded-lg"${_scopeId}><div${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>\u95B2\u89A7\u6570\u3092\u8868\u793A</p><p class="text-xs text-on-surface-variant"${_scopeId}>\u6295\u7A3F\u306B\u95B2\u89A7\u6570\u3092\u8868\u793A</p></div><label class="relative inline-flex items-center cursor-pointer"${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(showViewCount)) ? ssrLooseContain(unref(showViewCount), null) : unref(showViewCount)) ? " checked" : ""} class="sr-only peer"${_scopeId}><div class="w-9 h-5 bg-surface-container-high rounded-full peer peer-checked:bg-indigo-600 transition after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition peer-checked:after:translate-x-4"${_scopeId}></div></label></div></div>`);
            } else _push2(`<!---->`);
            if (unref(activeCategory) === "timeline") {
              _push2(`<div class="space-y-4"${_scopeId}><label class="block text-sm text-on-surface-variant mb-2"${_scopeId}>\u66F4\u65B0\u30E2\u30FC\u30C9</label><div class="space-y-2"${_scopeId}><label class="${ssrRenderClass([unref(refreshMode) === "auto" ? "ring-1 ring-indigo-500" : "", "flex items-center gap-3 p-3 bg-surface-container/30 rounded-lg cursor-pointer"])}"${_scopeId}><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(refreshMode), "auto")) ? " checked" : ""} value="auto" class="sr-only"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:radio",
                class: ["w-5 h-5 shrink-0", unref(refreshMode) === "auto" ? "text-indigo-400" : "text-slate-600"]
              }, null, _parent2, _scopeId));
              _push2(`<div${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>\u81EA\u52D5\u66F4\u65B0</p><p class="text-xs text-on-surface-variant"${_scopeId}> \u65B0\u3057\u3044\u6295\u7A3F\u304C\u81EA\u52D5\u3067\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3\u306B\u8868\u793A </p></div></label><label class="${ssrRenderClass([unref(refreshMode) === "manual" ? "ring-1 ring-indigo-500" : "", "flex items-center gap-3 p-3 bg-surface-container/30 rounded-lg cursor-pointer"])}"${_scopeId}><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(refreshMode), "manual")) ? " checked" : ""} value="manual" class="sr-only"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:radio",
                class: ["w-5 h-5 shrink-0", unref(refreshMode) === "manual" ? "text-indigo-400" : "text-slate-600"]
              }, null, _parent2, _scopeId));
              _push2(`<div${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>\u624B\u52D5\u66F4\u65B0</p><p class="text-xs text-on-surface-variant"${_scopeId}>\u66F4\u65B0\u30DC\u30BF\u30F3\u3092\u62BC\u3057\u305F\u3068\u304D\u306E\u307F\u66F4\u65B0</p></div></label></div></div>`);
            } else _push2(`<!---->`);
            if (unref(activeCategory) === "media") {
              _push2(`<div class="space-y-4"${_scopeId}><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-2"${_scopeId}>\u30B9\u30DE\u30DB\u3067\u306E\u6295\u7A3F\u306E\u958B\u304D\u65B9</label><p class="text-xs text-slate-600 mb-3"${_scopeId}> \u6295\u7A3F\u3084\u52D5\u753B\u30FB\u753B\u50CF\u3092\u30BF\u30C3\u30D7\u3057\u305F\u3068\u304D\u306E\u8868\u793A\u65B9\u6CD5 </p><div class="space-y-2"${_scopeId}><label class="${ssrRenderClass([unref(mediaOpenMode) === "sheet" ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-surface-container/30 hover:bg-surface-container/50", "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"])}"${_scopeId}><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(mediaOpenMode), "sheet")) ? " checked" : ""} value="sheet" class="sr-only"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:panel-bottom-open",
                class: ["w-5 h-5 shrink-0", unref(mediaOpenMode) === "sheet" ? "text-indigo-400" : "text-slate-600"]
              }, null, _parent2, _scopeId));
              _push2(`<div${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>\u30A2\u30AF\u30B7\u30E7\u30F3\u30B7\u30FC\u30C8</p><p class="text-xs text-on-surface-variant"${_scopeId}> \u4E0B\u304B\u3089\u958B\u304D\u3001\u30C9\u30E9\u30C3\u30B0\u3067\u623B\u308C\u308B\u4F7F\u3044\u3084\u3059\u3044\u30B7\u30FC\u30C8 </p></div></label><label class="${ssrRenderClass([unref(mediaOpenMode) === "page" ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-surface-container/30 hover:bg-surface-container/50", "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"])}"${_scopeId}><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(mediaOpenMode), "page")) ? " checked" : ""} value="page" class="sr-only"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:maximize-2",
                class: ["w-5 h-5 shrink-0", unref(mediaOpenMode) === "page" ? "text-indigo-400" : "text-slate-600"]
              }, null, _parent2, _scopeId));
              _push2(`<div${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>\u30DA\u30FC\u30B8\u5207\u308A\u66FF\u3048</p><p class="text-xs text-on-surface-variant"${_scopeId}>\u5168\u753B\u9762\u3067\u8868\u793A</p></div></label><label class="${ssrRenderClass([unref(mediaOpenMode) === "mini" ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-surface-container/30 hover:bg-surface-container/50", "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition"])}"${_scopeId}><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(mediaOpenMode), "mini")) ? " checked" : ""} value="mini" class="sr-only"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:minimize-2",
                class: ["w-5 h-5 shrink-0", unref(mediaOpenMode) === "mini" ? "text-indigo-400" : "text-slate-600"]
              }, null, _parent2, _scopeId));
              _push2(`<div${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>\u30DF\u30CB\u30D7\u30EC\u30A4\u30E4\u30FC</p><p class="text-xs text-on-surface-variant"${_scopeId}>\u4E0B\u306E\u5C0F\u3055\u306A\u30D0\u30FC\u306B\u306E\u307F\u8868\u793A</p></div></label></div></div></div>`);
            } else _push2(`<!---->`);
            if (unref(activeCategory) === "appearance") {
              _push2(`<div class="space-y-4"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_ThemePicker, null, null, _parent2, _scopeId));
              _push2(`<div${_scopeId}><label class="block text-sm text-on-surface-variant mb-2"${_scopeId}>\u8A00\u8A9E</label><select class="w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"${_scopeId}><option value="ja"${ssrIncludeBooleanAttr(Array.isArray(unref(language)) ? ssrLooseContain(unref(language), "ja") : ssrLooseEqual(unref(language), "ja")) ? " selected" : ""}${_scopeId}>\u65E5\u672C\u8A9E</option><option value="en"${ssrIncludeBooleanAttr(Array.isArray(unref(language)) ? ssrLooseContain(unref(language), "en") : ssrLooseEqual(unref(language), "en")) ? " selected" : ""}${_scopeId}>English</option><option value="zh"${ssrIncludeBooleanAttr(Array.isArray(unref(language)) ? ssrLooseContain(unref(language), "zh") : ssrLooseEqual(unref(language), "zh")) ? " selected" : ""}${_scopeId}>\u4E2D\u6587</option><option value="ko"${ssrIncludeBooleanAttr(Array.isArray(unref(language)) ? ssrLooseContain(unref(language), "ko") : ssrLooseEqual(unref(language), "ko")) ? " selected" : ""}${_scopeId}>\uD55C\uAD6D\uC5B4</option></select></div><div${_scopeId}><label class="block text-sm text-on-surface-variant mb-2"${_scopeId}>\u30C7\u30B9\u30AF\u30C8\u30C3\u30D7\u306E\u30CA\u30D3\u8868\u793A</label><div class="grid grid-cols-2 gap-2"${_scopeId}><!--[-->`);
              ssrRenderList(navOptions, (opt) => {
                _push2(`<button type="button" class="${ssrRenderClass([unref(desktopNav) === opt.value ? "border-indigo-500 bg-indigo-500/15 text-white" : "border-outline bg-surface-container/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface", "flex items-center gap-2.5 p-3 rounded-lg border transition text-left"])}"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: opt.icon,
                  class: "w-4 h-4 shrink-0"
                }, null, _parent2, _scopeId));
                _push2(`<span class="text-sm font-medium"${_scopeId}>${ssrInterpolate(opt.label)}</span></button>`);
              });
              _push2(`<!--]--></div><p class="text-xs text-on-surface-variant mt-2"${_scopeId}> \u30B9\u30DE\u30DB\u306F\u5E38\u306B\u4E0B\u90E8\u30CA\u30D3\uFF08\u30B9\u30EF\u30A4\u30D7\u3067\u5207\u308A\u66FF\u3048\uFF09\u304C\u4F7F\u3048\u307E\u3059\u3002\u30C7\u30B9\u30AF\u30C8\u30C3\u30D7\u306F\u3053\u3053\u3067\u9078\u3079\u307E\u3059\u3002 </p></div></div>`);
            } else _push2(`<!---->`);
            if (unref(activeCategory) === "privacy") {
              _push2(`<div class="space-y-4"${_scopeId}><div class="flex items-center justify-between p-3 bg-surface-container/30 rounded-lg"${_scopeId}><div class="pr-4"${_scopeId}><p class="text-sm font-medium text-white flex items-center gap-1.5"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:lock",
                class: "w-4 h-4 text-on-surface-variant"
              }, null, _parent2, _scopeId));
              _push2(` \u9375\u30A2\u30AB\u30A6\u30F3\u30C8 </p><p class="text-xs text-on-surface-variant mt-1"${_scopeId}> \u30AA\u30F3\u306B\u3059\u308B\u3068\u3001\u30D5\u30A9\u30ED\u30EF\u30FC\u3060\u3051\u304C\u3042\u306A\u305F\u306E\u6295\u7A3F\u3092\u95B2\u89A7\u3067\u304D\u307E\u3059\u3002 </p></div><label class="relative inline-flex items-center cursor-pointer shrink-0"${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(isPrivate)) ? ssrLooseContain(unref(isPrivate), null) : unref(isPrivate)) ? " checked" : ""} class="sr-only peer"${_scopeId}><div class="w-9 h-5 bg-surface-container-high rounded-full peer peer-checked:bg-indigo-600 transition after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition peer-checked:after:translate-x-4"${_scopeId}></div></label></div><div class="p-3 bg-surface-container/30 rounded-lg"${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>\u73FE\u5728\u306E\u8A2D\u5B9A</p><p class="${ssrRenderClass([unref(isPrivate) ? "text-amber-400" : "text-on-surface-variant", "text-xs mt-1"])}"${_scopeId}>${ssrInterpolate(unref(isPrivate) ? "\u975E\u516C\u958B\u30A2\u30AB\u30A6\u30F3\u30C8\uFF08\u9375\u30A2\u30AB\uFF09" : "\u516C\u958B\u30A2\u30AB\u30A6\u30F3\u30C8")}</p></div></div>`);
            } else _push2(`<!---->`);
            if (unref(activeCategory) === "notifications") _push2(`<div class="space-y-4"${_scopeId}><div class="p-3 bg-surface-container/30 rounded-lg"${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>\u901A\u77E5\u8A2D\u5B9A</p><p class="text-xs text-on-surface-variant mt-1"${_scopeId}>\u8FD1\u65E5\u5BFE\u5FDC\u4E88\u5B9A</p></div></div>`);
            else _push2(`<!---->`);
            _push2(`<button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="w-full py-2.5 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"${_scopeId}>${ssrInterpolate(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58")}</button></div></div>`);
          } else return [createVNode("div", { class: "flex h-full" }, [createVNode("div", { class: "w-44 shrink-0 border-r border-outline-variant p-3 space-y-1 overflow-y-auto" }, [(openBlock(), createBlock(Fragment, null, renderList(categories, (cat) => {
            return createVNode("button", {
              key: cat.key,
              onClick: ($event) => activeCategory.value = cat.key,
              class: ["w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left", unref(activeCategory) === cat.key ? "bg-indigo-600/20 text-indigo-400" : "text-on-surface-variant hover:text-white hover:bg-surface-container/30"]
            }, [createVNode(_component_Icon, {
              name: cat.icon,
              class: "w-4 h-4 shrink-0"
            }, null, 8, ["name"]), createTextVNode(" " + toDisplayString(cat.label), 1)], 10, ["onClick"]);
          }), 64))]), createVNode("div", { class: "flex-1 min-w-0 p-6 overflow-y-auto space-y-5" }, [
            createVNode("div", { class: "flex items-center justify-between mb-2" }, [createVNode("h2", { class: "text-xl font-bold text-white" }, toDisplayString(((_g2 = categories.find((c) => c.key === unref(activeCategory))) == null ? void 0 : _g2.label) || "\u8A2D\u5B9A"), 1), createVNode("button", {
              onClick: ($event) => emit("close"),
              class: "text-on-surface-variant hover:text-white transition"
            }, [createVNode(_component_Icon, {
              name: "lucide:x",
              class: "w-5 h-5"
            })], 8, ["onClick"])]),
            unref(message) ? (openBlock(), createBlock("div", {
              key: 0,
              class: "bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 text-sm text-indigo-400"
            }, toDisplayString(unref(message)), 1)) : createCommentVNode("", true),
            unref(activeCategory) === "profile" ? (openBlock(), createBlock("div", {
              key: 1,
              class: "space-y-4"
            }, [
              createVNode("div", { class: "bg-surface-container/30 border border-outline-variant rounded-xl overflow-hidden" }, [unref(bannerUrl) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "h-16",
                style: `background-image: url(${unref(bannerUrl)}); background-size: cover; background-position: center; aspect-ratio: 3/1 !important; width: 100%; height: fit-content !important`
              }, null, 4)) : (openBlock(), createBlock("div", {
                key: 1,
                class: "h-16 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"
              })), createVNode("div", { class: "px-4 pb-3" }, [
                createVNode("div", { class: "flex items-end -mt-8 mb-2" }, [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(avatarUrl)) ? (openBlock(), createBlock("img", {
                  key: 0,
                  src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(unref(avatarUrl)),
                  class: "w-14 h-14 rounded-full border-4 border-surface-container object-cover"
                }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "w-14 h-14 rounded-full border-4 border-surface-container bg-indigo-600 flex items-center justify-center text-lg font-bold text-white"
                }, toDisplayString(((_h = unref(displayName)) == null ? void 0 : _h.charAt(0)) || "?"), 1))]),
                createVNode("p", { class: "font-bold text-white" }, toDisplayString(unref(displayName) || "\u8868\u793A\u540D"), 1),
                createVNode("p", { class: "text-xs text-on-surface-variant" }, "@" + toDisplayString((_i = unref(user)) == null ? void 0 : _i.username), 1),
                unref(bio) ? (openBlock(), createBlock("p", {
                  key: 0,
                  class: "text-xs text-on-surface-variant mt-1"
                }, toDisplayString(unref(bio)), 1)) : createCommentVNode("", true),
                unref(statusMessage) ? (openBlock(), createBlock("p", {
                  key: 1,
                  class: "text-[11px] text-emerald-400 mt-0.5 flex items-center gap-1"
                }, [createVNode("span", { class: "w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" }), createTextVNode(toDisplayString(unref(statusMessage)), 1)])) : createCommentVNode("", true)
              ])]),
              createVNode("div", { class: "flex gap-3" }, [createVNode("button", {
                onClick: ($event) => startCrop("avatar"),
                disabled: unref(uploadingAvatar),
                class: "flex-1 py-2 rounded-lg bg-surface-container text-xs text-on-surface hover:bg-surface-container-high transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              }, [unref(uploadingAvatar) ? (openBlock(), createBlock(_component_Icon, {
                key: 0,
                name: "lucide:loader-2",
                class: "w-3.5 h-3.5 animate-spin"
              })) : (openBlock(), createBlock(_component_Icon, {
                key: 1,
                name: "lucide:camera",
                class: "w-3.5 h-3.5"
              })), createTextVNode(" \u30A2\u30D0\u30BF\u30FC ")], 8, ["onClick", "disabled"]), createVNode("button", {
                onClick: ($event) => startCrop("banner"),
                disabled: unref(uploadingBanner),
                class: "flex-1 py-2 rounded-lg bg-surface-container text-xs text-on-surface hover:bg-surface-container-high transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              }, [unref(uploadingBanner) ? (openBlock(), createBlock(_component_Icon, {
                key: 0,
                name: "lucide:loader-2",
                class: "w-3.5 h-3.5 animate-spin"
              })) : (openBlock(), createBlock(_component_Icon, {
                key: 1,
                name: "lucide:image",
                class: "w-3.5 h-3.5"
              })), createTextVNode(" \u30D0\u30CA\u30FC ")], 8, ["onClick", "disabled"])]),
              createVNode("div", null, [createVNode("label", { class: "block text-sm text-on-surface-variant mb-1" }, "\u8868\u793A\u540D"), withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => isRef(displayName) ? displayName.value = $event : null,
                type: "text",
                class: "w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(displayName)]])]),
              createVNode("div", null, [createVNode("label", { class: "block text-sm text-on-surface-variant mb-1" }, "\u81EA\u5DF1\u7D39\u4ECB"), withDirectives(createVNode("textarea", {
                "onUpdate:modelValue": ($event) => isRef(bio) ? bio.value = $event : null,
                rows: "3",
                class: "w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(bio)]])]),
              createVNode("div", null, [createVNode("label", { class: "block text-sm text-on-surface-variant mb-1" }, "\u30B9\u30C6\u30FC\u30BF\u30B9\u30E1\u30C3\u30BB\u30FC\u30B8"), createVNode("div", { class: "relative" }, [withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => isRef(statusMessage) ? statusMessage.value = $event : null,
                type: "text",
                maxlength: "80",
                placeholder: "\u4ECA\u306A\u306B\u3057\u3066\u308B\uFF1F\uFF08\u4F8B: \u4F5C\u696D\u4E2D\u3001\u30B2\u30FC\u30E0\u4E2D\uFF09",
                class: "w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 pr-14 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(statusMessage)]]), createVNode("span", { class: "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 tabular-nums" }, toDisplayString(unref(statusMessage).length) + "/80", 1)])]),
              ((_k = (_j = unref(user)) == null ? void 0 : _j.badges) == null ? void 0 : _k.length) || ((_l = unref(user)) == null ? void 0 : _l.title) ? (openBlock(), createBlock("div", {
                key: 0,
                class: "p-3 bg-surface-container/30 rounded-lg"
              }, [
                createVNode("p", { class: "text-sm font-medium text-white mb-2" }, "\u30D0\u30C3\u30B8\u30FB\u79F0\u53F7"),
                createVNode("div", { class: "flex items-center gap-2 flex-wrap" }, [createVNode(_component_UserBadges, {
                  badges: unref(user).badges,
                  size: "md"
                }, null, 8, ["badges"]), createVNode(_component_UserTitle, { title: unref(user).title }, null, 8, ["title"])]),
                createVNode("p", { class: "text-xs text-on-surface-variant mt-2" }, "\u30D0\u30C3\u30B8\u306F\u30B5\u30FC\u30D0\u30FC\u5074\u3067\u4ED8\u4E0E\u3055\u308C\u307E\u3059\u3002\u79F0\u53F7\u306F\u5229\u7528\u72B6\u6CC1\u306B\u5FDC\u3058\u3066\u81EA\u52D5\u3067\u6C7A\u307E\u308A\u307E\u3059\u3002")
              ])) : createCommentVNode("", true)
            ])) : createCommentVNode("", true),
            unref(activeCategory) === "detail" ? (openBlock(), createBlock("div", {
              key: 2,
              class: "space-y-4"
            }, [createVNode("div", null, [createVNode("label", { class: "block text-sm text-on-surface-variant mb-1" }, "\u8A95\u751F\u65E5"), withDirectives(createVNode("input", {
              "onUpdate:modelValue": ($event) => isRef(birthday) ? birthday.value = $event : null,
              type: "date",
              class: "w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(birthday)]])]), createVNode("div", null, [createVNode("label", { class: "block text-sm text-on-surface-variant mb-1" }, "\u51FA\u8EAB"), withDirectives(createVNode("input", {
              "onUpdate:modelValue": ($event) => isRef(birthplace) ? birthplace.value = $event : null,
              type: "text",
              placeholder: "\u4F8B: \u6771\u4EAC\u90FD",
              class: "w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(birthplace)]])])])) : createCommentVNode("", true),
            unref(activeCategory) === "links" ? (openBlock(), createBlock("div", {
              key: 3,
              class: "space-y-4"
            }, [
              createVNode("div", null, [createVNode("label", { class: "block text-sm text-on-surface-variant mb-1" }, "GitHub"), createVNode("div", { class: "flex items-center gap-2" }, [createVNode(_component_Icon, {
                name: "lucide:github",
                class: "w-4 h-4 text-on-surface-variant shrink-0"
              }), withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => isRef(github) ? github.value = $event : null,
                type: "text",
                placeholder: "\u30E6\u30FC\u30B6\u30FC\u540D",
                class: "w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(github)]])])]),
              createVNode("div", null, [createVNode("label", { class: "block text-sm text-on-surface-variant mb-1" }, "Twitter / X"), createVNode("div", { class: "flex items-center gap-2" }, [createVNode(_component_Icon, {
                name: "lucide:twitter",
                class: "w-4 h-4 text-on-surface-variant shrink-0"
              }), withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => isRef(twitter) ? twitter.value = $event : null,
                type: "text",
                placeholder: "@\u30E6\u30FC\u30B6\u30FC\u540D",
                class: "w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(twitter)]])])]),
              createVNode("div", null, [createVNode("label", { class: "block text-sm text-on-surface-variant mb-1" }, "Web\u30B5\u30A4\u30C8"), createVNode("div", { class: "flex items-center gap-2" }, [createVNode(_component_Icon, {
                name: "lucide:globe",
                class: "w-4 h-4 text-on-surface-variant shrink-0"
              }), withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => isRef(website) ? website.value = $event : null,
                type: "url",
                placeholder: "https://",
                class: "w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(website)]])])])
            ])) : createCommentVNode("", true),
            unref(activeCategory) === "posts" ? (openBlock(), createBlock("div", {
              key: 4,
              class: "space-y-4"
            }, [createVNode("div", null, [
              createVNode("label", { class: "block text-sm text-on-surface-variant mb-2" }, "\u30DC\u30BF\u30F3\u306E\u8868\u793A\u9806"),
              createVNode("p", { class: "text-xs text-slate-600 mb-3" }, " \u5404\u6295\u7A3F\u306E\u4E0B\u306B\u3042\u308B\u30DC\u30BF\u30F3\u306E\u4E26\u3073\u9806\u3092\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA "),
              createVNode("div", { class: "space-y-2" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(buttonOrder), (key) => {
                var _a3, _b3;
                return openBlock(), createBlock("div", {
                  key,
                  class: "flex items-center gap-2 bg-surface-container/50 rounded-lg px-3 py-2"
                }, [
                  createVNode(_component_Icon, {
                    name: ((_a3 = allButtons.find((b) => b.key === key)) == null ? void 0 : _a3.icon) || "",
                    class: "w-4 h-4 text-on-surface-variant"
                  }, null, 8, ["name"]),
                  createVNode("span", { class: "flex-1 text-sm text-white" }, toDisplayString((_b3 = allButtons.find((b) => b.key === key)) == null ? void 0 : _b3.label), 1),
                  createVNode("button", {
                    onClick: ($event) => moveButton(key, -1),
                    disabled: unref(buttonOrder).indexOf(key) === 0,
                    class: "p-1 text-on-surface-variant hover:text-white disabled:opacity-30 transition"
                  }, [createVNode(_component_Icon, {
                    name: "lucide:chevron-up",
                    class: "w-4 h-4"
                  })], 8, ["onClick", "disabled"]),
                  createVNode("button", {
                    onClick: ($event) => moveButton(key, 1),
                    disabled: unref(buttonOrder).indexOf(key) === unref(buttonOrder).length - 1,
                    class: "p-1 text-on-surface-variant hover:text-white disabled:opacity-30 transition"
                  }, [createVNode(_component_Icon, {
                    name: "lucide:chevron-down",
                    class: "w-4 h-4"
                  })], 8, ["onClick", "disabled"])
                ]);
              }), 128))])
            ]), createVNode("div", { class: "flex items-center justify-between p-3 bg-surface-container/30 rounded-lg" }, [createVNode("div", null, [createVNode("p", { class: "text-sm font-medium text-white" }, "\u95B2\u89A7\u6570\u3092\u8868\u793A"), createVNode("p", { class: "text-xs text-on-surface-variant" }, "\u6295\u7A3F\u306B\u95B2\u89A7\u6570\u3092\u8868\u793A")]), createVNode("label", { class: "relative inline-flex items-center cursor-pointer" }, [withDirectives(createVNode("input", {
              type: "checkbox",
              "onUpdate:modelValue": ($event) => isRef(showViewCount) ? showViewCount.value = $event : null,
              class: "sr-only peer"
            }, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, unref(showViewCount)]]), createVNode("div", { class: "w-9 h-5 bg-surface-container-high rounded-full peer peer-checked:bg-indigo-600 transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition peer-checked:after:translate-x-4" })])])])) : createCommentVNode("", true),
            unref(activeCategory) === "timeline" ? (openBlock(), createBlock("div", {
              key: 5,
              class: "space-y-4"
            }, [createVNode("label", { class: "block text-sm text-on-surface-variant mb-2" }, "\u66F4\u65B0\u30E2\u30FC\u30C9"), createVNode("div", { class: "space-y-2" }, [createVNode("label", { class: ["flex items-center gap-3 p-3 bg-surface-container/30 rounded-lg cursor-pointer", unref(refreshMode) === "auto" ? "ring-1 ring-indigo-500" : ""] }, [
              withDirectives(createVNode("input", {
                type: "radio",
                "onUpdate:modelValue": ($event) => isRef(refreshMode) ? refreshMode.value = $event : null,
                value: "auto",
                class: "sr-only"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelRadio, unref(refreshMode)]]),
              createVNode(_component_Icon, {
                name: "lucide:radio",
                class: ["w-5 h-5 shrink-0", unref(refreshMode) === "auto" ? "text-indigo-400" : "text-slate-600"]
              }, null, 8, ["class"]),
              createVNode("div", null, [createVNode("p", { class: "text-sm font-medium text-white" }, "\u81EA\u52D5\u66F4\u65B0"), createVNode("p", { class: "text-xs text-on-surface-variant" }, " \u65B0\u3057\u3044\u6295\u7A3F\u304C\u81EA\u52D5\u3067\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3\u306B\u8868\u793A ")])
            ], 2), createVNode("label", { class: ["flex items-center gap-3 p-3 bg-surface-container/30 rounded-lg cursor-pointer", unref(refreshMode) === "manual" ? "ring-1 ring-indigo-500" : ""] }, [
              withDirectives(createVNode("input", {
                type: "radio",
                "onUpdate:modelValue": ($event) => isRef(refreshMode) ? refreshMode.value = $event : null,
                value: "manual",
                class: "sr-only"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelRadio, unref(refreshMode)]]),
              createVNode(_component_Icon, {
                name: "lucide:radio",
                class: ["w-5 h-5 shrink-0", unref(refreshMode) === "manual" ? "text-indigo-400" : "text-slate-600"]
              }, null, 8, ["class"]),
              createVNode("div", null, [createVNode("p", { class: "text-sm font-medium text-white" }, "\u624B\u52D5\u66F4\u65B0"), createVNode("p", { class: "text-xs text-on-surface-variant" }, "\u66F4\u65B0\u30DC\u30BF\u30F3\u3092\u62BC\u3057\u305F\u3068\u304D\u306E\u307F\u66F4\u65B0")])
            ], 2)])])) : createCommentVNode("", true),
            unref(activeCategory) === "media" ? (openBlock(), createBlock("div", {
              key: 6,
              class: "space-y-4"
            }, [createVNode("div", null, [
              createVNode("label", { class: "block text-sm text-on-surface-variant mb-2" }, "\u30B9\u30DE\u30DB\u3067\u306E\u6295\u7A3F\u306E\u958B\u304D\u65B9"),
              createVNode("p", { class: "text-xs text-slate-600 mb-3" }, " \u6295\u7A3F\u3084\u52D5\u753B\u30FB\u753B\u50CF\u3092\u30BF\u30C3\u30D7\u3057\u305F\u3068\u304D\u306E\u8868\u793A\u65B9\u6CD5 "),
              createVNode("div", { class: "space-y-2" }, [
                createVNode("label", { class: ["flex items-center gap-3 p-3 rounded-lg cursor-pointer transition", unref(mediaOpenMode) === "sheet" ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-surface-container/30 hover:bg-surface-container/50"] }, [
                  withDirectives(createVNode("input", {
                    type: "radio",
                    "onUpdate:modelValue": ($event) => isRef(mediaOpenMode) ? mediaOpenMode.value = $event : null,
                    value: "sheet",
                    class: "sr-only"
                  }, null, 8, ["onUpdate:modelValue"]), [[vModelRadio, unref(mediaOpenMode)]]),
                  createVNode(_component_Icon, {
                    name: "lucide:panel-bottom-open",
                    class: ["w-5 h-5 shrink-0", unref(mediaOpenMode) === "sheet" ? "text-indigo-400" : "text-slate-600"]
                  }, null, 8, ["class"]),
                  createVNode("div", null, [createVNode("p", { class: "text-sm font-medium text-white" }, "\u30A2\u30AF\u30B7\u30E7\u30F3\u30B7\u30FC\u30C8"), createVNode("p", { class: "text-xs text-on-surface-variant" }, " \u4E0B\u304B\u3089\u958B\u304D\u3001\u30C9\u30E9\u30C3\u30B0\u3067\u623B\u308C\u308B\u4F7F\u3044\u3084\u3059\u3044\u30B7\u30FC\u30C8 ")])
                ], 2),
                createVNode("label", { class: ["flex items-center gap-3 p-3 rounded-lg cursor-pointer transition", unref(mediaOpenMode) === "page" ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-surface-container/30 hover:bg-surface-container/50"] }, [
                  withDirectives(createVNode("input", {
                    type: "radio",
                    "onUpdate:modelValue": ($event) => isRef(mediaOpenMode) ? mediaOpenMode.value = $event : null,
                    value: "page",
                    class: "sr-only"
                  }, null, 8, ["onUpdate:modelValue"]), [[vModelRadio, unref(mediaOpenMode)]]),
                  createVNode(_component_Icon, {
                    name: "lucide:maximize-2",
                    class: ["w-5 h-5 shrink-0", unref(mediaOpenMode) === "page" ? "text-indigo-400" : "text-slate-600"]
                  }, null, 8, ["class"]),
                  createVNode("div", null, [createVNode("p", { class: "text-sm font-medium text-white" }, "\u30DA\u30FC\u30B8\u5207\u308A\u66FF\u3048"), createVNode("p", { class: "text-xs text-on-surface-variant" }, "\u5168\u753B\u9762\u3067\u8868\u793A")])
                ], 2),
                createVNode("label", { class: ["flex items-center gap-3 p-3 rounded-lg cursor-pointer transition", unref(mediaOpenMode) === "mini" ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-surface-container/30 hover:bg-surface-container/50"] }, [
                  withDirectives(createVNode("input", {
                    type: "radio",
                    "onUpdate:modelValue": ($event) => isRef(mediaOpenMode) ? mediaOpenMode.value = $event : null,
                    value: "mini",
                    class: "sr-only"
                  }, null, 8, ["onUpdate:modelValue"]), [[vModelRadio, unref(mediaOpenMode)]]),
                  createVNode(_component_Icon, {
                    name: "lucide:minimize-2",
                    class: ["w-5 h-5 shrink-0", unref(mediaOpenMode) === "mini" ? "text-indigo-400" : "text-slate-600"]
                  }, null, 8, ["class"]),
                  createVNode("div", null, [createVNode("p", { class: "text-sm font-medium text-white" }, "\u30DF\u30CB\u30D7\u30EC\u30A4\u30E4\u30FC"), createVNode("p", { class: "text-xs text-on-surface-variant" }, "\u4E0B\u306E\u5C0F\u3055\u306A\u30D0\u30FC\u306B\u306E\u307F\u8868\u793A")])
                ], 2)
              ])
            ])])) : createCommentVNode("", true),
            unref(activeCategory) === "appearance" ? (openBlock(), createBlock("div", {
              key: 7,
              class: "space-y-4"
            }, [
              createVNode(_component_ThemePicker),
              createVNode("div", null, [createVNode("label", { class: "block text-sm text-on-surface-variant mb-2" }, "\u8A00\u8A9E"), withDirectives(createVNode("select", {
                "onUpdate:modelValue": ($event) => isRef(language) ? language.value = $event : null,
                class: "w-full bg-surface-container border border-outline rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              }, [
                createVNode("option", { value: "ja" }, "\u65E5\u672C\u8A9E"),
                createVNode("option", { value: "en" }, "English"),
                createVNode("option", { value: "zh" }, "\u4E2D\u6587"),
                createVNode("option", { value: "ko" }, "\uD55C\uAD6D\uC5B4")
              ], 8, ["onUpdate:modelValue"]), [[vModelSelect, unref(language)]])]),
              createVNode("div", null, [
                createVNode("label", { class: "block text-sm text-on-surface-variant mb-2" }, "\u30C7\u30B9\u30AF\u30C8\u30C3\u30D7\u306E\u30CA\u30D3\u8868\u793A"),
                createVNode("div", { class: "grid grid-cols-2 gap-2" }, [(openBlock(), createBlock(Fragment, null, renderList(navOptions, (opt) => {
                  return createVNode("button", {
                    key: opt.value,
                    type: "button",
                    onClick: ($event) => unref(setDesktopNav)(opt.value),
                    class: ["flex items-center gap-2.5 p-3 rounded-lg border transition text-left", unref(desktopNav) === opt.value ? "border-indigo-500 bg-indigo-500/15 text-white" : "border-outline bg-surface-container/30 text-on-surface-variant hover:border-outline-variant hover:text-on-surface"]
                  }, [createVNode(_component_Icon, {
                    name: opt.icon,
                    class: "w-4 h-4 shrink-0"
                  }, null, 8, ["name"]), createVNode("span", { class: "text-sm font-medium" }, toDisplayString(opt.label), 1)], 10, ["onClick"]);
                }), 64))]),
                createVNode("p", { class: "text-xs text-on-surface-variant mt-2" }, " \u30B9\u30DE\u30DB\u306F\u5E38\u306B\u4E0B\u90E8\u30CA\u30D3\uFF08\u30B9\u30EF\u30A4\u30D7\u3067\u5207\u308A\u66FF\u3048\uFF09\u304C\u4F7F\u3048\u307E\u3059\u3002\u30C7\u30B9\u30AF\u30C8\u30C3\u30D7\u306F\u3053\u3053\u3067\u9078\u3079\u307E\u3059\u3002 ")
              ])
            ])) : createCommentVNode("", true),
            unref(activeCategory) === "privacy" ? (openBlock(), createBlock("div", {
              key: 8,
              class: "space-y-4"
            }, [createVNode("div", { class: "flex items-center justify-between p-3 bg-surface-container/30 rounded-lg" }, [createVNode("div", { class: "pr-4" }, [createVNode("p", { class: "text-sm font-medium text-white flex items-center gap-1.5" }, [createVNode(_component_Icon, {
              name: "lucide:lock",
              class: "w-4 h-4 text-on-surface-variant"
            }), createTextVNode(" \u9375\u30A2\u30AB\u30A6\u30F3\u30C8 ")]), createVNode("p", { class: "text-xs text-on-surface-variant mt-1" }, " \u30AA\u30F3\u306B\u3059\u308B\u3068\u3001\u30D5\u30A9\u30ED\u30EF\u30FC\u3060\u3051\u304C\u3042\u306A\u305F\u306E\u6295\u7A3F\u3092\u95B2\u89A7\u3067\u304D\u307E\u3059\u3002 ")]), createVNode("label", { class: "relative inline-flex items-center cursor-pointer shrink-0" }, [withDirectives(createVNode("input", {
              type: "checkbox",
              "onUpdate:modelValue": ($event) => isRef(isPrivate) ? isPrivate.value = $event : null,
              class: "sr-only peer"
            }, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, unref(isPrivate)]]), createVNode("div", { class: "w-9 h-5 bg-surface-container-high rounded-full peer peer-checked:bg-indigo-600 transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition peer-checked:after:translate-x-4" })])]), createVNode("div", { class: "p-3 bg-surface-container/30 rounded-lg" }, [createVNode("p", { class: "text-sm font-medium text-white" }, "\u73FE\u5728\u306E\u8A2D\u5B9A"), createVNode("p", { class: ["text-xs mt-1", unref(isPrivate) ? "text-amber-400" : "text-on-surface-variant"] }, toDisplayString(unref(isPrivate) ? "\u975E\u516C\u958B\u30A2\u30AB\u30A6\u30F3\u30C8\uFF08\u9375\u30A2\u30AB\uFF09" : "\u516C\u958B\u30A2\u30AB\u30A6\u30F3\u30C8"), 3)])])) : createCommentVNode("", true),
            unref(activeCategory) === "notifications" ? (openBlock(), createBlock("div", {
              key: 9,
              class: "space-y-4"
            }, [createVNode("div", { class: "p-3 bg-surface-container/30 rounded-lg" }, [createVNode("p", { class: "text-sm font-medium text-white" }, "\u901A\u77E5\u8A2D\u5B9A"), createVNode("p", { class: "text-xs text-on-surface-variant mt-1" }, "\u8FD1\u65E5\u5BFE\u5FDC\u4E88\u5B9A")])])) : createCommentVNode("", true),
            createVNode("button", {
              onClick: save,
              disabled: unref(saving),
              class: "w-full py-2.5 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            }, toDisplayString(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58"), 9, ["disabled"])
          ])])];
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_BottomSheet, {
        open: !!unref(cropMode),
        "dismiss-on-backdrop": true,
        onClose: cancelCrop
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div${_scopeId}><div class="p-4 border-b border-outline-variant flex items-center justify-between"${_scopeId}><h3 class="font-bold text-white"${_scopeId}>${ssrInterpolate(unref(cropMode) === "avatar" ? "\u30A2\u30D0\u30BF\u30FC\u3092\u7DE8\u96C6" : "\u30D0\u30CA\u30FC\u3092\u7DE8\u96C6")}</h3><button class="text-on-surface-variant hover:text-white transition"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:x",
              class: "w-5 h-5"
            }, null, _parent2, _scopeId));
            _push2(`</button></div><div class="bg-black/40 select-none" style="${ssrRenderStyle({
              position: "relative",
              overflow: "hidden",
              cursor: unref(isDragging) ? "grabbing" : "grab",
              aspectRatio: unref(cropMode) === "avatar" ? "1 / 1 !important" : "3 / 1 !important",
              width: "100%"
            })}"${_scopeId}><img${ssrRenderAttr("src", unref(cropImageUrl))} draggable="false" style="${ssrRenderStyle({
              position: "absolute",
              left: unref(cropOffset).x + "px",
              top: unref(cropOffset).y + "px",
              transform: `scale(${unref(cropZoom)})`,
              transformOrigin: "0 0",
              maxWidth: "none",
              pointerEvents: "none",
              userSelect: "none"
            })}"${_scopeId}><div class="absolute inset-0 pointer-events-none" style="${ssrRenderStyle({
              boxShadow: "inset 0 0 0 9999px rgba(0,0,0,0.5)",
              border: "2px solid rgba(99,102,241,0.8)",
              borderRadius: unref(cropMode) === "avatar" ? "50%" : "0"
            })}"${_scopeId}></div></div><div class="p-4 flex items-center justify-between gap-2"${_scopeId}><div class="flex items-center gap-1"${_scopeId}><button class="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-container-high transition" title="\u7E2E\u5C0F"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:zoom-out",
              class: "w-4 h-4"
            }, null, _parent2, _scopeId));
            _push2(`</button><span class="text-xs text-on-surface-variant w-10 text-center"${_scopeId}>${ssrInterpolate(Math.round(unref(cropZoom) * 100))}%</span><button class="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-container-high transition" title="\u62E1\u5927"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:zoom-in",
              class: "w-4 h-4"
            }, null, _parent2, _scopeId));
            _push2(`</button></div><div class="flex items-center gap-2"${_scopeId}><button class="px-4 py-2 text-sm text-on-surface-variant hover:text-white transition"${_scopeId}> \u30AD\u30E3\u30F3\u30BB\u30EB </button><button class="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition"${_scopeId}> \u9069\u7528 </button></div></div></div>`);
          } else return [createVNode("div", null, [
            createVNode("div", { class: "p-4 border-b border-outline-variant flex items-center justify-between" }, [createVNode("h3", { class: "font-bold text-white" }, toDisplayString(unref(cropMode) === "avatar" ? "\u30A2\u30D0\u30BF\u30FC\u3092\u7DE8\u96C6" : "\u30D0\u30CA\u30FC\u3092\u7DE8\u96C6"), 1), createVNode("button", {
              onClick: cancelCrop,
              class: "text-on-surface-variant hover:text-white transition"
            }, [createVNode(_component_Icon, {
              name: "lucide:x",
              class: "w-5 h-5"
            })])]),
            createVNode("div", {
              class: "bg-black/40 select-none",
              ref_key: "cropContainerRef",
              ref: cropContainerRef,
              onPointerdown: withModifiers(() => {
              }, ["stop"]),
              onMousedown: onCropMouseDown,
              onMousemove: onCropMouseMove,
              onMouseup: onCropMouseUp,
              onMouseleave: onCropMouseUp,
              onWheel: onCropWheel,
              style: {
                position: "relative",
                overflow: "hidden",
                cursor: unref(isDragging) ? "grabbing" : "grab",
                aspectRatio: unref(cropMode) === "avatar" ? "1 / 1 !important" : "3 / 1 !important",
                width: "100%"
              }
            }, [createVNode("img", {
              ref_key: "cropImageRef",
              ref: cropImageRef,
              src: unref(cropImageUrl),
              onLoad: onCropImageLoad,
              draggable: "false",
              style: {
                position: "absolute",
                left: unref(cropOffset).x + "px",
                top: unref(cropOffset).y + "px",
                transform: `scale(${unref(cropZoom)})`,
                transformOrigin: "0 0",
                maxWidth: "none",
                pointerEvents: "none",
                userSelect: "none"
              }
            }, null, 44, ["src"]), createVNode("div", {
              class: "absolute inset-0 pointer-events-none",
              style: {
                boxShadow: "inset 0 0 0 9999px rgba(0,0,0,0.5)",
                border: "2px solid rgba(99,102,241,0.8)",
                borderRadius: unref(cropMode) === "avatar" ? "50%" : "0"
              }
            }, null, 4)], 44, ["onPointerdown"]),
            createVNode("div", { class: "p-4 flex items-center justify-between gap-2" }, [createVNode("div", { class: "flex items-center gap-1" }, [
              createVNode("button", {
                onClick: zoomOut,
                class: "p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-container-high transition",
                title: "\u7E2E\u5C0F"
              }, [createVNode(_component_Icon, {
                name: "lucide:zoom-out",
                class: "w-4 h-4"
              })]),
              createVNode("span", { class: "text-xs text-on-surface-variant w-10 text-center" }, toDisplayString(Math.round(unref(cropZoom) * 100)) + "%", 1),
              createVNode("button", {
                onClick: zoomIn,
                class: "p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-white hover:bg-surface-container-high transition",
                title: "\u62E1\u5927"
              }, [createVNode(_component_Icon, {
                name: "lucide:zoom-in",
                class: "w-4 h-4"
              })])
            ]), createVNode("div", { class: "flex items-center gap-2" }, [createVNode("button", {
              onClick: cancelCrop,
              class: "px-4 py-2 text-sm text-on-surface-variant hover:text-white transition"
            }, " \u30AD\u30E3\u30F3\u30BB\u30EB "), createVNode("button", {
              onClick: confirmCrop,
              class: "px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition"
            }, " \u9069\u7528 ")])])
          ])];
        }),
        _: 1
      }, _parent));
      _push(`<!--]-->`);
    };
  }
});
var _sfc_setup = SettingsModal_vue_vue_type_script_setup_true_lang_default.setup;
SettingsModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SettingsModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var SettingsModal_default = Object.assign(SettingsModal_vue_vue_type_script_setup_true_lang_default, { __name: "SettingsModal" });

export { SettingsModal_default as S, useAppPreferences as a, useTheme as b, useNavLayout as u };
//# sourceMappingURL=SettingsModal-CsgJUYKF.mjs.map
