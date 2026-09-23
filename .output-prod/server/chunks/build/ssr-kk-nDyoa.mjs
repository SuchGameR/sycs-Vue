import { u as useNuxtApp, $ as $fetch$1$1 } from '../virtual/entry.mjs';
import { b2 as getRequestHeaders } from '../_/nitro.mjs';

var $fetch$1 = $fetch$1$1;
function useRequestEvent(nuxtApp) {
  var _a;
  nuxtApp || (nuxtApp = useNuxtApp());
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
function useRequestHeaders(include) {
  const event = useRequestEvent();
  const _headers = event ? getRequestHeaders(event) : {};
  if (!include || !event) return _headers;
  const headers = /* @__PURE__ */ Object.create(null);
  for (const _key of include) {
    const key = _key.toLowerCase();
    const header = _headers[key];
    if (header) headers[key] = header;
  }
  return headers;
}
function useRequestFetch() {
  var _a;
  return ((_a = useRequestEvent()) == null ? void 0 : _a.$fetch) || $fetch$1;
}

export { useRequestFetch as a, useRequestHeaders as u };
//# sourceMappingURL=ssr-kk-nDyoa.mjs.map
