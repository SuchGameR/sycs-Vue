import { b as defineKeyedFunctionFactory, f as dataDiagnostics, g as fetchDefaults, h as useAsyncData, $ as $fetch$1$1 } from '../virtual/entry.mjs';
import { a as useRequestFetch } from './ssr-kk-nDyoa.mjs';
import { computed, toValue, reactive } from 'vue';
import { isPlainObject } from '@vue/shared';

//#region src/index.ts
/**
* Compute the 64-bit FNV-1a hash of a string as two 32-bit lanes.
*
* This is the fast core: no BigInt, no allocations, plain `Math.imul`-free
* 32-bit arithmetic. Prefer {@link fnv1a64Hex} or {@link fnv1a64Base36} for a
* usable key; use this directly only when you want to avoid string formatting.
*
* The hash is computed over UTF-16 code units (`str.charCodeAt(i)`), not UTF-8
* bytes. For ASCII input this matches a canonical FNV-1a-64; for non-ASCII it
* does not. See the README for details.
*
* @param str - The string to hash.
* @returns The `{ high, low }` 32-bit lanes of the 64-bit hash.
*/
function fnv1a64(str) {
	let low = 2216829733;
	let high = 3421674724;
	for (let i = 0; i < str.length; i++) {
		low ^= str.charCodeAt(i);
		const lowByLow = (low & 65535) * 435;
		const highOfLow = (low >>> 16) * 435;
		const highByHigh = (high & 65535) * 435 + ((high >>> 16) * 435 << 16);
		const carry = (lowByLow >>> 16) + highOfLow;
		high = highByHigh + (carry >>> 16) + low * 256 >>> 0;
		low = (lowByLow & 65535 | (carry & 65535) << 16) >>> 0;
	}
	return {
		high: high >>> 0,
		low: low >>> 0
	};
}
/**
* Compute the 64-bit FNV-1a hash of a string as a `bigint`.
*
* Ergonomic and comparable, at the cost of composing the two lanes into a
* `bigint`. For a compact string key, prefer {@link fnv1a64Base36}.
*
* @param str - The string to hash.
* @returns The 64-bit hash as an unsigned `bigint`.
*/
function fnv1a64BigInt(str) {
	const { high, low } = fnv1a64(str);
	return BigInt(high) << 32n | BigInt(low);
}
/**
* Compute the 64-bit FNV-1a hash of a string as a base36 string.
*
* This is the shortest textual form (up to 13 characters) and is ideal for
* cache keys. The length varies with the value; it is not zero-padded. Equal
* inputs always produce identical strings.
*
* @param str - The string to hash.
* @returns A base36 string of the 64-bit hash.
*/
function fnv1a64Base36(str) {
	return fnv1a64BigInt(str).toString(36);
}

function walk(input, seen) {
	if (input === null) return "L";
	let out, i = 0, keys = input, tmp = typeof input;
	if (tmp !== "object") {
		if (tmp === "number") return input - input === 0 ? "n" + input : "L";
		if (tmp === "string") return "s" + input;
		if (tmp === "bigint") return "n" + input;
		if (tmp === "boolean") return input ? "T" : "F";
		return;
	}
	let is_arr = Array.isArray(input);
	if (!is_arr) {
		if (input instanceof Date) return "d" + +input;
		if (input instanceof RegExp) return "r" + input.source + input.flags;
	}
	tmp = seen.indexOf(input);
	if (~tmp) return "~" + (tmp + 1);
	if (typeof input.toJSON === "function" && !ArrayBuffer.isView(input)) {
		input = input.toJSON();
		if (input === null || typeof input !== "object") return walk(input, seen);
		tmp = seen.indexOf(input);
		if (~tmp) return "~" + (tmp + 1);
		is_arr = Array.isArray(input);
	}
	seen.push(keys);
	if (is_arr) {
		for (out = "a"; i < input.length; out += (tmp = walk(input[i++], seen)) === undefined ? "L" : tmp);
	} else if (input instanceof Set) {
		out = "e";
		for (let value of input) out += (tmp = walk(value, seen)) === undefined ? "L" : tmp;
	} else if (input instanceof Map) {
		keys = [...input.keys()];
		if (keys.length > 1) keys.sort();
		for (out = "o"; i < keys.length; i++) {
			if ((tmp = walk(input.get(keys[i]), seen)) !== undefined) out += keys[i] + tmp;
		}
	} else if (input[Symbol.toStringTag] === undefined || ArrayBuffer.isView(input)) {
		keys = Object.keys(input);
		if (keys.length > 1) keys.sort();
		for (out = "o"; i < keys.length; i++) {
			if ((tmp = walk(input[keys[i]], seen)) !== undefined) out += keys[i] + tmp;
		}
	} else {
		throw new Error("Unsupported value");
	}
	seen.pop();
	return out;
}
/**
* Canonicalize a value into a stable identity string. Two structurally-equal
* inputs return the same id, regardless of key order.
*
* @example
* ```ts
* identify({ a: 1, b: 2 }) === identify({ b: 2, a: 1 }); // true
* ```
*/
function identify(input) {
	return walk(input, []) ?? "U";
}

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
//# sourceMappingURL=fetch-Cq4So9M_.mjs.map
