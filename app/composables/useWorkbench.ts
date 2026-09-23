export interface ExtensionDef {
  id: string
  name: string
  description: string
  icon: string
  accent: string
  size: { w: number; h: number }
}

export interface WorkbenchWindow {
  id: string
  extId: string
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
}

export interface WorkbenchLayout {
  sidebar: boolean
  mediaPane: boolean
}

interface WorkbenchState {
  installed: string[]
  windows: WorkbenchWindow[]
  layout: WorkbenchLayout
  zTop: number
}

const STORAGE_KEY = 'sycs:workbench'

export const EXTENSION_CATALOG: ExtensionDef[] = [
  {
    id: 'clock',
    name: '時計',
    description: '現在の時刻と日付を表示します',
    icon: 'lucide:clock',
    accent: 'from-sky-500/20 to-indigo-500/10',
    size: { w: 240, h: 240 },
  },
  {
    id: 'notes',
    name: 'クイックメモ',
    description: '思いついたことをすぐ書き留めます',
    icon: 'lucide:sticky-note',
    accent: 'from-amber-500/20 to-orange-500/10',
    size: { w: 280, h: 260 },
  },
  {
    id: 'trending',
    name: 'トレンド',
    description: 'いま人気の投稿をリアルタイム表示します',
    icon: 'lucide:trending-up',
    accent: 'from-fuchsia-500/20 to-rose-500/10',
    size: { w: 320, h: 380 },
  },
]

function defaultState(): WorkbenchState {
  return {
    installed: [],
    windows: [],
    layout: { sidebar: true, mediaPane: true },
    zTop: 100,
  }
}

function loadState(): WorkbenchState {
  const base = defaultState()
  if (!import.meta.client) return base
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw)
    return {
      installed: Array.isArray(parsed.installed) ? parsed.installed : base.installed,
      windows: Array.isArray(parsed.windows) ? parsed.windows : base.windows,
      layout: { ...base.layout, ...(parsed.layout || {}) },
      zTop: typeof parsed.zTop === 'number' ? parsed.zTop : base.zTop,
    }
  } catch {
    return base
  }
}

function catalogOf(extId: string) {
  return EXTENSION_CATALOG.find(e => e.id === extId)
}

export function useWorkbench() {
  const initial = loadState()
  const installed = useState<string[]>('wb:installed', () => initial.installed)
  const windows = useState<WorkbenchWindow[]>('wb:windows', () => initial.windows)
  const layout = useState<WorkbenchLayout>('wb:layout', () => initial.layout)
  const zTop = useState<number>('wb:ztop', () => initial.zTop)

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        installed: installed.value,
        windows: windows.value,
        layout: layout.value,
        zTop: zTop.value,
      }))
    } catch { /* ignore quota errors */ }
  }

  function isInstalled(extId: string) {
    return installed.value.includes(extId)
  }

  function isOpen(extId: string) {
    return windows.value.some(w => w.extId === extId && !w.minimized)
  }

  function nextZ() {
    zTop.value += 1
    return zTop.value
  }

  function openWindow(extId: string) {
    const existing = windows.value.find(w => w.extId === extId)
    if (existing) {
      windows.value = windows.value.map(w =>
        w.id === existing.id ? { ...w, minimized: false, z: nextZ() } : w
      )
    } else {
      const def = catalogOf(extId)
      const size = def?.size || { w: 280, h: 240 }
      const offset = (windows.value.length % 6) * 28
      let x = 96 + offset
      let y = 96 + offset
      if (import.meta.client) {
        const vw = window.innerWidth
        const vh = window.innerHeight
        x = Math.max(16, Math.min(x, vw - size.w - 16))
        y = Math.max(16, Math.min(y, vh - size.h - 48))
      }
      windows.value = [...windows.value, {
        id: `${extId}-${Date.now().toString(36)}`,
        extId,
        x,
        y,
        w: size.w,
        h: size.h,
        z: nextZ(),
        minimized: false,
      }]
    }
    persist()
  }

  function install(extId: string) {
    if (!isInstalled(extId)) {
      installed.value = [...installed.value, extId]
    }
    openWindow(extId)
  }

  function uninstall(extId: string) {
    installed.value = installed.value.filter(id => id !== extId)
    windows.value = windows.value.filter(w => w.extId !== extId)
    persist()
  }

  function closeWindow(winId: string) {
    windows.value = windows.value.filter(w => w.id !== winId)
    persist()
  }

  function minimizeWindow(winId: string) {
    windows.value = windows.value.map(w => w.id === winId ? { ...w, minimized: true } : w)
    persist()
  }

  function focusWindow(winId: string) {
    windows.value = windows.value.map(w => w.id === winId ? { ...w, z: nextZ() } : w)
    persist()
  }

  function moveWindow(winId: string, x: number, y: number) {
    windows.value = windows.value.map(w => w.id === winId ? { ...w, x, y } : w)
  }

  function resizeWindow(winId: string, w: number, h: number) {
    windows.value = windows.value.map(win => win.id === winId ? { ...win, w, h } : win)
  }

  function commit() {
    persist()
  }

  function setLayout(patch: Partial<WorkbenchLayout>) {
    layout.value = { ...layout.value, ...patch }
    persist()
  }

  function resetAll() {
    installed.value = []
    windows.value = []
    layout.value = { sidebar: true, mediaPane: true }
    zTop.value = 100
    persist()
  }

  return {
    installed,
    windows,
    layout,
    EXTENSION_CATALOG,
    isInstalled,
    isOpen,
    install,
    uninstall,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    commit,
    setLayout,
    resetAll,
  }
}
