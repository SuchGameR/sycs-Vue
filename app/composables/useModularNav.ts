/**
 * モジュール式ナビゲーション。
 *
 * 下部ピル / サイドバーの項目を「表示するか」「どの順番か」だけ保存する。
 * 実際のラベルや遷移先は MobileNav 側が持つので、ここでは key の順序と
 * 可視状態だけを扱う。
 */

export interface ModularNavItem {
  key: string
  label: string
  icon: string
  visible: boolean
}

export const DEFAULT_NAV_MODULES: ModularNavItem[] = [
  { key: 'home', label: 'ホーム', icon: 'lucide:house', visible: true },
  { key: 'social', label: 'ソーシャル', icon: 'lucide:users-round', visible: true },
  { key: 'search', label: '検索', icon: 'lucide:search', visible: true },
  { key: 'actions', label: 'アクティビティ', icon: 'lucide:heart', visible: true },
  { key: 'me', label: 'プロフィール', icon: 'lucide:user-round', visible: true },
]

const STORAGE_KEY = 'sycs:modular-nav:v1'

export function useModularNav() {
  const items = useState<ModularNavItem[]>('nav:modules', () =>
    DEFAULT_NAV_MODULES.map((i) => ({ ...i })),
  )
  const hydrated = useState<boolean>('nav:modules:hydrated', () => false)

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      /* ignore */
    }
  }

  function hydrate() {
    if (hydrated.value) return
    hydrated.value = true
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as ModularNavItem[]
      if (!Array.isArray(parsed)) return
      const byKey = new Map(parsed.map((i) => [i.key, i]))
      const merged = DEFAULT_NAV_MODULES.map((base) => {
        const saved = byKey.get(base.key)
        return saved
          ? { ...base, visible: saved.visible !== false }
          : { ...base }
      })
      // 保存後に追加された新しい項目は末尾へ。
      for (const saved of parsed) {
        if (!merged.some((m) => m.key === saved.key) && saved.key) {
          merged.push({
            key: saved.key,
            label: saved.label || saved.key,
            icon: saved.icon || 'lucide:circle',
            visible: saved.visible !== false,
          })
        }
      }
      items.value = merged
    } catch {
      /* ignore */
    }
  }

  function setVisible(key: string, visible: boolean) {
    items.value = items.value.map((i) => (i.key === key ? { ...i, visible } : i))
    persist()
  }

  function toggle(key: string) {
    const item = items.value.find((i) => i.key === key)
    if (item) setVisible(key, !item.visible)
  }

  function move(key: string, direction: -1 | 1) {
    const index = items.value.findIndex((i) => i.key === key)
    const to = index + direction
    if (index < 0 || to < 0 || to >= items.value.length) return
    const next = [...items.value]
    const [item] = next.splice(index, 1)
    next.splice(to, 0, item!)
    items.value = next
    persist()
  }

  function reset() {
    items.value = DEFAULT_NAV_MODULES.map((i) => ({ ...i }))
    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
  }

  const visibleItems = computed(() => items.value.filter((i) => i.visible))
  const orderOf = computed(() => {
    const map = new Map<string, number>()
    items.value.forEach((item, index) => map.set(item.key, index))
    return map
  })

  return {
    items,
    visibleItems,
    orderOf,
    hydrate,
    setVisible,
    toggle,
    move,
    reset,
  }
}
