import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';

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

export { UserTitle_default as U };
//# sourceMappingURL=UserTitle-CX959JWB.mjs.map
