import { _ as _plugin_vue_export_helper_default, m as useState, c as components_default, $ as $fetch$1 } from '../virtual/entry.mjs';
import { N as NuxtLink } from './nuxt-link-DHTgvg7C.mjs';
import { U as UserBadges_default, a as UserTitle_default } from './UserTitle-CTUBxh5l.mjs';
import { a as avatarSrc } from './avatar-BGDIRQ_Q.mjs';
import { u as useCustomEmojis, r as renderRichText } from './richText-C23QsgTl.mjs';
import { u as useQuoteComposer, E as EmojiIcon_default, R as ReactionPicker_default } from './useQuoteComposer-aC9wgnjC.mjs';
import { P as PostAttachments_default } from './useInfiniteScroll-pgXZQZjZ.mjs';
import { u as usePlaylists } from './usePlaylists-B3RYj2Xy.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, unref, openBlock, createBlock, createCommentVNode, createVNode, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';

var QuotedPostCard_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "QuotedPostCard",
  __ssrInlineRender: true,
  props: { post: {} },
  emits: ["open"],
  setup(__props, { emit: __emit }) {
    const { map: customEmojiMap } = useCustomEmojis();
    const props = __props;
    function timeAgo(date) {
      if (!date) return "";
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 1) return "\u305F\u3063\u305F\u4ECA";
      if (minutes < 60) return `${minutes}\u5206\u524D`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}\u6642\u9593\u524D`;
      return `${Math.floor(hours / 24)}\u65E5\u524D`;
    }
    const previewAtts = computed(() => {
      var _a;
      return (((_a = props.post) == null ? void 0 : _a.attachments) || []).slice(0, 4);
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_Icon = components_default;
      if (__props.post) {
        _push(`<button${ssrRenderAttrs(mergeProps({
          type: "button",
          class: "w-full text-left rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-600 transition p-3 flex flex-col gap-2 overflow-hidden"
        }, _attrs))}>`);
        if (__props.post.deleted) _push(`<div class="text-sm text-slate-500 py-2 text-center">\u3053\u306E\u30DD\u30B9\u30C8\u306F\u524A\u9664\u3055\u308C\u307E\u3057\u305F</div>`);
        else {
          _push(`<!--[--><div class="flex items-center gap-2 min-w-0">`);
          if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a = __props.post.user) == null ? void 0 : _a.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(__props.post.user.avatarUrl))} loading="lazy" class="w-5 h-5 rounded-full object-cover shrink-0">`);
          else _push(`<div class="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">${ssrInterpolate((((_b = __props.post.user) == null ? void 0 : _b.displayName) || "?").charAt(0))}</div>`);
          _push(`<span class="font-bold text-slate-200 text-sm truncate">${ssrInterpolate(((_c = __props.post.user) == null ? void 0 : _c.displayName) || "\u4E0D\u660E")}</span><span class="text-slate-500 text-xs truncate">@${ssrInterpolate((_d = __props.post.user) == null ? void 0 : _d.username)} \xB7 ${ssrInterpolate(timeAgo(__props.post.createdAt))}</span></div>`);
          if (__props.post.content) _push(`<p class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-6">${(_e = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(__props.post.content, { custom: unref(customEmojiMap) })) != null ? _e : ""}</p>`);
          else _push(`<!---->`);
          if (unref(previewAtts).length) {
            _push(`<div class="flex gap-1 flex-wrap"><!--[-->`);
            ssrRenderList(unref(previewAtts).filter((x) => String(x.mime || "").startsWith("image/")), (a) => {
              _push(`<img${ssrRenderAttr("src", a.url)} loading="lazy" class="w-14 h-14 rounded-lg object-cover">`);
            });
            _push(`<!--]-->`);
            if (unref(previewAtts).some((a) => !String(a.mime || "").startsWith("image/"))) {
              _push(`<span class="flex items-center gap-1 text-xs text-slate-500 px-2 py-1 rounded-lg bg-slate-800/60">`);
              _push(ssrRenderComponent(_component_Icon, {
                name: "lucide:paperclip",
                class: "w-3.5 h-3.5"
              }, null, _parent));
              _push(` ${ssrInterpolate(unref(previewAtts).filter((a) => !String(a.mime || "").startsWith("image/")).length)} \u30D5\u30A1\u30A4\u30EB </span>`);
            } else _push(`<!---->`);
            _push(`</div>`);
          } else _push(`<!---->`);
          _push(`<!--]-->`);
        }
        _push(`</button>`);
      } else _push(`<!---->`);
    };
  }
});
var _sfc_setup$1 = QuotedPostCard_vue_vue_type_script_setup_true_lang_default.setup;
QuotedPostCard_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/QuotedPostCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var QuotedPostCard_default = Object.assign(QuotedPostCard_vue_vue_type_script_setup_true_lang_default, { __name: "QuotedPostCard" });
var PostItem_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "PostItem",
  __ssrInlineRender: true,
  props: {
    post: {},
    showViewCount: { type: Boolean },
    currentUserId: {}
  },
  emits: [
    "toggleRepost",
    "toggleBookmark",
    "quotePost",
    "delete",
    "report",
    "openMedia"
  ],
  setup(__props, { emit: __emit }) {
    const { map: customEmojiMap } = useCustomEmojis();
    const props = __props;
    const emit = __emit;
    const showMenu = ref(false);
    const showRepostMenu = ref(false);
    const rootEl = ref(null);
    usePlaylists();
    const me = useState("current-user", () => null);
    useQuoteComposer();
    const myId = computed(() => {
      var _a;
      return props.currentUserId || ((_a = me.value) == null ? void 0 : _a.id);
    });
    function openMedia() {
      emit("openMedia", props.post);
    }
    function timeAgo(date) {
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 1) return "\u305F\u3063\u305F\u4ECA";
      if (minutes < 60) return `${minutes}\u5206\u524D`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}\u6642\u9593\u524D`;
      return `${Math.floor(hours / 24)}\u65E5\u524D`;
    }
    const isMine = computed(() => myId.value === props.post.user.id);
    function applyReactionDelta(emoji, userId, active, isMe) {
      var _a;
      const reactions = [...props.post.reactions || []];
      let group = reactions.find((r) => r.emoji === emoji);
      if (active) {
        if (!group) {
          group = {
            emoji,
            count: 0,
            mine: false,
            users: []
          };
          reactions.push(group);
        }
        if (!((_a = group.users) == null ? void 0 : _a.some((u) => u.id === userId))) {
          group.count += 1;
          group.users = [...group.users || [], { id: userId }];
        }
        group.mine = true;
      } else if (group) {
        group.count = Math.max(0, group.count - 1);
        group.users = (group.users || []).filter((u) => u.id !== userId);
        group.mine = false;
        if (group.count === 0) {
          const idx = reactions.indexOf(group);
          if (idx >= 0) reactions.splice(idx, 1);
        }
      }
      props.post.reactions = [...reactions];
    }
    async function toggleReaction(emoji) {
      try {
        const res = await $fetch$1(`/api/posts/${props.post.id}/reactions`, {
          method: "POST",
          body: { emoji }
        });
        const uid = myId.value;
        if (uid) applyReactionDelta(emoji, uid, res.active, true);
        else applyReactionDelta(emoji, "me", res.active, true);
      } catch {
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_Icon = components_default;
      const _component_NuxtLink = NuxtLink;
      const _component_UserBadges = UserBadges_default;
      const _component_UserTitle = UserTitle_default;
      const _component_PostAttachments = PostAttachments_default;
      const _component_QuotedPostCard = QuotedPostCard_default;
      const _component_EmojiIcon = EmojiIcon_default;
      const _component_ReactionPicker = ReactionPicker_default;
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "rootEl",
        ref: rootEl,
        class: "py-4 px-3 border-b border-slate-800 last:border-b-0 hover:bg-slate-800/30 transition"
      }, _attrs))} data-v-11dc6c2a>`);
      if (__props.post.boostedBy) {
        _push(`<div class="flex items-center gap-1.5 mb-1 text-sm text-green-400" data-v-11dc6c2a>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:repeat-2",
          class: "w-3.5 h-3.5"
        }, null, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/profile/@${((_a = __props.post.boostedBy.user) == null ? void 0 : _a.username) || ""}`,
          class: "hover:underline truncate"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) if (__props.post.boostedBy.user) {
              _push2(`<span class="flex items-center gap-1" data-v-11dc6c2a${_scopeId}>`);
              if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(__props.post.boostedBy.user.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(__props.post.boostedBy.user.avatarUrl))} loading="lazy" class="w-4 h-4 rounded-full object-cover" data-v-11dc6c2a${_scopeId}>`);
              else _push2(`<!---->`);
              _push2(`<span class="font-bold" data-v-11dc6c2a${_scopeId}>${ssrInterpolate(__props.post.boostedBy.user.displayName)}</span></span>`);
            } else _push2(`<!---->`);
            else return [__props.post.boostedBy.user ? (openBlock(), createBlock("span", {
              key: 0,
              class: "flex items-center gap-1"
            }, [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(__props.post.boostedBy.user.avatarUrl) ? (openBlock(), createBlock("img", {
              key: 0,
              src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(__props.post.boostedBy.user.avatarUrl),
              loading: "lazy",
              class: "w-4 h-4 rounded-full object-cover"
            }, null, 8, ["src"])) : createCommentVNode("", true), createVNode("span", { class: "font-bold" }, toDisplayString(__props.post.boostedBy.user.displayName), 1)])) : createCommentVNode("", true)];
          }),
          _: 1
        }, _parent));
        _push(`<span class="text-slate-500 text-xs" data-v-11dc6c2a>\u304C\u30EA\u30DD\u30B9\u30C8 \xB7 ${ssrInterpolate(timeAgo(__props.post.boostedBy.repostedAt || __props.post.createdAt))}</span></div>`);
      } else _push(`<!---->`);
      _push(`<div class="flex gap-3" data-v-11dc6c2a>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/profile/@${__props.post.user.username}`,
        class: "shrink-0"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(__props.post.user.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(__props.post.user.avatarUrl))} loading="lazy" class="w-10 h-10 rounded-full object-cover" data-v-11dc6c2a${_scopeId}>`);
          else _push2(`<div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm" data-v-11dc6c2a${_scopeId}>${ssrInterpolate(__props.post.user.displayName.charAt(0))}</div>`);
          else return [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(__props.post.user.avatarUrl) ? (openBlock(), createBlock("img", {
            key: 0,
            src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(__props.post.user.avatarUrl),
            loading: "lazy",
            class: "w-10 h-10 rounded-full object-cover"
          }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
            key: 1,
            class: "w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm"
          }, toDisplayString(__props.post.user.displayName.charAt(0)), 1))];
        }),
        _: 1
      }, _parent));
      _push(`<div class="flex-1 min-w-0" data-v-11dc6c2a><div class="flex items-center gap-2 mb-1" data-v-11dc6c2a>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/profile/@${__props.post.user.username}`,
        class: "font-bold text-white hover:underline truncate"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) _push2(`${ssrInterpolate(__props.post.user.displayName)}`);
          else return [createTextVNode(toDisplayString(__props.post.user.displayName), 1)];
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_UserBadges, { badges: __props.post.user.badges }, null, _parent));
      _push(ssrRenderComponent(_component_UserTitle, { title: __props.post.user.title }, null, _parent));
      _push(`<span class="text-slate-500 text-sm shrink-0" data-v-11dc6c2a>@${ssrInterpolate(__props.post.user.username)} \xB7 ${ssrInterpolate(timeAgo(__props.post.createdAt))}</span><div class="relative ml-auto" data-v-11dc6c2a><button class="p-1 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition" data-v-11dc6c2a>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:ellipsis",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button>`);
      if (unref(showMenu)) _push(`<div class="fixed inset-0 z-40" data-v-11dc6c2a></div>`);
      else _push(`<!---->`);
      if (unref(showMenu)) {
        _push(`<div class="absolute top-full right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl z-50 min-w-40" data-v-11dc6c2a><div class="px-4 py-1.5 text-xs text-slate-500 border-b border-slate-800" data-v-11dc6c2a> \u95B2\u89A7\u6570 ${ssrInterpolate(__props.post.viewCount || 0)}</div><div class="px-4 py-1.5 text-xs text-slate-500" data-v-11dc6c2a> \u516C\u958B\u7BC4\u56F2: ${ssrInterpolate({
          public: "\u516C\u958B",
          followers: "\u30D5\u30A9\u30ED\u30EF\u30FC",
          close_friends: "\u89AA\u3057\u3044\u53CB\u9054",
          specific: "\u7279\u5B9A\u306E\u4EBA"
        }[__props.post.visibility || "public"])}</div><hr class="border-slate-800 my-1" data-v-11dc6c2a><button class="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/30 transition flex items-center gap-2" data-v-11dc6c2a>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:list-video",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` \u30D7\u30EC\u30A4\u30EA\u30B9\u30C8\u306B\u8FFD\u52A0 </button><button class="w-full text-left px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/30 transition" data-v-11dc6c2a> \u5831\u544A </button>`);
        if (unref(isMine)) _push(`<button class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800/30 transition" data-v-11dc6c2a> \u524A\u9664 </button>`);
        else _push(`<!---->`);
        _push(`</div>`);
      } else _push(`<!---->`);
      _push(`</div></div><p class="text-slate-200 leading-relaxed whitespace-pre-wrap break-words cursor-pointer" data-v-11dc6c2a>${(_b = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(__props.post.content, { custom: unref(customEmojiMap) })) != null ? _b : ""}</p>`);
      if ((_c = __props.post.attachments) == null ? void 0 : _c.length) _push(ssrRenderComponent(_component_PostAttachments, {
        attachments: __props.post.attachments,
        "post-id": __props.post.id,
        interactive: "",
        "image-lightbox": "",
        onOpen: openMedia
      }, null, _parent));
      else _push(`<!---->`);
      if (__props.post.quotedPost) _push(ssrRenderComponent(_component_QuotedPostCard, {
        post: __props.post.quotedPost,
        class: "mt-2",
        onOpen: ($event) => emit("openMedia", __props.post.quotedPost)
      }, null, _parent));
      else _push(`<!---->`);
      _push(`<div class="flex items-center gap-4 mt-3 text-slate-500" data-v-11dc6c2a><div class="relative" data-v-11dc6c2a><button class="${ssrRenderClass([__props.post.reposted ? "text-green-400" : "hover:text-green-400", "flex items-center gap-1.5 transition text-sm"])}" data-v-11dc6c2a>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:repeat-2",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`<span data-v-11dc6c2a>${ssrInterpolate(__props.post.repostCount || 0)}</span></button>`);
      if (unref(showRepostMenu)) _push(`<div class="fixed inset-0 z-40" data-v-11dc6c2a></div>`);
      else _push(`<!---->`);
      if (unref(showRepostMenu)) {
        _push(`<div class="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl py-1.5 shadow-xl z-50 min-w-44" data-v-11dc6c2a><button class="${ssrRenderClass([__props.post.reposted ? "text-green-400" : "text-slate-300 hover:text-white hover:bg-slate-800/30", "w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition"])}" data-v-11dc6c2a>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:repeat-2",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` ${ssrInterpolate(__props.post.reposted ? "\u30EA\u30DD\u30B9\u30C8\u3092\u53D6\u308A\u6D88\u3057" : "\u30EA\u30DD\u30B9\u30C8")}</button><button class="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800/30 transition" data-v-11dc6c2a>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:message-square-quote",
          class: "w-4 h-4"
        }, null, _parent));
        _push(` \u5F15\u7528\u30EA\u30DD\u30B9\u30C8 </button></div>`);
      } else _push(`<!---->`);
      _push(`</div><button class="flex items-center gap-1.5 transition text-sm hover:text-indigo-400" data-v-11dc6c2a>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:message-circle",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`<span data-v-11dc6c2a>${ssrInterpolate(__props.post.commentCount || 0)}</span></button><button class="${ssrRenderClass([__props.post.bookmarked ? "text-amber-400" : "hover:text-amber-400", "flex items-center gap-1.5 transition text-sm"])}" data-v-11dc6c2a><svg viewBox="0 0 24 24" class="${ssrRenderClass([__props.post.bookmarked ? "fill-amber-400 stroke-amber-400" : "stroke-current fill-none", "w-4 h-4"])}" data-v-11dc6c2a><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" data-v-11dc6c2a></path></svg></button>`);
      if (__props.showViewCount) {
        _push(`<span class="flex items-center gap-1 text-xs text-slate-600 ml-auto" data-v-11dc6c2a>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:eye",
          class: "w-3.5 h-3.5"
        }, null, _parent));
        _push(` ${ssrInterpolate(__props.post.viewCount || 0)}</span>`);
      } else _push(`<!---->`);
      _push(`</div><div class="flex flex-wrap items-center gap-1.5 mt-2" data-v-11dc6c2a><!--[-->`);
      ssrRenderList(__props.post.reactions || [], (r) => {
        _push(`<button class="${ssrRenderClass([r.mine ? "bg-indigo-600/25 border-indigo-500/50 text-indigo-200" : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500", "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition"])}"${ssrRenderAttr("title", (r.users || []).map((u) => u.displayName || "").filter(Boolean).join(", "))} data-v-11dc6c2a>`);
        _push(ssrRenderComponent(_component_EmojiIcon, {
          emoji: r.emoji,
          size: "sm"
        }, null, _parent));
        _push(`<span data-v-11dc6c2a>${ssrInterpolate(r.count)}</span></button>`);
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(_component_ReactionPicker, { onSelect: toggleReaction }, null, _parent));
      _push(`</div></div></div></div>`);
    };
  }
});
var _sfc_setup = PostItem_vue_vue_type_script_setup_true_lang_default.setup;
PostItem_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PostItem.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PostItem_default = /* @__PURE__ */ Object.assign(_plugin_vue_export_helper_default(PostItem_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-11dc6c2a"]]), { __name: "PostItem" });

export { PostItem_default as P, QuotedPostCard_default as Q };
//# sourceMappingURL=PostItem-B40v-dca.mjs.map
