import { c as components_default, n as navigateTo, $ as $fetch$1 } from '../virtual/entry.mjs';
import { B as BottomSheet_default } from './BottomSheet-lvIleqFE.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, Fragment, createTextVNode, renderList, toDisplayString, createCommentVNode, withDirectives, vModelText, isRef, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';

var ServerListModal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "ServerListModal",
  __ssrInlineRender: true,
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const open = ref(true);
    const servers = ref([]);
    const loading = ref(true);
    const showCreateForm = ref(false);
    const showJoinForm = ref(false);
    const createForm = ref({
      name: "",
      description: ""
    });
    const joinCode = ref("");
    async function loadServers() {
      loading.value = true;
      try {
        const data = await $fetch$1("/api/servers");
        servers.value = data.servers;
      } finally {
        loading.value = false;
      }
    }
    async function createServer() {
      const data = await $fetch$1("/api/servers", {
        method: "POST",
        body: createForm.value
      });
      showCreateForm.value = false;
      createForm.value = {
        name: "",
        description: ""
      };
      await loadServers();
      navigateTo(`/servers/${data.server.id}`);
      emit("close");
    }
    async function joinServer() {
      if (!joinCode.value.trim()) return;
      const data = await $fetch$1(`/api/servers/join/${joinCode.value}`, { method: "POST" });
      showJoinForm.value = false;
      joinCode.value = "";
      await loadServers();
      navigateTo(`/servers/${data.serverId}`);
      emit("close");
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BottomSheet = BottomSheet_default;
      const _component_Icon = components_default;
      _push(ssrRenderComponent(_component_BottomSheet, mergeProps({
        open: unref(open),
        height: unref(showCreateForm) || unref(showJoinForm) ? "min(88dvh, 40rem)" : "min(78dvh, 34rem)",
        onClose: ($event) => emit("close")
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6 pt-3 space-y-4"${_scopeId}><div class="flex items-center justify-between"${_scopeId}><h2 class="text-xl font-bold"${_scopeId}>\u30B5\u30FC\u30D0\u30FC\u4E00\u89A7</h2><button class="p-1 -mr-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:x",
              class: "w-5 h-5"
            }, null, _parent2, _scopeId));
            _push2(`</button></div>`);
            if (!unref(showCreateForm) && !unref(showJoinForm)) {
              _push2(`<!--[--><div class="flex gap-2"${_scopeId}><button class="flex-1 py-2.5 rounded-lg border border-outline text-sm text-on-surface hover:bg-surface-container transition flex items-center justify-center gap-1.5"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:log-in",
                class: "w-4 h-4"
              }, null, _parent2, _scopeId));
              _push2(` \u53C2\u52A0 </button><button class="flex-1 py-2.5 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition flex items-center justify-center gap-1.5"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "lucide:plus",
                class: "w-4 h-4"
              }, null, _parent2, _scopeId));
              _push2(` \u4F5C\u6210 </button></div>`);
              if (unref(loading)) _push2(`<div class="text-center text-on-surface-variant py-6 text-sm"${_scopeId}>\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>`);
              else if (!unref(servers).length) _push2(`<div class="text-center text-on-surface-variant py-6 text-sm"${_scopeId}>\u53C2\u52A0\u3057\u3066\u3044\u308B\u30B5\u30FC\u30D0\u30FC\u306F\u3042\u308A\u307E\u305B\u3093</div>`);
              else {
                _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
                ssrRenderList(unref(servers), (server) => {
                  var _a;
                  _push2(`<button class="w-full text-left bg-surface-container/30 border border-outline-variant rounded-xl p-3 hover:bg-surface-container/50 hover:border-outline transition flex items-center gap-3"${_scopeId}><div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0"${_scopeId}>${ssrInterpolate((_a = server.name) == null ? void 0 : _a.charAt(0))}</div><div class="flex-1 min-w-0"${_scopeId}><h3 class="font-bold text-sm text-on-surface truncate"${_scopeId}>${ssrInterpolate(server.name)}</h3><p class="text-xs text-on-surface-variant truncate"${_scopeId}>${ssrInterpolate(server.description || "\u8AAC\u660E\u306A\u3057")}</p></div></button>`);
                });
                _push2(`<!--]--></div>`);
              }
              _push2(`<!--]-->`);
            } else _push2(`<!---->`);
            if (unref(showCreateForm)) _push2(`<div class="space-y-4"${_scopeId}><h3 class="text-lg font-bold"${_scopeId}>\u30B5\u30FC\u30D0\u30FC\u3092\u4F5C\u6210</h3><div class="space-y-3"${_scopeId}><div${_scopeId}><label class="text-xs text-on-surface-variant font-medium block mb-1"${_scopeId}>\u30B5\u30FC\u30D0\u30FC\u540D</label><input${ssrRenderAttr("value", unref(createForm).name)} class="w-full bg-surface border border-outline rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-indigo-500" placeholder="\u30B5\u30FC\u30D0\u30FC\u540D"${_scopeId}></div><div${_scopeId}><label class="text-xs text-on-surface-variant font-medium block mb-1"${_scopeId}>\u8AAC\u660E (\u4EFB\u610F)</label><textarea rows="3" class="w-full bg-surface border border-outline rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-indigo-500 resize-none" placeholder="\u8AAC\u660E"${_scopeId}>${ssrInterpolate(unref(createForm).description)}</textarea></div></div><div class="flex justify-end gap-2"${_scopeId}><button class="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition"${_scopeId}>\u623B\u308B</button><button${ssrIncludeBooleanAttr(!unref(createForm).name.trim()) ? " disabled" : ""} class="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"${_scopeId}>\u4F5C\u6210</button></div></div>`);
            else if (unref(showJoinForm)) _push2(`<div class="space-y-4"${_scopeId}><h3 class="text-lg font-bold"${_scopeId}>\u62DB\u5F85\u30B3\u30FC\u30C9\u3067\u53C2\u52A0</h3><div${_scopeId}><label class="text-xs text-on-surface-variant font-medium block mb-1"${_scopeId}>\u62DB\u5F85\u30B3\u30FC\u30C9</label><input${ssrRenderAttr("value", unref(joinCode))} class="w-full bg-surface border border-outline rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-indigo-500" placeholder="\u30B3\u30FC\u30C9\u3092\u5165\u529B"${_scopeId}></div><div class="flex justify-end gap-2"${_scopeId}><button class="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition"${_scopeId}>\u623B\u308B</button><button${ssrIncludeBooleanAttr(!unref(joinCode).trim()) ? " disabled" : ""} class="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"${_scopeId}>\u53C2\u52A0</button></div></div>`);
            else _push2(`<!---->`);
            _push2(`</div>`);
          } else return [createVNode("div", { class: "p-6 pt-3 space-y-4" }, [
            createVNode("div", { class: "flex items-center justify-between" }, [createVNode("h2", { class: "text-xl font-bold" }, "\u30B5\u30FC\u30D0\u30FC\u4E00\u89A7"), createVNode("button", {
              onClick: ($event) => emit("close"),
              class: "p-1 -mr-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition"
            }, [createVNode(_component_Icon, {
              name: "lucide:x",
              class: "w-5 h-5"
            })], 8, ["onClick"])]),
            !unref(showCreateForm) && !unref(showJoinForm) ? (openBlock(), createBlock(Fragment, { key: 0 }, [createVNode("div", { class: "flex gap-2" }, [createVNode("button", {
              onClick: ($event) => showJoinForm.value = true,
              class: "flex-1 py-2.5 rounded-lg border border-outline text-sm text-on-surface hover:bg-surface-container transition flex items-center justify-center gap-1.5"
            }, [createVNode(_component_Icon, {
              name: "lucide:log-in",
              class: "w-4 h-4"
            }), createTextVNode(" \u53C2\u52A0 ")], 8, ["onClick"]), createVNode("button", {
              onClick: ($event) => showCreateForm.value = true,
              class: "flex-1 py-2.5 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition flex items-center justify-center gap-1.5"
            }, [createVNode(_component_Icon, {
              name: "lucide:plus",
              class: "w-4 h-4"
            }), createTextVNode(" \u4F5C\u6210 ")], 8, ["onClick"])]), unref(loading) ? (openBlock(), createBlock("div", {
              key: 0,
              class: "text-center text-on-surface-variant py-6 text-sm"
            }, "\u8AAD\u307F\u8FBC\u307F\u4E2D...")) : !unref(servers).length ? (openBlock(), createBlock("div", {
              key: 1,
              class: "text-center text-on-surface-variant py-6 text-sm"
            }, "\u53C2\u52A0\u3057\u3066\u3044\u308B\u30B5\u30FC\u30D0\u30FC\u306F\u3042\u308A\u307E\u305B\u3093")) : (openBlock(), createBlock("div", {
              key: 2,
              class: "space-y-2"
            }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(servers), (server) => {
              var _a;
              return openBlock(), createBlock("button", {
                key: server.id,
                onClick: ($event) => {
                  ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))(`/servers/${server.id}`);
                  emit("close");
                },
                class: "w-full text-left bg-surface-container/30 border border-outline-variant rounded-xl p-3 hover:bg-surface-container/50 hover:border-outline transition flex items-center gap-3"
              }, [createVNode("div", { class: "w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0" }, toDisplayString((_a = server.name) == null ? void 0 : _a.charAt(0)), 1), createVNode("div", { class: "flex-1 min-w-0" }, [createVNode("h3", { class: "font-bold text-sm text-on-surface truncate" }, toDisplayString(server.name), 1), createVNode("p", { class: "text-xs text-on-surface-variant truncate" }, toDisplayString(server.description || "\u8AAC\u660E\u306A\u3057"), 1)])], 8, ["onClick"]);
            }), 128))]))], 64)) : createCommentVNode("", true),
            unref(showCreateForm) ? (openBlock(), createBlock("div", {
              key: 1,
              class: "space-y-4"
            }, [
              createVNode("h3", { class: "text-lg font-bold" }, "\u30B5\u30FC\u30D0\u30FC\u3092\u4F5C\u6210"),
              createVNode("div", { class: "space-y-3" }, [createVNode("div", null, [createVNode("label", { class: "text-xs text-on-surface-variant font-medium block mb-1" }, "\u30B5\u30FC\u30D0\u30FC\u540D"), withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => unref(createForm).name = $event,
                class: "w-full bg-surface border border-outline rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-indigo-500",
                placeholder: "\u30B5\u30FC\u30D0\u30FC\u540D"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(createForm).name]])]), createVNode("div", null, [createVNode("label", { class: "text-xs text-on-surface-variant font-medium block mb-1" }, "\u8AAC\u660E (\u4EFB\u610F)"), withDirectives(createVNode("textarea", {
                "onUpdate:modelValue": ($event) => unref(createForm).description = $event,
                rows: "3",
                class: "w-full bg-surface border border-outline rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-indigo-500 resize-none",
                placeholder: "\u8AAC\u660E"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(createForm).description]])])]),
              createVNode("div", { class: "flex justify-end gap-2" }, [createVNode("button", {
                onClick: ($event) => showCreateForm.value = false,
                class: "px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition"
              }, "\u623B\u308B", 8, ["onClick"]), createVNode("button", {
                onClick: createServer,
                disabled: !unref(createForm).name.trim(),
                class: "px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"
              }, "\u4F5C\u6210", 8, ["disabled"])])
            ])) : unref(showJoinForm) ? (openBlock(), createBlock("div", {
              key: 2,
              class: "space-y-4"
            }, [
              createVNode("h3", { class: "text-lg font-bold" }, "\u62DB\u5F85\u30B3\u30FC\u30C9\u3067\u53C2\u52A0"),
              createVNode("div", null, [createVNode("label", { class: "text-xs text-on-surface-variant font-medium block mb-1" }, "\u62DB\u5F85\u30B3\u30FC\u30C9"), withDirectives(createVNode("input", {
                "onUpdate:modelValue": ($event) => isRef(joinCode) ? joinCode.value = $event : null,
                class: "w-full bg-surface border border-outline rounded-lg px-3 py-2 text-on-surface text-sm focus:ring-1 focus:ring-indigo-500",
                placeholder: "\u30B3\u30FC\u30C9\u3092\u5165\u529B"
              }, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(joinCode)]])]),
              createVNode("div", { class: "flex justify-end gap-2" }, [createVNode("button", {
                onClick: ($event) => showJoinForm.value = false,
                class: "px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition"
              }, "\u623B\u308B", 8, ["onClick"]), createVNode("button", {
                onClick: joinServer,
                disabled: !unref(joinCode).trim(),
                class: "px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition disabled:opacity-50"
              }, "\u53C2\u52A0", 8, ["disabled"])])
            ])) : createCommentVNode("", true)
          ])];
        }),
        _: 1
      }, _parent));
    };
  }
});
var _sfc_setup = ServerListModal_vue_vue_type_script_setup_true_lang_default.setup;
ServerListModal_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ServerListModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ServerListModal_default = Object.assign(ServerListModal_vue_vue_type_script_setup_true_lang_default, { __name: "ServerListModal" });

export { ServerListModal_default as S };
//# sourceMappingURL=ServerListModal-BzbS4U8N.mjs.map
