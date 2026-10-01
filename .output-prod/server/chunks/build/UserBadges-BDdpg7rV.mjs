import { c as components_default } from '../virtual/entry.mjs';
import { defineComponent, computed, unref, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

var UserBadges_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "UserBadges",
  __ssrInlineRender: true,
  props: {
    badges: {},
    size: {}
  },
  setup(__props) {
    const props = __props;
    const box = computed(() => props.size === "md" ? "h-6 w-6" : "h-4 w-4");
    const normalised = computed(() => {
      var _a, _b, _c, _d, _e;
      const out = [];
      for (const [i, b] of (props.badges || []).entries()) {
        if (!b) continue;
        const image = String((_b = (_a = b.image) != null ? _a : b.kind === "image" ? b.value : "") != null ? _b : "").trim();
        const rawIcon = String((_d = (_c = b.icon) != null ? _c : b.kind === "icon" ? b.value : "") != null ? _d : "").trim();
        if (!image && !rawIcon) continue;
        out.push({
          key: `${image || rawIcon}-${i}`,
          icon: rawIcon,
          image,
          label: String((_e = b.label) != null ? _e : "").trim()
        });
      }
      return out;
    });
    const shown = computed(() => normalised.value.slice(0, 4));
    const overflow = computed(() => Math.max(0, normalised.value.length - shown.value.length));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      if (unref(shown).length || unref(overflow)) {
        _push(`<span${ssrRenderAttrs(mergeProps({ class: "inline-flex items-center gap-1 shrink-0" }, _attrs))}><!--[-->`);
        ssrRenderList(unref(shown), (b) => {
          _push(`<span class="group/badge relative inline-flex shrink-0"${ssrRenderAttr("aria-label", b.label || void 0)}${ssrRenderAttr("title", b.label || void 0)}>`);
          if (b.image) _push(`<img${ssrRenderAttr("src", b.image)}${ssrRenderAttr("alt", b.label || "")} class="${ssrRenderClass([unref(box), "rounded object-contain"])}">`);
          else _push(ssrRenderComponent(_component_Icon, {
            name: b.icon,
            class: ["shrink-0 text-indigo-500 [&_svg]:fill-current", unref(box)]
          }, null, _parent));
          if (b.label) _push(`<span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-outline-variant bg-surface-container px-1.5 py-0.5 text-[10px] font-medium leading-none text-on-surface opacity-0 shadow-lg transition-opacity duration-150 group-hover/badge:opacity-100 group-focus-within/badge:opacity-100" aria-hidden="true">${ssrInterpolate(b.label)}</span>`);
          else _push(`<!---->`);
          _push(`</span>`);
        });
        _push(`<!--]-->`);
        if (unref(overflow)) _push(`<span class="inline-flex shrink-0 items-center justify-center rounded-full bg-surface-container px-1 text-[9px] font-bold leading-none text-on-surface-variant">+${ssrInterpolate(unref(overflow))}</span>`);
        else _push(`<!---->`);
        _push(`</span>`);
      } else _push(`<!---->`);
    };
  }
});
var _sfc_setup = UserBadges_vue_vue_type_script_setup_true_lang_default.setup;
UserBadges_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UserBadges.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var UserBadges_default = Object.assign(UserBadges_vue_vue_type_script_setup_true_lang_default, { __name: "UserBadges" });

export { UserBadges_default as U };
//# sourceMappingURL=UserBadges-BDdpg7rV.mjs.map
