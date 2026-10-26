<script setup lang="ts">
/**
 * Interaction Studio
 *
 * 33 のインタラクションパターンを、その場で触って・有効/無効を切り替えて
 * 確認できるページ。カタログ (interactionCatalog.ts) が唯一の情報源。
 */
import {
  INTERACTIONS,
  INTERACTION_CATEGORIES,
  findInteraction,
  type InteractionCategory,
  type InteractionId,
} from '~/utils/interactionCatalog'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Interaction Studio — SYCS',
  meta: [{ name: 'description', content: 'SYCS の 33 のインタラクションパターンを試して調整する。' }],
})

const settings = useInteractionSettings()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const query = ref('')
const category = ref<'all' | InteractionCategory>('all')
const initialPattern = typeof route.query.p === 'string' ? findInteraction(route.query.p) : null
const selectedId = ref<InteractionId>((initialPattern?.id as InteractionId) || 'pull-to-refresh')
const stageEl = ref<HTMLElement | null>(null)

const categoryOptions = [
  { id: 'all' as const, label: 'すべて', icon: 'lucide:layout-grid', description: '全パターン' },
  ...INTERACTION_CATEGORIES,
]

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return INTERACTIONS.filter((item) => {
    if (category.value !== 'all' && item.category !== category.value) return false
    if (!q) return true
    const cat = INTERACTION_CATEGORIES.find((c) => c.id === item.category)
    return (
      item.label.toLowerCase().includes(q) ||
      item.en.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (cat?.label.toLowerCase().includes(q) ?? false)
    )
  })
})

const selected = computed(() => findInteraction(selectedId.value) ?? INTERACTIONS[0])
const selectedCategory = computed(() =>
  INTERACTION_CATEGORIES.find((c) => c.id === selected.value.category),
)
const selectedEnabled = computed(() => settings.isEnabled(selectedId.value))
const selectedIndex = computed(() =>
  filtered.value.findIndex((item) => item.id === selectedId.value),
)

function isEnabled(id: InteractionId) {
  return settings.isEnabled(id)
}

function choose(id: InteractionId) {
  selectedId.value = id
  router.replace({ query: { ...route.query, p: id } })
  if (import.meta.client && window.matchMedia('(max-width: 999px)').matches) {
    nextTick(() => stageEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
}

function pickCategory(id: 'all' | InteractionCategory) {
  category.value = id
  if (filtered.value.length && !filtered.value.some((item) => item.id === selectedId.value)) {
    selectedId.value = filtered.value[0]!.id
  }
}

function toggleSelected() {
  const next = !selectedEnabled.value
  settings.setEnabled(selectedId.value, next)
  if (next) toast.success(`「${selected.value.label}」を有効にしました`, { icon: selected.value.icon })
  else toast.info(`「${selected.value.label}」を無効にしました`, { icon: 'lucide:power' })
}

function toggleOne(id: InteractionId) {
  const next = !settings.isEnabled(id)
  settings.setEnabled(id, next)
  if (next) toast.success('有効にしました', { icon: 'lucide:check' })
  else toast.info('無効にしました', { icon: 'lucide:power' })
}

function step(direction: -1 | 1) {
  if (!filtered.value.length) return
  const current = filtered.value.findIndex((item) => item.id === selectedId.value)
  const base = current < 0 ? 0 : current
  const next = (base + direction + filtered.value.length) % filtered.value.length
  choose(filtered.value[next]!.id)
}

function enableAll() {
  settings.enableAll()
  toast.success('すべてのパターンを有効にしました', { icon: 'lucide:check-check' })
}

function disableAll() {
  settings.disableAll()
  toast.info('すべてのパターンを無効にしました', { icon: 'lucide:power' })
}

onMounted(() => {
  settings.hydrate()
  const q = typeof route.query.p === 'string' ? route.query.p : ''
  if (q && findInteraction(q)) selectedId.value = q as InteractionId
})

watch(
  () => route.query.p,
  (value) => {
    if (typeof value === 'string' && findInteraction(value) && value !== selectedId.value) {
      selectedId.value = value as InteractionId
    }
  },
)
</script>

<template>
  <div class="mx-auto max-w-6xl px-3 pb-28 pt-4 min-[681px]:pb-10">
    <!-- Hero -->
    <header class="relative overflow-hidden rounded-2xl border border-outline-variant bg-surface-container/40 p-4 min-[681px]:p-6">
      <div class="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div class="relative flex flex-wrap items-start gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-900/30">
          <Icon name="lucide:wand-sparkles" class="h-6 w-6" />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h1 class="text-xl font-extrabold tracking-tight text-on-surface min-[681px]:text-2xl">
              Interaction Studio
            </h1>
            <span class="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-200">
              33 patterns
            </span>
          </div>
          <p class="mt-1 max-w-2xl text-xs leading-relaxed text-on-surface-variant min-[681px]:text-sm">
            アプリで使っている操作・フィードバック・レイアウトを、その場で試して調整できます。
            変更はこの端末に保存され、ホームやナビにも実際に反映されます。
          </p>
        </div>
        <div class="flex w-full flex-wrap items-center gap-2 min-[681px]:w-auto">
          <span class="flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-high/60 px-3 py-1.5 text-[11px] text-on-surface-variant">
            <Icon name="lucide:power" class="h-3.5 w-3.5 text-emerald-400" />
            {{ settings.enabledCount.value }} / {{ settings.total }} 有効
          </span>
          <button
            type="button"
            class="rounded-full border border-outline-variant px-3 py-1.5 text-[11px] font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            @click="enableAll"
          >
            すべて有効
          </button>
          <button
            type="button"
            class="rounded-full border border-outline-variant px-3 py-1.5 text-[11px] font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
            @click="disableAll"
          >
            すべて無効
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="relative mt-4">
        <Icon name="lucide:search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        <input
          v-model="query"
          type="search"
          placeholder="パターンを検索 (例: トースト、swipe、テーマ)"
          class="w-full rounded-xl border border-outline-variant bg-surface-container/70 py-2.5 pl-9 pr-10 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/60 focus:border-indigo-500/70"
          aria-label="パターンを検索"
        />
        <button
          v-if="query"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-on-surface-variant transition hover:bg-white/10"
          aria-label="検索をクリア"
          @click="query = ''"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>

      <!-- Categories -->
      <div class="sycs-no-scrollbar -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        <button
          v-for="option in categoryOptions"
          :key="option.id"
          type="button"
          class="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition"
          :class="
            category === option.id
              ? 'border-indigo-500/50 bg-indigo-600/20 text-indigo-200'
              : 'border-outline-variant bg-surface-container/40 text-on-surface-variant hover:bg-surface-container-high'
          "
          :aria-pressed="category === option.id"
          @click="pickCategory(option.id)"
        >
          <Icon :name="option.icon" class="h-3.5 w-3.5" />
          {{ option.label }}
        </button>
      </div>
    </header>

    <div class="mt-4 grid gap-4 min-[1000px]:grid-cols-[19rem_minmax(0,1fr)] min-[1000px]:items-start">
      <!-- Pattern list -->
      <aside class="min-[1000px]:sticky min-[1000px]:top-4">
        <div class="mb-2 flex items-center justify-between px-1">
          <p class="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/70">
            {{ category === 'all' ? 'すべて' : categoryOptions.find((c) => c.id === category)?.label }}
          </p>
          <p class="text-[11px] text-on-surface-variant">{{ filtered.length }}件</p>
        </div>

        <div class="sycs-no-scrollbar max-h-[70vh] space-y-1 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container/20 p-1.5 min-[1000px]:max-h-[calc(100dvh-13rem)]">
          <button
            v-for="item in filtered"
            :key="item.id"
            type="button"
            class="flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition"
            :class="
              item.id === selectedId
                ? 'border-indigo-500/50 bg-indigo-600/15'
                : 'border-transparent hover:border-outline-variant hover:bg-surface-container/60'
            "
            :aria-current="item.id === selectedId ? 'true' : undefined"
            @click="choose(item.id)"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              :class="item.id === selectedId ? 'bg-indigo-500/25 text-indigo-200' : 'bg-surface-container-high text-on-surface-variant'"
            >
              <Icon :name="item.icon" class="h-4 w-4" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-xs font-bold text-on-surface">{{ item.label }}</span>
              <span class="block truncate text-[10px] text-on-surface-variant">{{ item.en }}</span>
            </span>
            <span
              class="h-2 w-2 shrink-0 rounded-full"
              :class="isEnabled(item.id) ? 'bg-emerald-400' : 'bg-slate-600'"
              :title="isEnabled(item.id) ? '有効' : '無効'"
            />
            <span
              v-if="item.id === selectedId"
              class="shrink-0 text-indigo-300"
              aria-hidden="true"
            >
              <Icon name="lucide:chevron-right" class="h-4 w-4" />
            </span>
          </button>

          <div v-if="!filtered.length" class="px-3 py-8 text-center">
            <p class="text-xs text-on-surface-variant">「{{ query }}」に一致するパターンがありません。</p>
            <button class="mt-2 text-[11px] font-medium text-indigo-300" @click="query = ''">検索をクリア</button>
          </div>
        </div>

        <p class="mt-2 hidden px-1 text-[10px] leading-relaxed text-on-surface-variant/70 min-[1000px]:block">
          ヒント: 右上のスイッチで、そのパターンだけを無効にできます。
        </p>
      </aside>

      <!-- Stage -->
      <section ref="stageEl" class="min-w-0 scroll-mt-4">
        <div class="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container/30">
          <div class="relative border-b border-outline-variant bg-surface-container/40 p-4">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 to-fuchsia-500/15 text-indigo-200 ring-1 ring-indigo-500/20">
                <Icon :name="selected.icon" class="h-5 w-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-base font-extrabold text-on-surface min-[681px]:text-lg">{{ selected.label }}</h2>
                  <span class="rounded-full border border-outline-variant bg-surface-container/60 px-2 py-0.5 text-[10px] text-on-surface-variant">
                    {{ selectedCategory?.label }}
                  </span>
                </div>
                <p class="mt-0.5 text-[11px] uppercase tracking-wide text-on-surface-variant/70">{{ selected.en }}</p>
                <p class="mt-1.5 text-xs leading-relaxed text-on-surface-variant">{{ selected.description }}</p>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-1.5">
                <UiSwitch
                  :model-value="selectedEnabled"
                  :label="`${selected.label}を有効にする`"
                  @update:model-value="toggleSelected"
                />
                <span class="text-[10px]" :class="selectedEnabled ? 'text-emerald-400' : 'text-on-surface-variant'">
                  {{ selectedEnabled ? '有効' : '無効' }}
                </span>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-1.5">
              <code class="rounded-md bg-surface-container-high/70 px-1.5 py-0.5 text-[10px] text-indigo-200">{{ selected.source }}</code>
              <NuxtLink
                to="/home"
                class="flex items-center gap-1 rounded-md border border-outline-variant px-1.5 py-0.5 text-[10px] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
              >
                <Icon name="lucide:house" class="h-3 w-3" />
                ホームで確認
              </NuxtLink>
              <NuxtLink
                to="/home"
                class="hidden items-center gap-1 rounded-md border border-outline-variant px-1.5 py-0.5 text-[10px] text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface sm:flex"
              >
                <Icon name="lucide:arrow-left" class="h-3 w-3" />
                戻る
              </NuxtLink>
            </div>
          </div>

          <div v-if="!selectedEnabled" class="flex items-start gap-2 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5">
            <Icon name="lucide:info" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
            <p class="flex-1 text-[11px] leading-relaxed text-amber-100">
              このパターンは現在<strong>無効</strong>です。デモは表示されますが、ホームなどの実画面では動作しません。
            </p>
            <button type="button" class="shrink-0 rounded-md bg-amber-500/20 px-2 py-1 text-[10px] font-bold text-amber-100" @click="toggleSelected">
              有効にする
            </button>
          </div>

          <div class="p-3 min-[681px]:p-4" data-interaction-stage :data-interaction-id="selected.id">
            <LabPatternDemo :id="selected.id" :key="selected.id" />
          </div>

          <div class="flex items-center justify-between gap-2 border-t border-outline-variant bg-surface-container/20 px-3 py-2.5">
            <button
              type="button"
              class="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
              @click="step(-1)"
            >
              <Icon name="lucide:chevron-left" class="h-3.5 w-3.5" />
              前へ
            </button>
            <span class="text-[10px] text-on-surface-variant">
              {{ selectedIndex < 0 ? '—' : selectedIndex + 1 }} / {{ filtered.length }}
            </span>
            <button
              type="button"
              class="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-on-surface-variant transition hover:bg-white/10 hover:text-on-surface"
              @click="step(1)"
            >
              次へ
              <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div class="mt-3 grid gap-2 min-[681px]:grid-cols-2">
          <div class="rounded-xl border border-outline-variant bg-surface-container/20 p-3">
            <div class="flex items-center gap-1.5 text-[11px] font-bold text-on-surface">
              <Icon name="lucide:keyboard" class="h-3.5 w-3.5 text-indigo-300" />
              キーボード
            </div>
            <p class="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
              <kbd class="rounded border border-outline-variant px-1">Ctrl</kbd> /
              <kbd class="rounded border border-outline-variant px-1">⌘</kbd> +
              <kbd class="rounded border border-outline-variant px-1">K</kbd>
              でコマンドパレットを開き、どの画面からでもこのスタジオへ移動できます。
            </p>
          </div>
          <div class="rounded-xl border border-outline-variant bg-surface-container/20 p-3">
            <div class="flex items-center gap-1.5 text-[11px] font-bold text-on-surface">
              <Icon name="lucide:briefcase" class="h-3.5 w-3.5 text-indigo-300" />
              まとめて保存
            </div>
            <p class="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
              「ワークスペースプロファイル」のデモから、今のテーマ・ナビ・機能トグルをひとまとめに保存できます。
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
