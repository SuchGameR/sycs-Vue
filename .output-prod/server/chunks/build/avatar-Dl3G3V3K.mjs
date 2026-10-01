import { b as useRuntimeConfig } from '../virtual/entry.mjs';

function avatarSrc(src) {
  if (src) return src;
  const base = useRuntimeConfig().app.baseURL || "/";
  return (base.endsWith("/") ? base : base + "/") + "default-avator.webp";
}

export { avatarSrc as a };
//# sourceMappingURL=avatar-Dl3G3V3K.mjs.map
