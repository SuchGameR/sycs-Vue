import { u as useFetch } from './fetch-CdHJIb6H.mjs';
import { c as components_default } from '../virtual/entry.mjs';
import { U as UserBadges_default, a as UserTitle_default } from './useInfiniteScroll-Bd156WHj.mjs';
import { defineComponent, withAsyncContext, computed, ref, unref, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrRenderList, ssrRenderClass, ssrRenderComponent, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';

var SettingsModal_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "SettingsModal",
  __ssrInlineRender: true,
  emits: ["close"],
  async setup(__props, { emit: __emit }) {
    var _a, _b, _c, _d, _e, _f;
    let __temp, __restore;
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
    const avatarUrl = ref(((_c = user.value) == null ? void 0 : _c.avatarUrl) || "");
    const bannerUrl = ref(((_d = user.value) == null ? void 0 : _d.bannerUrl) || "");
    const isPrivate = ref(((_e = user.value) == null ? void 0 : _e.isPrivate) || false);
    const birthday = ref(s.value.birthday || "");
    const birthplace = ref(s.value.birthplace || "");
    const theme = ref(s.value.theme || "dark");
    const language = ref(s.value.language || "ja");
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
    const showViewCount = ref((_f = s.value.showViewCount) != null ? _f : true);
    const refreshMode = ref(s.value.refreshMode || "auto");
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
    const cropMode = ref(null);
    const cropImageUrl = ref("");
    ref(null);
    ref(null);
    const cropOffset = ref({
      x: 0,
      y: 0
    });
    const cropZoom = ref(1);
    const isDragging = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_UserBadges = UserBadges_default;
      const _component_UserTitle = UserTitle_default;
      ssrRenderTeleport(_push, (_push2) => {
        var _a2, _b2, _c2, _d2, _e2, _f2;
        _push2(`<div class="fixed inset-0 z-[100] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/60"></div><div class="relative bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex"><div class="w-44 shrink-0 border-r border-slate-800 p-3 space-y-1 overflow-y-auto"><!--[-->`);
        ssrRenderList(categories, (cat) => {
          _push2(`<button class="${ssrRenderClass([unref(activeCategory) === cat.key ? "bg-indigo-600/20 text-indigo-400" : "text-slate-400 hover:text-white hover:bg-slate-800/30", "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left"])}">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: cat.icon,
            class: "w-4 h-4 shrink-0"
          }, null, _parent));
          _push2(` ${ssrInterpolate(cat.label)}</button>`);
        });
        _push2(`<!--]--></div><div class="flex-1 p-6 overflow-y-auto space-y-5"><div class="flex items-center justify-between mb-2"><h2 class="text-xl font-bold text-white">${ssrInterpolate(((_a2 = categories.find((c) => c.key === unref(activeCategory))) == null ? void 0 : _a2.label) || "\u8A2D\u5B9A")}</h2><button class="text-slate-500 hover:text-white transition">`);
        _push2(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-5 h-5"
        }, null, _parent));
        _push2(`</button></div>`);
        if (unref(message)) _push2(`<div class="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 text-sm text-indigo-400">${ssrInterpolate(unref(message))}</div>`);
        else _push2(`<!---->`);
        if (unref(activeCategory) === "profile") {
          _push2(`<div class="space-y-4"><div class="bg-slate-800/30 border border-slate-800 rounded-xl overflow-hidden">`);
          if (unref(bannerUrl)) _push2(`<div class="h-16" style="${ssrRenderStyle(`background-image: url(${unref(bannerUrl)}); background-size: cover; background-position: center; aspect-ratio: 3/1 !important; width: 100%; height: fit-content !important`)}"></div>`);
          else _push2(`<div class="h-16 bg-gradient-to-r from-indigo-900/50 to-purple-900/50"></div>`);
          _push2(`<div class="px-4 pb-3"><div class="flex items-end -mt-8 mb-2">`);
          if (unref(avatarUrl)) _push2(`<img${ssrRenderAttr("src", unref(avatarUrl))} class="w-14 h-14 rounded-full border-4 border-[#151a24] object-cover">`);
          else _push2(`<div class="w-14 h-14 rounded-full border-4 border-[#151a24] bg-indigo-600 flex items-center justify-center text-lg font-bold text-white">${ssrInterpolate(((_b2 = unref(displayName)) == null ? void 0 : _b2.charAt(0)) || "?")}</div>`);
          _push2(`</div><p class="font-bold text-white">${ssrInterpolate(unref(displayName) || "\u8868\u793A\u540D")}</p><p class="text-xs text-slate-500">@${ssrInterpolate((_c2 = unref(user)) == null ? void 0 : _c2.username)}</p>`);
          if (unref(bio)) _push2(`<p class="text-xs text-slate-400 mt-1">${ssrInterpolate(unref(bio))}</p>`);
          else _push2(`<!---->`);
          _push2(`</div></div><div class="flex gap-3"><button${ssrIncludeBooleanAttr(unref(uploadingAvatar)) ? " disabled" : ""} class="flex-1 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50">`);
          if (unref(uploadingAvatar)) _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:loader-2",
            class: "w-3.5 h-3.5 animate-spin"
          }, null, _parent));
          else _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:camera",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push2(` \u30A2\u30D0\u30BF\u30FC </button><button${ssrIncludeBooleanAttr(unref(uploadingBanner)) ? " disabled" : ""} class="flex-1 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50">`);
          if (unref(uploadingBanner)) _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:loader-2",
            class: "w-3.5 h-3.5 animate-spin"
          }, null, _parent));
          else _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:image",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push2(` \u30D0\u30CA\u30FC </button></div><div><label class="block text-sm text-slate-400 mb-1">\u8868\u793A\u540D</label><input${ssrRenderAttr("value", unref(displayName))} type="text" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"></div><div><label class="block text-sm text-slate-400 mb-1">\u81EA\u5DF1\u7D39\u4ECB</label><textarea rows="3" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none">${ssrInterpolate(unref(bio))}</textarea></div>`);
          if (((_e2 = (_d2 = unref(user)) == null ? void 0 : _d2.badges) == null ? void 0 : _e2.length) || ((_f2 = unref(user)) == null ? void 0 : _f2.title)) {
            _push2(`<div class="p-3 bg-slate-800/30 rounded-lg"><p class="text-sm font-medium text-white mb-2">\u30D0\u30C3\u30B8\u30FB\u79F0\u53F7</p><div class="flex items-center gap-2 flex-wrap">`);
            _push2(ssrRenderComponent(_component_UserBadges, {
              badges: unref(user).badges,
              size: "md"
            }, null, _parent));
            _push2(ssrRenderComponent(_component_UserTitle, { title: unref(user).title }, null, _parent));
            _push2(`</div><p class="text-xs text-slate-500 mt-2">\u30D0\u30C3\u30B8\u306F\u30B5\u30FC\u30D0\u30FC\u5074\u3067\u4ED8\u4E0E\u3055\u308C\u307E\u3059\u3002\u79F0\u53F7\u306F\u5229\u7528\u72B6\u6CC1\u306B\u5FDC\u3058\u3066\u81EA\u52D5\u3067\u6C7A\u307E\u308A\u307E\u3059\u3002</p></div>`);
          } else _push2(`<!---->`);
          _push2(`</div>`);
        } else _push2(`<!---->`);
        if (unref(activeCategory) === "detail") _push2(`<div class="space-y-4"><div><label class="block text-sm text-slate-400 mb-1">\u8A95\u751F\u65E5</label><input${ssrRenderAttr("value", unref(birthday))} type="date" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"></div><div><label class="block text-sm text-slate-400 mb-1">\u51FA\u8EAB</label><input${ssrRenderAttr("value", unref(birthplace))} type="text" placeholder="\u4F8B: \u6771\u4EAC\u90FD" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"></div></div>`);
        else _push2(`<!---->`);
        if (unref(activeCategory) === "links") {
          _push2(`<div class="space-y-4"><div><label class="block text-sm text-slate-400 mb-1">GitHub</label><div class="flex items-center gap-2">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:github",
            class: "w-4 h-4 text-slate-500 shrink-0"
          }, null, _parent));
          _push2(`<input${ssrRenderAttr("value", unref(github))} type="text" placeholder="\u30E6\u30FC\u30B6\u30FC\u540D" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"></div></div><div><label class="block text-sm text-slate-400 mb-1">Twitter / X</label><div class="flex items-center gap-2">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:twitter",
            class: "w-4 h-4 text-slate-500 shrink-0"
          }, null, _parent));
          _push2(`<input${ssrRenderAttr("value", unref(twitter))} type="text" placeholder="@\u30E6\u30FC\u30B6\u30FC\u540D" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"></div></div><div><label class="block text-sm text-slate-400 mb-1">Web\u30B5\u30A4\u30C8</label><div class="flex items-center gap-2">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:globe",
            class: "w-4 h-4 text-slate-500 shrink-0"
          }, null, _parent));
          _push2(`<input${ssrRenderAttr("value", unref(website))} type="url" placeholder="https://" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"></div></div></div>`);
        } else _push2(`<!---->`);
        if (unref(activeCategory) === "posts") {
          _push2(`<div class="space-y-4"><div><label class="block text-sm text-slate-400 mb-2">\u30DC\u30BF\u30F3\u306E\u8868\u793A\u9806</label><p class="text-xs text-slate-600 mb-3"> \u5404\u6295\u7A3F\u306E\u4E0B\u306B\u3042\u308B\u30DC\u30BF\u30F3\u306E\u4E26\u3073\u9806\u3092\u30AB\u30B9\u30BF\u30DE\u30A4\u30BA </p><div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(buttonOrder), (key) => {
            var _a3, _b3;
            _push2(`<div class="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: ((_a3 = allButtons.find((b) => b.key === key)) == null ? void 0 : _a3.icon) || "",
              class: "w-4 h-4 text-slate-400"
            }, null, _parent));
            _push2(`<span class="flex-1 text-sm text-white">${ssrInterpolate((_b3 = allButtons.find((b) => b.key === key)) == null ? void 0 : _b3.label)}</span><button${ssrIncludeBooleanAttr(unref(buttonOrder).indexOf(key) === 0) ? " disabled" : ""} class="p-1 text-slate-500 hover:text-white disabled:opacity-30 transition">`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:chevron-up",
              class: "w-4 h-4"
            }, null, _parent));
            _push2(`</button><button${ssrIncludeBooleanAttr(unref(buttonOrder).indexOf(key) === unref(buttonOrder).length - 1) ? " disabled" : ""} class="p-1 text-slate-500 hover:text-white disabled:opacity-30 transition">`);
            _push2(ssrRenderComponent(_component_Icon, {
              name: "lucide:chevron-down",
              class: "w-4 h-4"
            }, null, _parent));
            _push2(`</button></div>`);
          });
          _push2(`<!--]--></div></div><div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"><div><p class="text-sm font-medium text-white">\u95B2\u89A7\u6570\u3092\u8868\u793A</p><p class="text-xs text-slate-500">\u6295\u7A3F\u306B\u95B2\u89A7\u6570\u3092\u8868\u793A</p></div><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(showViewCount)) ? ssrLooseContain(unref(showViewCount), null) : unref(showViewCount)) ? " checked" : ""} class="sr-only peer"><div class="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:bg-indigo-600 transition after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition peer-checked:after:translate-x-4"></div></label></div></div>`);
        } else _push2(`<!---->`);
        if (unref(activeCategory) === "timeline") {
          _push2(`<div class="space-y-4"><label class="block text-sm text-slate-400 mb-2">\u66F4\u65B0\u30E2\u30FC\u30C9</label><div class="space-y-2"><label class="${ssrRenderClass([unref(refreshMode) === "auto" ? "ring-1 ring-indigo-500" : "", "flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer"])}"><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(refreshMode), "auto")) ? " checked" : ""} value="auto" class="sr-only">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:radio",
            class: ["w-5 h-5 shrink-0", unref(refreshMode) === "auto" ? "text-indigo-400" : "text-slate-600"]
          }, null, _parent));
          _push2(`<div><p class="text-sm font-medium text-white">\u81EA\u52D5\u66F4\u65B0</p><p class="text-xs text-slate-500"> \u65B0\u3057\u3044\u6295\u7A3F\u304C\u81EA\u52D5\u3067\u30BF\u30A4\u30E0\u30E9\u30A4\u30F3\u306B\u8868\u793A </p></div></label><label class="${ssrRenderClass([unref(refreshMode) === "manual" ? "ring-1 ring-indigo-500" : "", "flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg cursor-pointer"])}"><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(refreshMode), "manual")) ? " checked" : ""} value="manual" class="sr-only">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:radio",
            class: ["w-5 h-5 shrink-0", unref(refreshMode) === "manual" ? "text-indigo-400" : "text-slate-600"]
          }, null, _parent));
          _push2(`<div><p class="text-sm font-medium text-white">\u624B\u52D5\u66F4\u65B0</p><p class="text-xs text-slate-500">\u66F4\u65B0\u30DC\u30BF\u30F3\u3092\u62BC\u3057\u305F\u3068\u304D\u306E\u307F\u66F4\u65B0</p></div></label></div></div>`);
        } else _push2(`<!---->`);
        if (unref(activeCategory) === "appearance") _push2(`<div class="space-y-4"><div><label class="block text-sm text-slate-400 mb-2">\u30C6\u30FC\u30DE</label><div class="grid grid-cols-2 gap-2"><label class="${ssrRenderClass([unref(theme) === "dark" ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-slate-800/30", "flex items-center gap-3 p-3 rounded-lg cursor-pointer"])}"><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(theme), "dark")) ? " checked" : ""} value="dark" class="sr-only"><div class="w-6 h-6 rounded-full bg-slate-900 border border-slate-600 shrink-0"></div><span class="text-sm text-white">\u30C0\u30FC\u30AF</span></label><label class="${ssrRenderClass([unref(theme) === "light" ? "bg-indigo-600/20 ring-1 ring-indigo-500" : "bg-slate-800/30", "flex items-center gap-3 p-3 rounded-lg cursor-pointer"])}"><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(theme), "light")) ? " checked" : ""} value="light" class="sr-only"><div class="w-6 h-6 rounded-full bg-white border border-slate-300 shrink-0"></div><span class="text-sm text-white">\u30E9\u30A4\u30C8</span></label></div></div><div><label class="block text-sm text-slate-400 mb-2">\u8A00\u8A9E</label><select class="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"><option value="ja"${ssrIncludeBooleanAttr(Array.isArray(unref(language)) ? ssrLooseContain(unref(language), "ja") : ssrLooseEqual(unref(language), "ja")) ? " selected" : ""}>\u65E5\u672C\u8A9E</option><option value="en"${ssrIncludeBooleanAttr(Array.isArray(unref(language)) ? ssrLooseContain(unref(language), "en") : ssrLooseEqual(unref(language), "en")) ? " selected" : ""}>English</option><option value="zh"${ssrIncludeBooleanAttr(Array.isArray(unref(language)) ? ssrLooseContain(unref(language), "zh") : ssrLooseEqual(unref(language), "zh")) ? " selected" : ""}>\u4E2D\u6587</option><option value="ko"${ssrIncludeBooleanAttr(Array.isArray(unref(language)) ? ssrLooseContain(unref(language), "ko") : ssrLooseEqual(unref(language), "ko")) ? " selected" : ""}>\uD55C\uAD6D\uC5B4</option></select></div></div>`);
        else _push2(`<!---->`);
        if (unref(activeCategory) === "privacy") {
          _push2(`<div class="space-y-4"><div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"><div class="pr-4"><p class="text-sm font-medium text-white flex items-center gap-1.5">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:lock",
            class: "w-4 h-4 text-slate-400"
          }, null, _parent));
          _push2(` \u9375\u30A2\u30AB\u30A6\u30F3\u30C8 </p><p class="text-xs text-slate-500 mt-1"> \u30AA\u30F3\u306B\u3059\u308B\u3068\u3001\u30D5\u30A9\u30ED\u30EF\u30FC\u3060\u3051\u304C\u3042\u306A\u305F\u306E\u6295\u7A3F\u3092\u95B2\u89A7\u3067\u304D\u307E\u3059\u3002 </p></div><label class="relative inline-flex items-center cursor-pointer shrink-0"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(isPrivate)) ? ssrLooseContain(unref(isPrivate), null) : unref(isPrivate)) ? " checked" : ""} class="sr-only peer"><div class="w-9 h-5 bg-slate-700 rounded-full peer peer-checked:bg-indigo-600 transition after:content-[&#39;&#39;] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition peer-checked:after:translate-x-4"></div></label></div><div class="p-3 bg-slate-800/30 rounded-lg"><p class="text-sm font-medium text-white">\u73FE\u5728\u306E\u8A2D\u5B9A</p><p class="${ssrRenderClass([unref(isPrivate) ? "text-amber-400" : "text-slate-500", "text-xs mt-1"])}">${ssrInterpolate(unref(isPrivate) ? "\u975E\u516C\u958B\u30A2\u30AB\u30A6\u30F3\u30C8\uFF08\u9375\u30A2\u30AB\uFF09" : "\u516C\u958B\u30A2\u30AB\u30A6\u30F3\u30C8")}</p></div></div>`);
        } else _push2(`<!---->`);
        if (unref(activeCategory) === "notifications") _push2(`<div class="space-y-4"><div class="p-3 bg-slate-800/30 rounded-lg"><p class="text-sm font-medium text-white">\u901A\u77E5\u8A2D\u5B9A</p><p class="text-xs text-slate-500 mt-1">\u8FD1\u65E5\u5BFE\u5FDC\u4E88\u5B9A</p></div></div>`);
        else _push2(`<!---->`);
        _push2(`<button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="w-full py-2.5 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50">${ssrInterpolate(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58")}</button></div></div></div>`);
        if (unref(cropMode)) {
          _push2(`<div class="fixed inset-0 z-[200] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/70"></div><div class="relative bg-[#151a24] border border-slate-700 rounded-2xl w-full max-w-lg"><div class="p-4 border-b border-slate-800 flex items-center justify-between"><h3 class="font-bold text-white">${ssrInterpolate(unref(cropMode) === "avatar" ? "\u30A2\u30D0\u30BF\u30FC\u3092\u7DE8\u96C6" : "\u30D0\u30CA\u30FC\u3092\u7DE8\u96C6")}</h3><button class="text-slate-500 hover:text-white transition">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:x",
            class: "w-5 h-5"
          }, null, _parent));
          _push2(`</button></div><div class="bg-black/40 select-none" style="${ssrRenderStyle({
            position: "relative",
            overflow: "hidden",
            cursor: unref(isDragging) ? "grabbing" : "grab",
            aspectRatio: unref(cropMode) === "avatar" ? "1 / 1 !important" : "3 / 1 !important",
            width: "100%"
          })}"><img${ssrRenderAttr("src", unref(cropImageUrl))} draggable="false" style="${ssrRenderStyle({
            position: "absolute",
            left: unref(cropOffset).x + "px",
            top: unref(cropOffset).y + "px",
            transform: `scale(${unref(cropZoom)})`,
            transformOrigin: "0 0",
            maxWidth: "none",
            pointerEvents: "none",
            userSelect: "none"
          })}"><div class="absolute inset-0 pointer-events-none" style="${ssrRenderStyle({
            boxShadow: "inset 0 0 0 9999px rgba(0,0,0,0.5)",
            border: "2px solid rgba(99,102,241,0.8)",
            borderRadius: unref(cropMode) === "avatar" ? "50%" : "0"
          })}"></div></div><div class="p-4 flex items-center justify-between gap-2"><div class="flex items-center gap-1"><button class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition" title="\u7E2E\u5C0F">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:zoom-out",
            class: "w-4 h-4"
          }, null, _parent));
          _push2(`</button><span class="text-xs text-slate-500 w-10 text-center">${ssrInterpolate(Math.round(unref(cropZoom) * 100))}%</span><button class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition" title="\u62E1\u5927">`);
          _push2(ssrRenderComponent(_component_Icon, {
            name: "lucide:zoom-in",
            class: "w-4 h-4"
          }, null, _parent));
          _push2(`</button></div><div class="flex items-center gap-2"><button class="px-4 py-2 text-sm text-slate-400 hover:text-white transition"> \u30AD\u30E3\u30F3\u30BB\u30EB </button><button class="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition"> \u9069\u7528 </button></div></div></div></div>`);
        } else _push2(`<!---->`);
      }, "body", false, _parent);
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

export { SettingsModal_default as S };
//# sourceMappingURL=SettingsModal-CJkZ5C_m.mjs.map
