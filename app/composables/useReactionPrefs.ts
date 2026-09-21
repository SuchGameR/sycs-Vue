const PALETTE_KEY = 'sycs:reaction-palette'
const RECENT_KEY = 'sycs:reaction-recent'
const DEFAULT_PALETTE = ['👍', '❤️', '🔥', '😂', '😮', '👀']

function loadList(key: string, fallback: string[]): string[] {
  if (!import.meta.client) return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.every(v => typeof v === 'string') ? parsed : fallback
  } catch {
    return fallback
  }
}

function saveList(key: string, value: string[]) {
  if (!import.meta.client) return
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

export function useReactionPrefs() {
  const palette = useState<string[]>('reaction:palette', () => loadList(PALETTE_KEY, DEFAULT_PALETTE))
  const recent = useState<string[]>('reaction:recent', () => loadList(RECENT_KEY, []))

  function persist() {
    saveList(PALETTE_KEY, palette.value)
    saveList(RECENT_KEY, recent.value)
  }

  function addToPalette(emoji: string) {
    if (!emoji || palette.value.includes(emoji)) return
    palette.value = [...palette.value, emoji].slice(-24)
    persist()
  }

  function removeFromPalette(emoji: string) {
    palette.value = palette.value.filter(e => e !== emoji)
    persist()
  }

  function pushRecent(emoji: string) {
    if (!emoji) return
    recent.value = [emoji, ...recent.value.filter(e => e !== emoji)].slice(0, 12)
    persist()
  }

  function resetPalette() {
    palette.value = [...DEFAULT_PALETTE]
    persist()
  }

  return { palette, recent, addToPalette, removeFromPalette, pushRecent, resetPalette }
}
