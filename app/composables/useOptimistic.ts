import type { Ref } from 'vue'

/**
 * 楽観的 UI。
 *
 * 1. 先に画面を更新する
 * 2. サーバー呼び出しを待つ
 * 3. 失敗したら元の値へ巻き戻す
 *
 * pending を数えているので、連打しても表示がちらつかない。
 */
export function useOptimistic<T>(
  target: Ref<T>,
  options: { onError?: (error: unknown) => void } = {},
) {
  const pendingCount = ref(0)

  async function run(
    optimistic: T | ((previous: T) => T),
    commit: (value: T) => Promise<T | void>,
  ): Promise<boolean> {
    const previous = target.value
    const next =
      typeof optimistic === 'function'
        ? (optimistic as (previous: T) => T)(previous)
        : optimistic

    target.value = next
    pendingCount.value += 1
    try {
      const result = await commit(next)
      if (result !== undefined) target.value = result
      return true
    } catch (error) {
      target.value = previous
      options.onError?.(error)
      return false
    } finally {
      pendingCount.value = Math.max(0, pendingCount.value - 1)
    }
  }

  return {
    value: target,
    pending: computed(() => pendingCount.value > 0),
    pendingCount,
    run,
  }
}
