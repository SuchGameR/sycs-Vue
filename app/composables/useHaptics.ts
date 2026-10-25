/**
 * 触覚フィードバック (Vibration API)。
 *
 * - 非対応端末 / prefers-reduced-motion / 設定オフでは何もしない
 * - 呼び出し側は戻り値を見て、必要なら視覚的なパルスを出す
 */

export type HapticPattern =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  selection: 8,
  light: 12,
  medium: 22,
  heavy: 36,
  success: [10, 36, 16],
  warning: [22, 56, 22],
  error: [34, 48, 34],
}

export function useHaptics() {
  const { isEnabled } = useInteractionSettings()

  const isSupported = computed(
    () =>
      import.meta.client &&
      typeof navigator !== 'undefined' &&
      typeof navigator.vibrate === 'function',
  )

  function pulse(pattern: HapticPattern = 'light'): boolean {
    if (!import.meta.client || !isEnabled('haptic-feedback')) return false
    if (!isSupported.value) return false
    // 動きを減らす設定の端末では振動も控える。
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    try {
      return navigator.vibrate(PATTERNS[pattern])
    } catch {
      return false
    }
  }

  return { pulse, isSupported }
}
