import {
  DEFAULT_INTERACTION_STATE,
  INTERACTION_IDS,
  type InteractionId,
} from '~/utils/interactionCatalog'

/**
 * Interaction Kit の有効 / 無効を一元管理する。
 *
 * 既定はすべて有効。localStorage には「既定から変えたもの」だけを保存する
 * ので、将来パターンを追加しても既存ユーザーの設定を壊さない。
 */

const STORAGE_KEY = 'sycs:interactions:v1'

export function useInteractionSettings() {
  const enabled = useState<Record<string, boolean>>('interactions:enabled', () => ({
    ...DEFAULT_INTERACTION_STATE,
  }))
  const hydrated = useState<boolean>('interactions:hydrated', () => false)

  /** 壊れた値・未知の ID は無視して既定へフォールバックする。 */
  function hydrate() {
    if (hydrated.value || !import.meta.client) return
    hydrated.value = true
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, unknown>
      const next: Record<string, boolean> = { ...DEFAULT_INTERACTION_STATE }
      for (const id of INTERACTION_IDS) {
        if (typeof parsed[id] === 'boolean') next[id] = parsed[id] as boolean
      }
      enabled.value = next
    } catch {
      /* 壊れた JSON は既定のまま */
    }
  }

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enabled.value))
    } catch {
      /* 容量超過などは無視 */
    }
  }

  function isEnabled(id: InteractionId | string): boolean {
    return enabled.value[id] !== false
  }

  function setEnabled(id: InteractionId, value: boolean) {
    enabled.value = { ...enabled.value, [id]: value }
    persist()
  }

  function toggle(id: InteractionId) {
    setEnabled(id, !isEnabled(id))
  }

  /** プロファイル適用など、まとめて差し替えたいとき。 */
  function setMany(patch: Partial<Record<InteractionId, boolean>>) {
    enabled.value = { ...enabled.value, ...patch }
    persist()
  }

  function enableAll() {
    enabled.value = { ...DEFAULT_INTERACTION_STATE }
    persist()
  }

  function disableAll() {
    enabled.value = Object.fromEntries(INTERACTION_IDS.map((id) => [id, false]))
    persist()
  }

  function reset() {
    enabled.value = { ...DEFAULT_INTERACTION_STATE }
    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
  }

  const enabledCount = computed(
    () => INTERACTION_IDS.filter((id) => isEnabled(id)).length,
  )

  return {
    enabled,
    hydrated,
    enabledCount,
    total: INTERACTION_IDS.length,
    hydrate,
    isEnabled,
    setEnabled,
    toggle,
    setMany,
    enableAll,
    disableAll,
    reset,
  }
}
