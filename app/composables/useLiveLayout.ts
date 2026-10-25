/**
 * ライブレイアウトエディタ。
 *
 * ダッシュボードのブロック (並び順 / 幅 / 表示) を編集して保存する。
 * ドラッグ並べ替えは useDragSort、永続化はここが担当。
 */

export interface LiveBlock {
  id: string
  title: string
  description: string
  icon: string
  /** 1 = 半分, 2 = 全幅 */
  span: 1 | 2
  visible: boolean
}

export const DEFAULT_LIVE_BLOCKS: LiveBlock[] = [
  {
    id: 'hero',
    title: 'ヒーロー',
    description: 'プロフィールと今日のサマリー',
    icon: 'lucide:sparkles',
    span: 2,
    visible: true,
  },
  {
    id: 'timeline',
    title: 'タイムライン',
    description: '最新の投稿',
    icon: 'lucide:list',
    span: 2,
    visible: true,
  },
  {
    id: 'activity',
    title: 'アクティビティ',
    description: 'リアクションと通知',
    icon: 'lucide:activity',
    span: 1,
    visible: true,
  },
  {
    id: 'media',
    title: 'メディア',
    description: '最近の画像・動画',
    icon: 'lucide:image',
    span: 1,
    visible: true,
  },
  {
    id: 'trends',
    title: 'トレンド',
    description: 'いま話題のタグ',
    icon: 'lucide:trending-up',
    span: 1,
    visible: false,
  },
]

const STORAGE_KEY = 'sycs:live-layout:v1'

export function useLiveLayout() {
  const blocks = useState<LiveBlock[]>('layout:blocks', () =>
    DEFAULT_LIVE_BLOCKS.map((b) => ({ ...b })),
  )
  const hydrated = useState<boolean>('layout:blocks:hydrated', () => false)

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks.value))
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
      const parsed = JSON.parse(raw) as LiveBlock[]
      if (!Array.isArray(parsed)) return
      const byId = new Map(parsed.map((b) => [b.id, b]))
      const merged = DEFAULT_LIVE_BLOCKS.map((base) => {
        const saved = byId.get(base.id)
        return saved
          ? {
              ...base,
              span: saved.span === 1 ? 1 : 2,
              visible: saved.visible !== false,
            }
          : { ...base }
      })
      blocks.value = merged
    } catch {
      /* ignore */
    }
  }

  function setSpan(id: string, span: 1 | 2) {
    blocks.value = blocks.value.map((b) => (b.id === id ? { ...b, span } : b))
    persist()
  }

  function setVisible(id: string, visible: boolean) {
    blocks.value = blocks.value.map((b) => (b.id === id ? { ...b, visible } : b))
    persist()
  }

  function reset() {
    blocks.value = DEFAULT_LIVE_BLOCKS.map((b) => ({ ...b }))
    if (import.meta.client) localStorage.removeItem(STORAGE_KEY)
  }

  const visibleBlocks = computed(() => blocks.value.filter((b) => b.visible))

  return {
    blocks,
    visibleBlocks,
    hydrate,
    setSpan,
    setVisible,
    reset,
    persist,
  }
}
