import { defineComponent, ref, computed, watch, unref, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderStyle, ssrRenderClass, ssrRenderSlot } from 'vue/server-renderer';

var BottomSheet_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "BottomSheet",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean },
    height: { default: "auto" },
    dismissOnBackdrop: {
      type: Boolean,
      default: false
    }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    ref(null);
    ref(false);
    const canDrag = ref(false);
    const panelStyle = computed(() => {
      if (props.height === "auto") return {};
      if (props.height === "full") return { height: "calc(100dvh - 3.5rem)" };
      return { height: props.height };
    });
    watch(() => props.open, (v) => {
    });
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.open) {
          _push2(`<div class="fixed inset-0" role="dialog" aria-modal="true"><div class="sycs-sheet-backdrop"></div><div class="sycs-sheet-panel" style="${ssrRenderStyle(unref(panelStyle))}"><div class="${ssrRenderClass([unref(canDrag) ? "cursor-grab" : "", "sycs-sheet-grabber"])}"></div><div class="sycs-sheet-body">`);
          ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent);
          _push2(`</div><div class="sycs-sheet-safe shrink-0"></div></div></div>`);
        } else _push2(`<!---->`);
      }, "body", false, _parent);
    };
  }
});
var _sfc_setup = BottomSheet_vue_vue_type_script_setup_true_lang_default.setup;
BottomSheet_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BottomSheet.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var BottomSheet_default = Object.assign(BottomSheet_vue_vue_type_script_setup_true_lang_default, { __name: "BottomSheet" });

export { BottomSheet_default as B };
//# sourceMappingURL=BottomSheet-lvIleqFE.mjs.map
