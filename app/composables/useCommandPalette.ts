/**
 * コマンドパレットのレジストリと検索。
 *
 * 各画面は onMounted で register() するだけ。Ctrl/⌘+K で開き、
 * あいまい検索 → Enter で実行。最近使ったコマンドは上に来る。
 */

export interface PaletteCommand {
  id: string
  title: string
  subtitle?: string
  icon?: string
  group?: string
  keywords?: string[]
  shortcut?: string
  run: () => void | Promise<void>
  /** false を返すと一覧から隠れる (権限やログイン状態) */
  when?: () => boolean
}

export interface PaletteResult {
  command: PaletteCommand
  score: number
}

/** サブシーケンス一致 + 単語頭ボーナス。一致しなければ -1。 */
export function fuzzyScore(text: string, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1
  const t = text.toLowerCase()
  let ti = 0
  let score = 0
  let previous = -2

  for (const char of q) {
    const found = t.indexOf(char, ti)
    if (found === -1) return -1
    score += 1
    if (found === previous + 1) score += 2.5
    if (found === 0 || /[\s\-_/・]/.test(t[found - 1] ?? '')) score += 3
    previous = found
    ti = found + 1
  }
  // 短いタイトルほど上位に。
  return score - t.length * 0.015
}

export function useCommandPalette() {
  const registry = useState<PaletteCommand[]>('cmd:registry', () => [])
  const open = useState<boolean>('cmd:open', () => false)
  const query = useState<string>('cmd:query', () => '')
  const activeIndex = useState<number>('cmd:active', () => 0)
  const recentIds = useState<string[]>('cmd:recent', () => [])

  function hydrateRecent() {
    if (!import.meta.client || recentIds.value.length) return
    try {
      const raw = localStorage.getItem('sycs:cmd-recent')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) recentIds.value = parsed.filter((x) => typeof x === 'string')
    } catch {
      /* ignore */
    }
  }

  function persistRecent() {
    if (!import.meta.client) return
    try {
      localStorage.setItem('sycs:cmd-recent', JSON.stringify(recentIds.value.slice(0, 8)))
    } catch {
      /* ignore */
    }
  }

  function register(command: PaletteCommand) {
    registry.value = [...registry.value.filter((c) => c.id !== command.id), command]
    return () => unregister(command.id)
  }

  function registerMany(commands: PaletteCommand[]) {
    for (const command of commands) register(command)
    return () => {
      for (const command of commands) unregister(command.id)
    }
  }

  function unregister(id: string) {
    registry.value = registry.value.filter((c) => c.id !== id)
  }

  function setOpen(value: boolean) {
    open.value = value
    if (value) {
      query.value = ''
      activeIndex.value = 0
      hydrateRecent()
    }
  }

  function toggle() {
    setOpen(!open.value)
  }

  function close() {
    open.value = false
    query.value = ''
  }

  const commands = computed(() =>
    registry.value.filter((command) => {
      try {
        return command.when ? command.when() : true
      } catch {
        return true
      }
    }),
  )

  const results = computed<PaletteResult[]>(() => {
    const q = query.value.trim()
    const recent = new Map(recentIds.value.map((id, index) => [id, index]))
    return commands.value
      .map((command) => {
        const haystack = [
          command.title,
          command.subtitle ?? '',
          command.group ?? '',
          ...(command.keywords ?? []),
        ].join(' ')
        let score = fuzzyScore(haystack, q)
        if (score < 0) return { command, score }
        const recentIndex = recent.get(command.id)
        if (recentIndex !== undefined) score += Math.max(0, 6 - recentIndex)
        return { command, score }
      })
      .filter((result) => result.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 14)
  })

  function setActive(index: number) {
    activeIndex.value = index
  }

  function moveActive(delta: number) {
    const count = results.value.length
    if (!count) return
    activeIndex.value = (activeIndex.value + delta + count) % count
  }

  async function run(id: string) {
    const command = commands.value.find((c) => c.id === id)
    if (!command) return
    recentIds.value = [id, ...recentIds.value.filter((x) => x !== id)].slice(0, 8)
    persistRecent()
    close()
    await command.run()
  }

  async function runActive() {
    const item = results.value[activeIndex.value]
    if (item) await run(item.command.id)
  }

  watch(results, () => {
    if (activeIndex.value >= results.value.length) activeIndex.value = 0
  })

  return {
    registry,
    open,
    query,
    activeIndex,
    results,
    commands,
    recentIds,
    register,
    registerMany,
    unregister,
    setOpen,
    toggle,
    close,
    setActive,
    moveActive,
    run,
    runActive,
    hydrateRecent,
  }
}
