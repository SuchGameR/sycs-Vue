export interface TimelineConditions {
  scope: 'global' | 'local' | 'following' | 'recommended'
  mediaType?: '' | 'image' | 'video' | 'audio' | 'text'
  sort?: 'latest' | 'popular'
  serverId?: string
  channelId?: string
  serverName?: string
  channelName?: string
  includeRelated?: boolean
}

export interface TimelineTab {
  id: string
  label: string
  fixed?: boolean
  pinned?: boolean
  preset?: string
  conditions: TimelineConditions
}

const STORAGE_KEY = 'sycs:timelines'

const fixedTabs: TimelineTab[] = [
  { id: 'following', label: 'フォロー中', fixed: true, preset: 'following', conditions: { scope: 'following', sort: 'latest' } },
  { id: 'recommended', label: 'オススメ', fixed: true, preset: 'recommended', conditions: { scope: 'recommended', sort: 'popular' } },
  { id: 'latest', label: '最新', fixed: true, preset: 'latest', conditions: { scope: 'global', sort: 'latest' } },
]

export const TIMELINE_PRESETS: Array<{ key: string; label: string; icon: string; conditions: TimelineConditions }> = [
  { key: 'video', label: '動画', icon: 'lucide:video', conditions: { scope: 'global', mediaType: 'video', sort: 'latest' } },
  { key: 'image', label: '画像', icon: 'lucide:image', conditions: { scope: 'global', mediaType: 'image', sort: 'latest' } },
  { key: 'audio', label: '音楽', icon: 'lucide:music', conditions: { scope: 'global', mediaType: 'audio', sort: 'latest' } },
  { key: 'text', label: 'テキスト', icon: 'lucide:type', conditions: { scope: 'global', mediaType: 'text', sort: 'latest' } },
  { key: 'trending', label: '急上昇', icon: 'lucide:trending-up', conditions: { scope: 'global', sort: 'popular' } },
  { key: 'following', label: 'フォロー中', icon: 'lucide:users', conditions: { scope: 'following', sort: 'latest' } },
  { key: 'local', label: 'ローカル', icon: 'lucide:heart-handshake', conditions: { scope: 'local', sort: 'latest' } },
  { key: 'similar', label: '似てるもの', icon: 'lucide:sparkles', conditions: { scope: 'recommended', sort: 'popular', includeRelated: true } },
]

function loadPersisted(): { tabs: TimelineTab[]; activeId: string } {
  if (!import.meta.client) return { tabs: [], activeId: 'following' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { tabs: [], activeId: 'following' }
    const parsed = JSON.parse(raw)
    return {
      tabs: Array.isArray(parsed.tabs) ? parsed.tabs : [],
      activeId: parsed.activeId || 'following',
    }
  } catch {
    return { tabs: [], activeId: 'following' }
  }
}

export function useCustomTimelines() {
  const customTabs = useState<TimelineTab[]>('timelines:custom', () => loadPersisted().tabs)
  const activeId = useState<string>('timelines:active', () => loadPersisted().activeId)

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tabs: customTabs.value,
      activeId: activeId.value,
    }))
  }

  const pinnedTabs = computed(() => customTabs.value.filter(t => (t as any).pinned))
  const unpinnedTabs = computed(() => customTabs.value.filter(t => !(t as any).pinned))
  const allTabs = computed(() => [...fixedTabs, ...customTabs.value])

  const activeTab = computed<TimelineTab>(() =>
    allTabs.value.find(t => t.id === activeId.value) || fixedTabs[0]
  )

  function setActive(id: string) {
    activeId.value = id
    persist()
  }

  function addTab(tab: Omit<TimelineTab, 'id'> & { id?: string }) {
    const id = tab.id || `custom-${Date.now().toString(36)}`
    customTabs.value = [...customTabs.value, { ...tab, id, fixed: false } as TimelineTab]
    activeId.value = id
    persist()
    return id
  }

  function updateTab(id: string, patch: Partial<TimelineTab>) {
    customTabs.value = customTabs.value.map(t => t.id === id ? { ...t, ...patch } : t)
    persist()
  }

  function removeTab(id: string) {
    customTabs.value = customTabs.value.filter(t => t.id !== id)
    if (activeId.value === id) activeId.value = fixedTabs[0].id
    persist()
  }

  function togglePin(id: string) {
    customTabs.value = customTabs.value.map(t =>
      t.id === id ? ({ ...t, pinned: !(t as any).pinned } as TimelineTab) : t
    )
    persist()
  }

  function buildQuery(tab?: TimelineTab) {
    const t = tab || activeTab.value
    const c = t.conditions
    const params: Record<string, any> = {
      scope: c.scope,
      sort: c.sort || 'latest',
      limit: 10,
    }
    if (c.mediaType) params.mediaType = c.mediaType
    if (c.includeRelated) params.related = 'true'
    if (c.serverId) params.serverId = c.serverId
    if (c.channelId) params.channelId = c.channelId
    return params
  }

  return {
    fixedTabs,
    customTabs,
    pinnedTabs,
    unpinnedTabs,
    allTabs,
    activeId,
    activeTab,
    setActive,
    addTab,
    updateTab,
    removeTab,
    togglePin,
    buildQuery,
    persist,
  }
}
