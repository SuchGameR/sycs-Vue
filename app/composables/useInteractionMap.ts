/**
 * ジェスチャー → 動作の割り当て。
 *
 * 実際のスワイプ処理は UiSwipeAction が行い、ここは「何をするか」だけを持つ。
 * MobileNav のスワイプや PostItem の長押しも同じマップを参照できる。
 */

export type GestureId = 'swipeLeft' | 'swipeRight' | 'longPress' | 'doubleTap' | 'pullDown'

export type GestureActionId =
  | 'bookmark'
  | 'like'
  | 'repost'
  | 'share'
  | 'quick-actions'
  | 'open'
  | 'none'

export interface GestureDef {
  id: GestureId
  label: string
  description: string
  icon: string
}

export interface GestureActionDef {
  id: GestureActionId
  label: string
  icon: string
}

export const GESTURES: GestureDef[] = [
  {
    id: 'swipeLeft',
    label: '左スワイプ',
    description: 'カードを左へ払う',
    icon: 'lucide:arrow-left',
  },
  {
    id: 'swipeRight',
    label: '右スワイプ',
    description: 'カードを右へ払う',
    icon: 'lucide:arrow-right',
  },
  {
    id: 'longPress',
    label: '長押し',
    description: '500ms 押し続ける',
    icon: 'lucide:fingerprint',
  },
  {
    id: 'doubleTap',
    label: 'ダブルタップ',
    description: '素早く 2 回叩く',
    icon: 'lucide:mouse-pointer-click',
  },
  {
    id: 'pullDown',
    label: '下へ引っ張る',
    description: '先頭でさらに下へ',
    icon: 'lucide:arrow-down',
  },
]

export const GESTURE_ACTIONS: GestureActionDef[] = [
  { id: 'bookmark', label: 'ブックマーク', icon: 'lucide:bookmark' },
  { id: 'like', label: 'いいね', icon: 'lucide:heart' },
  { id: 'repost', label: 'リポスト', icon: 'lucide:repeat-2' },
  { id: 'share', label: '共有', icon: 'lucide:share-2' },
  { id: 'quick-actions', label: 'クイック操作', icon: 'lucide:wand-sparkles' },
  { id: 'open', label: '詳細を開く', icon: 'lucide:maximize-2' },
  { id: 'none', label: '何もしない', icon: 'lucide:ban' },
]

export const DEFAULT_INTERACTION_MAP: Record<GestureId, GestureActionId> = {
  swipeLeft: 'bookmark',
  swipeRight: 'like',
  longPress: 'quick-actions',
  doubleTap: 'like',
  pullDown: 'open',
}

const STORAGE_KEY = 'sycs:interaction-map:v1'

export function useInteractionMap() {
  const map = useState<Record<GestureId, GestureActionId>>('interaction:map', () => ({
    ...DEFAULT_INTERACTION_MAP,
  }))
  const hydrated = useState<boolean>('interaction:map:hydrated', () => false)

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map.value))
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
      const parsed = JSON.parse(raw) as Partial<Record<GestureId, GestureActionId>>
      const next = { ...DEFAULT_INTERACTION_MAP }
      for (const g of GESTURES) {
        const value = parsed[g.id]
        if (value && GESTURE_ACTIONS.some((a) => a.id === value)) next[g.id] = value
      }
      map.value = next
    } catch {
      /* ignore */
    }
  }

  function setMapping(gesture: GestureId, action: GestureActionId) {
    map.value = { ...map.value, [gesture]: action }
    persist()
  }

  function reset() {
    map.value = { ...DEFAULT_INTERACTION_MAP }
    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
  }

  function resolve(gesture: GestureId): GestureActionId {
    return map.value[gesture] ?? 'none'
  }

  function actionDef(gesture: GestureId): GestureActionDef {
    const id = resolve(gesture)
    return GESTURE_ACTIONS.find((a) => a.id === id) ?? GESTURE_ACTIONS[GESTURE_ACTIONS.length - 1]!
  }

  return { map, hydrate, setMapping, reset, resolve, actionDef }
}
