interface UseInfiniteScrollOptions {
  rootMargin?: string
  root?: () => HTMLElement | null | undefined
}

export const FEED_PAGE_SIZE = 10

/**
 * Observes a sentinel element and calls `onLoad` when it scrolls into view.
 * `onLoad` should return `false` (or `{ hasMore: false }`) when the source is exhausted.
 */
export function useInfiniteScroll(
  onLoad: () => unknown | Promise<unknown>,
  options: UseInfiniteScrollOptions = {}
) {
  const sentinel = ref<HTMLElement | null>(null)
  const loading = ref(false)
  const done = ref(false)

  let observer: IntersectionObserver | null = null

  async function loadMore() {
    if (loading.value || done.value) return
    loading.value = true
    try {
      const result: any = await onLoad()
      const hasMore = result && typeof result === 'object' && 'hasMore' in result
        ? !!result.hasMore
        : result !== false
      done.value = !hasMore
    } finally {
      loading.value = false
    }
  }

  function reset() {
    done.value = false
  }

  function observe(el: HTMLElement | null) {
    observer?.disconnect()
    observer = null
    if (!el || !import.meta.client || typeof IntersectionObserver === 'undefined') return
    observer = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) loadMore()
    }, {
      root: options.root?.() || null,
      rootMargin: options.rootMargin ?? '600px',
    })
    observer.observe(el)
  }

  watch(sentinel, (el) => observe(el), { immediate: true })
  onUnmounted(() => { observer?.disconnect(); observer = null })

  return { sentinel, loading, done, loadMore, reset, observe }
}
