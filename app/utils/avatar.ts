export function avatarSrc(src?: string | null): string {
  if (src) return src
  const base = useRuntimeConfig().app.baseURL || '/'
  return (base.endsWith('/') ? base : base + '/') + 'default-avator.webp'
}