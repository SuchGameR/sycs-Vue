import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { defineProdDiagnostics } from 'nostics';
import { ansiFormatter } from 'nostics/formatters/ansi';
import { getCurrentScope, ref, watchEffect, getCurrentInstance, onBeforeUnmount, onDeactivated, onActivated, shallowReactive, reactive, effectScope, hasInjectionContext, inject, toRef, defineComponent, createElementBlock, shallowRef, provide, cloneVNode, h, isRef, computed, toValue, onServerPrefetch, nextTick, unref, createApp, onErrorCaptured, createVNode, resolveDynamicComponent, defineAsyncComponent, mergeProps, isReadonly, useSSRContext, isShallow, isReactive, toRaw, isVNode, createCommentVNode, withCtx, Suspense, Fragment } from 'vue';
import { h as createError, aI as hasProtocol, aJ as isScriptProtocol, aE as joinURL, aK as withQuery, aL as sanitizeStatusCode, aM as parseURL, ax as encodePath, aN as decodePath, aO as $fetch$2, aP as baseURL, aQ as defu, aR as klona, aS as hash, aT as defuFn } from '../nitro/nitro.mjs';
import { START_LOCATION, createMemoryHistory, createRouter, useRoute as useRoute$1, RouterView } from 'vue-router';
import { walkResolver } from 'unhead/utils';
import { i as injectHead$1, V as VueResolver, h as headSymbol } from '../routes/renderer.mjs';
import { debounce } from 'perfect-debounce';
import { _api, addAPIProvider, setCustomIconsLoader, Icon, getIcon, loadIcon } from '@iconify/vue';
import { ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode, ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { getIconCSS } from '@iconify/utils/lib/css/icon';

function useHead(input, options = {}) {
  const head = options.head || injectHead$1();
  return head.ssr ? head.push(input || {}, options) : clientUseHead(head, input, options);
}
function clientUseHead(head, input, options = {}) {
  const scope = getCurrentScope();
  if (scope && !scope.active) {
    return { patch() {
    }, dispose() {
    }, _i: -1 };
  }
  const deactivated = ref(false);
  if (options.onRendered && scope) {
    const _onRendered = options.onRendered;
    options = { ...options, onRendered: (ctx) => scope.run(() => _onRendered(ctx)) };
  }
  let entry;
  watchEffect(() => {
    const i = deactivated.value ? {} : walkResolver(input, VueResolver);
    if (entry) {
      entry.patch(i);
    } else {
      entry = head.push(i, options);
    }
  });
  const vm = getCurrentInstance();
  if (vm) {
    onBeforeUnmount(() => {
      entry.dispose();
    });
    onDeactivated(() => {
      deactivated.value = true;
    });
    onActivated(() => {
      deactivated.value = false;
    });
  }
  return entry;
}

function flatHooks(configHooks, hooks = {}, parentName) {
	for (const key in configHooks) {
		const subHook = configHooks[key];
		const name = parentName ? `${parentName}:${key}` : key;
		if (typeof subHook === "object" && subHook !== null) flatHooks(subHook, hooks, name);
		else if (typeof subHook === "function") hooks[name] = subHook;
	}
	return hooks;
}
const createTask = /* @__PURE__ */ (() => {
	if (console.createTask) return console.createTask;
	const defaultTask = { run: (fn) => fn() };
	return () => defaultTask;
})();
function callHooks(hooks, args, startIndex, task) {
	for (let i = startIndex; i < hooks.length; i += 1) try {
		const result = task ? task.run(() => hooks[i](...args)) : hooks[i](...args);
		if (result && typeof result.then === "function") return Promise.resolve(result).then(() => callHooks(hooks, args, i + 1, task));
	} catch (error) {
		return Promise.reject(error);
	}
}
function serialTaskCaller(hooks, args, name) {
	if (hooks.length > 0) return callHooks(hooks, args, 0, createTask(name));
}
function parallelTaskCaller(hooks, args, name) {
	if (hooks.length > 0) {
		const task = createTask(name);
		return Promise.all(hooks.map((hook) => task.run(() => hook(...args))));
	}
}
function callEachWith(callbacks, arg0) {
	for (const callback of [...callbacks]) callback(arg0);
}
var Hookable = class {
	_hooks;
	_before;
	_after;
	_deprecatedHooks;
	_deprecatedMessages;
	constructor() {
		this._hooks = {};
		this._before = void 0;
		this._after = void 0;
		this._deprecatedMessages = void 0;
		this._deprecatedHooks = {};
		this.hook = this.hook.bind(this);
		this.callHook = this.callHook.bind(this);
		this.callHookWith = this.callHookWith.bind(this);
	}
	hook(name, function_, options = {}) {
		if (!name || typeof function_ !== "function") return () => {};
		const originalName = name;
		let dep;
		while (this._deprecatedHooks[name]) {
			dep = this._deprecatedHooks[name];
			name = dep.to;
		}
		if (dep && !options.allowDeprecated) {
			let message = dep.message;
			if (!message) message = `${originalName} hook has been deprecated` + (dep.to ? `, please use ${dep.to}` : "");
			if (!this._deprecatedMessages) this._deprecatedMessages = /* @__PURE__ */ new Set();
			if (!this._deprecatedMessages.has(message)) {
				console.warn(message);
				this._deprecatedMessages.add(message);
			}
		}
		if (!function_.name) try {
			Object.defineProperty(function_, "name", {
				get: () => "_" + name.replace(/\W+/g, "_") + "_hook_cb",
				configurable: true
			});
		} catch {}
		this._hooks[name] = this._hooks[name] || [];
		this._hooks[name].push(function_);
		return () => {
			if (function_) {
				this.removeHook(name, function_);
				function_ = void 0;
			}
		};
	}
	hookOnce(name, function_) {
		let _unreg;
		let _function = (...arguments_) => {
			if (typeof _unreg === "function") _unreg();
			_unreg = void 0;
			_function = void 0;
			return function_(...arguments_);
		};
		_unreg = this.hook(name, _function);
		return _unreg;
	}
	removeHook(name, function_) {
		const hooks = this._hooks[name];
		if (hooks) {
			const index = hooks.indexOf(function_);
			if (index !== -1) hooks.splice(index, 1);
			if (hooks.length === 0) this._hooks[name] = void 0;
		}
	}
	clearHook(name) {
		this._hooks[name] = void 0;
	}
	deprecateHook(name, deprecated) {
		this._deprecatedHooks[name] = typeof deprecated === "string" ? { to: deprecated } : deprecated;
		const _hooks = this._hooks[name] || [];
		this._hooks[name] = void 0;
		for (const hook of _hooks) this.hook(name, hook);
	}
	deprecateHooks(deprecatedHooks) {
		for (const name in deprecatedHooks) this.deprecateHook(name, deprecatedHooks[name]);
	}
	addHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		const removeFns = Object.keys(hooks).map((key) => this.hook(key, hooks[key]));
		return () => {
			for (const unreg of removeFns) unreg();
			removeFns.length = 0;
		};
	}
	removeHooks(configHooks) {
		const hooks = flatHooks(configHooks);
		for (const key in hooks) this.removeHook(key, hooks[key]);
	}
	removeAllHooks() {
		this._hooks = {};
	}
	callHook(name, ...args) {
		return this.callHookWith(serialTaskCaller, name, args);
	}
	callHookParallel(name, ...args) {
		return this.callHookWith(parallelTaskCaller, name, args);
	}
	callHookWith(caller, name, args) {
		const event = this._before || this._after ? {
			name,
			args,
			context: {}
		} : void 0;
		if (this._before) callEachWith(this._before, event);
		const result = caller(this._hooks[name] ? [...this._hooks[name]] : [], args, name);
		if (result instanceof Promise) return result.finally(() => {
			if (this._after && event) callEachWith(this._after, event);
		});
		if (this._after && event) callEachWith(this._after, event);
		return result;
	}
	beforeEach(function_) {
		this._before = this._before || [];
		this._before.push(function_);
		return () => {
			if (this._before !== void 0) {
				const index = this._before.indexOf(function_);
				if (index !== -1) this._before.splice(index, 1);
			}
		};
	}
	afterEach(function_) {
		this._after = this._after || [];
		this._after.push(function_);
		return () => {
			if (this._after !== void 0) {
				const index = this._after.indexOf(function_);
				if (index !== -1) this._after.splice(index, 1);
			}
		};
	}
};
function createHooks() {
	return new Hookable();
}

function _getAsyncLocalStorage() {
	return globalThis.AsyncLocalStorage || globalThis.process?.getBuiltinModule?.("node:async_hooks")?.AsyncLocalStorage;
}
function createContext(opts = {}) {
	let currentInstance;
	let isSingleton = false;
	const checkConflict = (instance) => {
		if (currentInstance && currentInstance !== instance) throw new Error("Context conflict");
	};
	let als;
	if (opts.asyncContext) {
		const _AsyncLocalStorage = opts.AsyncLocalStorage || _getAsyncLocalStorage();
		if (_AsyncLocalStorage) als = new _AsyncLocalStorage();
		else console.warn("[unctx] `AsyncLocalStorage` is not provided.");
	}
	const _wrapInstance = (instance) => als && instance !== null && typeof instance === "object" ? { __unctx_weak: new WeakRef(instance) } : instance;
	const _unwrapInstance = (store) => store && store.__unctx_weak ? store.__unctx_weak.deref() : store;
	const _getCurrentInstance = () => {
		if (als) {
			const store = als.getStore();
			if (store !== void 0) return _unwrapInstance(store);
		}
		return currentInstance;
	};
	return {
		use: () => {
			const _instance = _getCurrentInstance();
			if (_instance === void 0) throw new Error("Context is not available");
			return _instance;
		},
		tryUse: () => {
			return _getCurrentInstance();
		},
		set: (instance, replace) => {
			if (!replace) checkConflict(instance);
			currentInstance = instance;
			isSingleton = true;
		},
		unset: () => {
			currentInstance = void 0;
			isSingleton = false;
		},
		call: (instance, callback) => {
			checkConflict(instance);
			currentInstance = instance;
			try {
				return als ? als.run(_wrapInstance(instance), callback) : callback();
			} finally {
				if (!isSingleton) currentInstance = void 0;
			}
		},
		async callAsync(instance, callback) {
			currentInstance = instance;
			const onRestore = () => {
				currentInstance = instance;
			};
			const onLeave = () => currentInstance === instance ? onRestore : void 0;
			asyncHandlers.add(onLeave);
			try {
				const r = als ? als.run(_wrapInstance(instance), callback) : callback();
				if (!isSingleton) currentInstance = void 0;
				return await r;
			} finally {
				asyncHandlers.delete(onLeave);
			}
		}
	};
}
function createNamespace(defaultOpts = {}) {
	const contexts = {};
	return { get(key, opts = {}) {
		if (!contexts[key]) contexts[key] = createContext({
			...defaultOpts,
			...opts
		});
		return contexts[key];
	} };
}
const _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
const getContext = (key, opts = {}) => defaultNamespace.get(key, opts);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());
function executeAsync(function_) {
	const restores = [];
	for (const leaveHandler of asyncHandlers) {
		const restore = leaveHandler();
		if (restore) restores.push(restore);
	}
	const restore = () => {
		for (const restore of restores) restore();
	};
	let awaitable = function_();
	if (awaitable && typeof awaitable === "object" && "catch" in awaitable) awaitable = awaitable.catch((error) => {
		restore();
		throw error;
	});
	return [awaitable, restore];
}

function docsBase(code) {
  return `https://nuxt.com/docs/4.x/errors/${code.replace("NUXT_", "").toLowerCase()}`;
}
var ansi = (open, close) => (s) => `\x1B[${open}m${s}\x1B[${close}m`;
ansiFormatter({
  red: ansi(31, 39),
  yellow: ansi(33, 39),
  cyan: ansi(36, 39),
  gray: ansi(90, 39),
  bold: ansi(1, 22),
  dim: ansi(2, 22)
});
var prodReporter = (diagnostic) => {
  console.error(`[${diagnostic.name}]`);
};
var prodReporters = [prodReporter];
var appDiagnostics = /* @__PURE__ */ defineProdDiagnostics({
  docsBase,
  reporters: prodReporters
});
var nuxtLinkDefaults = {
  "componentName": "NuxtLink"};
var asyncDataDefaults = { "deep": false };
var fetchDefaults = {};
function getNuxtAppCtx(id = "nuxt-app") {
  return getContext(id, { asyncContext: false });
}
var NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  var _a;
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    versions: {
      get nuxt() {
        return "4.5.0";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...((_a = options.ssrContext) == null ? void 0 : _a.payload) || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: { data: {} },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) return () => {
      };
      hydratingCount++;
      let called = false;
      return () => {
        if (called) return;
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _state: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  nuxtApp.payload.serverRendered = true;
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) await nuxtApp.runWithContext(() => hook(...args));
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin === "function") {
    const run = () => nuxtApp.runWithContext(() => plugin(nuxtApp));
    const { provide } = await run() || {};
    if (provide && typeof provide === "object") for (const key in provide) nuxtApp.provide(key, provide[key]);
  }
}
async function applyPlugins(nuxtApp, plugins) {
  let error;
  for (const plugin of plugins) try {
    await applyPlugin(nuxtApp, plugin);
  } catch (e) {
    if (!nuxtApp.payload.error) throw e;
    error || (error = e);
  }
  if (error) throw nuxtApp.payload.error || error;
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin) {
  if (typeof plugin === "function") return plugin;
  const _name = plugin._name || plugin.name;
  delete plugin.name;
  return Object.assign(plugin.setup || (() => {
  }), plugin, {
    [NuxtPluginIndicator]: true,
    _name
  });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
}
function tryUseNuxtApp(id) {
  var _a;
  let nuxtAppInstance;
  if (hasInjectionContext()) nuxtAppInstance = (_a = getCurrentInstance()) == null ? void 0 : _a.appContext.app.$nuxt;
  nuxtAppInstance || (nuxtAppInstance = getNuxtAppCtx(id).tryUse());
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) throw appDiagnostics.NUXT_E1001();
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}

globalThis._importMeta_.url.replace(/\/app\/.*$/, "/");
var LayoutMetaSymbol = /* @__PURE__ */ Symbol("layout-meta");
var LayoutSymbol = /* @__PURE__ */ Symbol("layout");
var PageRouteSymbol = /* @__PURE__ */ Symbol("route");
var navigationDiagnostics = /* @__PURE__ */ defineProdDiagnostics({
  docsBase,
  reporters: prodReporters
});
var useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
var useRoute = (() => {
  if (hasInjectionContext()) return inject(PageRouteSymbol, useNuxtApp()._route);
  return useNuxtApp()._route;
});
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
var isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) return true;
  } catch {
    return false;
  }
  return false;
};
var HTML_ATTR_UNSAFE_RE = /[&"'<>]/g;
var HTML_ATTR_ENCODE_MAP = {
  "&": "&amp;",
  '"': "&quot;",
  "'": "&#x27;",
  "<": "&lt;",
  ">": "&gt;"
};
function encodeForHtmlAttr(value) {
  return value.replace(HTML_ATTR_UNSAFE_RE, (c) => HTML_ATTR_ENCODE_MAP[c]);
}
var navigateTo = (to, options) => {
  to || (to = "/");
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = (options == null ? void 0 : options.external) || isExternalHost;
  if (isExternal) {
    if (!(options == null ? void 0 : options.external)) throw navigationDiagnostics.NUXT_E2001({ toPath });
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) throw navigationDiagnostics.NUXT_E2002({
      toPath,
      protocol
    });
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  if (nuxtApp.ssrContext) {
    const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
    const location = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
    const redirect = async function(response) {
      await nuxtApp.callHook("app:redirected");
      const encodedHeader = encodeURL(location, isExternalHost);
      const encodedLoc = encodeForHtmlAttr(encodedHeader);
      nuxtApp.ssrContext["~renderResponse"] = {
        statusCode: sanitizeStatusCode((options == null ? void 0 : options.redirectCode) || 302, 302),
        body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
        headers: { location: encodedHeader }
      };
      return response;
    };
    if (!isExternal && inMiddleware) {
      router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
      return to;
    }
    return redirect(!inMiddleware ? void 0 : false);
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options == null ? void 0 : options.replace) (void 0).replace(toPath);
    else (void 0).href = toPath;
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) return false;
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return (options == null ? void 0 : options.replace) ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location, isExternalHost = false) {
  const url = new URL(location, "http://localhost");
  if (!isExternalHost) return url.pathname.replace(/^\/{2,}/, "/") + url.search + url.hash;
  if (location.startsWith("//")) return url.toString().replace(url.protocol, "");
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
var NUXT_ERROR_SIGNATURE = "__nuxt_error";
var useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
var showError = (error) => {
  const nuxtError = createError$1(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    error2.value || (error2.value = nuxtError);
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
var _showErrorUnlessCrawler = async (nuxtApp, error) => {
  await nuxtApp.runWithContext(() => showError(error));
};
var isNuxtError = (error) => !!error && typeof error === "object" && "__nuxt_error" in error;
var createError$1 = (error) => {
  var _a;
  if (typeof error !== "string" && error.statusText) (_a = error.message) != null ? _a : error.message = error.statusText;
  const nuxtError = createError(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};

if (!globalThis.$fetch) globalThis.$fetch = $fetch$2.create({ baseURL: baseURL() });
var $fetch$1 = globalThis.$fetch;

var _wrapInTransition = (props, children) => {
  return { default: () => {
    var _a;
    return (_a = children.default) == null ? void 0 : _a.call(children);
  } };
};
var ROUTE_KEY_PARENTHESES_RE$1 = /(:\w+)\([^)]+\)/g;
var ROUTE_KEY_SYMBOLS_RE$1 = /(:\w+)[?+*]/g;
var ROUTE_KEY_NORMAL_RE$1 = /:\w+/g;
function generateRouteKey$1(route) {
  var _a;
  const source = (_a = route == null ? void 0 : route.meta.key) != null ? _a : route.path.replace(ROUTE_KEY_PARENTHESES_RE$1, "$1").replace(ROUTE_KEY_SYMBOLS_RE$1, "$1").replace(ROUTE_KEY_NORMAL_RE$1, (r) => {
    var _a2;
    return ((_a2 = route.params[r.slice(1)]) == null ? void 0 : _a2.toString()) || "";
  });
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) return false;
  if (generateRouteKey$1(to) !== generateRouteKey$1(from)) return true;
  if (to.matched.every((comp, index) => {
    var _a, _b;
    return comp.components && comp.components.default === ((_b = (_a = from.matched[index]) == null ? void 0 : _a.components) == null ? void 0 : _b.default);
  })) return false;
  return true;
}
var VALID_TAG_RE = /^[a-z][a-z0-9-]*$/i;
function sanitizeTag(tag, fallback) {
  return tag && VALID_TAG_RE.test(tag) ? tag : fallback;
}
function toArray$1(value) {
  return Array.isArray(value) ? value : [value];
}
function _mergeTransitionProps(routeProps) {
  const _props = [];
  for (const prop of routeProps) {
    if (!prop) continue;
    _props.push({
      ...prop,
      onAfterLeave: prop.onAfterLeave ? toArray$1(prop.onAfterLeave) : void 0,
      onBeforeLeave: prop.onBeforeLeave ? toArray$1(prop.onBeforeLeave) : void 0
    });
  }
  return defu(..._props);
}

var unheadDiagnostics = /* @__PURE__ */ defineProdDiagnostics({
  docsBase,
  reporters: prodReporters
});
function injectHead(nuxtApp) {
  var _a;
  const nuxt = nuxtApp || useNuxtApp();
  return ((_a = nuxt.ssrContext) == null ? void 0 : _a.head) || nuxt.runWithContext(() => {
    if (hasInjectionContext()) {
      const head = inject(headSymbol);
      if (!head) throw unheadDiagnostics.NUXT_E6001();
      return head;
    }
  });
}
function useHead$1(input, options = {}) {
  return useHead(input, {
    head: options.head || injectHead(options.nuxt),
    ...options
  });
}

defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
var clientOnlySymbol = /* @__PURE__ */ Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: [
    "fallback",
    "placeholder",
    "placeholderTag",
    "fallbackTag"
  ],
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) vm._nuxtClientOnly = true;
    provide(clientOnlySymbol, true);
    return () => {
      var _a;
      if (mounted.value) {
        const vnodes = (_a = slots.default) == null ? void 0 : _a.call(slots);
        if (vnodes && vnodes.length === 1) return [cloneVNode(vnodes[0], attrs)];
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) return h(slot);
      const fallbackStr = props.fallback || props.placeholder || "";
      return createElementBlock(sanitizeTag(props.fallbackTag || props.placeholderTag, "span"), attrs, fallbackStr);
    };
  }
});
function defineKeyedFunctionFactory(factory) {
  const placeholder = function() {
    throw appDiagnostics.NUXT_E1007({ name: factory.name });
  };
  return Object.defineProperty(placeholder, "__nuxt_factory", {
    enumerable: false,
    get: () => factory.factory
  });
}
var dataDiagnostics = /* @__PURE__ */ defineProdDiagnostics({
  docsBase,
  reporters: prodReporters
});
var createUseAsyncData = defineKeyedFunctionFactory({
  name: "createUseAsyncData",
  factory(options = {}) {
    function useAsyncData2(...args) {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
      if (_isAutoKeyNeeded(args[0], args[1])) args.unshift(autoKey);
      let [_key, _handler, opts = {}] = args;
      const key = isRef(_key) || typeof _key === "function" ? computed(() => toValue(_key)) : { value: _key };
      if (!key.value || typeof key.value !== "string") throw dataDiagnostics.NUXT_E3008();
      if (typeof _handler !== "function") throw dataDiagnostics.NUXT_E3009();
      const shouldFactoryOptionsOverride = typeof options === "function";
      const nuxtApp = useNuxtApp();
      const factoryOptions = shouldFactoryOptionsOverride ? options(opts) : options;
      if (!shouldFactoryOptionsOverride) for (const key2 in factoryOptions) {
        if (factoryOptions[key2] === void 0) continue;
        if (opts[key2] !== void 0) continue;
        opts[key2] = factoryOptions[key2];
      }
      (_a = opts.server) != null ? _a : opts.server = true;
      (_b = opts.default) != null ? _b : opts.default = getDefault;
      (_c = opts.getCachedData) != null ? _c : opts.getCachedData = getDefaultCachedData;
      (_d = opts.lazy) != null ? _d : opts.lazy = false;
      (_e = opts.immediate) != null ? _e : opts.immediate = true;
      (_f = opts.deep) != null ? _f : opts.deep = asyncDataDefaults.deep;
      (_g = opts.dedupe) != null ? _g : opts.dedupe = "cancel";
      (_h = opts.enabled) != null ? _h : opts.enabled = true;
      if (shouldFactoryOptionsOverride) for (const key2 in factoryOptions) {
        if (factoryOptions[key2] === void 0) continue;
        opts[key2] = factoryOptions[key2];
      }
      nuxtApp._asyncData[key.value];
      function createInitialFetch() {
        const initialFetchOptions = {
          cause: "initial",
          dedupe: opts.dedupe
        };
        const existing = nuxtApp._asyncData[key.value];
        if (!(existing == null ? void 0 : existing._init)) {
          initialFetchOptions.cachedData = opts.getCachedData(key.value, nuxtApp, { cause: "initial" });
          nuxtApp._asyncData[key.value] = buildAsyncData(nuxtApp, key.value, _handler, opts, initialFetchOptions.cachedData);
          nuxtApp._asyncData[key.value]._initialCachedData = initialFetchOptions.cachedData;
        } else if (nuxtApp._asyncDataPromises[key.value]) initialFetchOptions.cachedData = existing._initialCachedData;
        return () => nuxtApp._asyncData[key.value].execute(initialFetchOptions);
      }
      const initialFetch = createInitialFetch();
      const asyncData = nuxtApp._asyncData[key.value];
      asyncData._deps++;
      if (opts.server !== false && nuxtApp.payload.serverRendered && opts.immediate) {
        const promise = initialFetch();
        if (getCurrentInstance()) onServerPrefetch(() => promise);
        else nuxtApp.hook("app:created", async () => {
          await promise;
        });
      }
      const asyncReturn = {
        data: writableComputedRef(() => {
          var _a2;
          return (_a2 = nuxtApp._asyncData[key.value]) == null ? void 0 : _a2.data;
        }),
        pending: writableComputedRef(() => {
          var _a2;
          return (_a2 = nuxtApp._asyncData[key.value]) == null ? void 0 : _a2.pending;
        }),
        status: writableComputedRef(() => {
          var _a2;
          return (_a2 = nuxtApp._asyncData[key.value]) == null ? void 0 : _a2.status;
        }),
        error: writableComputedRef(() => {
          var _a2;
          return (_a2 = nuxtApp._asyncData[key.value]) == null ? void 0 : _a2.error;
        }),
        refresh: (...args2) => {
          var _a2;
          if (!((_a2 = nuxtApp._asyncData[key.value]) == null ? void 0 : _a2._init)) return createInitialFetch()();
          return nuxtApp._asyncData[key.value].execute(...args2);
        },
        execute: (...args2) => asyncReturn.refresh(...args2),
        clear: () => {
          const entry = nuxtApp._asyncData[key.value];
          if (entry == null ? void 0 : entry._abortController) try {
            entry._abortController.abort(new DOMException("AsyncData aborted by user.", "AbortError"));
          } finally {
            entry._abortController = void 0;
          }
          clearNuxtDataByKey(nuxtApp, key.value);
        }
      };
      const asyncDataPromise = Promise.resolve(nuxtApp._asyncDataPromises[key.value]).then(() => asyncReturn);
      Object.assign(asyncDataPromise, asyncReturn);
      Object.defineProperties(asyncDataPromise, {
        then: {
          enumerable: true,
          value: asyncDataPromise.then.bind(asyncDataPromise)
        },
        catch: {
          enumerable: true,
          value: asyncDataPromise.catch.bind(asyncDataPromise)
        },
        finally: {
          enumerable: true,
          value: asyncDataPromise.finally.bind(asyncDataPromise)
        }
      });
      return asyncDataPromise;
    }
    return useAsyncData2;
  }
});
var useAsyncData = createUseAsyncData.__nuxt_factory();
createUseAsyncData.__nuxt_factory({
  lazy: true,
  _functionName: "useLazyAsyncData"
});
function writableComputedRef(getter) {
  return computed({
    get() {
      var _a;
      return (_a = getter()) == null ? void 0 : _a.value;
    },
    set(value) {
      const ref2 = getter();
      if (ref2) ref2.value = value;
    }
  });
}
function _isAutoKeyNeeded(keyOrFetcher, fetcher) {
  if (typeof keyOrFetcher === "string") return false;
  if (typeof keyOrFetcher === "object" && keyOrFetcher !== null) return false;
  if (typeof keyOrFetcher === "function" && typeof fetcher === "function") return false;
  return true;
}
function clearNuxtDataByKey(nuxtApp, key) {
  delete nuxtApp.payload.data[key];
  delete nuxtApp.payload._errors[key];
  if (nuxtApp._asyncData[key]) {
    nuxtApp._asyncData[key].data.value = unref(nuxtApp._asyncData[key]._default());
    nuxtApp._asyncData[key].error.value = void 0;
    nuxtApp._asyncData[key].status.value = "idle";
    nuxtApp._asyncData[key]._initialCachedData = void 0;
  }
  delete nuxtApp._asyncDataPromises[key];
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) newObj[key] = obj[key];
  return newObj;
}
function buildAsyncData(nuxtApp, key, _handler, options, initialCachedData) {
  var _a, _b;
  (_b = (_a = nuxtApp.payload._errors)[key]) != null ? _b : _a[key] = void 0;
  const hasCustomGetCachedData = options.getCachedData !== getDefaultCachedData;
  const handler = _handler ;
  const _ref = options.deep ? ref : shallowRef;
  const hasCachedData = initialCachedData !== void 0;
  const unsubRefreshAsyncData = nuxtApp.hook("app:data:refresh", async (keys) => {
    if (!keys || keys.includes(key)) await asyncData.execute({ cause: "refresh:hook" });
  });
  const asyncData = {
    data: _ref(hasCachedData ? initialCachedData : options.default()),
    pending: computed(() => asyncData.status.value === "pending"),
    error: toRef(nuxtApp.payload._errors, key),
    status: shallowRef("idle"),
    execute: (...args) => {
      var _a2, _b2;
      const [_opts, newValue = void 0] = args;
      const opts = _opts && newValue === void 0 && typeof _opts === "object" ? _opts : {};
      if (nuxtApp._asyncDataPromises[key]) {
        if (((_a2 = opts.dedupe) != null ? _a2 : options.dedupe) === "defer") return nuxtApp._asyncDataPromises[key];
      }
      {
        const cachedData = "cachedData" in opts ? opts.cachedData : options.getCachedData(key, nuxtApp, { cause: (_b2 = opts.cause) != null ? _b2 : "refresh:manual" });
        if (cachedData !== void 0) {
          nuxtApp.payload.data[key] = asyncData.data.value = cachedData;
          asyncData.error.value = void 0;
          asyncData.status.value = "success";
          return Promise.resolve(cachedData);
        }
      }
      if (toValue(options.enabled) === false) return Promise.resolve(asyncData.data.value);
      if (asyncData._abortController) asyncData._abortController.abort(new DOMException("AsyncData request cancelled by deduplication", "AbortError"));
      asyncData._abortController = new AbortController();
      asyncData.status.value = "pending";
      const cleanupController = new AbortController();
      const promise = new Promise((resolve, reject) => {
        var _a3, _b3;
        try {
          const timeout = (_a3 = opts.timeout) != null ? _a3 : options.timeout;
          const mergedSignal = mergeAbortSignals([(_b3 = asyncData._abortController) == null ? void 0 : _b3.signal, opts == null ? void 0 : opts.signal], cleanupController.signal, timeout);
          if (mergedSignal.aborted) {
            const reason = mergedSignal.reason;
            reject(reason instanceof Error ? reason : new DOMException(String(reason != null ? reason : "Aborted"), "AbortError"));
            return;
          }
          mergedSignal.addEventListener("abort", () => {
            const reason = mergedSignal.reason;
            reject(reason instanceof Error ? reason : new DOMException(String(reason != null ? reason : "Aborted"), "AbortError"));
          }, {
            once: true,
            signal: cleanupController.signal
          });
          return Promise.resolve(handler(nuxtApp, { signal: mergedSignal })).then(resolve, reject);
        } catch (err) {
          reject(err);
        }
      }).then(async (_result) => {
        if (nuxtApp._asyncDataPromises[key] !== promise) return;
        let result = _result;
        if (options.transform) result = await options.transform(_result);
        if (options.pick) result = pick(result, options.pick);
        nuxtApp.payload.data[key] = result;
        asyncData.data.value = result;
        asyncData.error.value = void 0;
        asyncData.status.value = "success";
      }).catch((error) => {
        var _a3;
        if (nuxtApp._asyncDataPromises[key] !== promise) return nuxtApp._asyncDataPromises[key];
        if ((_a3 = asyncData._abortController) == null ? void 0 : _a3.signal.aborted) return nuxtApp._asyncDataPromises[key];
        if (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError") {
          asyncData.status.value = "idle";
          return nuxtApp._asyncDataPromises[key];
        }
        asyncData.error.value = createError$1(error);
        asyncData.data.value = unref(options.default());
        asyncData.status.value = "error";
      }).finally(() => {
        cleanupController.abort();
        if (nuxtApp._asyncDataPromises[key] === promise) delete nuxtApp._asyncDataPromises[key];
      });
      nuxtApp._asyncDataPromises[key] = promise;
      return nuxtApp._asyncDataPromises[key];
    },
    _execute: debounce((...args) => asyncData.execute(...args), 0, { leading: true }),
    _default: options.default,
    _deps: 0,
    _init: true,
    _hash: void 0,
    _off: () => {
      var _a2, _b2;
      unsubRefreshAsyncData();
      if ((_a2 = nuxtApp._asyncData[key]) == null ? void 0 : _a2._init) nuxtApp._asyncData[key]._init = false;
      if (nuxtApp._asyncDataPromises[key]) {
        (_b2 = asyncData._abortController) == null ? void 0 : _b2.abort(new DOMException("AsyncData request cancelled by unmount", "AbortError"));
        delete nuxtApp._asyncDataPromises[key];
      }
      if (!hasCustomGetCachedData) nextTick(() => {
        var _a3;
        if (!((_a3 = nuxtApp._asyncData[key]) == null ? void 0 : _a3._init)) {
          clearNuxtDataByKey(nuxtApp, key);
          asyncData.execute = () => Promise.resolve();
        }
      });
    }
  };
  return asyncData;
}
var getDefault = () => void 0;
var getDefaultCachedData = (key, nuxtApp, ctx) => {
  if (nuxtApp.isHydrating) return nuxtApp.payload.data[key];
  if (ctx.cause !== "refresh:manual" && ctx.cause !== "refresh:hook") return nuxtApp.static.data[key];
};
function mergeAbortSignals(signals, cleanupSignal, timeout) {
  var _a, _b, _c;
  const list = signals.filter((s) => !!s);
  if (typeof timeout === "number" && timeout >= 0) {
    const timeoutSignal = (_a = AbortSignal.timeout) == null ? void 0 : _a.call(AbortSignal, timeout);
    if (timeoutSignal) list.push(timeoutSignal);
  }
  if (AbortSignal.any) return AbortSignal.any(list);
  const controller = new AbortController();
  for (const sig of list) if (sig.aborted) {
    const reason = (_b = sig.reason) != null ? _b : new DOMException("Aborted", "AbortError");
    try {
      controller.abort(reason);
    } catch {
      controller.abort();
    }
    return controller.signal;
  }
  const onAbort = () => {
    var _a2, _b2;
    const reason = (_b2 = (_a2 = list.find((s) => s.aborted)) == null ? void 0 : _a2.reason) != null ? _b2 : new DOMException("Aborted", "AbortError");
    try {
      controller.abort(reason);
    } catch {
      controller.abort();
    }
  };
  for (const sig of list) (_c = sig.addEventListener) == null ? void 0 : _c.call(sig, "abort", onAbort, {
    once: true,
    signal: cleanupSignal
  });
  return controller.signal;
}

//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	__defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region virtual:nuxt:.nuxt-prod%2Fglobal-polyfills.mjs
if (!("global" in globalThis)) globalThis.global = globalThis;
//#endregion
//#region node_modules/nuxt/dist/head/runtime/island-head.js
/**
* No-op `head.push` until the returned `unfreeze` runs. Plugin/transformer
* augmentations on the same head are unaffected.
*/
function freezeHead(head) {
	const realPush = head.push;
	head.push = () => ({
		dispose: () => {},
		patch: () => {},
		_i: 0
	});
	return () => {
		head.push = realPush;
	};
}
//#endregion
//#region node_modules/nuxt/dist/head/runtime/plugins/unhead.server.js
var plugin$2 = defineNuxtPlugin({
	name: "nuxt:head",
	enforce: "pre",
	setup(nuxtApp) {
		const head = nuxtApp.ssrContext.head;
		if (nuxtApp.ssrContext.islandContext) {
			const unfreeze = freezeHead(head);
			nuxtApp.hooks.hookOnce("app:created", unfreeze);
		}
		nuxtApp.vueApp.use(head);
	}
});
//#endregion
//#region node_modules/nuxt/dist/pages/runtime/utils.js
var ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
var ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
var ROUTE_KEY_NORMAL_RE = /:\w+/g;
var interpolatePath = (route, match) => {
	return match.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
};
var generateRouteKey = (routeProps, override) => {
	const matchedRoute = routeProps.route.matched.find((m) => m.components?.default === routeProps.Component.type);
	const source = matchedRoute?.meta.key ?? (matchedRoute && interpolatePath(routeProps.route, matchedRoute));
	return typeof source === "function" ? source(routeProps.route) : source;
};
/** @since 3.9.0 */
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
//#endregion
//#region node_modules/nuxt/dist/pages/runtime/router.options.js
var router_options_default = { scrollBehavior(to, from, savedPosition) {
	const nuxtApp = useNuxtApp();
	const hashScrollBehaviour = useRouter().options?.scrollBehaviorType ?? "auto";
	if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
		if (from.hash && !to.hash) return savedPosition ?? {
			left: 0,
			top: 0
		};
		if (to.hash) return {
			el: to.hash,
			top: _getHashElementScrollMarginTop(to.hash),
			behavior: hashScrollBehaviour
		};
		return false;
	}
	if ((typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop) === false) return false;
	if (from === START_LOCATION) return _calculatePosition(to, from, savedPosition, hashScrollBehaviour);
	return new Promise((resolve) => {
		const doScroll = () => {
			requestAnimationFrame(() => resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour)));
		};
		nuxtApp.hooks.hookOnce("page:loading:end", () => {
			const transitionPromise = nuxtApp["~transitionPromise"];
			if (transitionPromise) transitionPromise.then(doScroll);
			else doScroll();
		});
	});
} };
function _getHashElementScrollMarginTop(selector) {
	try {
		const elem = (void 0).querySelector(selector);
		if (elem) return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
	} catch {}
	return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
	if (savedPosition) return savedPosition;
	if (to.hash) return {
		el: to.hash,
		top: _getHashElementScrollMarginTop(to.hash),
		behavior: isChangingPage(to, from) ? defaultHashScrollBehaviour : "instant"
	};
	return {
		left: 0,
		top: 0
	};
}
var virtual_nuxt__nuxt_prod_2Frouter_options_default = {
	hashMode: false,
	scrollBehaviorType: "auto",
	...router_options_default
};
Object.assign(Object.create(null), {});
var pageIslandRoutes = Object.assign(Object.create(null), {});
//#endregion
//#region node_modules/nuxt/dist/pages/runtime/validate.js
var middleware$1 = defineNuxtRouteMiddleware(async (to) => {
	let __temp, __restore;
	if (!to.meta?.validate) return;
	const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
	if (result === true) return;
	return createError$1({
		fatal: false,
		status: result && (result.status || result.statusCode) || 404,
		statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
		data: { path: to.fullPath }
	});
});
//#endregion
//#region node_modules/nuxt/dist/app/diagnostics/manifest.js
/**
* E5xxx
* App manifest / route-rules runtime diagnostics.
*/
var manifestDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
//#endregion
//#region virtual:nuxt:.nuxt-prod%2Froute-rules.mjs
var matcher = /* @__PURE__ */ (() => {
	const $0 = { prerender: false };
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1);
		let s = p.split("/");
		if (s.length > 1 && s[s.length - 1] === "") {
			s.pop();
			p = p.slice(0, -1);
		}
		if (s.length > 1) {
			if (s[1] === "api") r.push({
				data: $0,
				params: { "_": p.slice(5) }
			});
		}
		return r.reverse();
	};
})();
var virtual_nuxt__nuxt_prod_2Froute_rules_default = (path) => defu({}, ...matcher("", typeof path === "string" ? path.toLowerCase() : path).map((r) => r.data).reverse());
//#endregion
//#region node_modules/nuxt/dist/app/composables/manifest.js
var routeRulesMatcher$1 = virtual_nuxt__nuxt_prod_2Froute_rules_default;
function getRouteRules(arg) {
	const path = typeof arg === "string" ? arg : arg.path;
	try {
		return routeRulesMatcher$1(path.toLowerCase());
	} catch (e) {
		manifestDiagnostics.NUXT_E5003({
			path,
			cause: e
		});
		return {};
	}
}
//#endregion
//#region virtual:nuxt:.nuxt-prod%2Fmiddleware.mjs
var globalMiddleware = [middleware$1, /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {})];
var namedMiddleware = {
	auth: () => import('../build/auth-C_qOkDJZ.mjs'),
	guest: () => import('../build/guest-GfyNMhEn.mjs')
};
//#endregion
//#region app/pages/playlists/[id].vue?macro=true&vue&type=script&setup=true&lang.ts
var __nuxt_page_meta$6 = { layout: "default" };
//#endregion
//#region app/pages/actions.vue?macro=true&vue&type=script&setup=true&lang.ts
var __nuxt_page_meta$5 = { layout: "default" };
//#endregion
//#region app/pages/home.vue?macro=true&vue&type=script&setup=true&lang.ts
var __nuxt_page_meta$4 = { layout: "default" };
//#endregion
//#region app/pages/notifications.vue?macro=true&vue&type=script&setup=true&lang.ts
var __nuxt_page_meta$3 = { middleware: [function() {
	return navigateTo("/actions", { redirectCode: 302 });
}] };
//#endregion
//#region app/pages/signin.vue?macro=true&vue&type=script&setup=true&lang.ts
var __nuxt_page_meta$2 = { layout: false };
//#endregion
//#region app/pages/signup.vue?macro=true&vue&type=script&setup=true&lang.ts
var __nuxt_page_meta$1 = { layout: false };
//#endregion
//#region app/pages/index.vue?macro=true&vue&type=script&setup=true&lang.ts
var __nuxt_page_meta = { layout: false };
//#endregion
//#region virtual:nuxt:.nuxt-prod%2Froutes.mjs
var virtual_nuxt__nuxt_prod_2Froutes_default = [
	{
		name: "dm-id",
		path: "/dm/:id()",
		meta: { "middleware": "auth" },
		component: () => import('../build/_id_-DWkT_dvI.mjs')
	},
	{
		name: "invite-code",
		path: "/invite/:code()",
		meta: { "middleware": "auth" },
		component: () => import('../build/_code_-BUdsNBJg.mjs')
	},
	{
		name: "playlists-id",
		path: "/playlists/:id()",
		meta: {
			...__nuxt_page_meta$6 || {},
			"middleware": "auth"
		},
		component: () => import('../build/_id_-BANLWcLy.mjs')
	},
	{
		name: "profile-slug",
		path: "/profile/:slug()",
		component: () => import('../build/_slug_-CFB6sOqq.mjs')
	},
	{
		name: "servers-id",
		path: "/servers/:id()",
		meta: { "middleware": "auth" },
		component: () => import('../build/_id_-us9-SHRX.mjs')
	},
	{
		name: "actions",
		path: "/actions",
		meta: {
			...__nuxt_page_meta$5 || {},
			"middleware": "auth"
		},
		component: () => import('../build/actions-BbPWjnhS.mjs')
	},
	{
		name: "dm",
		path: "/dm",
		meta: { "middleware": "auth" },
		component: () => import('../build/dm-LD4aQpDi.mjs')
	},
	{
		name: "home",
		path: "/home",
		meta: {
			...__nuxt_page_meta$4 || {},
			"middleware": "auth"
		},
		component: () => import('../build/home-cgpW5qM6.mjs')
	},
	{
		name: "notifications",
		path: "/notifications",
		meta: __nuxt_page_meta$3 || {},
		component: () => import('../build/notifications-Jn0Wl8m0.mjs')
	},
	{
		name: "servers",
		path: "/servers",
		meta: { "middleware": "auth" },
		component: () => import('../build/servers-QTf4jadu.mjs')
	},
	{
		name: "signin",
		path: "/signin",
		meta: __nuxt_page_meta$2 || {},
		component: () => import('../build/signin-DiW1n438.mjs')
	},
	{
		name: "signup",
		path: "/signup",
		meta: __nuxt_page_meta$1 || {},
		component: () => import('../build/signup-PciZhS6q.mjs')
	},
	{
		name: "index",
		path: "/",
		meta: {
			...__nuxt_page_meta || {},
			"middleware": "guest"
		},
		component: () => import('../build/pages-ka5OFtVb.mjs')
	}
];
//#endregion
//#region node_modules/nuxt/dist/pages/runtime/plugins/router.js
var plugin$1 = defineNuxtPlugin({
	name: "nuxt:router",
	enforce: "pre",
	async setup(nuxtApp) {
		let __temp, __restore;
		let routerBase = useRuntimeConfig().app.baseURL;
		const history = virtual_nuxt__nuxt_prod_2Frouter_options_default.history?.(routerBase) ?? createMemoryHistory(routerBase);
		const routes = virtual_nuxt__nuxt_prod_2Frouter_options_default.routes ? ([__temp, __restore] = executeAsync(() => virtual_nuxt__nuxt_prod_2Frouter_options_default.routes(virtual_nuxt__nuxt_prod_2Froutes_default)), __temp = await __temp, __restore(), __temp) ?? virtual_nuxt__nuxt_prod_2Froutes_default : virtual_nuxt__nuxt_prod_2Froutes_default;
		let startPosition;
		const router = createRouter({
			...virtual_nuxt__nuxt_prod_2Frouter_options_default,
			scrollBehavior: (to, from, savedPosition) => {
				if (from === START_LOCATION) {
					startPosition = savedPosition;
					return;
				}
				if (virtual_nuxt__nuxt_prod_2Frouter_options_default.scrollBehavior) {
					router.options.scrollBehavior = virtual_nuxt__nuxt_prod_2Frouter_options_default.scrollBehavior;
					if ("scrollRestoration" in (void 0).history) {
						const unsub = router.beforeEach(() => {
							unsub();
							(void 0).history.scrollRestoration = "manual";
						});
					}
					return virtual_nuxt__nuxt_prod_2Frouter_options_default.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
				}
			},
			history,
			routes
		});
		nuxtApp.vueApp.use(router);
		const previousRoute = shallowRef(router.currentRoute.value);
		router.afterEach((_to, from) => {
			previousRoute.value = from;
		});
		Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", { get: () => previousRoute.value });
		const initialURL = nuxtApp.ssrContext.url;
		const _route = shallowRef(router.currentRoute.value);
		const syncCurrentRoute = () => {
			_route.value = router.currentRoute.value;
		};
		router.afterEach((to, from) => {
			const lastTo = to.matched.at(-1)?.components?.default;
			const lastFrom = from.matched.at(-1)?.components?.default;
			if (lastTo === lastFrom) {
				if (generateRouteKey({
					route: to,
					Component: { type: lastTo }
				}) === generateRouteKey({
					route: from,
					Component: { type: lastFrom }
				})) syncCurrentRoute();
				return;
			}
			if (to.matched.length < from.matched.length && to.matched.every((m, i) => m.components?.default === from.matched[i]?.components?.default)) syncCurrentRoute();
		});
		const route = { sync: syncCurrentRoute };
		for (const key in _route.value) Object.defineProperty(route, key, {
			get: () => _route.value[key],
			enumerable: true
		});
		nuxtApp._route = shallowReactive(route);
		nuxtApp._middleware ||= {
			global: [],
			named: {}
		};
		const error = useError();
		const isServerPage = nuxtApp.ssrContext?.islandContext?.name?.startsWith("page_");
		if (!nuxtApp.ssrContext?.islandContext || isServerPage) router.afterEach(async (to, _from, failure) => {
			delete nuxtApp._processingMiddleware;
			if (failure) await nuxtApp.callHook("page:loading:end");
			if (failure?.type === 4) return;
			if (to.redirectedFrom && to.fullPath !== initialURL) await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
		});
		try {
			[__temp, __restore] = executeAsync(() => router.push(initialURL)), __temp = await __temp, __restore();
			[__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
		} catch (error) {
			[__temp, __restore] = executeAsync(() => _showErrorUnlessCrawler(nuxtApp, error)), await __temp, __restore();
		}
		const resolvedInitialRoute = router.currentRoute.value;
		syncCurrentRoute();
		if (nuxtApp.ssrContext?.islandContext && !isServerPage) return { provide: { router } };
		const initialLayout = nuxtApp.payload.state._layout;
		router.beforeEach(async (to, from) => {
			await nuxtApp.callHook("page:loading:start");
			to.meta = reactive(to.meta);
			if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) to.meta.layout = initialLayout;
			nuxtApp._processingMiddleware = true;
			if (!nuxtApp.ssrContext?.islandContext || isServerPage) {
				const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
				for (const component of to.matched) {
					const componentMiddleware = component.meta.middleware;
					if (!componentMiddleware) continue;
					for (const entry of toArray(componentMiddleware)) middlewareEntries.add(entry);
				}
				const routeRules = getRouteRules({ path: to.path });
				if (routeRules.appMiddleware) for (const key in routeRules.appMiddleware) if (routeRules.appMiddleware[key]) middlewareEntries.add(key);
				else middlewareEntries.delete(key);
				for (const entry of middlewareEntries) {
					const middleware = typeof entry === "string" ? nuxtApp._middleware.named[entry] || await namedMiddleware[entry]?.().then((r) => r.default || r) : entry;
					if (!middleware) throw navigationDiagnostics.NUXT_E2004({
						entry: String(entry),
						validMiddleware: void 0
					});
					try {
						const result = await nuxtApp.runWithContext(() => middleware(to, from));
						if (result === false || result instanceof Error) {
							const error = result || createError$1({
								status: 404,
								statusText: `Page Not Found: ${initialURL}`
							});
							await nuxtApp.runWithContext(() => showError(error));
							return false;
						}
						if (result === true) continue;
						if (result === false) return result;
						if (result) {
							if (isNuxtError(result) && result.fatal) await nuxtApp.runWithContext(() => showError(result));
							return result;
						}
					} catch (err) {
						const error = createError$1(err);
						if (error.fatal) await nuxtApp.runWithContext(() => showError(error));
						return error;
					}
				}
			}
		});
		if (isServerPage) router.beforeResolve((to) => {
			const expected = pageIslandRoutes[nuxtApp.ssrContext.islandContext.name];
			const actual = to.matched.find((m) => (m.components?.default)?.__nuxt_island)?.components?.default;
			if (!expected || expected !== actual?.__nuxt_island) {
				nuxtApp.ssrContext["~renderResponse"] = {
					statusCode: 400,
					statusMessage: "Invalid island request path"
				};
				return false;
			}
		});
		router.onError(async () => {
			delete nuxtApp._processingMiddleware;
			await nuxtApp.callHook("page:loading:end");
		});
		router.afterEach((to) => {
			if (to.matched.length === 0 && !error.value) return nuxtApp.runWithContext(() => showError(createError$1({
				status: 404,
				fatal: false,
				statusText: `Page not found: ${to.fullPath}`,
				data: { path: to.fullPath }
			})));
		});
		nuxtApp.hooks.hookOnce("app:created", async () => {
			try {
				if ("name" in resolvedInitialRoute) resolvedInitialRoute.name = void 0;
				await router.replace({
					...resolvedInitialRoute,
					force: true
				});
				router.options.scrollBehavior = virtual_nuxt__nuxt_prod_2Frouter_options_default.scrollBehavior;
			} catch (error) {
				await _showErrorUnlessCrawler(nuxtApp, error);
			}
		});
		return { provide: { router } };
	}
});
//#endregion
//#region node_modules/nuxt/dist/app/diagnostics/state.js
/**
* E7xxx
* Payload / state / cookie runtime diagnostics.
*/
var stateDiagnostics = /* #__PURE__ */ defineProdDiagnostics({
	docsBase,
	reporters: prodReporters
});
//#endregion
//#region node_modules/nuxt/dist/app/composables/payload.js
/**
* This is an experimental function for configuring passing rich data from server -> client.
* @since 3.4.0
*/
function definePayloadReducer(name, reduce) {
	useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
}
//#endregion
//#region node_modules/nuxt/dist/app/plugins/revive-payload.server.js
var reducers = [
	["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
	["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
	["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
	["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
	["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
	["Ref", (data) => isRef(data) && data.value],
	["Reactive", (data) => isReactive(data) && toRaw(data)]
];
var plugin = /* @__PURE__ */ defineNuxtPlugin({
	name: "nuxt:revive-payload:server",
	setup() {
		for (const [reducer, fn] of reducers) definePayloadReducer(reducer, fn);
	}
});
//#endregion
//#region virtual:nuxt:.nuxt-prod%2Fcomponents.plugin.mjs
var lazyGlobalComponents = [["Icon", defineAsyncComponent(() => Promise.resolve().then(() => components_exports).then((r) => r["default"] || r.default || r))]];
var virtual_nuxt__nuxt_prod_2Fcomponents_plugin_default = defineNuxtPlugin({
	name: "nuxt:global-components",
	setup(nuxtApp) {
		for (const [name, component] of lazyGlobalComponents) {
			nuxtApp.vueApp.component(name, component);
			nuxtApp.vueApp.component("Lazy" + name, component);
		}
	}
});
//#endregion
//#region virtual:nuxt:.nuxt-prod%2Fcolor-mode-options.mjs
var preference = "system";
//#endregion
//#region node_modules/nuxt/dist/app/composables/state.js
var useStateKeyPrefix = "$s";
function useState(...args) {
	const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
	if (typeof args[0] !== "string") args.unshift(autoKey);
	const [_key, init] = args;
	if (!_key || typeof _key !== "string") throw stateDiagnostics.NUXT_E7009({ key: _key });
	if (init !== void 0 && typeof init !== "function") throw stateDiagnostics.NUXT_E7007({ type: typeof init });
	const key = useStateKeyPrefix + _key;
	const nuxtApp = useNuxtApp();
	const state = toRef(nuxtApp.payload.state, key);
	if (init) nuxtApp._state[key] ??= { _default: init };
	if (state.value === void 0 && init) {
		const initialValue = init();
		if (isRef(initialValue)) {
			nuxtApp.payload.state[key] = initialValue;
			return initialValue;
		}
		state.value = initialValue;
	}
	return state;
}
//#endregion
//#region node_modules/@nuxtjs/color-mode/dist/runtime/plugin.server.js
var plugin_server_default = defineNuxtPlugin((nuxtApp) => {
	const colorMode = nuxtApp.ssrContext?.islandContext ? ref({}).value : useState("color-mode", () => reactive({
		preference,
		value: preference,
		unknown: true,
		forced: false
	})).value;
	const htmlAttrs = {};
	useHead$1({ htmlAttrs });
	useRouter().afterEach((to) => {
		const forcedColorMode = to.meta.colorMode;
		if (forcedColorMode && forcedColorMode !== "system") {
			htmlAttrs["data-color-mode-forced"] = forcedColorMode;
			colorMode.value = forcedColorMode;
			colorMode.forced = true;
		} else if (forcedColorMode === "system") console.warn("You cannot force the colorMode to system at the page level.");
	});
	nuxtApp.provide("colorMode", colorMode);
});
/** client-end **/
var virtual_nuxt__nuxt_prod_2Fapp_config_default = /*@__PURE__*/ defuFn({
	"nuxt": {},
	"icon": {
		"provider": "server",
		"class": "",
		"aliases": {},
		"iconifyApiEndpoint": "https://api.iconify.design",
		"localApiEndpoint": "/api/_nuxt_icon",
		"fallbackToApi": true,
		"cssSelectorPrefix": "i-",
		"cssWherePseudo": true,
		"mode": "css",
		"attrs": { "aria-hidden": true },
		"collections": [
			"academicons",
			"akar-icons",
			"ant-design",
			"arcticons",
			"basil",
			"bi",
			"bitcoin-icons",
			"bpmn",
			"brandico",
			"bx",
			"bxl",
			"bxs",
			"bytesize",
			"carbon",
			"catppuccin",
			"cbi",
			"charm",
			"ci",
			"cib",
			"cif",
			"cil",
			"circle-flags",
			"circum",
			"clarity",
			"codex",
			"codicon",
			"covid",
			"cryptocurrency",
			"cryptocurrency-color",
			"cuida",
			"dashicons",
			"devicon",
			"devicon-plain",
			"dinkie-icons",
			"duo-icons",
			"ei",
			"el",
			"emojione",
			"emojione-monotone",
			"emojione-v1",
			"entypo",
			"entypo-social",
			"eos-icons",
			"ep",
			"et",
			"eva",
			"f7",
			"fa",
			"fa-brands",
			"fa-regular",
			"fa-solid",
			"fa6-brands",
			"fa6-regular",
			"fa6-solid",
			"fa7-brands",
			"fa7-regular",
			"fa7-solid",
			"fad",
			"famicons",
			"fe",
			"feather",
			"file-icons",
			"flag",
			"flagpack",
			"flat-color-icons",
			"flat-ui",
			"flowbite",
			"fluent",
			"fluent-color",
			"fluent-emoji",
			"fluent-emoji-flat",
			"fluent-emoji-high-contrast",
			"fluent-mdl2",
			"fontelico",
			"fontisto",
			"formkit",
			"foundation",
			"fxemoji",
			"gala",
			"game-icons",
			"garden",
			"geo",
			"gg",
			"gis",
			"gravity-ui",
			"gridicons",
			"grommet-icons",
			"guidance",
			"healthicons",
			"heroicons",
			"heroicons-outline",
			"heroicons-solid",
			"hugeicons",
			"humbleicons",
			"ic",
			"icomoon-free",
			"icon-park",
			"icon-park-outline",
			"icon-park-solid",
			"icon-park-twotone",
			"iconamoon",
			"iconoir",
			"icons8",
			"il",
			"ion",
			"iwwa",
			"ix",
			"jam",
			"la",
			"lets-icons",
			"line-md",
			"lineicons",
			"logos",
			"ls",
			"lsicon",
			"lucide",
			"lucide-lab",
			"mage",
			"majesticons",
			"maki",
			"map",
			"marketeq",
			"material-icon-theme",
			"material-symbols",
			"material-symbols-light",
			"mdi",
			"mdi-light",
			"medical-icon",
			"memory",
			"meteocons",
			"meteor-icons",
			"mi",
			"mingcute",
			"mono-icons",
			"mynaui",
			"nimbus",
			"nonicons",
			"noto",
			"noto-v1",
			"nrk",
			"octicon",
			"oi",
			"ooui",
			"openmoji",
			"oui",
			"pajamas",
			"pepicons",
			"pepicons-pencil",
			"pepicons-pop",
			"pepicons-print",
			"ph",
			"picon",
			"pixel",
			"pixelarticons",
			"prime",
			"proicons",
			"ps",
			"qlementine-icons",
			"quill",
			"radix-icons",
			"raphael",
			"ri",
			"rivet-icons",
			"roentgen",
			"si",
			"si-glyph",
			"sidekickicons",
			"simple-icons",
			"simple-line-icons",
			"skill-icons",
			"solar",
			"stash",
			"streamline",
			"streamline-block",
			"streamline-color",
			"streamline-cyber",
			"streamline-cyber-color",
			"streamline-emojis",
			"streamline-flex",
			"streamline-flex-color",
			"streamline-freehand",
			"streamline-freehand-color",
			"streamline-kameleon-color",
			"streamline-logos",
			"streamline-pixel",
			"streamline-plump",
			"streamline-plump-color",
			"streamline-sharp",
			"streamline-sharp-color",
			"streamline-stickies-color",
			"streamline-ultimate",
			"streamline-ultimate-color",
			"subway",
			"svg-spinners",
			"system-uicons",
			"tabler",
			"tdesign",
			"teenyicons",
			"temaki",
			"token",
			"token-branded",
			"topcoat",
			"twemoji",
			"typcn",
			"uil",
			"uim",
			"uis",
			"uit",
			"uiw",
			"unjs",
			"vaadin",
			"vs",
			"vscode-icons",
			"websymbol",
			"weui",
			"whh",
			"wi",
			"wpf",
			"zmdi",
			"zondicons"
		],
		"fetchTimeout": 1500
	}
});
//#endregion
//#region node_modules/nuxt/dist/app/config.js
function useAppConfig() {
	const nuxtApp = useNuxtApp();
	nuxtApp._appConfig ||= klona(virtual_nuxt__nuxt_prod_2Fapp_config_default);
	return nuxtApp._appConfig;
}
//#endregion
//#region virtual:nuxt:.nuxt-prod%2Fplugins.server.mjs
var virtual_nuxt__nuxt_prod_2Fplugins_server_default = [
	plugin$2,
	plugin$1,
	plugin,
	virtual_nuxt__nuxt_prod_2Fcomponents_plugin_default,
	plugin_server_default,
	defineNuxtPlugin({
		name: "@nuxt/icon",
		setup() {
			const configs = useRuntimeConfig();
			const options = useAppConfig().icon;
			_api.setFetch($fetch.native);
			const resources = [];
			if (options.provider === "server") {
				const baseURL = configs.app?.baseURL?.replace(/\/$/, "") ?? "";
				resources.push(baseURL + (options.localApiEndpoint || "/api/_nuxt_icon"));
				if (options.fallbackToApi === true || options.fallbackToApi === "client-only") resources.push(options.iconifyApiEndpoint);
			} else if (options.provider === "none") _api.setFetch(() => Promise.resolve(new Response()));
			else resources.push(options.iconifyApiEndpoint);
			async function customIconLoader(icons, prefix) {
				try {
					const data = await $fetch(resources[0] + "/" + prefix + ".json", { query: { icons: icons.join(",") } });
					if (!data || data.prefix !== prefix || !data.icons) throw new Error("Invalid data" + JSON.stringify(data));
					return data;
				} catch (e) {
					console.error("Failed to load custom icons", e);
					return null;
				}
			}
			addAPIProvider("", { resources });
			for (const prefix of options.customCollections || []) if (prefix) setCustomIconsLoader(customIconLoader, prefix);
		}
	})
];
//#endregion
//#region node_modules/nuxt/dist/app/composables/layout.js
var routeRulesMatcher = virtual_nuxt__nuxt_prod_2Froute_rules_default;
function resolveLayoutName(route, name) {
	return unref(name) ?? route?.meta.layout ?? routeRulesMatcher(route?.path ?? "/").appLayout ?? "default";
}
//#endregion
//#region virtual:nuxt:.nuxt-prod%2Flayouts.mjs
var virtual_nuxt__nuxt_prod_2Flayouts_default = { default: defineAsyncComponent(() => import('../build/default-BoEOPw6f.mjs').then((m) => m.default || m)) };
//#endregion
//#region node_modules/nuxt/dist/app/components/nuxt-layout.js
var LayoutLoader = defineComponent({
	name: "LayoutLoader",
	inheritAttrs: false,
	props: {
		name: String,
		layoutProps: Object
	},
	setup(props, context) {
		return () => h(virtual_nuxt__nuxt_prod_2Flayouts_default[props.name], props.layoutProps, context.slots);
	}
});
var nuxt_layout_default = defineComponent({
	name: "NuxtLayout",
	inheritAttrs: false,
	props: {
		name: {
			type: [
				String,
				Boolean,
				Object
			],
			default: null
		},
		fallback: {
			type: [String, Object],
			default: null
		}
	},
	setup(props, context) {
		const nuxtApp = useNuxtApp();
		const injectedRoute = inject(PageRouteSymbol);
		const route = !injectedRoute || injectedRoute === useRoute() ? useRoute$1() : injectedRoute;
		const layout = computed(() => {
			let layout = resolveLayoutName(route, props.name);
			if (layout && !(layout in virtual_nuxt__nuxt_prod_2Flayouts_default)) {
				if (props.fallback) layout = unref(props.fallback);
			}
			return layout;
		});
		provide(LayoutSymbol, layout);
		const layoutRef = shallowRef();
		context.expose({ layoutRef });
		const done = nuxtApp.deferHydration();
		let lastLayout;
		return () => {
			const hasTransition = !!layout.value && layout.value in virtual_nuxt__nuxt_prod_2Flayouts_default && !!(route?.meta.layoutTransition ?? false);
			const transitionProps = hasTransition && _mergeTransitionProps([
				route?.meta.layoutTransition,
				false,
				{
					onBeforeLeave() {
						nuxtApp["~transitionPromise"] = new Promise((resolve) => {
							nuxtApp["~transitionFinish"] = resolve;
						});
					},
					onAfterLeave() {
						nuxtApp["~transitionFinish"]?.();
						delete nuxtApp["~transitionFinish"];
						delete nuxtApp["~transitionPromise"];
					}
				}
			]);
			const previouslyRenderedLayout = lastLayout;
			lastLayout = layout.value;
			return _wrapInTransition(transitionProps, { default: () => h(Suspense, {
				suspensible: true,
				onResolve: async () => {
					await nextTick(done);
				}
			}, { default: () => h(LayoutProvider, {
				layoutProps: mergeProps(context.attrs, route.meta.layoutProps ?? {}, { ref: layoutRef }),
				key: layout.value || void 0,
				name: layout.value,
				shouldProvide: !props.name,
				isRenderingNewLayout: (name) => {
					return name !== previouslyRenderedLayout && name === layout.value;
				},
				hasTransition
			}, context.slots) }) }).default();
		};
	}
});
var LayoutProvider = defineComponent({
	name: "NuxtLayoutProvider",
	inheritAttrs: false,
	props: {
		name: { type: [String, Boolean] },
		layoutProps: { type: Object },
		hasTransition: { type: Boolean },
		shouldProvide: { type: Boolean },
		isRenderingNewLayout: {
			type: Function,
			required: true
		}
	},
	setup(props, context) {
		const name = props.name;
		if (props.shouldProvide) provide(LayoutMetaSymbol, { isCurrent: (route) => name === false || name === resolveLayoutName(route) });
		const injectedRoute = inject(PageRouteSymbol);
		const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
		const enclosingLayout = inject(LayoutMetaSymbol, null);
		if (isNotWithinNuxtPage) {
			const vueRouterRoute = useRoute$1();
			const reactiveChildRoute = {};
			for (const _key in vueRouterRoute) {
				const key = _key;
				Object.defineProperty(reactiveChildRoute, key, {
					enumerable: true,
					get: () => {
						return props.isRenderingNewLayout(props.name) && (!enclosingLayout || enclosingLayout.isCurrent(vueRouterRoute)) ? vueRouterRoute[key] : injectedRoute[key];
					}
				});
			}
			provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
		}
		return () => {
			if (!name || typeof name === "string" && !(name in virtual_nuxt__nuxt_prod_2Flayouts_default)) return context.slots.default?.();
			return h(LayoutLoader, {
				key: name,
				layoutProps: props.layoutProps,
				name
			}, context.slots);
		};
	}
});
//#endregion
//#region node_modules/nuxt/dist/app/components/route-provider.js
var defineRouteProvider = (name = "RouteProvider") => defineComponent({
	name,
	props: {
		route: {
			type: Object,
			required: true
		},
		vnode: Object,
		vnodeRef: Object,
		renderKey: String,
		trackRootNodes: Boolean
	},
	setup(props) {
		const previousKey = props.renderKey;
		const previousRoute = props.route;
		const route = {};
		for (const key in props.route) Object.defineProperty(route, key, {
			get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
			enumerable: true
		});
		provide(PageRouteSymbol, shallowReactive(route));
		return () => {
			if (!props.vnode) return props.vnode;
			return h(props.vnode, { ref: props.vnodeRef });
		};
	}
});
var RouteProvider = defineRouteProvider();
//#endregion
//#region node_modules/nuxt/dist/pages/runtime/page.js
var page_default = defineComponent({
	name: "NuxtPage",
	inheritAttrs: false,
	props: {
		name: { type: String },
		transition: {
			type: [Boolean, Object],
			default: void 0
		},
		keepalive: {
			type: [Boolean, Object],
			default: void 0
		},
		route: { type: Object },
		pageKey: {
			type: [Function, String],
			default: null
		}
	},
	setup(props, { attrs, slots, expose }) {
		const nuxtApp = useNuxtApp();
		const pageRef = ref();
		inject(PageRouteSymbol, null);
		expose({ pageRef });
		inject(LayoutMetaSymbol, null);
		nuxtApp.deferHydration();
		return () => {
			return h(RouterView, {
				name: props.name,
				route: props.route,
				...attrs
			}, { default: markStableSlot((routeProps) => {
				return h(Suspense, { suspensible: true }, { default() {
					return h(RouteProvider, {
						vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
						route: routeProps.route,
						vnodeRef: pageRef
					});
				} });
			}) });
		};
	}
});
function markStableSlot(fn) {
	const wrapped = ((routeProps) => {
		const result = fn(routeProps);
		if (Array.isArray(result)) return result;
		if (result == null || !isVNode(result)) return [createCommentVNode()];
		return [result];
	});
	wrapped._n = true;
	return wrapped;
}
function normalizeSlot(slot, data) {
	const slotContent = slot(data);
	return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
//#endregion
//#region node_modules/@nuxt/icon/dist/runtime/components/shared.js
async function loadIcon$1(name, timeout) {
	if (!name) return null;
	const _icon = getIcon(name);
	if (_icon) return _icon;
	let timeoutWarn;
	const load = loadIcon(name).catch(() => {
		console.warn(`[Icon] failed to load icon \`${name}\``);
		return null;
	});
	if (timeout > 0) await Promise.race([load, new Promise((resolve) => {
		timeoutWarn = setTimeout(() => {
			console.warn(`[Icon] loading icon \`${name}\` timed out after ${timeout}ms`);
			resolve();
		}, timeout);
	})]).finally(() => clearTimeout(timeoutWarn));
	else await load;
	return getIcon(name);
}
function useResolvedName(getName) {
	const options = useAppConfig().icon;
	const collections = (options.collections || []).sort((a, b) => b.length - a.length);
	return computed(() => {
		const name = getName();
		const bare = name.startsWith(options.cssSelectorPrefix) ? name.slice(options.cssSelectorPrefix.length) : name;
		const resolved = options.aliases?.[bare] || bare;
		if (!resolved.includes(":")) {
			const collection = collections.find((c) => resolved.startsWith(c + "-"));
			return collection ? collection + ":" + resolved.slice(collection.length + 1) : resolved;
		}
		return resolved;
	});
}
function resolveCustomizeFn(customize, globalCustomize) {
	if (customize === false) return void 0;
	if (customize === true || customize === null) return globalCustomize;
	return customize;
}
//#endregion
//#region node_modules/@nuxt/icon/dist/runtime/components/css.js
var SYMBOL_SERVER_CSS = "NUXT_ICONS_SERVER_CSS";
function escapeCssSelector(selector) {
	return selector.replace(/([^\w-])/g, "\\$1");
}
var NuxtIconCss = /* @__PURE__ */ defineComponent({
	name: "NuxtIconCss",
	props: {
		name: {
			type: String,
			required: true
		},
		customize: {
			type: [
				Function,
				Boolean,
				null
			],
			default: null,
			required: false
		}
	},
	setup(props) {
		const nuxt = useNuxtApp();
		const options = useAppConfig().icon;
		const cssClass = computed(() => {
			if (!props.name) return "";
			const base = options.cssSelectorPrefix + props.name;
			if (typeof props.customize === "function") return base + "--customized-" + hash(props.customize.toString());
			return base;
		});
		const selector = computed(() => "." + escapeCssSelector(cssClass.value));
		function getCSS(icon, withLayer = true) {
			let iconSelector = selector.value;
			if (options.cssWherePseudo) iconSelector = `:where(${iconSelector})`;
			const css = getIconCSS(icon, {
				iconSelector,
				format: "compressed",
				customise: resolveCustomizeFn(props.customize, options.customize)
			});
			if (options.cssLayer && withLayer) return `@layer ${options.cssLayer} { ${css} }`;
			return css;
		}
		onServerPrefetch(async () => {
			if (!(useRuntimeConfig().icon || {})?.serverKnownCssClasses?.includes(cssClass.value)) {
				const icon = await loadIcon$1(props.name, options.fetchTimeout).catch(() => null);
				if (!icon) return null;
				let ssrCSS = nuxt.vueApp._context.provides[SYMBOL_SERVER_CSS];
				if (!ssrCSS) {
					ssrCSS = nuxt.vueApp._context.provides[SYMBOL_SERVER_CSS] = /* @__PURE__ */ new Map();
					nuxt.runWithContext(() => {
						useHead$1({ style: [() => {
							const sep = "";
							let css = Array.from(ssrCSS.values()).sort().join(sep);
							if (options.cssLayer) css = `@layer ${options.cssLayer} {${sep}${css}${sep}}`;
							return { innerHTML: css };
						}] }, { tagPriority: "low" });
					});
				}
				if (cssClass.value && !ssrCSS.has(cssClass.value)) {
					const css = getCSS(icon, false);
					ssrCSS.set(cssClass.value, css);
				}
				return null;
			}
		});
		return () => h("span", { class: ["iconify", cssClass.value] });
	}
});
//#endregion
//#region node_modules/@nuxt/icon/dist/runtime/components/svg.js
var NuxtIconSvg = /* @__PURE__ */ defineComponent({
	name: "NuxtIconSvg",
	props: {
		name: {
			type: String,
			required: true
		},
		customize: {
			type: [
				Function,
				Boolean,
				null
			],
			default: null,
			required: false
		}
	},
	setup(props, { slots }) {
		useNuxtApp();
		const options = useAppConfig().icon;
		const name = useResolvedName(() => props.name);
		const storeKey = "i-" + name.value;
		if (name.value) onServerPrefetch(async () => {
			await useAsyncData(storeKey, async () => await loadIcon$1(name.value, options.fetchTimeout), { deep: false });
		});
		return () => h(Icon, {
			icon: name.value,
			ssr: true,
			customise: resolveCustomizeFn(props.customize, options.customize)
		}, slots);
	}
});
//#endregion
//#region node_modules/@nuxt/icon/dist/runtime/components/index.js
var components_exports = /* @__PURE__ */ __exportAll({ default: () => components_default });
var components_default = defineComponent({
	name: "NuxtIcon",
	props: {
		name: {
			type: String,
			required: true
		},
		mode: {
			type: String,
			required: false,
			default: null
		},
		size: {
			type: [Number, String],
			required: false,
			default: null
		},
		customize: {
			type: [
				Function,
				Boolean,
				null
			],
			default: null,
			required: false
		}
	},
	setup(props, { slots }) {
		const nuxtApp = useNuxtApp();
		const runtimeOptions = useAppConfig().icon;
		const name = useResolvedName(() => props.name);
		const component = computed(() => nuxtApp.vueApp?.component(name.value) || ((props.mode || runtimeOptions.mode) === "svg" ? NuxtIconSvg : NuxtIconCss));
		const style = computed(() => {
			const size = props.size || runtimeOptions.size;
			return size ? { fontSize: Number.isNaN(+size) ? size : size + "px" } : null;
		});
		return () => h(component.value, {
			...runtimeOptions.attrs,
			name: name.value,
			class: runtimeOptions.class,
			style: style.value,
			customize: props.customize
		}, slots);
	}
});
//#endregion
//#region app/composables/usePhpBridge.ts
var PHP_ACTIONS = {
	hello: "hello",
	me: "me",
	users: "users",
	get_user: "get_user",
	profile: "profile",
	threads: "get_threads",
	thread: "get_thread",
	create_thread: "create_thread",
	messages: "get_messages",
	send_message: "send_message",
	dm_list: "get_dm_list",
	dm_messages: "get_dm_messages",
	send_dm: "send_dm",
	friends: "get_friends",
	add_friend: "add_friend",
	location: "get_location",
	meeting: "get_meeting"
};
function usePhpBridge() {
	const status = useState("php-bridge:status", () => null);
	const events = useState("php-bridge:events", () => []);
	const busy = useState("php-bridge:busy", () => false);
	async function refreshStatus() {
		const res = await $fetch$1("/api/bridge/status");
		status.value = res;
		return res;
	}
	async function call(action, params = {}, csrfToken) {
		busy.value = true;
		try {
			return await $fetch$1("/api/bridge/call", {
				method: "POST",
				body: {
					action,
					params,
					csrfToken
				}
			});
		} catch (e) {
			return {
				ok: false,
				error: e.data?.error ?? e.message
			};
		} finally {
			busy.value = false;
		}
	}
	async function send(action, params = {}, csrfToken) {
		const result = await call(action, params, csrfToken);
		if (result.ok) pushEvent({
			type: `php.${action}`,
			source: "nuxt",
			payload: result.data ?? {}
		});
		return result;
	}
	async function register(plugin) {
		return await $fetch$1("/api/bridge/register", {
			method: "POST",
			body: plugin
		});
	}
	async function plugins() {
		return await $fetch$1("/api/bridge/plugins");
	}
	async function relay(type, payload = {}) {
		return await $fetch$1("/api/bridge/relay", {
			method: "POST",
			body: {
				type,
				payload,
				source: "nuxt"
			}
		});
	}
	function pushEvent(ev) {
		events.value = [ev, ...events.value].slice(0, 200);
	}
	return {
		status,
		events,
		busy,
		refreshStatus,
		call,
		send,
		register,
		plugins,
		relay,
		pushEvent
	};
}
//#endregion
//#region app/composables/useRealtime.ts
var handlers = {};
function useRealtime() {
	function on(type, handler) {
		(handlers[type] || (handlers[type] = /* @__PURE__ */ new Set())).add(handler);
		return () => {
			handlers[type]?.delete(handler);
		};
	}
	return { on };
}
//#endregion
//#region app/components/BridgeConsole.vue?vue&type=script&setup=true&lang.ts
var BridgeConsole_vue_vue_type_script_setup_true_lang_default = /*@__PURE__*/ defineComponent({
	__name: "BridgeConsole",
	__ssrInlineRender: true,
	setup(__props) {
		const bridge = usePhpBridge();
		const realtime = useRealtime();
		const open = ref(false);
		const tab = ref("status");
		const selectedAction = ref("hello");
		const actionParams = ref("{}");
		const csrfToken = ref("");
		const logs = ref([]);
		const registerFields = reactive({
			id: "suchgamer-php",
			name: "SuchGamer PHP",
			version: "1.0.0"
		});
		realtime.on("bridge.*", (payload) => {
			const p = payload ?? {};
			bridge.pushEvent({
				type: p.type ?? "bridge.event",
				source: p.source ?? "bridge",
				payload: p.payload ?? {},
				ts: p.ts ?? Date.now()
			});
		});
		return (_ctx, _push, _parent, _attrs) => {
			const _component_Icon = components_default;
			if (unref(open)) {
				_push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-y-0 right-0 z-[100] flex w-[520px] max-w-[92vw] flex-col border-l border-zinc-800 bg-[#101014] shadow-2xl" }, _attrs))}><div class="flex items-center justify-between border-b border-zinc-800 px-4 py-3"><div class="flex items-center gap-2">`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "mdi:bridge",
					class: "text-xl"
				}, null, _parent));
				_push(`<span class="font-bold">PHP Bridge</span><span class="${ssrRenderClass([unref(bridge).status?.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700 text-zinc-300", "rounded px-1.5 py-0.5 text-[10px] font-bold"])}">${ssrInterpolate(unref(bridge).status?.enabled ? "ENABLED" : unref(bridge).status?.reachable === false ? "UNREACHABLE" : "DISABLED")}</span></div><button class="text-zinc-500 hover:text-white">`);
				_push(ssrRenderComponent(_component_Icon, {
					name: "mdi:close",
					class: "text-xl"
				}, null, _parent));
				_push(`</button></div><div class="flex gap-1 border-b border-zinc-800 px-3 pt-2 text-sm"><!--[-->`);
				ssrRenderList([
					"status",
					"call",
					"events"
				], (t) => {
					_push(`<button class="${ssrRenderClass([unref(tab) === t ? "border-b-2 border-emerald-500 font-semibold" : "text-zinc-500", "rounded-t px-3 py-1.5"])}">${ssrInterpolate(t)}</button>`);
				});
				_push(`<!--]--></div><div class="flex-1 overflow-auto p-4">`);
				if (unref(tab) === "status") {
					_push(`<div class="space-y-4 text-sm"><div class="grid grid-cols-[120px_1fr] gap-y-2"><span class="text-zinc-500">phpBase</span><span class="break-all">${ssrInterpolate(unref(bridge).status?.phpBase || "-")}</span><span class="text-zinc-500">enabled</span><span>${ssrInterpolate(unref(bridge).status?.enabled)}</span><span class="text-zinc-500">reachable</span><span>${ssrInterpolate(unref(bridge).status?.reachable)}</span></div><div><div class="mb-2 font-semibold">Registered plugins (${ssrInterpolate(unref(bridge).status?.plugins?.length ?? 0)})</div><!--[-->`);
					ssrRenderList(unref(bridge).status?.plugins ?? [], (p) => {
						_push(`<div class="mb-2 rounded-lg border border-zinc-800 p-2"><div class="flex items-center justify-between"><span class="${ssrRenderClass([p.source === "nuxt" ? "text-emerald-400" : "", "font-medium"])}">${ssrInterpolate(p.name)}</span><span class="text-[10px] text-zinc-500">${ssrInterpolate(p.id)} · v${ssrInterpolate(p.version)} · ${ssrInterpolate(p.source)}</span></div><div class="mt-1 flex flex-wrap gap-1"><!--[-->`);
						ssrRenderList(p.capabilities, (c) => {
							_push(`<span class="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-300">${ssrInterpolate(c)}</span>`);
						});
						_push(`<!--]--></div></div>`);
					});
					_push(`<!--]--></div><button class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold hover:bg-emerald-500"> Refresh </button></div>`);
				} else if (unref(tab) === "call") {
					_push(`<div class="space-y-4 text-sm"><div class="grid grid-cols-2 gap-2"><div><label class="mb-1 block text-xs text-zinc-500">Action</label><input${ssrRenderAttr("value", unref(selectedAction))} type="text" class="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5"><div class="mt-1 max-h-40 overflow-y-auto"><!--[-->`);
					ssrRenderList("PHP_ACTIONS" in _ctx ? _ctx.PHP_ACTIONS : unref(PHP_ACTIONS), (v, k) => {
						_push(`<button class="mb-0.5 block w-full rounded px-2 py-1 text-left text-xs hover:bg-zinc-800">${ssrInterpolate(k)} → ${ssrInterpolate(v)}</button>`);
					});
					_push(`<!--]--></div></div><div><label class="mb-1 block text-xs text-zinc-500">csrfToken</label><input${ssrRenderAttr("value", unref(csrfToken))} type="text" class="mb-3 w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5"><label class="mb-1 block text-xs text-zinc-500">params (JSON)</label><textarea rows="8" class="w-full rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 font-mono text-xs">${ssrInterpolate(unref(actionParams))}</textarea></div></div><button class="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold hover:bg-emerald-500"${ssrIncludeBooleanAttr(_ctx.busy) ? " disabled" : ""}>${ssrInterpolate(_ctx.busy ? "Calling…" : "Call PHP API")}</button><div class="border-t border-zinc-800 pt-3"><div class="mb-2 font-semibold">Register plugin</div><div class="grid grid-cols-3 gap-2"><input${ssrRenderAttr("value", unref(registerFields).id)} placeholder="id" class="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5"><input${ssrRenderAttr("value", unref(registerFields).name)} placeholder="name" class="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5"><input${ssrRenderAttr("value", unref(registerFields).version)} placeholder="version" class="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5"></div><div class="mt-2 flex gap-2"><button class="rounded-lg bg-zinc-700 px-3 py-1.5 hover:bg-zinc-600">Register</button><button class="rounded-lg bg-zinc-700 px-3 py-1.5 hover:bg-zinc-600">Relay test</button></div></div><div class="mt-4"><div class="mb-2 font-semibold">Logs (${ssrInterpolate(unref(logs).length)})</div><div class="max-h-48 space-y-1 overflow-y-auto font-mono text-xs"><!--[-->`);
					ssrRenderList(unref(logs), (l, i) => {
						_push(`<div class="break-all border-b border-zinc-900 py-1"><span class="text-zinc-500">&gt;</span> ${ssrInterpolate(l.text)}</div>`);
					});
					_push(`<!--]--></div></div></div>`);
				} else if (unref(tab) === "events") {
					_push(`<div class="space-y-1 text-sm"><!--[-->`);
					ssrRenderList(unref(bridge).events, (e, i) => {
						_push(`<div class="rounded border border-zinc-800/50 p-2"><span class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">${ssrInterpolate(e.type)}</span><span class="ml-2 text-[10px] text-zinc-500">${ssrInterpolate(e.source)} · ${ssrInterpolate(new Date(e.ts).toLocaleTimeString())}</span><pre class="mt-1 overflow-x-auto text-[10px] text-zinc-300">${ssrInterpolate(JSON.stringify(e.payload, null, 2))}</pre></div>`);
					});
					_push(`<!--]-->`);
					if (!unref(bridge).events.length) _push(`<div class="text-zinc-500">No events yet</div>`);
					else _push(`<!---->`);
					_push(`</div>`);
				} else _push(`<!---->`);
				_push(`</div></div>`);
			} else _push(`<!---->`);
		};
	}
});
//#endregion
//#region app/components/BridgeConsole.vue
var _sfc_setup$3 = BridgeConsole_vue_vue_type_script_setup_true_lang_default.setup;
BridgeConsole_vue_vue_type_script_setup_true_lang_default.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BridgeConsole.vue");
	return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
var BridgeConsole_default = Object.assign(BridgeConsole_vue_vue_type_script_setup_true_lang_default, { __name: "BridgeConsole" });
//#endregion
//#region \0plugin-vue:export-helper
var _plugin_vue_export_helper_default = (sfc, props) => {
	const target = sfc.__vccOpts || sfc;
	for (const [key, val] of props) target[key] = val;
	return target;
};
//#endregion
//#region app/app.vue
var _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
	const _component_NuxtLayout = nuxt_layout_default;
	const _component_NuxtPage = page_default;
	const _component_BridgeConsole = BridgeConsole_default;
	_push(ssrRenderComponent(_component_NuxtLayout, _attrs, {
		default: withCtx((_, _push, _parent, _scopeId) => {
			if (_push) {
				_push(ssrRenderComponent(_component_NuxtPage, null, null, _parent, _scopeId));
				_push(ssrRenderComponent(_component_BridgeConsole, null, null, _parent, _scopeId));
			} else return [createVNode(_component_NuxtPage), createVNode(_component_BridgeConsole)];
		}),
		_: 1
	}, _parent));
}
var _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
	return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
var app_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]);
//#endregion
//#region node_modules/nuxt/dist/app/components/nuxt-error-page.vue
var _sfc_main$1 = {
	__name: "nuxt-error-page",
	__ssrInlineRender: true,
	props: { error: Object },
	setup(__props) {
		const _error = __props.error;
		const status = Number(_error.statusCode || 500);
		const is404 = status === 404;
		const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
		const description = _error.message || _error.toString();
		const stack = void 0;
		const _Error404 = defineAsyncComponent(() => import('../build/error-404-BjYsdHN8.mjs'));
		const _Error = defineAsyncComponent(() => import('../build/error-500-C9Up30W-.mjs'));
		const ErrorTemplate = is404 ? _Error404 : _Error;
		return (_ctx, _push, _parent, _attrs) => {
			_push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({
				status: unref(status),
				statusText: unref(statusText),
				statusCode: unref(status),
				statusMessage: unref(statusText),
				description: unref(description),
				stack: unref(stack)
			}, _attrs), null, _parent));
		};
	}
};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
//#endregion
//#region virtual:nuxt:.nuxt-prod%2Fisland-renderer.mjs
var IslandRenderer = () => null;
//#endregion
//#region node_modules/nuxt/dist/app/components/nuxt-root.vue
var _sfc_main = {
	__name: "nuxt-root",
	__ssrInlineRender: true,
	setup(__props) {
		const nuxtApp = useNuxtApp();
		nuxtApp.deferHydration();
		nuxtApp.ssrContext.url;
		const SingleRenderer = false;
		provide(PageRouteSymbol, useRoute());
		nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup", []);
		const error = useError();
		const abortRender = error.value && !nuxtApp.ssrContext.error;
		function invokeAppErrorHandler(err, target, info) {
			const errorHandler = nuxtApp.vueApp.config.errorHandler;
			if (errorHandler && !errorHandler.__nuxt_default) try {
				errorHandler(err, target, info);
			} catch (handlerError) {
				console.error("[nuxt] Error in `app.config.errorHandler`", handlerError);
			}
		}
		onErrorCaptured((err, target, info) => {
			nuxtApp.hooks.callHook("vue:error", err, target, info)?.catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
			{
				const p = nuxtApp.runWithContext(() => showError(err));
				onServerPrefetch(() => p);
				invokeAppErrorHandler(err, target, info);
				return false;
			}
		});
		const islandContext = nuxtApp.ssrContext.islandContext;
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderSuspense(_push, {
				default: () => {
					if (unref(abortRender)) _push(`<div></div>`);
					else if (unref(error)) _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
					else if (unref(islandContext)) _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
					else if (unref(SingleRenderer)) ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
					else _push(ssrRenderComponent(unref(app_default), null, null, _parent));
				},
				_: 1
			});
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("../node_modules/nuxt/dist/app/components/nuxt-root.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
//#region node_modules/nuxt/dist/app/entry.js
var entry$1 = async function createNuxtAppServer(ssrContext) {
	const vueApp = createApp(_sfc_main);
	const nuxt = createNuxtApp({
		vueApp,
		ssrContext
	});
	try {
		await applyPlugins(nuxt, virtual_nuxt__nuxt_prod_2Fplugins_server_default);
		await nuxt.hooks.callHook("app:created", vueApp);
	} catch (error) {
		await nuxt.hooks.callHook("app:error", error);
		nuxt.payload.error ||= createError$1(error);
	}
	if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) throw new Error("skipping render");
	return vueApp;
};
var entry_default = ((ssrContext) => entry$1(ssrContext));

const entry = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: entry_default
}, Symbol.toStringTag, { value: 'Module' }));

export { $fetch$1 as $, _plugin_vue_export_helper_default as _, useRoute as a, defineKeyedFunctionFactory as b, components_default as c, defineNuxtRouteMiddleware as d, executeAsync as e, dataDiagnostics as f, fetchDefaults as g, useAsyncData as h, useRouter as i, encodeRoutePath as j, useRuntimeConfig as k, nuxtLinkDefaults as l, useState as m, navigateTo as n, useRealtime as o, appDiagnostics as p, useHead$1 as q, resolveRouteObject as r, entry as s, useNuxtApp as u };
//# sourceMappingURL=entry.mjs.map
