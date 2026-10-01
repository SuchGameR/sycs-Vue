import { computed, ref } from 'vue'

/**
 * Shared bottom-of-viewport inset.
 *
 * Every bottom-anchored overlay (the floating pill, the media mini player, the
 * call dock) is `position: fixed` and sits at a different height. Pages cannot
 * know how much of their last row will be covered, and a hard-coded guess is
 * wrong twice: too small and content hides behind an overlay, too large and
 * there is a dead gap whenever nothing is playing.
 *
 * So overlays register how far their own top edge is from the viewport bottom,
 * and pages pad by the largest of those. Nothing registers -> no padding.
 *
 * Deliberately measured with getBoundingClientRect rather than offsetTop: the
 * pill is scaled down while the page is scrolled, and that transform changes
 * where it visually ends. offsetHeight would keep reporting the unscaled
 * height and leave the old, now-too-large, gap behind.
 */
const entries = ref<Record<string, number>>({})

export function useBottomInset() {
  /** Largest registered overlay top-distance, in px. 0 when nothing is showing. */
  const inset = computed(() => {
    const values = Object.values(entries.value)
    return values.length ? Math.max(...values) : 0
  })

  /** Pass null to unregister (overlay unmounted, or not overlaying content). */
  function register(name: string, topDistance: number | null) {
    const current = entries.value
    if (topDistance === null || topDistance <= 0) {
      if (!(name in current)) return
      const { [name]: _drop, ...rest } = current
      entries.value = rest
      return
    }
    if (current[name] === topDistance) return
    entries.value = { ...current, [name]: topDistance }
  }

  return { inset, register }
}

/**
 * Distance from the viewport bottom up to the element's top edge, i.e. exactly
 * how much vertical space this overlay takes away from the page beneath it.
 */
export function bottomOverlapOf(el: Element | null | undefined): number {
  if (!el || typeof window === 'undefined') return 0
  const rect = el.getBoundingClientRect()
  if (!rect.height) return 0
  return Math.max(0, Math.round(window.innerHeight - rect.top))
}

/**
 * Track an element's bottom overlap, keeping it current through resizes,
 * layout changes and the pill's scroll-driven scale.
 */
export function useBottomInsetReporter(name: string, getEl: () => Element | null | undefined, enabled: () => boolean) {
  const { register } = useBottomInset()
  let ro: ResizeObserver | null = null

  function report() {
    if (!enabled()) { register(name, null); return }
    register(name, bottomOverlapOf(getEl()))
  }

  function observe() {
    ro?.disconnect()
    ro = null
    const el = getEl()
    if (enabled() && typeof ResizeObserver !== 'undefined' && el) {
      ro = new ResizeObserver(report)
      ro.observe(el)
    }
    report()
  }

  // Created in setup scope, not inside onMounted: a watcher created from a
  // lifecycle callback is not bound to the component's effect scope and would
  // outlive the component. `flush: 'post'` runs after the v-if has rendered, so
  // the element exists by the time it is measured.
  watch(enabled, observe, { immediate: true, flush: 'post' })

  onMounted(() => {
    window.addEventListener('resize', report)
  })

  onBeforeUnmount(() => {
    ro?.disconnect()
    ro = null
    window.removeEventListener('resize', report)
    register(name, null)
  })

  return { report }
}