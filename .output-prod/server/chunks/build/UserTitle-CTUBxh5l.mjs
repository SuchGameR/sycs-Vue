import { c as components_default } from '../virtual/entry.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';

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
var _sfc_setup$1 = UserBadges_vue_vue_type_script_setup_true_lang_default.setup;
UserBadges_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UserBadges.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
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
var _sfc_setup = UserTitle_vue_vue_type_script_setup_true_lang_default.setup;
UserTitle_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/UserTitle.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var UserTitle_default = Object.assign(UserTitle_vue_vue_type_script_setup_true_lang_default, { __name: "UserTitle" });

export { UserBadges_default as U, UserTitle_default as a };
//# sourceMappingURL=UserTitle-CTUBxh5l.mjs.map
