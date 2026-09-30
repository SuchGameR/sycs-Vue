/**
 * Material 3 の波紋（ripple）。
 *
 * pointerdown の座標を --m3-ripple-x / --m3-ripple-y に書き、
 * 一度だけ .m3-rippling を付けて animation を起動する。
 * 実際の描画は theme.css の ::after 側（Material 3 スタイル時のみ有効）。
 */

const TARGETS = 'button, a, [role="button"], label, summary'

export default defineNuxtPlugin(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let frame = 0
  let current: HTMLElement | null = null

  function ripple(el: HTMLElement) {
    if (current === el) {
      // 連打時は再生し直す
      el.classList.remove('m3-rippling')
    }
    current = el
    el.classList.add('m3-rippling')
    window.clearTimeout(frame)
    frame = window.setTimeout(() => {
      el.classList.remove('m3-rippling')
      if (current === el) current = null
    }, 560)
  }

  document.addEventListener(
    'pointerdown',
    (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(TARGETS)
      if (!el || el.hasAttribute('disabled')) return

      const box = el.getBoundingClientRect()
      if (!box.width || !box.height) return

      el.style.setProperty('--m3-ripple-x', `${e.clientX - box.left}px`)
      el.style.setProperty('--m3-ripple-y', `${e.clientY - box.top}px`)
      ripple(el)
    },
    { passive: true, capture: true },
  )
})
