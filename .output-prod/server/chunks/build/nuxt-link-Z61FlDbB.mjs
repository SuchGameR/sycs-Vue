import { i as useRouter, j as encodeRoutePath, r as resolveRouteObject, n as navigateTo, k as useRuntimeConfig, u as useNuxtApp, l as nuxtLinkDefaults } from '../virtual/entry.mjs';
import { defineComponent, shallowRef, h, resolveComponent, computed, unref } from 'vue';
import { aI as hasProtocol, aE as joinURL, aV as parseQuery, aJ as isScriptProtocol, aW as withTrailingSlash, aX as withoutTrailingSlash } from '../nitro/nitro.mjs';

var firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
function sanitizeExternalHref(value) {
  let candidate = value.replace(/[\u0000-\u001F\s]+/g, "");
  while (candidate.toLowerCase().startsWith("view-source:")) candidate = candidate.slice(12);
  const colon = candidate.indexOf(":");
  if (colon > 0 && isScriptProtocol(candidate.slice(0, colon + 1))) return null;
  return value;
}
// @__NO_SIDE_EFFECTS__
function defineNuxtLink(options) {
  const componentName = options.componentName || "NuxtLink";
  function isHashLinkWithoutHashMode(link) {
    return typeof link === "string" && link.startsWith("#");
  }
  function resolveTrailingSlashBehavior(to, resolve, trailingSlash) {
    const effectiveTrailingSlash = trailingSlash != null ? trailingSlash : options.trailingSlash;
    if (!to || effectiveTrailingSlash !== "append" && effectiveTrailingSlash !== "remove") return to;
    if (typeof to === "string") return applyTrailingSlashBehavior(to, effectiveTrailingSlash);
    const path = "path" in to && to.path !== void 0 ? to.path : resolve(to).path;
    return {
      ...to,
      name: void 0,
      path: applyTrailingSlashBehavior(path, effectiveTrailingSlash)
    };
  }
  function useNuxtLink(props) {
    var _a, _b, _c;
    const router = useRouter();
    const config = /* @__PURE__ */ useRuntimeConfig();
    const hasTarget = computed(() => !!unref(props.target) && unref(props.target) !== "_self");
    const isAbsoluteUrl = computed(() => {
      const path = unref(props.to) || unref(props.href) || "";
      return typeof path === "string" && hasProtocol(path, { acceptRelative: true });
    });
    const builtinRouterLink = resolveComponent("RouterLink");
    const useBuiltinLink = builtinRouterLink && typeof builtinRouterLink !== "string" ? builtinRouterLink.useLink : void 0;
    const isExternal = computed(() => {
      if (unref(props.external)) return true;
      const path = unref(props.to) || unref(props.href) || "";
      if (typeof path === "object") return false;
      return path === "" || isAbsoluteUrl.value;
    });
    const to = computed(() => {
      const path = unref(props.to) || unref(props.href) || "";
      if (isExternal.value) return path;
      return resolveTrailingSlashBehavior(path, router.resolve, unref(props.trailingSlash));
    });
    const link = isExternal.value ? void 0 : useBuiltinLink == null ? void 0 : useBuiltinLink({
      ...props,
      to,
      viewTransition: unref(props.viewTransition)
    });
    const href = computed(() => {
      var _a2, _b2, _c2;
      const effectiveTrailingSlash = (_a2 = unref(props.trailingSlash)) != null ? _a2 : options.trailingSlash;
      if (!to.value || isAbsoluteUrl.value || isHashLinkWithoutHashMode(to.value)) {
        const raw = to.value;
        return typeof raw === "string" ? sanitizeExternalHref(raw) : raw;
      }
      if (isExternal.value) {
        const path = typeof to.value === "object" && "path" in to.value ? resolveRouteObject(to.value) : to.value;
        const href2 = typeof path === "object" ? router.resolve(path).href : path;
        const safe = typeof href2 === "string" ? sanitizeExternalHref(href2) : href2;
        return safe === null ? null : applyTrailingSlashBehavior(safe, effectiveTrailingSlash);
      }
      if (typeof to.value === "object") return (_c2 = (_b2 = router.resolve(to.value)) == null ? void 0 : _b2.href) != null ? _c2 : null;
      return applyTrailingSlashBehavior(joinURL(config.app.baseURL, to.value), effectiveTrailingSlash);
    });
    return {
      to,
      hasTarget,
      isAbsoluteUrl,
      isExternal,
      href,
      isActive: (_a = link == null ? void 0 : link.isActive) != null ? _a : computed(() => to.value === router.currentRoute.value.path),
      isExactActive: (_b = link == null ? void 0 : link.isExactActive) != null ? _b : computed(() => to.value === router.currentRoute.value.path),
      route: (_c = link == null ? void 0 : link.route) != null ? _c : computed(() => router.resolve(to.value)),
      async navigate(_e) {
        if (href.value === null) return;
        await navigateTo(href.value, {
          replace: unref(props.replace),
          external: isExternal.value || hasTarget.value
        });
      }
    };
  }
  return defineComponent({
    name: componentName,
    props: {
      to: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      href: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      target: {
        type: String,
        default: void 0,
        required: false
      },
      rel: {
        type: String,
        default: void 0,
        required: false
      },
      noRel: {
        type: Boolean,
        default: void 0,
        required: false
      },
      prefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      prefetchOn: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      noPrefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      activeClass: {
        type: String,
        default: void 0,
        required: false
      },
      exactActiveClass: {
        type: String,
        default: void 0,
        required: false
      },
      prefetchedClass: {
        type: String,
        default: void 0,
        required: false
      },
      replace: {
        type: Boolean,
        default: void 0,
        required: false
      },
      ariaCurrentValue: {
        type: String,
        default: void 0,
        required: false
      },
      external: {
        type: Boolean,
        default: void 0,
        required: false
      },
      custom: {
        type: Boolean,
        default: void 0,
        required: false
      },
      trailingSlash: {
        type: String,
        default: void 0,
        required: false
      }
    },
    useLink: useNuxtLink,
    setup(props, { slots }) {
      const router = useRouter();
      const { to, href, navigate, isExternal, hasTarget, isAbsoluteUrl } = useNuxtLink(props);
      const prefetched = shallowRef(false);
      const el = void 0;
      const elRef = void 0;
      function shouldPrefetch(mode) {
        return false;
      }
      async function prefetch(nuxtApp = useNuxtApp()) {
      }
      return () => {
        var _a;
        const target = props.target || null;
        const rel = firstNonUndefined(props.noRel ? "" : props.rel, options.externalRelAttribute, isAbsoluteUrl.value || hasTarget.value ? "noopener noreferrer" : "") || null;
        const getCustomSlotProps = (routerLinkSlotProps) => ({
          href: href.value,
          navigate,
          get route() {
            if (!href.value) return;
            const url = new URL(href.value, "http://localhost");
            return {
              path: url.pathname,
              fullPath: url.pathname,
              get query() {
                return parseQuery(url.search);
              },
              hash: url.hash,
              params: {},
              name: void 0,
              matched: [],
              redirectedFrom: void 0,
              meta: {},
              href: href.value
            };
          },
          rel,
          target,
          isExternal: isExternal.value || hasTarget.value,
          isActive: false,
          isExactActive: false,
          ...routerLinkSlotProps,
          prefetch,
          prefetched: prefetched.value,
          shouldPrefetch
        });
        if (!isExternal.value && !hasTarget.value && !isHashLinkWithoutHashMode(to.value)) {
          const routerLinkProps = {
            ref: elRef,
            to: to.value,
            activeClass: props.activeClass || options.activeClass,
            exactActiveClass: props.exactActiveClass || options.exactActiveClass,
            replace: props.replace,
            ariaCurrentValue: props.ariaCurrentValue,
            custom: props.custom
          };
          if (!props.custom) routerLinkProps.rel = props.rel || void 0;
          return h(resolveComponent("RouterLink"), routerLinkProps, props.custom && slots.default ? { default: (slotProps) => slots.default(getCustomSlotProps(slotProps)) } : slots.default);
        }
        if (props.custom) {
          if (!slots.default) return null;
          return slots.default(getCustomSlotProps());
        }
        return h("a", {
          ref: el,
          href: href.value || null,
          rel,
          target,
          onClick: async (event) => {
            var _a2;
            if (isExternal.value || hasTarget.value) return;
            event.preventDefault();
            try {
              const encodedHref = encodeRoutePath((_a2 = href.value) != null ? _a2 : "");
              return await (props.replace ? router.replace(encodedHref) : router.push(encodedHref));
            } finally {
            }
          }
        }, (_a = slots.default) == null ? void 0 : _a.call(slots));
      };
    }
  });
}
var NuxtLink = /* @__PURE__ */ defineNuxtLink(nuxtLinkDefaults);
function applyTrailingSlashBehavior(to, trailingSlash) {
  const normalizeFn = trailingSlash === "append" ? withTrailingSlash : withoutTrailingSlash;
  if (hasProtocol(to) && !to.startsWith("http")) return to;
  return normalizeFn(to, true);
}

export { NuxtLink as N };
//# sourceMappingURL=nuxt-link-Z61FlDbB.mjs.map
