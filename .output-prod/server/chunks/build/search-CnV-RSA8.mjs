import { a as useRoute, g as useRouter, c as components_default, $ as $fetch$1 } from '../virtual/entry.mjs';
import { N as NuxtLink } from './nuxt-link-1Qo3YrhL.mjs';
import { U as UserBadges_default } from './UserBadges-BDdpg7rV.mjs';
import { a as avatarSrc } from './avatar-Dl3G3V3K.mjs';
import { U as UserTitle_default } from './UserTitle-CX959JWB.mjs';
import { u as useCustomEmojis, r as renderRichText } from './richText-ohg8QsVE.mjs';
import { u as useMediaPane } from './useMediaPane-Dnqhkp4f.mjs';
import { u as useScrollCompact } from './useScrollCompact-j_xEyUxM.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createVNode, toDisplayString, openBlock, createBlock, createTextVNode, createCommentVNode, Fragment, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import 'nostics';
import 'nostics/formatters/ansi';
import '../nitro/nitro.mjs';
import 'crypto';
import 'drizzle-orm';
import 'jose';
import 'bcryptjs';
import 'fs';
import 'fs/promises';
import 'path';
import 'sharp';
import 'opentype.js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import 'node:url';
import '@iconify/utils';
import 'consola';
import 'vue-router';
import 'unhead/utils';
import '../routes/renderer.mjs';
import 'unhead/server';
import 'unhead/legacy';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import 'perfect-debounce';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';

var PAGE = 8;
var MediaReelFeed_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "MediaReelFeed",
  __ssrInlineRender: true,
  props: {
    media: { default: "" },
    sort: { default: "random" }
  },
  setup(__props) {
    const { map: customEmojiMap } = useCustomEmojis();
    useMediaPane();
    useScrollCompact();
    const props = __props;
    const posts = ref([]);
    const seen = ref([]);
    const loading = ref(false);
    const exhausted = ref(false);
    const scroller = ref(null);
    const visibleIndex = ref(0);
    function firstAttachment(post) {
      var _a;
      return ((_a = post == null ? void 0 : post.attachments) == null ? void 0 : _a[0]) || null;
    }
    function kindOf(post) {
      const a = firstAttachment(post);
      const mime = String((a == null ? void 0 : a.mime) || (a == null ? void 0 : a.type) || "");
      if (mime.startsWith("video") || /\.(mp4|webm|mov)(\?|$)/i.test(String((a == null ? void 0 : a.url) || ""))) return "video";
      if (mime.startsWith("audio") || /\.(mp3|wav|ogg|m4a|flac)(\?|$)/i.test(String((a == null ? void 0 : a.url) || ""))) return "audio";
      if (/\.(glb|gltf|obj|fbx|stl|3ds)(\?|$)/i.test(String((a == null ? void 0 : a.url) || ""))) return "model";
      if (mime.startsWith("image") || /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(String((a == null ? void 0 : a.url) || ""))) return "image";
      return "file";
    }
    async function loadMore() {
      if (loading.value || exhausted.value) return;
      loading.value = true;
      try {
        const incoming = ((await $fetch$1("/api/explore/media", { params: {
          limit: PAGE,
          exclude: seen.value.join(","),
          media: props.media || void 0,
          sort: props.sort
        } })).posts || []).filter((p) => !seen.value.includes(p.id));
        if (!incoming.length) {
          exhausted.value = true;
          return;
        }
        for (const p of incoming) seen.value.push(p.id);
        posts.value = [...posts.value, ...incoming];
      } catch {
        exhausted.value = true;
      } finally {
        loading.value = false;
      }
    }
    watch(() => [props.media, props.sort], () => {
      posts.value = [];
      seen.value = [];
      exhausted.value = false;
      if (scroller.value) scroller.value.scrollTop = 0;
      visibleIndex.value = 0;
      loadMore();
    });
    function shouldPlay(idx) {
      return visibleIndex.value === idx;
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
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = components_default;
      const _component_NuxtLink = NuxtLink;
      _push(`<div${ssrRenderAttrs(mergeProps({
        ref_key: "scroller",
        ref: scroller,
        class: "h-full overflow-y-scroll snap-y snap-mandatory overscroll-contain"
      }, _attrs))}>`);
      if (unref(posts).length) {
        _push(`<!--[-->`);
        ssrRenderList(unref(posts), (post, i) => {
          var _a, _b, _c, _d, _e;
          _push(`<section class="snap-start snap-always relative w-full h-full overflow-hidden bg-black">`);
          if (kindOf(post) === "image") _push(`<img${ssrRenderAttr("src", (_a = firstAttachment(post)) == null ? void 0 : _a.url)} class="w-full h-full object-cover" alt="" loading="lazy">`);
          else if (kindOf(post) === "video") _push(`<video${ssrRenderAttr("src", (_b = firstAttachment(post)) == null ? void 0 : _b.url)} class="w-full h-full object-contain"${ssrIncludeBooleanAttr(shouldPlay(i)) ? " autoplay" : ""}${ssrIncludeBooleanAttr(true) ? " loop" : ""}${ssrIncludeBooleanAttr(true) ? " muted" : ""}${ssrRenderAttr("playsinline", true)} preload="metadata"></video>`);
          else if (kindOf(post) === "audio") {
            _push(`<div class="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-indigo-950 via-black to-fuchsia-950"><div class="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center backdrop-blur">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:music-4",
              class: "w-10 h-10 text-white/80"
            }, null, _parent));
            _push(`</div><audio${ssrRenderAttr("src", (_c = firstAttachment(post)) == null ? void 0 : _c.url)} controls class="w-[85%] max-w-sm" preload="metadata"></audio></div>`);
          } else {
            _push(`<div class="w-full h-full flex flex-col items-center justify-center gap-4 bg-surface"><div class="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: kindOf(post) === "model" ? "lucide:box" : "lucide:file",
              class: "w-9 h-9 text-on-surface-variant"
            }, null, _parent));
            _push(`</div><p class="text-sm text-on-surface-variant">\u30BF\u30C3\u30D7\u3057\u3066\u958B\u304D\u307E\u3059</p></div>`);
          }
          _push(`<div class="absolute inset-x-0 bottom-0 p-4 pb-[calc(1rem+var(--app-footer-h))] pt-16 bg-gradient-to-t from-black/85 via-black/45 to-transparent"><div class="flex items-center gap-2 mb-1.5">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/profile/@${(_d = post.user) == null ? void 0 : _d.username}`,
            class: "flex items-center gap-2 min-w-0"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a2, _b2, _c2, _d2, _e2, _f, _g, _h;
              if (_push2) {
                if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = post.user) == null ? void 0 : _a2.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(post.user.avatarUrl))} class="w-7 h-7 rounded-full object-cover ring-1 ring-white/30" alt=""${_scopeId}>`);
                else _push2(`<div class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold"${_scopeId}>${ssrInterpolate(((_c2 = (_b2 = post.user) == null ? void 0 : _b2.displayName) == null ? void 0 : _c2.charAt(0)) || "?")}</div>`);
                _push2(`<span class="text-sm font-bold text-white truncate"${_scopeId}>${ssrInterpolate(((_d2 = post.user) == null ? void 0 : _d2.displayName) || "\u4E0D\u660E")}</span>`);
              } else return [("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_e2 = post.user) == null ? void 0 : _e2.avatarUrl) ? (openBlock(), createBlock("img", {
                key: 0,
                src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(post.user.avatarUrl),
                class: "w-7 h-7 rounded-full object-cover ring-1 ring-white/30",
                alt: ""
              }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold"
              }, toDisplayString(((_g = (_f = post.user) == null ? void 0 : _f.displayName) == null ? void 0 : _g.charAt(0)) || "?"), 1)), createVNode("span", { class: "text-sm font-bold text-white truncate" }, toDisplayString(((_h = post.user) == null ? void 0 : _h.displayName) || "\u4E0D\u660E"), 1)];
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-xs text-white/60 shrink-0">${ssrInterpolate(timeAgo(post.createdAt))}</span></div>`);
          if (post.content) _push(`<p class="text-sm text-white/90 leading-relaxed line-clamp-3 break-words">${(_e = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(post.content, { custom: unref(customEmojiMap) })) != null ? _e : ""}</p>`);
          else _push(`<!---->`);
          _push(`<button class="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold text-white hover:bg-white/25 transition">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:maximize-2",
            class: "w-3.5 h-3.5"
          }, null, _parent));
          _push(` \u8A73\u7D30\u3092\u958B\u304F </button></div></section>`);
        });
        _push(`<!--]-->`);
      } else if (unref(loading)) {
        _push(`<div class="h-full flex items-center justify-center">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:loader-2",
          class: "w-6 h-6 text-white/60 animate-spin"
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="h-full flex flex-col items-center justify-center gap-2 px-8 text-center"><div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:clapperboard",
          class: "w-6 h-6 text-white/70"
        }, null, _parent));
        _push(`</div><p class="font-bold text-white">\u30EA\u30FC\u30EB\u306E\u6295\u7A3F\u304C\u3042\u308A\u307E\u305B\u3093</p><p class="text-sm text-white/60">\u753B\u50CF\u30FB\u52D5\u753B\u30FB\u97F3\u697D\u3092\u6DFB\u4ED8\u3057\u305F\u6295\u7A3F\u304C\u3053\u3053\u306B\u6D41\u308C\u3066\u304D\u307E\u3059</p></div>`);
      }
      if (unref(posts).length && unref(loading)) {
        _push(`<div class="h-16 flex items-center justify-center">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:loader-2",
          class: "w-5 h-5 text-white/50 animate-spin"
        }, null, _parent));
        _push(`</div>`);
      } else if (unref(posts).length && unref(exhausted)) _push(`<p class="h-16 flex items-center justify-center text-xs text-white/40"> \u3059\u3079\u3066\u306E\u30EA\u30FC\u30EB\u3092\u8868\u793A\u3057\u307E\u3057\u305F </p>`);
      else _push(`<!---->`);
      _push(`</div>`);
    };
  }
});
var _sfc_setup$1 = MediaReelFeed_vue_vue_type_script_setup_true_lang_default.setup;
MediaReelFeed_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/MediaReelFeed.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
var MediaReelFeed_default = Object.assign(MediaReelFeed_vue_vue_type_script_setup_true_lang_default, { __name: "MediaReelFeed" });
var search_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  __name: "search",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    useRouter();
    useMediaPane();
    const { map: customEmojiMap } = useCustomEmojis();
    const queryStr = ref(String(route.query.q || ""));
    const tab = ref(String(route.query.type || "all"));
    const results = ref({
      users: [],
      posts: [],
      servers: [],
      hashtags: []
    });
    const loading = ref(false);
    const error = ref("");
    const searched = ref(false);
    const GENRES = [
      {
        value: "",
        label: "\u3059\u3079\u3066",
        icon: "lucide:layers"
      },
      {
        value: "image",
        label: "\u753B\u50CF",
        icon: "lucide:image"
      },
      {
        value: "video",
        label: "\u52D5\u753B",
        icon: "lucide:clapperboard"
      },
      {
        value: "audio",
        label: "\u97F3\u697D",
        icon: "lucide:music-4"
      },
      {
        value: "model",
        label: "3D",
        icon: "lucide:box"
      }
    ];
    const SORTS = [
      {
        value: "relevance",
        label: "\u95A2\u9023\u5EA6",
        icon: "lucide:sparkles"
      },
      {
        value: "new",
        label: "\u65B0\u3057\u3044\u9806",
        icon: "lucide:arrow-down-narrow-wide"
      },
      {
        value: "old",
        label: "\u53E4\u3044\u9806",
        icon: "lucide:arrow-up-narrow-wide"
      },
      {
        value: "popular",
        label: "\u4EBA\u6C17\u9806",
        icon: "lucide:flame"
      }
    ];
    const PERIODS = [
      {
        value: "",
        label: "\u3059\u3079\u3066\u306E\u671F\u9593"
      },
      {
        value: "day",
        label: "\u4ECA\u65E5"
      },
      {
        value: "week",
        label: "\u904E\u53BB1\u9031\u9593"
      },
      {
        value: "month",
        label: "\u904E\u53BB1\u304B\u6708"
      },
      {
        value: "year",
        label: "\u904E\u53BB1\u5E74"
      }
    ];
    const media = ref(route.query.media || "");
    const sort = ref(String(route.query.sort || "relevance"));
    const since = ref(String(route.query.since || ""));
    const filtersOpen = ref(false);
    const advancedOpen = ref(false);
    const activeFilterCount = computed(() => (media.value ? 1 : 0) + (sort.value !== "relevance" ? 1 : 0) + (since.value ? 1 : 0));
    const { compact} = useScrollCompact();
    ref(null);
    ref(null);
    ref(null);
    const isReelMode = computed(() => !queryStr.value.trim());
    const tabs = [
      {
        key: "all",
        label: "\u3059\u3079\u3066",
        icon: "lucide:layout-grid"
      },
      {
        key: "posts",
        label: "\u6295\u7A3F",
        icon: "lucide:message-square"
      },
      {
        key: "users",
        label: "\u30E6\u30FC\u30B6\u30FC",
        icon: "lucide:users"
      },
      {
        key: "hashtags",
        label: "\u30BF\u30B0",
        icon: "lucide:hash"
      },
      {
        key: "servers",
        label: "\u30B5\u30FC\u30D0\u30FC",
        icon: "lucide:server"
      }
    ];
    const isTagQuery = computed(() => /^#[A-Za-z0-9_\u3040-\u30FF]{1,20}$/.test(queryStr.value.trim()));
    const visibleTabs = computed(() => isTagQuery.value ? tabs.filter((t) => t.key === "hashtags") : tabs);
    const counts = computed(() => ({
      posts: results.value.posts.length,
      users: results.value.users.length,
      servers: results.value.servers.length,
      hashtags: results.value.hashtags.length
    }));
    const totalCount = computed(() => counts.value.posts + counts.value.users + counts.value.servers + counts.value.hashtags);
    function tagHref(tag) {
      return "/hashtag/" + encodeURIComponent(tag);
    }
    async function runSearch(silent = false) {
      var _a;
      const q = queryStr.value.trim();
      if (!q) {
        results.value = {
          users: [],
          posts: [],
          servers: [],
          hashtags: []
        };
        searched.value = false;
        return;
      }
      if (!silent) loading.value = true;
      error.value = "";
      try {
        const data = await $fetch$1("/api/search", { params: {
          q,
          type: tab.value === "all" ? "all" : tab.value,
          media: media.value || void 0,
          sort: sort.value !== "relevance" ? sort.value : void 0,
          since: since.value || void 0
        } });
        results.value = data;
        searched.value = true;
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u691C\u7D22\u306B\u5931\u6557\u3057\u307E\u3057\u305F";
      } finally {
        if (!silent) loading.value = false;
      }
    }
    ref(null);
    function timeAgo(date) {
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 6e4);
      if (minutes < 1) return "\u305F\u3063\u305F\u4ECA";
      if (minutes < 60) return `${minutes}\u5206\u524D`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}\u6642\u9593\u524D`;
      return `${Math.floor(hours / 24)}\u65E5\u524D`;
    }
    let debounceTimer = null;
    watch(queryStr, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        runSearch(true);
      }, 400);
    });
    const examples = [
      {
        q: "#\u30B2\u30FC\u30E0",
        icon: "lucide:hash"
      },
      {
        q: "\u304A\u77E5\u3089\u305B",
        icon: "lucide:megaphone"
      },
      {
        q: "\u753B\u50CF",
        icon: "lucide:image"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_Icon = components_default;
      const _component_MediaReelFeed = MediaReelFeed_default;
      const _component_NuxtLink = NuxtLink;
      const _component_UserBadges = UserBadges_default;
      const _component_UserTitle = UserTitle_default;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "h-full flex flex-col" }, _attrs))}><div class="${ssrRenderClass([unref(compact) ? "bg-surface/70 backdrop-blur-xl border-outline-variant/30" : "bg-surface/95 backdrop-blur-md border-outline-variant", "sticky top-0 z-30 shrink-0 border-b transition-colors duration-300"])}"><form class="${ssrRenderClass([unref(compact) ? "py-1.5" : "py-3", "flex items-stretch gap-2 px-3 transition-all duration-300"])}"><div class="${ssrRenderClass([unref(compact) ? "h-10 px-3" : "h-14 px-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.35)]", "relative flex-1 min-w-0 flex items-center gap-2.5 rounded-2xl bg-surface-container/70 border transition-all duration-300 select-none"])}">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:search",
        class: ["shrink-0 text-on-surface-variant", unref(compact) ? "w-4 h-4" : "w-5 h-5"]
      }, null, _parent));
      _push(`<input${ssrRenderAttr("value", unref(queryStr))} type="search" placeholder="\u691C\u7D22..." class="${ssrRenderClass([unref(compact) ? "text-sm" : "text-base", "flex-1 min-w-0 bg-transparent text-on-surface placeholder-on-surface-variant focus:outline-none transition-all"])}">`);
      if (unref(queryStr)) {
        _push(`<button type="button" class="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-on-surface/10 text-on-surface-variant hover:text-on-surface hover:bg-on-surface/20 transition" title="\u30AF\u30EA\u30A2">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:x",
          class: "w-3.5 h-3.5"
        }, null, _parent));
        _push(`</button>`);
      } else _push(`<!---->`);
      if (!unref(compact)) _push(`<span class="hidden min-[681px]:flex items-center gap-1 shrink-0 text-[10px] text-on-surface-variant/70 border border-outline-variant rounded px-1.5 py-0.5">\u9577\u62BC\u3057\u3067\u8A73\u7D30</span>`);
      else _push(`<!---->`);
      _push(`</div><button type="button" class="${ssrRenderClass([unref(compact) ? "w-12 h-10" : "w-14 h-14", "relative shrink-0 rounded-2xl bg-surface-container/70 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface transition-all duration-300 flex flex-col items-center justify-center gap-0.5"])}"${ssrRenderAttr("aria-expanded", unref(filtersOpen))} title="\u30D5\u30A3\u30EB\u30BF\u30FC">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:sliders-horizontal",
        class: unref(compact) ? "w-4 h-4" : "w-5 h-5"
      }, null, _parent));
      if (!unref(compact)) _push(`<span class="text-[9px] font-bold leading-none">\u30D5\u30A3\u30EB\u30BF</span>`);
      else _push(`<!---->`);
      if (unref(activeFilterCount)) _push(`<span class="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface">${ssrInterpolate(unref(activeFilterCount))}</span>`);
      else _push(`<!---->`);
      _push(`</button></form><div class="${ssrRenderClass([unref(filtersOpen) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0", "grid transition-[grid-template-rows,opacity] duration-300 ease-out"])}"><div class="overflow-hidden"><div class="px-3 pb-3"><p class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">\u30B8\u30E3\u30F3\u30EB</p><div class="flex flex-wrap gap-1.5"><!--[-->`);
      ssrRenderList(GENRES, (g) => {
        _push(`<button type="button" class="${ssrRenderClass([unref(media) === g.value ? "bg-indigo-600 text-white shadow-sm" : "bg-surface-container text-on-surface-variant hover:text-on-surface", "flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold transition"])}">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: g.icon,
          class: "w-4 h-4 shrink-0"
        }, null, _parent));
        _push(` ${ssrInterpolate(g.label)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(activeFilterCount)) {
        _push(`<button type="button" class="mt-3 flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-on-surface transition">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: "lucide:rotate-ccw",
          class: "w-3.5 h-3.5"
        }, null, _parent));
        _push(` \u30D5\u30A3\u30EB\u30BF\u30FC\u3092\u30EA\u30BB\u30C3\u30C8 </button>`);
      } else _push(`<!---->`);
      _push(`</div></div></div><div class="${ssrRenderClass([unref(advancedOpen) ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0", "grid transition-[grid-template-rows,opacity] duration-300 ease-out"])}"><div class="overflow-hidden"><div class="px-3 pb-3 space-y-3"><div class="flex items-center justify-between"><p class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">\u8A73\u7D30\u30D5\u30A3\u30EB\u30BF\u30FC</p><button type="button" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface transition" title="\u9589\u3058\u308B">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "lucide:x",
        class: "w-4 h-4"
      }, null, _parent));
      _push(`</button></div><div><p class="text-xs font-bold text-on-surface-variant mb-1.5">\u4E26\u3073\u9806</p><div class="grid grid-cols-4 gap-1"><!--[-->`);
      ssrRenderList(SORTS, (s) => {
        _push(`<button type="button" class="${ssrRenderClass([unref(sort) === s.value ? "bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/60" : "bg-surface-container/60 text-on-surface-variant hover:text-on-surface", "flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-bold transition"])}">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: s.icon,
          class: "w-4 h-4"
        }, null, _parent));
        _push(` ${ssrInterpolate(s.label)}</button>`);
      });
      _push(`<!--]--></div></div><div><p class="text-xs font-bold text-on-surface-variant mb-1.5">\u671F\u9593</p><div class="flex flex-wrap gap-1.5"><!--[-->`);
      ssrRenderList(PERIODS, (p) => {
        _push(`<button type="button" class="${ssrRenderClass([unref(since) === p.value ? "bg-indigo-600 text-white" : "bg-surface-container/60 text-on-surface-variant hover:text-on-surface", "px-3 py-1.5 rounded-full text-xs font-bold transition"])}">${ssrInterpolate(p.label)}</button>`);
      });
      _push(`<!--]--></div></div></div></div></div><div class="${ssrRenderClass([unref(compact) ? "h-0 opacity-0 pb-0" : "pb-3 opacity-100", "flex gap-1 px-3 overflow-x-auto transition-all duration-300"])}"><!--[-->`);
      ssrRenderList(unref(visibleTabs), (t) => {
        _push(`<button class="${ssrRenderClass([unref(tab) === t.key ? "bg-indigo-600 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface bg-surface-container/40", "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 whitespace-nowrap"])}">`);
        _push(ssrRenderComponent(_component_Icon, {
          name: t.icon,
          class: "w-3.5 h-3.5 shrink-0"
        }, null, _parent));
        _push(` ${ssrInterpolate(t.label)} `);
        if (unref(tab) === "all" && !unref(isTagQuery) && t.key !== "all" && unref(counts)[t.key]) _push(`<span class="opacity-70">${ssrInterpolate(unref(counts)[t.key])}</span>`);
        else _push(`<!---->`);
        _push(`</button>`);
      });
      _push(`<!--]--></div></div>`);
      if (unref(isReelMode)) {
        _push(`<div class="flex-1 min-h-0 pb-[var(--app-nav-clear)]">`);
        _push(ssrRenderComponent(_component_MediaReelFeed, {
          media: unref(media),
          sort: unref(sort)
        }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="flex-1 min-h-0 overflow-y-auto pb-[calc(var(--app-nav-clear)+1rem)]">`);
        if (unref(error)) _push(`<div class="m-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">${ssrInterpolate(unref(error))}</div>`);
        else _push(`<!---->`);
        if (unref(loading)) _push(`<div class="text-center text-on-surface-variant py-10">\u691C\u7D22\u4E2D...</div>`);
        else if (unref(searched)) {
          _push(`<!--[-->`);
          if (unref(activeFilterCount)) {
            _push(`<div class="flex items-center gap-1.5 px-3 py-2 overflow-x-auto bg-surface-container/30">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: "lucide:filter",
              class: "w-3.5 h-3.5 text-on-surface-variant shrink-0"
            }, null, _parent));
            _push(`<!--[-->`);
            ssrRenderList(GENRES.filter((x) => x.value === unref(media)), (g) => {
              _push(`<span class="px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 text-[11px] font-bold shrink-0">${ssrInterpolate(g.label)}</span>`);
            });
            _push(`<!--]-->`);
            if (unref(sort) !== "relevance") _push(`<span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold shrink-0">${ssrInterpolate((_a = SORTS.find((s) => s.value === unref(sort))) == null ? void 0 : _a.label)}</span>`);
            else _push(`<!---->`);
            if (unref(since)) _push(`<span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold shrink-0">${ssrInterpolate((_b = PERIODS.find((p) => p.value === unref(since))) == null ? void 0 : _b.label)}</span>`);
            else _push(`<!---->`);
            _push(`</div>`);
          } else _push(`<!---->`);
          if (unref(tab) !== "servers" && unref(tab) !== "hashtags" && (unref(counts).posts || unref(tab) === "posts")) {
            _push(`<section><h2 class="sticky top-0 z-10 bg-surface/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/60"> \u6295\u7A3F `);
            if (unref(counts).posts) _push(`<span class="ml-1 opacity-70">${ssrInterpolate(unref(counts).posts)}</span>`);
            else _push(`<!---->`);
            _push(`</h2><!--[-->`);
            ssrRenderList(unref(results).posts, (p) => {
              var _a2, _b2, _c, _d, _e, _f, _g;
              _push(`<button class="w-full text-left px-3 py-3 flex gap-3 hover:bg-surface-container/30 transition border-b border-outline-variant/30">`);
              if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))((_a2 = p.user) == null ? void 0 : _a2.avatarUrl)) _push(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(p.user.avatarUrl))} class="w-9 h-9 rounded-full object-cover shrink-0" alt="">`);
              else _push(`<div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">${ssrInterpolate(((_c = (_b2 = p.user) == null ? void 0 : _b2.displayName) == null ? void 0 : _c.charAt(0)) || "?")}</div>`);
              _push(`<div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="font-bold text-on-surface text-sm truncate">${ssrInterpolate(((_d = p.user) == null ? void 0 : _d.displayName) || "\u4E0D\u660E")}</span><span class="text-on-surface-variant text-xs shrink-0">@${ssrInterpolate((_e = p.user) == null ? void 0 : _e.username)} \xB7 ${ssrInterpolate(timeAgo(p.createdAt))}</span></div><p class="text-on-surface text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-3">${(_f = ("renderRichText" in _ctx ? _ctx.renderRichText : unref(renderRichText))(p.content, { custom: unref(customEmojiMap) })) != null ? _f : ""}</p>`);
              if ((_g = p.attachments) == null ? void 0 : _g.length) {
                _push(`<div class="flex gap-1 mt-1.5"><!--[-->`);
                ssrRenderList(p.attachments.filter((x) => String(x.mime || "").startsWith("image/")).slice(0, 3), (a) => {
                  _push(`<img${ssrRenderAttr("src", a.url)} class="w-12 h-12 rounded-lg object-cover" alt="">`);
                });
                _push(`<!--]-->`);
                if (p.attachments.some((x) => !String(x.mime || "").startsWith("image/"))) {
                  _push(`<span class="flex items-center gap-1 text-[11px] text-on-surface-variant px-2 rounded-lg bg-surface-container/60">`);
                  _push(ssrRenderComponent(_component_Icon, {
                    name: "lucide:paperclip",
                    class: "w-3 h-3"
                  }, null, _parent));
                  _push(`${ssrInterpolate(p.attachments.filter((x) => !String(x.mime || "").startsWith("image/")).length)}</span>`);
                } else _push(`<!---->`);
                _push(`</div>`);
              } else _push(`<!---->`);
              _push(`</div></button>`);
            });
            _push(`<!--]--></section>`);
          } else _push(`<!---->`);
          if (unref(tab) !== "servers" && unref(tab) !== "posts" && (unref(counts).hashtags || unref(tab) === "hashtags")) {
            _push(`<section><h2 class="sticky top-0 z-10 bg-surface/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-y border-outline-variant/60"> \u30CF\u30C3\u30B7\u30E5\u30BF\u30B0 `);
            if (unref(counts).hashtags) _push(`<span class="ml-1 opacity-70">${ssrInterpolate(unref(counts).hashtags)}</span>`);
            else _push(`<!---->`);
            _push(`</h2><!--[-->`);
            ssrRenderList(unref(results).hashtags, (h) => {
              _push(ssrRenderComponent(_component_NuxtLink, {
                key: h.tag,
                to: tagHref(h.tag),
                class: "w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-container/30 transition border-b border-outline-variant/30"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`<div class="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0"${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_Icon, {
                      name: "lucide:hash",
                      class: "w-4 h-4 text-indigo-400"
                    }, null, _parent2, _scopeId));
                    _push2(`</div><div class="flex-1 min-w-0"${_scopeId}><p class="text-sm font-bold text-on-surface truncate"${_scopeId}>#${ssrInterpolate(h.displayTag)}</p><p class="text-xs text-on-surface-variant"${_scopeId}>${ssrInterpolate(h.postCount)} \u4EF6\u306E\u6295\u7A3F</p></div>`);
                    _push2(ssrRenderComponent(_component_Icon, {
                      name: "lucide:chevron-right",
                      class: "w-4 h-4 text-on-surface-variant shrink-0"
                    }, null, _parent2, _scopeId));
                  } else return [
                    createVNode("div", { class: "w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0" }, [createVNode(_component_Icon, {
                      name: "lucide:hash",
                      class: "w-4 h-4 text-indigo-400"
                    })]),
                    createVNode("div", { class: "flex-1 min-w-0" }, [createVNode("p", { class: "text-sm font-bold text-on-surface truncate" }, "#" + toDisplayString(h.displayTag), 1), createVNode("p", { class: "text-xs text-on-surface-variant" }, toDisplayString(h.postCount) + " \u4EF6\u306E\u6295\u7A3F", 1)]),
                    createVNode(_component_Icon, {
                      name: "lucide:chevron-right",
                      class: "w-4 h-4 text-on-surface-variant shrink-0"
                    })
                  ];
                }),
                _: 2
              }, _parent));
            });
            _push(`<!--]--></section>`);
          } else _push(`<!---->`);
          if (unref(tab) !== "posts" && unref(tab) !== "hashtags" && (unref(counts).users || unref(tab) === "users")) {
            _push(`<section><h2 class="sticky top-0 z-10 bg-surface/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-y border-outline-variant/60"> \u30E6\u30FC\u30B6\u30FC `);
            if (unref(counts).users) _push(`<span class="ml-1 opacity-70">${ssrInterpolate(unref(counts).users)}</span>`);
            else _push(`<!---->`);
            _push(`</h2><!--[-->`);
            ssrRenderList(unref(results).users, (u) => {
              _push(ssrRenderComponent(_component_NuxtLink, {
                key: u.id,
                to: `/profile/@${u.username}`,
                class: "w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-container/30 transition border-b border-outline-variant/30"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  var _a2, _b2;
                  if (_push2) {
                    if (("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(u.avatarUrl)) _push2(`<img${ssrRenderAttr("src", ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(u.avatarUrl))} class="w-9 h-9 rounded-full object-cover shrink-0" alt=""${_scopeId}>`);
                    else _push2(`<div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0"${_scopeId}>${ssrInterpolate(((_a2 = u.displayName) == null ? void 0 : _a2.charAt(0)) || "?")}</div>`);
                    _push2(`<div class="flex-1 min-w-0"${_scopeId}><p class="text-sm font-bold text-on-surface truncate flex items-center gap-1"${_scopeId}>${ssrInterpolate(u.displayName)}`);
                    _push2(ssrRenderComponent(_component_UserBadges, { badges: u.badges }, null, _parent2, _scopeId));
                    _push2(ssrRenderComponent(_component_UserTitle, { title: u.title }, null, _parent2, _scopeId));
                    _push2(`</p><p class="text-xs text-on-surface-variant truncate"${_scopeId}>@${ssrInterpolate(u.username)}`);
                    if (u.bio) _push2(`<span${_scopeId}> \xB7 ${ssrInterpolate(u.bio)}</span>`);
                    else _push2(`<!---->`);
                    _push2(`</p></div>`);
                    _push2(ssrRenderComponent(_component_Icon, {
                      name: "lucide:chevron-right",
                      class: "w-4 h-4 text-on-surface-variant shrink-0"
                    }, null, _parent2, _scopeId));
                  } else return [
                    ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(u.avatarUrl) ? (openBlock(), createBlock("img", {
                      key: 0,
                      src: ("avatarSrc" in _ctx ? _ctx.avatarSrc : unref(avatarSrc))(u.avatarUrl),
                      class: "w-9 h-9 rounded-full object-cover shrink-0",
                      alt: ""
                    }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0"
                    }, toDisplayString(((_b2 = u.displayName) == null ? void 0 : _b2.charAt(0)) || "?"), 1)),
                    createVNode("div", { class: "flex-1 min-w-0" }, [createVNode("p", { class: "text-sm font-bold text-on-surface truncate flex items-center gap-1" }, [
                      createTextVNode(toDisplayString(u.displayName), 1),
                      createVNode(_component_UserBadges, { badges: u.badges }, null, 8, ["badges"]),
                      createVNode(_component_UserTitle, { title: u.title }, null, 8, ["title"])
                    ]), createVNode("p", { class: "text-xs text-on-surface-variant truncate" }, [createTextVNode("@" + toDisplayString(u.username), 1), u.bio ? (openBlock(), createBlock("span", { key: 0 }, " \xB7 " + toDisplayString(u.bio), 1)) : createCommentVNode("", true)])]),
                    createVNode(_component_Icon, {
                      name: "lucide:chevron-right",
                      class: "w-4 h-4 text-on-surface-variant shrink-0"
                    })
                  ];
                }),
                _: 2
              }, _parent));
            });
            _push(`<!--]--></section>`);
          } else _push(`<!---->`);
          if (unref(tab) === "servers" || unref(tab) === "all") {
            _push(`<section><h2 class="sticky top-0 z-10 bg-surface/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-y border-outline-variant/60"> \u30B5\u30FC\u30D0\u30FC `);
            if (unref(counts).servers) _push(`<span class="ml-1 opacity-70">${ssrInterpolate(unref(counts).servers)}</span>`);
            else _push(`<!---->`);
            _push(`</h2><!--[-->`);
            ssrRenderList(unref(results).servers, (s) => {
              _push(ssrRenderComponent(_component_NuxtLink, {
                key: s.id,
                to: `/servers/${s.id}`,
                class: "w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-container/30 transition border-b border-outline-variant/30"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  var _a2, _b2, _c, _d;
                  if (_push2) {
                    _push2(`<div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden"${_scopeId}>`);
                    if (s.icon_url || s.iconUrl) _push2(`<img${ssrRenderAttr("src", s.icon_url || s.iconUrl)} class="w-full h-full object-cover" alt=""${_scopeId}>`);
                    else _push2(`<!--[-->${ssrInterpolate(((_a2 = s.name) == null ? void 0 : _a2.charAt(0)) || "?")}<!--]-->`);
                    _push2(`</div><div class="flex-1 min-w-0"${_scopeId}><p class="text-sm font-bold text-on-surface truncate"${_scopeId}>${ssrInterpolate(s.name)}</p><p class="text-xs text-on-surface-variant line-clamp-1"${_scopeId}>${ssrInterpolate(s.description || `\u30E1\u30F3\u30D0\u30FC ${(_b2 = s.member_count) != null ? _b2 : 0} \u4EBA`)}</p></div>`);
                    _push2(ssrRenderComponent(_component_Icon, {
                      name: "lucide:chevron-right",
                      class: "w-4 h-4 text-on-surface-variant shrink-0"
                    }, null, _parent2, _scopeId));
                  } else return [
                    createVNode("div", { class: "w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden" }, [s.icon_url || s.iconUrl ? (openBlock(), createBlock("img", {
                      key: 0,
                      src: s.icon_url || s.iconUrl,
                      class: "w-full h-full object-cover",
                      alt: ""
                    }, null, 8, ["src"])) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(((_c = s.name) == null ? void 0 : _c.charAt(0)) || "?"), 1)], 64))]),
                    createVNode("div", { class: "flex-1 min-w-0" }, [createVNode("p", { class: "text-sm font-bold text-on-surface truncate" }, toDisplayString(s.name), 1), createVNode("p", { class: "text-xs text-on-surface-variant line-clamp-1" }, toDisplayString(s.description || `\u30E1\u30F3\u30D0\u30FC ${(_d = s.member_count) != null ? _d : 0} \u4EBA`), 1)]),
                    createVNode(_component_Icon, {
                      name: "lucide:chevron-right",
                      class: "w-4 h-4 text-on-surface-variant shrink-0"
                    })
                  ];
                }),
                _: 2
              }, _parent));
            });
            _push(`<!--]--></section>`);
          } else _push(`<!---->`);
          if (!unref(totalCount)) _push(`<p class="px-4 py-12 text-center text-on-surface-variant text-sm"> \u300C${ssrInterpolate(unref(queryStr))}\u300D\u306B\u4E00\u81F4\u3059\u308B\u7D50\u679C\u306F\u3042\u308A\u307E\u305B\u3093 </p>`);
          else _push(`<!---->`);
          _push(`<!--]-->`);
        } else {
          _push(`<div class="px-4 py-10 text-center space-y-4"><div class="w-12 h-12 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">`);
          _push(ssrRenderComponent(_component_Icon, {
            name: "lucide:search",
            class: "w-5 h-5 text-on-surface-variant"
          }, null, _parent));
          _push(`</div><div><p class="font-bold text-on-surface">\u4E0B\u3078\u30B9\u30AF\u30ED\u30FC\u30EB\u3067\u30EA\u30FC\u30EB</p><p class="text-on-surface-variant text-sm mt-1">\u691C\u7D22\u67A0\u306B\u4F55\u3082\u5165\u308C\u306A\u3051\u308C\u3070\u3001\u52D5\u753B\u3084\u753B\u50CF\u3001\u97F3\u697D\u304C\u30E9\u30F3\u30C0\u30E0\u306B\u6D41\u308C\u3066\u304D\u307E\u3059</p></div><div class="flex flex-wrap items-center justify-center gap-2"><!--[-->`);
          ssrRenderList(examples, (ex) => {
            _push(`<button class="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container/70 text-sm text-on-surface hover:bg-surface-container transition">`);
            _push(ssrRenderComponent(_component_Icon, {
              name: ex.icon,
              class: "w-4 h-4 text-on-surface-variant"
            }, null, _parent));
            _push(` ${ssrInterpolate(ex.q)}</button>`);
          });
          _push(`<!--]--></div></div>`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
var _sfc_setup = search_vue_vue_type_script_setup_true_lang_default.setup;
search_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/search.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var search_default = search_vue_vue_type_script_setup_true_lang_default;

export { search_default as default };
//# sourceMappingURL=search-CnV-RSA8.mjs.map
