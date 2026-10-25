/**
 * 共有要素トランジション。
 *
 * View Transitions API があれば、一覧のカードと詳細面に同じ
 * `view-transition-name` を付けて、形を補間しながら移動させる。
 * 非対応ブラウザ / reduced motion / 機能オフでは即時切り替えに落ちる。
 */

export function useSharedElement() {
  const settings = useInteractionSettings()

  function isSupported(): boolean {
    return (
      import.meta.client &&
      typeof document !== 'undefined' &&
      typeof (document as any).startViewTransition === 'function'
    )
  }

  function canAnimate(): boolean {
    if (!isSupported()) return false
    if (!settings.isEnabled('shared-element')) return false
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  async function transition(update: () => void | Promise<void>): Promise<void> {
    if (!canAnimate()) {
      await update()
      return
    }
    const vt = (document as any).startViewTransition(() => update())
    try {
      await vt.finished
    } catch {
      /* 中断されても状態は update 済み */
    }
  }

  function nameFor(id: string | number): string {
    return `sycs-shared-${String(id).replace(/[^a-zA-Z0-9_-]/g, '-')}`
  }

  return { isSupported, canAnimate, transition, nameFor }
}
