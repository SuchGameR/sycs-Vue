import { b as defineKeyedFunctionFactory, f as dataDiagnostics, g as fetchDefaults, h as useAsyncData, $ as $fetch$1$1 } from '../virtual/entry.mjs';
import { a as useRequestFetch } from './ssr-8ixC2dth.mjs';
import { computed, toValue, reactive } from 'vue';
import { isPlainObject } from '@vue/shared';
import { fnv1a64Base36 } from 'fnv1a-64';
import { identify } from 'object-identity';

function hashKey(value) {
  return fnv1a64Base36(identify(value));
}
var $fetch$1 = $fetch$1$1;
var MAYBE_REF_OR_GETTER_OPTION_KEYS = [
  "method",
  "baseURL",
  "query",
  "params",
  "body",
  "headers"
];
function generateOptionSegments(opts) {
  var _a;
  const segments = [((_a = toValue(opts.method)) == null ? void 0 : _a.toUpperCase()) || "GET", toValue(opts.baseURL)];
  for (const _obj of [opts.query || opts.params]) {
    const obj = toValue(_obj);
    if (!obj) continue;
    const unwrapped = {};
    for (const [key, value] of Object.entries(obj)) unwrapped[toValue(key)] = toValue(value);
    segments.push(unwrapped);
  }
  if (opts.body) {
    const value = toValue(opts.body);
    if (!value) segments.push(hashKey(value));
    else if (value instanceof ArrayBuffer) segments.push(hashKey(Object.fromEntries([...new Uint8Array(value).entries()].map(([k, v]) => [k, v.toString()]))));
    else if (value instanceof FormData) {
      const entries = [];
      for (const entry of value.entries()) {
        const [key, val] = entry;
        entries.push([key, val instanceof File ? `${val.name}:${val.size}:${val.lastModified}` : val]);
      }
      segments.push(hashKey(entries));
    } else if (isPlainObject(value)) segments.push(hashKey(reactive(value)));
    else try {
      segments.push(hashKey(value));
    } catch {
      dataDiagnostics.NUXT_E3002({ cause: value });
    }
  }
  return segments;
}
var createUseFetch = defineKeyedFunctionFactory({
  name: "createUseFetch",
  factory(options = {}) {
    function useFetch2(request, arg1, arg2) {
      const [opts = {}, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
      const factoryOptions = typeof options === "function" ? options(opts) : options;
      const { server, lazy, default: defaultFn, transform, pick, watch: watchSources, immediate, getCachedData, deep, dedupe, timeout, enabled, ...fetchOptions } = {
        ...typeof options === "function" ? {} : factoryOptions,
        ...opts,
        ...typeof options === "function" ? factoryOptions : {}
      };
      const _request = computed(() => toValue(request));
      const key = computed(() => toValue(fetchOptions.key) || "$f" + hashKey([
        autoKey,
        typeof _request.value === "string" ? _request.value : "",
        ...generateOptionSegments(fetchOptions)
      ]));
      if (!fetchOptions.baseURL && typeof _request.value === "string" && _request.value[0] === "/" && _request.value[1] === "/") throw dataDiagnostics.NUXT_E3001({ url: _request.value });
      const _fetchOptions = reactive({
        ...fetchDefaults,
        ...fetchOptions,
        cache: typeof fetchOptions.cache === "boolean" ? void 0 : fetchOptions.cache
      });
      const _asyncDataOptions = {
        server,
        lazy,
        default: defaultFn,
        transform,
        pick,
        immediate,
        getCachedData,
        deep,
        dedupe,
        timeout,
        enabled,
        watch: watchSources === false ? [] : [...watchSources || [], _fetchOptions]
      };
      if (watchSources === false) _asyncDataOptions._keyTriggersExecute = false;
      return useAsyncData(key, (_, { signal }) => {
        let _$fetch = fetchOptions.$fetch || $fetch$1;
        if (!fetchOptions.$fetch) {
          if (typeof _request.value === "string" && _request.value[0] === "/" && (!toValue(fetchOptions.baseURL) || toValue(fetchOptions.baseURL)[0] === "/")) _$fetch = useRequestFetch();
        }
        const resolvedOptions = {
          signal,
          ..._fetchOptions
        };
        for (const key2 of MAYBE_REF_OR_GETTER_OPTION_KEYS) if (typeof resolvedOptions[key2] === "function") resolvedOptions[key2] = toValue(resolvedOptions[key2]);
        return _$fetch(_request.value, resolvedOptions);
      }, _asyncDataOptions);
    }
    return useFetch2;
  }
});
var useFetch = createUseFetch.__nuxt_factory();
createUseFetch.__nuxt_factory({
  lazy: true,
  _functionName: "useLazyFetch"
});

export { useFetch as u };
//# sourceMappingURL=fetch-CdHJIb6H.mjs.map
