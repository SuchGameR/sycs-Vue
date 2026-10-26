import type { Ref } from 'vue'

/**
 * ポインタベースの並べ替え。
 *
 * 行のハンドルに `v-on="getHandleProps(key)"` を付けるだけで動く。
 * タッチ / マウス / ペン共通。ドラッグ中にポインタの Y 座標と各項目の
 * 中点を比べ、越えた瞬間に配列を組み替える (ライブプレビュー)。
 */
export function useDragSort<T>(list: Ref<T[]>, keyOf: (item: T) => string) {
  const containerRef = ref<HTMLElement | null>(null)
  const draggingKey = ref<string | null>(null)
  const overKey = ref<string | null>(null)
  const justDragged = ref(false)

  let pointerId: number | null = null
  let suppressTimer: ReturnType<typeof setTimeout> | null = null

  function detach() {
    if (!import.meta.client) return
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', end)
    window.removeEventListener('pointercancel', end)
  }

  function start(e: PointerEvent, key: string) {
    if (!import.meta.client) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()
    pointerId = e.pointerId
    draggingKey.value = key
    overKey.value = key
    justDragged.value = false
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {
      /* capture 非対応でも window 側で追従する */
    }
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  function onMove(e: PointerEvent) {
    if (pointerId === null || e.pointerId !== pointerId) return
    if (e.cancelable) e.preventDefault()

    const els = Array.from(
      containerRef.value?.querySelectorAll<HTMLElement>('[data-sort-key]') ?? [],
    )
    if (!els.length) return

    let targetKey = els[els.length - 1]!.dataset.sortKey
    for (const el of els) {
      const rect = el.getBoundingClientRect()
      if (e.clientY < rect.top + rect.height / 2) {
        targetKey = el.dataset.sortKey
        break
      }
    }
    if (!targetKey) return

    const from = list.value.findIndex((item) => keyOf(item) === draggingKey.value)
    const to = list.value.findIndex((item) => keyOf(item) === targetKey)
    if (from < 0 || to < 0 || from === to) {
      overKey.value = targetKey
      return
    }
    const next = [...list.value]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved!)
    list.value = next
    overKey.value = targetKey
    justDragged.value = true
  }

  function end() {
    if (pointerId === null && !draggingKey.value) return
    pointerId = null
    draggingKey.value = null
    overKey.value = null
    detach()
    if (suppressTimer) clearTimeout(suppressTimer)
    suppressTimer = setTimeout(() => {
      justDragged.value = false
    }, 300)
  }

  function moveBy(key: string, direction: -1 | 1) {
    const from = list.value.findIndex((item) => keyOf(item) === key)
    const to = from + direction
    if (from < 0 || to < 0 || to >= list.value.length) return
    const next = [...list.value]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved!)
    list.value = next
  }

  /** ハンドル用: `@pointerdown="drag.onHandleDown($event, key)"` */
  function onHandleDown(e: PointerEvent, key: string) {
    start(e, key)
  }

  onBeforeUnmount(() => {
    if (suppressTimer) clearTimeout(suppressTimer)
    detach()
  })

  return {
    containerRef,
    draggingKey,
    overKey,
    justDragged,
    onHandleDown,
    moveBy,
    end,
  }
}
