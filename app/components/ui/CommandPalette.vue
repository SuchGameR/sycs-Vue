<script setup lang="ts">
/**
 * コマンドパレット (Ctrl / ⌘ + K)。
 *
 * 既定のコマンドを登録し、画面ごとのコマンドは useCommandPalette().register() で
 * 追加できる。検索はあいまい一致、最近使ったものが上に来る。
 */
import type { PaletteResult } from '~/composables/useCommandPalette'

const {
  open,
  query,
  activeIndex,
  results,
  setOpen,
  close,
  run,
  runActive,
  moveActive,
  setActive,
  registerMany,
  hydrateRecent,
} = useCommandPalette()

const inputEl = ref<HTMLInputElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)

const theme = useTheme()
const nav = useNavLayout()
const network = useNetworkStatus()
const settings = useInteractionSettings()
const toast = useToast()
const { pulse } = useHaptics()

let unregister: (() => void) | null = null

const commands = [
  {
    id: 'nav.home',
    title: 'ホームへ移動',
    subtitle: 'タイムライン',
    group: '移動',
    icon: 'lucide:house',
    keywords: ['home', 'feed', 'タイムライン'],
    run: () => navigateTo('/home'),
  },
  {
    id: 'nav.social',
    title: 'ソーシャルへ移動',
    subtitle: 'DM・つながり',
    group: '移動',
    icon: 'lucide:users-round',
    keywords: ['social', 'dm', 'messages'],
    run: () => navigateTo('/social'),
  },
  {
    id: 'nav.search',
    title: '検索する',
    subtitle: '投稿・ユーザー・タグ',
    group: '移動',
    icon: 'lucide:search',
    keywords: ['search', 'find'],
    run: () => navigateTo('/search'),
  },
  {
    id: 'nav.actions',
    title: 'アクティビティを見る',
    subtitle: 'いいね・通知',
    group: '移動',
    icon: 'lucide:heart',
    keywords: ['activity', 'notifications'],
    run: () => navigateTo('/actions'),
  },
  {
    id: 'nav.studio',
    title: 'インタラクションスタジオ',
    subtitle: '33 のパターンを試す・調整する',
    group: '設定',
    icon: 'lucide:wand-sparkles',
    keywords: ['interaction', 'lab', 'studio', 'ui', '設定'],
    run: () => navigateTo('/interactions'),
  },
  {
    id: 'theme.toggle',
    title: 'ライト / ダークを切り替え',
    group: '外観',
    icon: 'lucide:sun-moon',
    keywords: ['theme', 'dark', 'light', 'テーマ'],
    shortcut: '⇧T',
    run: () => {
      const next = theme.resolvedScheme.value === 'dark' ? 'light' : 'dark'
      theme.setScheme(next)
      toast.info(next === 'dark' ? 'ダークテーマにしました' : 'ライトテーマにしました', {
        icon: next === 'dark' ? 'lucide:moon' : 'lucide:sun',
      })
    },
  },
  {
    id: 'theme.system',
    title: '端末の設定に合わせる',
    subtitle: 'ライト / ダークを自動',
    group: '外観',
    icon: 'lucide:monitor',
    keywords: ['system', 'auto', 'theme'],
    run: () => {
      theme.setScheme('system')
      toast.info('端末の設定に合わせます', { icon: 'lucide:monitor' })
    },
  },
  {
    id: 'nav.layout',
    title: 'ナビをピル / サイドバー切替',
    group: 'レイアウト',
    icon: 'lucide:panel-left',
    keywords: ['nav', 'sidebar', 'pill', 'ナビ'],
    run: () => {
      nav.setDesktopNav(nav.desktopNav.value === 'pill' ? 'sidebar' : 'pill')
      toast.info('ナビ表示を切り替えました', { icon: 'lucide:panel-left' })
    },
  },
  {
    id: 'haptics.test',
    title: '触覚フィードバックをテスト',
    group: '設定',
    icon: 'lucide:vibrate',
    keywords: ['haptic', 'vibrate', '振動'],
    run: () => {
      const ok = pulse('success')
      toast.info(ok ? '触覚を再生しました' : 'この端末は振動に対応していません', {
        icon: 'lucide:vibrate',
      })
    },
  },
  {
    id: 'interactions.enableAll',
    title: 'すべてのインタラクションを有効化',
    group: '設定',
    icon: 'lucide:check-check',
    keywords: ['interaction', 'reset', 'enable'],
    run: () => {
      settings.enableAll()
      toast.success('すべてのインタラクションを有効にしました')
    },
  },
  {
    id: 'network.simulateOffline',
    title: 'オフラインをシミュレート',
    subtitle: '同期状態の動作を確認',
    group: '設定',
    icon: 'lucide:wifi-off',
    keywords: ['offline', 'sync', 'network'],
    run: () => {
      network.simulateOffline(true)
      toast.warning('オフラインに切り替えました。復帰はバナーから。')
    },
  },
  {
    id: 'toast.clear',
    title: '通知をすべて閉じる',
    group: '設定',
    icon: 'lucide:x',
    keywords: ['toast', 'clear', '通知'],
    run: () => toast.clear(),
  },
] as const

onMounted(() => {
  unregister = registerMany(commands as any)
  hydrateRecent()
  window.addEventListener('keydown', onGlobalKey)
})

onBeforeUnmount(() => {
  unregister?.()
  window.removeEventListener('keydown', onGlobalKey)
})

function onGlobalKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    setOpen(!open.value)
    return
  }
  if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    close()
  }
}

watch(open, async (value) => {
  if (!value) return
  await nextTick()
  inputEl.value?.focus()
  inputEl.value?.select()
})

watch(query, () => setActive(0))

watch(activeIndex, async () => {
  await nextTick()
  panelEl.value
    ?.querySelector<HTMLElement>(`[data-cmd-index="${activeIndex.value}"]`)
    ?.scrollIntoView({ block: 'nearest' })
})

const groups = computed(() => {
  const grouped: Array<{ label: string; items: Array<PaletteResult & { index: number }> }> = []
  results.value.forEach((result, index) => {
    const label = result.command.group || 'その他'
    let group = grouped.find((g) => g.label === label)
    if (!group) {
      group = { label, items: [] }
      grouped.push(group)
    }
    group.items.push({ ...result, index })
  })
  return grouped
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveActive(1)
    pulse('selection')
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveActive(-1)
    pulse('selection')
  } else if (e.key === 'Enter') {
    e.preventDefault()
    pulse('light')
    void runActive()
  }
}

async function choose(id: string) {
  pulse('light')
  await run(id)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sycs-fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[500] flex items-start justify-center px-3 pt-[10vh] min-[681px]:pt-[14vh]"
        role="dialog"
        aria-modal="true"
        aria-label="コマンドパレット"
      >
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />

        <div
          ref="panelEl"
          class="relative flex max-h-[76vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-high/95 shadow-2xl backdrop-blur-xl"
        >
          <div class="flex items-center gap-2 border-b border-outline-variant px-4">
            <Icon name="lucide:command" class="h-4 w-4 shrink-0 text-on-surface-variant" />
            <input
              ref="inputEl"
              v-model="query"
              type="text"
              class="min-w-0 flex-1 bg-transparent py-4 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70"
              placeholder="コマンドを検索… (ホーム、テーマ、設定)"
              aria-label="コマンドを検索"
              @keydown="onKeydown"
            />
            <kbd class="hidden shrink-0 rounded border border-outline-variant px-1.5 py-0.5 text-[10px] text-on-surface-variant min-[681px]:block">ESC</kbd>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto p-2">
            <p v-if="!results.length" class="px-3 py-8 text-center text-sm text-on-surface-variant">
              「{{ query }}」に一致するコマンドはありません
            </p>

            <div v-for="group in groups" :key="group.label" class="mb-1">
              <p class="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">
                {{ group.label }}
              </p>
              <button
                v-for="item in group.items"
                :key="item.command.id"
                type="button"
                :data-cmd-index="item.index"
                class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition"
                :class="item.index === activeIndex ? 'bg-indigo-600/20 text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-highest'"
                @mouseenter="setActive(item.index)"
                @click="choose(item.command.id)"
              >
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  :class="item.index === activeIndex ? 'bg-indigo-500/25 text-indigo-200' : 'bg-white/5'"
                >
                  <Icon :name="item.command.icon || 'lucide:circle'" class="h-4 w-4" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-medium">{{ item.command.title }}</span>
                  <span v-if="item.command.subtitle" class="block truncate text-[11px] opacity-70">
                    {{ item.command.subtitle }}
                  </span>
                </span>
                <kbd v-if="item.command.shortcut" class="shrink-0 rounded border border-outline-variant px-1.5 py-0.5 text-[10px]">
                  {{ item.command.shortcut }}
                </kbd>
                <Icon v-else-if="item.index === activeIndex" name="lucide:corner-down-left" class="h-3.5 w-3.5 shrink-0 opacity-60" />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3 border-t border-outline-variant px-4 py-2.5 text-[10px] text-on-surface-variant">
            <span class="flex items-center gap-1"><kbd class="rounded border border-outline-variant px-1">↑</kbd><kbd class="rounded border border-outline-variant px-1">↓</kbd> 移動</span>
            <span class="flex items-center gap-1"><kbd class="rounded border border-outline-variant px-1">↵</kbd> 実行</span>
            <span class="ml-auto flex items-center gap-1"><kbd class="rounded border border-outline-variant px-1">⌘</kbd><kbd class="rounded border border-outline-variant px-1">K</kbd> 開閉</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
