/**
 * 左端からのエッジスワイプで「戻る」。
 *
 * 重要: mobile-root-url.client.ts が history.pushState を replaceState に
 * 置き換えて、ブラウザ履歴を常に1件に潰している（Back でアプリを抜ける挙動）。
 * そのため history.back() は使えない。代わりにアプリ内の訪問履歴を自前で持ち、
 * スワイプで1つ前の画面へ戻す。
 *
 * ネイティブのタブバー同様、ソフトキーボード表示中や入力欄の上では発動しない。
 * マウス操作 (デスクトップ) では無効。タッチ/ペンのみ。
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const router = nuxtApp.$router

  // アプリ内の訪問履歴。URL は常に '/' に潰されるので fullPath で覚える。
  const stack: string[] = []
  function record() {
    const path = router.currentRoute.value.fullPath
    if (stack[stack.length - 1] !== path) stack.push(path)
    if (stack.length > 50) stack.shift()
  }
  record()
  router.afterEach(() => record())

  const EDGE = 28 // 発火を許可する左端からの距離 (px)
  const TRIGGER = 72 // 戻るを確定する水平移動量 (px)

  const indicator = document.createElement('div')
  indicator.className = 'sycs-swipe-back-indicator'
  indicator.setAttribute('aria-hidden', 'true')
  indicator.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>'
  document.body.appendChild(indicator)

  let tracking = false
  let pointerId = -1
  let startX = 0
  let startY = 0
  let dx = 0
  let axis: 'none' | 'x' | 'y' = 'none'

  function reset() {
    tracking = false
    pointerId = -1
    axis = 'none'
    dx = 0
    indicator.style.opacity = '0'
    indicator.style.transform = 'translateY(-50%) scale(0.6)'
  }

  function isTextTarget(t: EventTarget | null): boolean {
    const el = t as HTMLElement | null
    if (!el || !el.tagName) return false
    const tag = el.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
  }

  function onDown(e: PointerEvent) {
    if (e.pointerType === 'mouse' || e.button !== 0) return
    if (stack.length < 2) return
    if (e.clientX > EDGE || document.documentElement.classList.contains('sycs-keyboard-open')) return
    if (isTextTarget(e.target)) return
    tracking = true
    pointerId = e.pointerId
    startX = e.clientX
    startY = e.clientY
    dx = 0
    axis = 'none'
  }

  function onMove(e: PointerEvent) {
    if (!tracking || e.pointerId !== pointerId) return
    const mx = e.clientX - startX
    const my = e.clientY - startY
    if (axis === 'none') {
      if (Math.abs(mx) < 10 && Math.abs(my) < 10) return
      axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
      if (axis === 'y') { reset(); return }
    }
    if (axis !== 'x') return
    dx = Math.max(0, mx)
    const progress = Math.min(1, dx / TRIGGER)
    indicator.style.opacity = String(progress)
    indicator.style.transform = `translateY(-50%) scale(${(0.6 + 0.4 * progress).toFixed(3)})`
  }

  function onUp(e: PointerEvent) {
    if (!tracking || e.pointerId !== pointerId) return
    const shouldBack = axis === 'x' && dx >= TRIGGER
    reset()
    if (!shouldBack || stack.length < 2) return
    stack.pop()
    const prev = stack[stack.length - 1]
    if (prev) router.replace(prev)
  }

  document.addEventListener('pointerdown', onDown, { passive: true, capture: true })
  document.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerup', onUp)
  document.addEventListener('pointercancel', () => { if (tracking) reset() })
})
