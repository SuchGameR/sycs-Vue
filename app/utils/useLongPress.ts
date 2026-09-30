/**
 * 長押し検出のロジック (DOM 非依存部分)。
 *
 * LongPress.vue から使う想定だが、既存のコンポーネントからも直接呼べる。
 * 指针の移動量が moveTolerance を超えたらキャンセルするので、
 * スクロール途中で誤発火しない。
 */

export interface LongPressOptions {
  /** 発火までの時間 (ms) */
  delay?: number
  /** 発火前に許容する移動量 (px) */
  moveTolerance?: number
  /** 長押し_loop が始まった瞬間 */
  onStart?: () => void
  /** キャンセル時 (指を離した / 動いた / コンポーネントが破棄された) */
  onCancel?: () => void
}

export interface LongPressApi {
  /** template 側の ref に绑ぶための別名 (script からは el を使う) */
  ref: Ref<HTMLElement | null>
  el: Ref<HTMLElement | null>
  /** 発火したPointerEvent (handlers.event で参照) */
  event: PointerEvent
  onPointerDown: (e: PointerEvent) => void
  onPointerMove: (e: PointerEvent) => void
  onPointerUp: (e: PointerEvent) => void
  onPointerCancel: (e?: PointerEvent) => void
  cancel: () => void
}

export function onLongPress(
  handler: (event: PointerEvent) => void,
  options: LongPressOptions = {},
): LongPressApi {
  const delay = options.delay ?? 500
  const tolerance = options.moveTolerance ?? 10

  const el = ref<HTMLElement | null>(null)
  let timer: ReturnType<typeof setTimeout> | null = null
  let startX = 0
  let startY = 0
  let pointerId: number | null = null
  let fired = false

  const api = {
    ref: el,
    el,
    event: undefined as unknown as PointerEvent,
    cancel,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
  return api

  function clear() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function cancel() {
    const wasActive = timer !== null
    clear()
    pointerId = null
    if (wasActive && !fired) options.onCancel?.()
  }

  function onPointerDown(e: PointerEvent) {
    // 主ボタン以外 / 複数指のジェスは 長押し扱いにしない
    if (e.button !== 0 && e.pointerType === 'mouse') return

    fired = false
    pointerId = e.pointerId
    startX = e.clientX
    startY = e.clientY

    // 触覚フィードバック (Android Chrome / iOS Safari 15+)
    if ('vibrate' in navigator) {
      try { navigator.vibrate?.(8) } catch { /* noop */ }
    }

    options.onStart?.()
    clear()
    timer = setTimeout(() => {
      timer = null
      fired = true
      api.event = e
      if ('vibrate' in navigator) {
        try { navigator.vibrate?.([12, 40, 18]) } catch { /* noop */ }
      }
      handler(e)
    }, delay)
  }

  function onPointerMove(e: PointerEvent) {
    if (timer === null) return
    if (pointerId !== null && e.pointerId !== pointerId) return
    const dx = Math.abs(e.clientX - startX)
    const dy = Math.abs(e.clientY - startY)
    if (dx > tolerance || dy > tolerance) cancel()
  }

  function onPointerUp(e: PointerEvent) {
    if (pointerId !== null && e.pointerId !== pointerId) return
    const wasFiring = fired
    clear()
    pointerId = null
    // 発火済みなら onCancel は呼ばない (handlers 已经走った)
    if (!wasFiring) options.onCancel?.()
  }

  function onPointerCancel(e?: PointerEvent) {
    if (e && pointerId !== null && e.pointerId !== pointerId) return
    cancel()
  }
}
