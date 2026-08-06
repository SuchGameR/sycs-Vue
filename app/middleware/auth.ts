export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    const data = await $fetch('/api/auth/me', { headers })
    if (!data.user) throw new Error()
  } catch {
    return navigateTo('/signin')
  }
})
