export function useMediaQuery(query: string) {
  const matches = ref(import.meta.client ? window.matchMedia(query).matches : false)
  let mql: MediaQueryList | null = null

  const update = () => { matches.value = mql ? mql.matches : false }

  onMounted(() => {
    if (!import.meta.client) return
    mql = window.matchMedia(query)
    update()
    mql.addEventListener('change', update)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', update)
  })

  return matches
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}

export function useIsMobileNav() {
  return useMediaQuery('(max-width: 680px)')
}
