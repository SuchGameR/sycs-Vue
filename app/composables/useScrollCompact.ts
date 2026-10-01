import { readonly, ref } from 'vue'

/**
 * Shared "the page is scrolled" flag.
 *
 * Only the component that owns the scroll container reports into it. That is
 * deliberate: on /search the scroller is the results list (or the reel feed),
 * not `main` and not `window`, so a global window listener would never fire.
 *
 * The layout resets it on unmount so returning to a page that does not scroll
 * cannot inherit a stuck "compact" state from the previous one.
 */
const compact = ref(false)

export function useScrollCompact() {
  return {
    compact: readonly(compact),
    setCompact(value: boolean) { compact.value = value },
  }
}