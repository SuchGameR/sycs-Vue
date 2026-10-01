/**
 * Reload page data when `data/batch.json` changes on the server.
 *
 * Badges ride along on the `user` object of every API response, so there is no
 * dedicated badge endpoint to refresh -- the only way to pick up a config
 * change is to re-fetch whatever the page is currently showing. Registering a
 * callback from a page keeps that opt-in: pages that never call this just keep
 * whatever they loaded, and pick the new badges up on their next navigation.
 */
export function useBadgeReload(reload: () => void | Promise<void>) {
  const { on } = useRealtime()
  let off: (() => void) | null = null

  onMounted(() => {
    off = on('badge.update', () => {
      void reload()
    })
  })

  onUnmounted(() => {
    off?.()
    off = null
  })
}
