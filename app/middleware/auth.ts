export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    const data = await $fetch('/api/auth/me', { headers })
    if (!data.user) throw new Error('no user')
  } catch (e: any) {
    // Only a definitive "not signed in" should bounce to /signin. Any OTHER
    // failure (offline, 5xx, aborted fetch) previously redirected too, so a
    // transient network blip logged the user out of every authed route at once
    // and it looked like the pages were broken.
    const status = e?.statusCode ?? e?.response?.status ?? e?.status
    const signedOut = status === 401 || status === 403 || /no user/i.test(e?.message || '')
    if (signedOut) {
      const redirect = to.fullPath
      return navigateTo(`/signin?redirect=${encodeURIComponent(redirect)}`)
    }
    console.error('[auth] /api/auth/me failed, allowing navigation:', e?.message || e)
  }
})
