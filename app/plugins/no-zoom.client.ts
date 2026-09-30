/**
 * iOS の「拡大/縮小」ジェスチャを抑止するプラグイン。
 *
 * - gesturestart / gesturechange / gestureend を preventDefault
 *   (iOS Safari は iOS 10 以降 user-scalable=no と maximum-scale を無視するため)
 * -  orthodox な doubletap zoom も touch-action で抑止済み (app.css)
 * - Ctrl/Cmd + wheel (デスクトップのブラウザズーム) も抑止
 *
 * .sycs-allow-zoom を付けた要素の下では pinch-zoom を許可する。
 * (画像・動画ビューアなど、実際に拡大したい場所用)
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  // gesturestart は Safari 独自のイベント
  const stop = (e: Event) => {
    const target = e.target as HTMLElement | null
    if (target?.closest?.('.sycs-allow-zoom')) return
    e.preventDefault()
  }

  document.addEventListener('gesturestart', stop, { passive: false })
  document.addEventListener('gesturechange', stop, { passive: false })
  document.addEventListener('gestureend', stop, { passive: false })

  // Ctrl/Cmd + wheel = ブラウザズーム
  const onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    const target = e.target as HTMLElement | null
    if (target?.closest?.('.sycs-allow-zoom')) return
    e.preventDefault()
  }
  document.addEventListener('wheel', onWheel, { passive: false })

  // iOS の(genuine) ダブルタップ拡大は touch-action で抑止するが、
  // ピンチの残余として gesturestart が途中で発火するケースを潰す
  const preventTouchMoveZoom = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      const target = e.target as HTMLElement | null
      if (target?.closest?.('.sycs-allow-zoom')) return
      e.preventDefault()
    }
  }
  document.addEventListener('touchmove', preventTouchMoveZoom, { passive: false })
})
