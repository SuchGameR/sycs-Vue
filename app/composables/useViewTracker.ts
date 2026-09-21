const COOLDOWN_MS = 60_000

const lastSent = new Map<string, number>()
let observer: IntersectionObserver | null = null
const targets = new Map<Element, { postId: string; onCounted?: (viewCount?: number) => void }>()

function flush(entry: { postId: string; onCounted?: (viewCount?: number) => void }) {
  const now = Date.now()
  const last = lastSent.get(entry.postId)
  if (last && now - last < COOLDOWN_MS) return
  lastSent.set(entry.postId, now)
  $fetch<{ counted: boolean; viewCount?: number }>(`/api/posts/${entry.postId}/view`, { method: 'POST' })
    .then((res) => {
      if (res?.counted && res.viewCount !== undefined) entry.onCounted?.(res.viewCount)
    })
    .catch(() => lastSent.delete(entry.postId))
}

function ensureObserver() {
  if (observer || !import.meta.client) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const target = targets.get(e.target)
        if (target) flush(target)
      }
    },
    { threshold: 0.5 },
  )
  return observer
}

export function useViewTracker() {
  function observe(el: Element | null, postId: string, onCounted?: (viewCount?: number) => void) {
    if (!el || !postId) return
    targets.set(el, { postId, onCounted })
    ensureObserver()?.observe(el)
  }

  function unobserve(el: Element | null) {
    if (!el) return
    observer?.unobserve(el)
    targets.delete(el)
  }

  return { observe, unobserve, COOLDOWN_MS }
}
