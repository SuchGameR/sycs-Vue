<script setup lang="ts">
/**
 * Interaction Studio のデモ本体。
 *
 * 33 パターンそれぞれに「実際に触れる」最小構成を用意している。
 * 表示するパターンは props.id で切り替わる。
 */
import type { InteractionId } from '~/utils/interactionCatalog'
import type {
  FabAction,
  FilterChipOption,
  MenuItem,
  QuickAction,
  SelectionAction,
  SwipeActionItem,
  TimelineItem,
} from '~/utils/uiTypes'
import { validators } from '~/composables/useFormValidation'

const props = defineProps<{ id: InteractionId }>()

const toast = useToast()
const { pulse: pulseHaptic, isSupported: hapticsSupported } = useHaptics()
const {
  init: initNetwork,
  isOnline,
  forcedOffline,
  pending: netPending,
  syncing: netSyncing,
  state: netState,
  lastSyncedAt,
  enqueue,
  flush,
  simulateOffline,
} = useNetworkStatus()
const { setOpen: openPalette } = useCommandPalette()
const shared = useSharedElement()

onMounted(() => {
  initNetwork()
})

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* ---------------------------------------------------------------- 1. pull */
const refreshCount = ref(0)
const refreshList = ref([
  { id: 1, text: '最新の投稿を読み込みました' },
  { id: 2, text: '通知を確認しました' },
  { id: 3, text: 'トレンドを更新しました' },
])

async function demoRefresh() {
  await wait(900)
  refreshCount.value += 1
  refreshList.value = [
    { id: Date.now(), text: `更新 #${refreshCount.value} — ${new Date().toLocaleTimeString()}` },
    ...refreshList.value,
  ].slice(0, 5)
}

/* ------------------------------------------------------------ 2. skeleton */
const skeletonLoading = ref(true)
let skeletonTimer: ReturnType<typeof setTimeout> | null = null

function reloadSkeleton() {
  skeletonLoading.value = true
  if (skeletonTimer) clearTimeout(skeletonTimer)
  skeletonTimer = setTimeout(() => {
    skeletonLoading.value = false
  }, 1500)
}

watch(
  () => props.id,
  (id) => {
    if (id === 'skeleton-screen') reloadSkeleton()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (skeletonTimer) clearTimeout(skeletonTimer)
})

/* --------------------------------------------------------------- 3. toast */
function showToast(type: 'success' | 'error' | 'info' | 'warning') {
  const messages = {
    success: '投稿を保存しました',
    error: '保存に失敗しました。再試行してください。',
    info: '新しいアップデートがあります',
    warning: '接続が不安定です',
  }
  toast.push({ type, message: messages[type] })
}

function showUndoToast() {
  toast.undo('下書きを削除しました', () => {
    toast.success('下書きを復元しました')
  })
}

/* -------------------------------------------------------- 4. bottom sheet */
const sheetOpen = ref(false)

/* ------------------------------------------------------------- 5. swipe */
const swipeLeft: SwipeActionItem[] = [
  { id: 'bookmark', label: '保存', icon: 'lucide:bookmark', tone: 'primary' },
  { id: 'share', label: '共有', icon: 'lucide:share-2', tone: 'neutral' },
]
const swipeRight: SwipeActionItem[] = [
  { id: 'delete', label: '削除', icon: 'lucide:trash-2', tone: 'danger' },
]
const swipeResult = ref('まだ操作していません')

function onSwipe(action: SwipeActionItem, direction: 'left' | 'right') {
  swipeResult.value = `${direction === 'left' ? '左' : '右'}スワイプ → ${action.label}`
  toast.success(`「${action.label}」を実行しました`, { icon: action.icon })
}

/* ------------------------------------------------------- 6. autocomplete */
const acValue = ref('')
const acSelected = ref('')
const techItems = [
  'Nuxt',
  'Vue',
  'TypeScript',
  'Tailwind CSS',
  'Three.js',
  'WebGL',
  'Vite',
  'Drizzle ORM',
  'PostgreSQL',
  'Web Audio API',
  'View Transitions API',
]

/* ---------------------------------------------------------- 7. long press */
const longPressCount = ref(0)
const longPressLast = ref('')

function onLongPress(event: PointerEvent) {
  longPressCount.value += 1
  longPressLast.value = `${new Date().toLocaleTimeString()} に検出`
  pulseHaptic('medium')
}

/* ---------------------------------------------------------------- 8. fab */
const fabActions: FabAction[] = [
  { id: 'post', label: '投稿する', icon: 'lucide:pen-line', tone: 'primary' },
  { id: 'photo', label: '写真を追加', icon: 'lucide:image', tone: 'success' },
  { id: 'voice', label: '音声を録音', icon: 'lucide:mic', tone: 'neutral' },
]
const fabLog = ref('まだ選択していません')

function onFab(action: FabAction) {
  fabLog.value = action.label
  toast.success(`${action.label}を選択しました`, { icon: action.icon })
}

/* -------------------------------------------------------- 9. multi-select */
const multiPool = ref(['デザイン', '開発', 'マーケティング', '運用', 'サポート'])
const {
  active: multiActive,
  selected: multiSelected,
  count: multiCount,
  enter: enterMulti,
  exit: exitMulti,
  toggle: toggleMulti,
  isSelected: isMultiSelected,
} = useMultiSelect(multiPool)

const selectionActions: SelectionAction[] = [
  { id: 'archive', label: 'アーカイブ', icon: 'lucide:archive', tone: 'neutral' },
  { id: 'delete', label: '削除', icon: 'lucide:trash-2', tone: 'danger' },
]

function onSelectionAction(action: SelectionAction) {
  toast.success(`${multiCount.value}件を${action.label}しました`, { icon: action.icon })
  exitMulti()
}

/* ------------------------------------------------------- 10. optimistic */
const likeState = ref({ liked: false, count: 128 })
const failOptimistic = ref(false)
const { run: runOptimistic, pending: optimisticPending } = useOptimistic(likeState, {
  onError: () => toast.error('通信に失敗したため、元の状態に戻しました'),
})

function toggleOptimisticLike() {
  void runOptimistic(
    (previous) => ({
      liked: !previous.liked,
      count: previous.count + (previous.liked ? -1 : 1),
    }),
    async (next) => {
      await wait(900)
      if (failOptimistic.value) throw new Error('simulated failure')
      return next
    },
  )
}

/* --------------------------------------------------- 11. inline validation */
const form = useFormValidation(
  { username: '', email: '' },
  {
    username: [
      validators.required('ユーザー名は必須です'),
      validators.minLength(3),
      validators.pattern(/^[a-z0-9_]+$/, '半角英小文字・数字・_ のみ使えます'),
    ],
    email: [validators.required('メールアドレスは必須です'), validators.email()],
  },
)

function submitForm() {
  if (!form.validateAll()) {
    toast.error('入力内容を確認してください')
    return
  }
  toast.success('送信しました')
  form.reset()
}

/* ------------------------------------------------------- 12. empty state */
const emptyItems = ref<string[]>([])

function addEmptyItem() {
  emptyItems.value = [...emptyItems.value, `新しい項目 ${emptyItems.value.length + 1}`]
  toast.success('項目を追加しました')
}

/* ----------------------------------------------------------- 13. offline */
const lastSyncLabel = computed(() => {
  if (!lastSyncedAt.value) return 'まだ同期していません'
  const diff = Date.now() - lastSyncedAt.value
  if (diff < 60_000) return 'たった今同期しました'
  return `${Math.floor(diff / 60_000)}分前に同期`
})

async function queueOfflineChange() {
  const result = await enqueue('下書きを保存', async () => {
    await wait(800)
  })
  if (result.queued) {
    toast.info('オフラインのため、同期待ちに追加しました', { icon: 'lucide:cloud-upload' })
  } else {
    toast.success('サーバーへ送信しました', { icon: 'lucide:check' })
  }
}

/* --------------------------------------------------- 14. shared element */
const sharedCards = [
  { id: 1, title: '夕暮れの街', subtitle: 'Photography', gradient: 'from-orange-400 via-rose-500 to-purple-600' },
  { id: 2, title: '深海', subtitle: '3D Art', gradient: 'from-cyan-400 via-blue-600 to-indigo-900' },
  { id: 3, title: '森の朝', subtitle: 'Nature', gradient: 'from-emerald-300 via-green-600 to-teal-900' },
  { id: 4, title: 'ネオン', subtitle: 'Motion', gradient: 'from-fuchsia-400 via-purple-600 to-slate-900' },
]
const selectedCard = ref<number | null>(null)
const selectedCardData = computed(() => sharedCards.find((c) => c.id === selectedCard.value) ?? null)

function sharedStyle(id: number): Record<string, string> {
  return { viewTransitionName: shared.nameFor(id) }
}

async function openShared(id: number) {
  await shared.transition(() => {
    selectedCard.value = id
  })
}

async function closeShared() {
  await shared.transition(() => {
    selectedCard.value = null
  })
}

/* -------------------------------------------------------------- 15. haptic */
const hapticFlash = ref(false)
const hapticMessage = ref('ボタンを押して試せます')

function playHaptic(pattern: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
  const ok = pulseHaptic(pattern)
  hapticFlash.value = true
  setTimeout(() => { hapticFlash.value = false }, 280)
  hapticMessage.value = ok
    ? `「${pattern}」を再生しました`
    : hapticsSupported.value
      ? '設定または reduced motion により抑制されました'
      : 'この端末は振動に対応していません'
}

/* ------------------------------------------------------------ 17. filters */
const filterOptions: FilterChipOption[] = [
  { id: 'design', label: 'デザイン', icon: 'lucide:palette', count: 3 },
  { id: 'dev', label: '開発', icon: 'lucide:code', count: 3 },
  { id: 'media', label: 'メディア', icon: 'lucide:clapperboard', count: 2 },
  { id: 'business', label: 'ビジネス', icon: 'lucide:briefcase', count: 1 },
]
const filterValue = ref<string[]>([])
const filterItems = [
  { id: 1, title: 'デザインシステムの作り方', tag: 'design' },
  { id: 2, title: 'Nuxt 4 への移行メモ', tag: 'dev' },
  { id: 3, title: 'Three.js で 3D モデル表示', tag: 'dev' },
  { id: 4, title: 'シネマティックな映像編集', tag: 'media' },
  { id: 5, title: '配色とアクセシビリティ', tag: 'design' },
  { id: 6, title: '小さく始めるプロダクト', tag: 'business' },
  { id: 7, title: '音楽プレイヤーの UI', tag: 'media' },
  { id: 8, title: 'TypeScript の型パズル', tag: 'dev' },
  { id: 9, title: 'モバイルのタッチ操作', tag: 'design' },
]
const filteredItems = computed(() =>
  filterValue.value.length
    ? filterItems.filter((item) => filterValue.value.includes(item.tag))
    : filterItems,
)

/* --------------------------------------------------------- 18. drag sort */
const sortItems = ref([
  { id: 'hero', label: 'ヒーロー' },
  { id: 'timeline', label: 'タイムライン' },
  { id: 'media', label: 'メディア' },
  { id: 'activity', label: 'アクティビティ' },
])
const {
  containerRef: sortContainer,
  draggingKey: sortDragging,
  onHandleDown: onSortDown,
  moveBy: moveSort,
} = useDragSort(sortItems, (item) => item.id)

/* ------------------------------------------------------- 22. contextual */
const menuOpen = ref(false)
const menuX = ref(0)
const menuY = ref(0)
const contextCard = ref('SYCS の投稿カード')
const menuItems: MenuItem[] = [
  { id: 'open', label: '詳細を開く', icon: 'lucide:maximize-2', shortcut: '↵' },
  { id: 'bookmark', label: 'ブックマーク', icon: 'lucide:bookmark' },
  { id: 'copy', label: 'リンクをコピー', icon: 'lucide:link' },
  { id: 'delete', label: '削除', icon: 'lucide:trash-2', danger: true, separatorBefore: true },
]

function openContextMenu(event: MouseEvent | PointerEvent) {
  menuX.value = event.clientX
  menuY.value = event.clientY
  menuOpen.value = true
}

function onMenuSelect(item: MenuItem) {
  if (item.id === 'delete') {
    contextCard.value = '（削除されました）'
  }
  toast.success(`${item.label}を実行しました`, { icon: item.icon })
}

/* ----------------------------------------------------- 23. quick actions */
const quickActions: QuickAction[] = [
  { id: 'like', label: 'いいね', icon: 'lucide:heart', tone: 'primary' },
  { id: 'repost', label: 'リポスト', icon: 'lucide:repeat-2', tone: 'success' },
  { id: 'bookmark', label: '保存', icon: 'lucide:bookmark', tone: 'neutral' },
  { id: 'share', label: '共有', icon: 'lucide:share-2', tone: 'neutral' },
]
const quickLog = ref('アクションを選んでください')

function onQuickAction(action: QuickAction) {
  quickLog.value = action.label
  toast.success(`${action.label}を実行しました`, { icon: action.icon })
}

/* ------------------------------------------------- 24. reversible actions */
const reversibleItems = ref([
  { id: 'a', text: '古い下書き' },
  { id: 'b', text: '一時メモ' },
  { id: 'c', text: '未使用のテンプレート' },
])

function deleteReversible(item: { id: string; text: string }) {
  const index = reversibleItems.value.findIndex((x) => x.id === item.id)
  reversibleItems.value = reversibleItems.value.filter((x) => x.id !== item.id)
  toast.undo(
    `「${item.text}」を削除しました`,
    () => {
      const next = [...reversibleItems.value]
      next.splice(Math.max(0, index), 0, item)
      reversibleItems.value = next
      toast.success('元に戻しました')
    },
    { duration: 7000 },
  )
}

/* ------------------------------------------------------- 25. timeline */
const timelineItems: TimelineItem[] = [
  { id: '1', title: '投稿を作成', description: '「新しいデザインを公開しました」', time: '09:12', icon: 'lucide:pen-line', tone: 'default' },
  { id: '2', title: '3件のいいね', description: 'フォロワーがリアクションしました', time: '09:20', icon: 'lucide:heart', tone: 'success' },
  { id: '3', title: 'メディアを追加', description: '動画と 3D モデルを添付', time: '10:04', icon: 'lucide:image', tone: 'info' },
  { id: '4', title: '下書きを保存', description: '自動保存されました', time: '10:32', icon: 'lucide:save', tone: 'warning' },
]

/* --------------------------------------------------- 27. inline interaction */
const inlineTitle = ref('SYCS のプロフィール')
const inlineRating = ref(3)
const inlineLikes = ref(12)
const inlineLiked = ref(false)

function saveInlineTitle(value: string) {
  inlineTitle.value = value
  toast.success('タイトルを保存しました')
}

function validateInlineTitle(value: string) {
  if (value.trim().length < 2) return '2文字以上で入力してください'
  return true as const
}

function setRating(value: number) {
  inlineRating.value = value
  pulseHaptic('selection')
}

function toggleInlineLike() {
  inlineLiked.value = !inlineLiked.value
  inlineLikes.value += inlineLiked.value ? 1 : -1
  pulseHaptic('light')
}

/* -------------------------------------------------------- 21. mini player */
const playerOpen = ref(true)
const playerQueue = ['Midnight Drive', 'Glass Horizon', 'Neon Rain', 'Slow Motion']

/* ------------------------------------------------------ 16. command */
function openCommandPalette() {
  openPalette(true)
}
</script>

<template>
  <div class="space-y-4">
    <!-- 1. Pull to Refresh -->
    <template v-if="id === 'pull-to-refresh'">
      <div class="rounded-xl border border-outline-variant bg-surface-container/20 p-2">
        <UiPullToRefresh :on-refresh="demoRefresh" scroll-selector="#lab-pull-scroll" :show-desktop-button="false">
          <div id="lab-pull-scroll" class="h-56 space-y-1.5 overflow-y-auto rounded-lg p-2">
            <p class="px-1 pb-1 text-[10px] uppercase tracking-widest text-on-surface-variant/60">
              下へ引っ張って更新 ({{ refreshCount }}回)
            </p>
            <div
              v-for="item in refreshList"
              :key="item.id"
              class="rounded-lg border border-outline-variant bg-surface-container/40 px-3 py-2.5 text-xs text-on-surface"
            >
              {{ item.text }}
            </div>
          </div>
        </UiPullToRefresh>
      </div>
      <p class="text-center text-[11px] text-on-surface-variant">先頭で下へ引っ張ると更新されます</p>
    </template>

    <!-- 2. Skeleton Screen -->
    <template v-else-if="id === 'skeleton-screen'">
      <div class="flex items-center justify-between">
        <p class="text-[11px] text-on-surface-variant">
          {{ skeletonLoading ? '読み込み中 — 骨格を表示' : '読み込み完了 — 実際の内容' }}
        </p>
        <button type="button" class="rounded-lg border border-outline-variant px-2.5 py-1 text-[11px] text-on-surface-variant transition hover:bg-surface-container-high" @click="reloadSkeleton">
          もう一度
        </button>
      </div>
      <div v-if="skeletonLoading" class="space-y-2">
        <div v-for="i in 3" :key="i" class="rounded-xl border border-outline-variant bg-surface-container/30 p-3">
          <UiSkeletonBlock circle />
          <UiSkeletonBlock :lines="3" class="mt-3" />
        </div>
      </div>
      <div v-else class="space-y-2">
        <div v-for="i in 3" :key="i" class="rounded-xl border border-outline-variant bg-surface-container/30 p-3">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-indigo-500/30" />
            <div>
              <p class="text-xs font-bold text-on-surface">SYCS ユーザー {{ i }}</p>
              <p class="text-[10px] text-on-surface-variant">たった今</p>
            </div>
          </div>
          <p class="mt-2 text-xs leading-relaxed text-on-surface-variant">
            実際の内容が読み込まれました。スケルトンと同じ高さなので、表示がガタつきません。
          </p>
        </div>
      </div>
    </template>

    <!-- 3. Toast -->
    <template v-else-if="id === 'toast'">
      <div class="grid grid-cols-2 gap-2">
        <button type="button" class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-200" @click="showToast('success')">成功</button>
        <button type="button" class="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200" @click="showToast('error')">エラー</button>
        <button type="button" class="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-200" @click="showToast('info')">情報</button>
        <button type="button" class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-200" @click="showToast('warning')">警告</button>
      </div>
      <button type="button" class="w-full rounded-lg border border-outline-variant bg-surface-container/40 px-3 py-2 text-xs text-on-surface-variant transition hover:bg-surface-container-high" @click="showUndoToast">
        取り消せる通知 (元に戻す)
      </button>
    </template>

    <!-- 4. Bottom Sheet -->
    <template v-else-if="id === 'bottom-sheet'">
      <button type="button" class="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 active:scale-[0.99]" @click="sheetOpen = true">
        ボトムシートを開く
      </button>
      <p class="text-center text-[11px] text-on-surface-variant">下からせり上がり、ドラッグ / Esc で閉じられます</p>
      <BottomSheet :open="sheetOpen" height="auto" :dismiss-on-backdrop="true" @close="sheetOpen = false">
        <div class="p-4">
          <div class="mb-3 flex items-center justify-between">
            <p class="font-bold text-on-surface">クイック設定</p>
            <button type="button" class="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container" @click="sheetOpen = false">
              <Icon name="lucide:x" class="h-5 w-5" />
            </button>
          </div>
          <div class="space-y-2">
            <div v-for="label in ['通知', 'プライバシー', 'テーマ', 'アカウント']" :key="label" class="flex items-center justify-between rounded-lg bg-surface-container/40 px-3 py-2.5">
              <span class="text-xs text-on-surface">{{ label }}</span>
              <Icon name="lucide:chevron-right" class="h-4 w-4 text-on-surface-variant" />
            </div>
          </div>
        </div>
      </BottomSheet>
    </template>

    <!-- 5. Swipe Action -->
    <template v-else-if="id === 'swipe-action'">
      <div class="space-y-2">
        <UiSwipeAction :left="swipeLeft" :right="swipeRight" @action="onSwipe">
          <div class="border-b border-outline-variant bg-surface px-3 py-3">
            <p class="text-xs font-bold text-on-surface">左に払う → 保存 / 共有</p>
            <p class="text-[11px] text-on-surface-variant">右に払う → 削除</p>
          </div>
        </UiSwipeAction>
        <UiSwipeAction :left="swipeLeft" :right="swipeRight" @action="onSwipe">
          <div class="bg-surface px-3 py-3">
            <p class="text-xs font-bold text-on-surface">もう 1 つの行</p>
            <p class="text-[11px] text-on-surface-variant">マウスでもドラッグできます</p>
          </div>
        </UiSwipeAction>
      </div>
      <p class="rounded-lg bg-surface-container/30 px-3 py-2 text-[11px] text-on-surface-variant">{{ swipeResult }}</p>
    </template>

    <!-- 6. Autocomplete -->
    <template v-else-if="id === 'autocomplete'">
      <UiAutocompleteInput
        v-model="acValue"
        :items="techItems"
        label="技術を検索"
        placeholder="例: Nuxt, WebGL"
        icon="lucide:search"
        @select="acSelected = $event"
      />
      <p class="text-[11px] text-on-surface-variant">
        選択中: <span class="font-bold text-on-surface">{{ acSelected || '未選択' }}</span>
        <span class="opacity-60">（↑↓ / Enter でも選べます）</span>
      </p>
    </template>

    <!-- 7. Long Press -->
    <template v-else-if="id === 'long-press'">
      <LongPress :delay="500" @longpress="onLongPress">
        <div class="flex cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 px-4 py-8 transition active:scale-[0.99]">
          <Icon name="lucide:fingerprint" class="h-7 w-7 text-indigo-300" />
          <p class="text-sm font-bold text-on-surface">ここを長押し</p>
          <p class="text-[11px] text-on-surface-variant">500ms 押し続けると発火 ({{ longPressCount }}回)</p>
        </div>
      </LongPress>
      <p class="text-center text-[11px] text-on-surface-variant">{{ longPressLast || 'まだ長押しされていません' }}</p>
    </template>

    <!-- 8. FAB / Speed Dial -->
    <template v-else-if="id === 'fab-speed-dial'">
      <div class="relative h-64 overflow-hidden rounded-xl border border-outline-variant bg-surface-container/20">
        <p class="p-3 text-[11px] text-on-surface-variant">右下の + を押すと展開します</p>
        <UiFabSpeedDial inline :actions="fabActions" @action="onFab" />
      </div>
      <p class="text-center text-[11px] text-on-surface-variant">選択: {{ fabLog }}</p>
    </template>

    <!-- 9. Multi-select -->
    <template v-else-if="id === 'multi-select'">
      <div class="relative overflow-hidden rounded-xl border border-outline-variant">
        <div class="flex items-center justify-between border-b border-outline-variant bg-surface-container/40 px-3 py-2">
          <p class="text-xs font-bold text-on-surface">リスト</p>
          <button
            v-if="!multiActive"
            type="button"
            class="rounded-lg border border-outline-variant px-2.5 py-1 text-[11px] text-on-surface-variant transition hover:bg-surface-container-high"
            @click="enterMulti()"
          >
            選択
          </button>
          <span v-else class="text-[11px] text-indigo-300">{{ multiCount }}件選択中</span>
        </div>
        <button
          v-for="item in multiPool"
          :key="item"
          type="button"
          class="flex w-full items-center gap-2.5 border-b border-outline-variant/50 px-3 py-2.5 text-left transition last:border-0 hover:bg-surface-container/30"
          @click="multiActive ? toggleMulti(item) : enterMulti([item])"
        >
          <span
            class="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
            :class="multiActive && isMultiSelected(item) ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-outline-variant'"
          >
            <Icon v-if="multiActive && isMultiSelected(item)" name="lucide:check" class="h-3 w-3" />
          </span>
          <span class="text-xs text-on-surface">{{ item }}</span>
        </button>
        <div class="h-14" />
        <UiSelectionToolbar
          :count="multiCount"
          :actions="selectionActions"
          :fixed="false"
          @action="onSelectionAction"
          @clear="multiSelected.splice(0)"
          @exit="exitMulti"
        />
      </div>
      <p class="text-[11px] text-on-surface-variant">選択モード中は、行をタップで追加 / 解除できます。</p>
    </template>

    <!-- 10. Optimistic UI -->
    <template v-else-if="id === 'optimistic-ui'">
      <div class="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container/30 p-3">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90"
          :class="likeState.liked ? 'bg-rose-500/20 text-rose-400' : 'bg-surface-container-high text-on-surface-variant'"
          :aria-pressed="likeState.liked"
          @click="toggleOptimisticLike"
        >
          <Icon :name="likeState.liked ? 'lucide:heart' : 'lucide:heart'" class="h-5 w-5" :class="likeState.liked ? 'fill-current' : ''" />
        </button>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-on-surface">{{ likeState.count }} いいね</p>
          <p class="text-[11px] text-on-surface-variant">
            {{ optimisticPending ? '送信中… (画面は先に更新)' : 'サーバーと同期済み' }}
          </p>
        </div>
        <UiSwitch v-model="failOptimistic" size="sm" label="失敗させる" />
      </div>
      <p class="text-[11px] text-on-surface-variant">
        すぐにハートと数字が変わり、900ms 後に確定します。「失敗させる」を ON にすると巻き戻ります。
      </p>
    </template>

    <!-- 11. Inline Validation -->
    <template v-else-if="id === 'inline-validation'">
      <div class="space-y-3">
        <label class="block">
          <span class="mb-1 block text-[11px] font-medium text-on-surface-variant">ユーザー名</span>
          <input
            v-model="form.values.username"
            type="text"
            placeholder="例: sycs_user"
            class="w-full rounded-lg border bg-surface-container/40 px-3 py-2 text-sm text-on-surface outline-none transition"
            :class="form.errors.username && form.touched.username ? 'border-red-500/70' : 'border-outline-variant focus:border-indigo-500'"
            @input="form.touch('username')"
            @blur="form.touch('username')"
          />
          <span v-if="form.errors.username && form.touched.username" class="mt-1 flex items-center gap-1 text-[11px] text-red-400">
            <Icon name="lucide:alert-circle" class="h-3 w-3" />
            {{ form.errors.username }}
          </span>
        </label>

        <label class="block">
          <span class="mb-1 block text-[11px] font-medium text-on-surface-variant">メールアドレス</span>
          <input
            v-model="form.values.email"
            type="email"
            placeholder="you@example.com"
            class="w-full rounded-lg border bg-surface-container/40 px-3 py-2 text-sm text-on-surface outline-none transition"
            :class="form.errors.email && form.touched.email ? 'border-red-500/70' : 'border-outline-variant focus:border-indigo-500'"
            @input="form.touch('email')"
            @blur="form.touch('email')"
          />
          <span v-if="form.errors.email && form.touched.email" class="mt-1 flex items-center gap-1 text-[11px] text-red-400">
            <Icon name="lucide:alert-circle" class="h-3 w-3" />
            {{ form.errors.email }}
          </span>
        </label>

        <button type="button" class="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-500 active:scale-[0.99]" @click="submitForm">
          送信
        </button>
      </div>
    </template>

    <!-- 12. Empty State -->
    <template v-else-if="id === 'empty-state'">
      <div class="rounded-xl border border-outline-variant bg-surface-container/20">
        <UiEmptyState
          v-if="!emptyItems.length"
          icon="lucide:inbox"
          title="まだアイテムがありません"
          description="最初の 1 件を追加すると、ここに一覧が表示されます。"
          action-label="アイテムを追加"
          @action="addEmptyItem"
        />
        <div v-else class="p-3">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs font-bold text-on-surface">{{ emptyItems.length }}件</p>
            <button type="button" class="rounded-lg border border-outline-variant px-2.5 py-1 text-[11px] text-on-surface-variant" @click="addEmptyItem">追加</button>
          </div>
          <div v-for="item in emptyItems" :key="item" class="rounded-lg bg-surface-container/40 px-3 py-2 text-xs text-on-surface">
            {{ item }}
          </div>
        </div>
      </div>
    </template>

    <!-- 13. Offline / Sync -->
    <template v-else-if="id === 'offline-state'">
      <div class="rounded-xl border p-3" :class="isOnline ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-500/40 bg-slate-900/40'">
        <div class="flex items-center gap-2">
          <Icon :name="isOnline ? 'lucide:wifi' : 'lucide:wifi-off'" class="h-4 w-4" :class="isOnline ? 'text-emerald-400' : 'text-slate-400'" />
          <p class="text-xs font-bold text-on-surface">{{ isOnline ? 'オンライン' : 'オフライン' }}</p>
          <span class="ml-auto text-[10px] text-on-surface-variant">{{ netState }}</span>
        </div>
        <p class="mt-1 text-[11px] text-on-surface-variant">
          同期待ち: {{ netPending }}件 · {{ lastSyncLabel }}
          <span v-if="netSyncing"> · 送信中…</span>
        </p>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" class="rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white" @click="queueOfflineChange">
            変更を保存
          </button>
          <button type="button" class="rounded-lg border border-outline-variant px-3 py-1.5 text-[11px] text-on-surface-variant" @click="flush">
            今すぐ同期
          </button>
          <label class="ml-auto flex items-center gap-1.5 text-[11px] text-on-surface-variant">
            オフライン
            <UiSwitch :model-value="forcedOffline" size="sm" @update:model-value="simulateOffline($event)" />
          </label>
        </div>
      </div>
      <p class="text-[11px] text-on-surface-variant">
        オフライン中に保存した変更は、オンラインへ戻すと自動で送信されます。
      </p>
    </template>

    <!-- 14. Shared Element -->
    <template v-else-if="id === 'shared-element'">
      <div v-if="!selectedCardData" class="grid grid-cols-2 gap-2">
        <button
          v-for="card in sharedCards"
          :key="card.id"
          type="button"
          class="group relative h-32 overflow-hidden rounded-xl bg-gradient-to-br text-left transition active:scale-[0.98]"
          :class="card.gradient"
          :style="sharedStyle(card.id)"
          @click="openShared(card.id)"
        >
          <span class="absolute inset-x-0 bottom-0 bg-black/35 px-2.5 py-2 text-xs font-bold text-white backdrop-blur-sm">
            {{ card.title }}
          </span>
        </button>
      </div>
      <div
        v-else
        class="relative flex h-64 flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br p-4"
        :class="selectedCardData.gradient"
        :style="sharedStyle(selectedCardData.id)"
      >
        <button type="button" class="absolute left-3 top-3 rounded-full bg-black/40 p-1.5 text-white backdrop-blur" aria-label="戻る" @click="closeShared">
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
        </button>
        <p class="text-[11px] uppercase tracking-widest text-white/70">{{ selectedCardData.subtitle }}</p>
        <p class="text-2xl font-extrabold text-white">{{ selectedCardData.title }}</p>
        <p class="mt-1 max-w-xs text-xs text-white/80">カードが同じ形のまま詳細へ移動します。View Transitions 非対応時は即時に切り替わります。</p>
      </div>
    </template>

    <!-- 15. Haptic -->
    <template v-else-if="id === 'haptic-feedback'">
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="pattern in ['light', 'medium', 'heavy', 'success', 'warning', 'error'] as const"
          :key="pattern"
          type="button"
          class="rounded-lg border border-outline-variant bg-surface-container/40 px-2 py-2.5 text-[11px] font-medium text-on-surface transition active:scale-95"
          @click="playHaptic(pattern)"
        >
          {{ pattern }}
        </button>
      </div>
      <div
        class="flex h-16 items-center justify-center rounded-xl border transition"
        :class="hapticFlash ? 'border-indigo-400 bg-indigo-500/20' : 'border-outline-variant bg-surface-container/20'"
      >
        <Icon name="lucide:vibrate" class="h-6 w-6" :class="hapticFlash ? 'text-indigo-300' : 'text-on-surface-variant'" />
      </div>
      <p class="text-center text-[11px] text-on-surface-variant">{{ hapticMessage }}</p>
    </template>

    <!-- 16. Command Palette -->
    <template v-else-if="id === 'command-palette'">
      <button type="button" class="flex w-full items-center gap-3 rounded-xl border border-outline-variant bg-surface-container/40 px-4 py-3 text-left transition hover:bg-surface-container-high" @click="openCommandPalette">
        <Icon name="lucide:search" class="h-4 w-4 text-on-surface-variant" />
        <span class="flex-1 text-sm text-on-surface-variant">コマンドを検索…</span>
        <kbd class="rounded border border-outline-variant px-1.5 py-0.5 text-[10px] text-on-surface-variant">⌘ K</kbd>
      </button>
      <p class="text-center text-[11px] text-on-surface-variant">どこからでも Ctrl / ⌘ + K で開けます</p>
    </template>

    <!-- 17. Filter Chips -->
    <template v-else-if="id === 'filter-chips'">
      <UiFilterChips v-model="filterValue" :options="filterOptions" all-label="すべて" />
      <div class="space-y-1.5">
        <div v-for="item in filteredItems" :key="item.id" class="rounded-lg border border-outline-variant bg-surface-container/30 px-3 py-2 text-xs text-on-surface">
          {{ item.title }}
        </div>
        <p v-if="!filteredItems.length" class="py-4 text-center text-[11px] text-on-surface-variant">該当する項目がありません</p>
      </div>
    </template>

    <!-- 18. Drag & Drop -->
    <template v-else-if="id === 'drag-and-drop'">
      <ul ref="sortContainer" class="space-y-1.5">
        <li
          v-for="(item, index) in sortItems"
          :key="item.id"
          :data-sort-key="item.id"
          class="flex items-center gap-2 rounded-lg border px-2.5 py-2 transition"
          :class="sortDragging === item.id ? 'border-indigo-500/60 bg-indigo-600/10' : 'border-outline-variant bg-surface-container/30'"
        >
          <button type="button" class="touch-none cursor-grab rounded p-1 text-on-surface-variant active:cursor-grabbing" aria-label="ドラッグ" @pointerdown="onSortDown($event, item.id)">
            <Icon name="lucide:grip-vertical" class="h-4 w-4" />
          </button>
          <span class="flex-1 text-xs text-on-surface">{{ item.label }}</span>
          <button type="button" class="rounded p-1 text-on-surface-variant disabled:opacity-25" :disabled="index === 0" aria-label="上へ" @click="moveSort(item.id, -1)">
            <Icon name="lucide:chevron-up" class="h-3.5 w-3.5" />
          </button>
          <button type="button" class="rounded p-1 text-on-surface-variant disabled:opacity-25" :disabled="index === sortItems.length - 1" aria-label="下へ" @click="moveSort(item.id, 1)">
            <Icon name="lucide:chevron-down" class="h-3.5 w-3.5" />
          </button>
        </li>
      </ul>
      <p class="text-[11px] text-on-surface-variant">ハンドルをドラッグするか、↑↓ で並べ替え。</p>
    </template>

    <!-- 19. Sticky / Collapsing Header -->
    <template v-else-if="id === 'collapsing-header'">
      <UiCollapsingHeader title="プロフィール" subtitle="スクロールするとヘッダーが縮みます" body-height="22rem">
        <div v-for="i in 10" :key="i" class="rounded-lg border border-outline-variant bg-surface-container/30 px-3 py-3 text-xs text-on-surface">
          投稿 {{ i }} — ヘッダーは上に固定されたまま、タイトルだけが残ります。
        </div>
      </UiCollapsingHeader>
    </template>

    <!-- 20. Progressive Disclosure -->
    <template v-else-if="id === 'progressive-disclosure'">
      <UiProgressiveDisclosure title="基本設定" summary="通知と公開範囲" icon="lucide:settings-2" :default-open="true">
        <div class="space-y-2 text-xs text-on-surface-variant">
          <p>・通知は「メンションのみ」</p>
          <p>・投稿の既定公開範囲は「公開」</p>
        </div>
      </UiProgressiveDisclosure>
      <UiProgressiveDisclosure title="詳細設定" summary="データ・実験的な機能" icon="lucide:flask-conical">
        <div class="space-y-2 text-xs text-on-surface-variant">
          <p>・ベータ機能を有効にする</p>
          <p>・ローカルキャッシュを消去</p>
          <p>・エクスポート形式: JSON</p>
        </div>
      </UiProgressiveDisclosure>
      <UiProgressiveDisclosure title="危険な操作" summary="削除など" icon="lucide:alert-triangle" tone="warning">
        <p class="text-xs text-on-surface-variant">アカウントの削除など、取り消せない操作はここにまとめています。</p>
      </UiProgressiveDisclosure>
    </template>

    <!-- 21. Persistent Mini Player -->
    <template v-else-if="id === 'mini-player'">
      <div class="space-y-1.5">
        <div v-for="track in playerQueue" :key="track" class="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container/30 px-3 py-2.5">
          <Icon name="lucide:music" class="h-4 w-4 text-on-surface-variant" />
          <span class="text-xs text-on-surface">{{ track }}</span>
        </div>
        <p v-if="!playerOpen" class="pt-2 text-center text-[11px] text-on-surface-variant">
          プレイヤーは閉じられました
        </p>
      </div>
      <div class="sticky bottom-2">
        <UiMiniPlayerBar v-if="playerOpen" @close="playerOpen = false" />
        <button v-else type="button" class="w-full rounded-lg border border-outline-variant px-3 py-2 text-xs text-on-surface-variant" @click="playerOpen = true">
          プレイヤーを再表示
        </button>
      </div>
    </template>

    <!-- 22. Contextual UI -->
    <template v-else-if="id === 'contextual-ui'">
      <LongPress :delay="420" @longpress="openContextMenu">
        <div
          class="cursor-context-menu rounded-xl border border-outline-variant bg-surface-container/40 p-4"
          @contextmenu.prevent="openContextMenu"
        >
          <p class="text-xs font-bold text-on-surface">{{ contextCard }}</p>
          <p class="mt-1 text-[11px] text-on-surface-variant">
            右クリック、または長押しでメニューを開きます。
          </p>
          <div class="mt-3 flex gap-1.5">
            <span class="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-on-surface-variant">右クリック</span>
            <span class="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-on-surface-variant">長押し</span>
          </div>
        </div>
      </LongPress>
      <UiFloatingMenu
        :open="menuOpen"
        :x="menuX"
        :y="menuY"
        :items="menuItems"
        @close="menuOpen = false"
        @select="onMenuSelect"
      />
    </template>

    <!-- 23. Quick Actions -->
    <template v-else-if="id === 'quick-actions'">
      <div class="rounded-xl border border-outline-variant bg-surface-container/30 p-3">
        <p class="text-xs font-bold text-on-surface">投稿の操作</p>
        <p class="mb-2 text-[11px] text-on-surface-variant">対象のすぐ近くに操作を並べます。</p>
        <UiQuickActions :actions="quickActions" @action="onQuickAction" />
      </div>
      <p class="text-center text-[11px] text-on-surface-variant">選択: {{ quickLog }}</p>
    </template>

    <!-- 24. Reversible Actions -->
    <template v-else-if="id === 'reversible-actions'">
      <div class="space-y-1.5">
        <div v-for="item in reversibleItems" :key="item.id" class="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container/30 px-3 py-2.5">
          <span class="flex-1 text-xs text-on-surface">{{ item.text }}</span>
          <button type="button" class="rounded-lg p-1.5 text-red-300 transition hover:bg-red-500/15" aria-label="削除" @click="deleteReversible(item)">
            <Icon name="lucide:trash-2" class="h-4 w-4" />
          </button>
        </div>
        <p v-if="!reversibleItems.length" class="py-4 text-center text-[11px] text-on-surface-variant">すべて削除されました（トーストから元に戻せます）</p>
      </div>
      <p class="text-[11px] text-on-surface-variant">削除直後のトーストの「元に戻す」で復元できます。</p>
    </template>

    <!-- 25. Activity Timeline -->
    <template v-else-if="id === 'activity-timeline'">
      <div class="rounded-xl border border-outline-variant bg-surface-container/30 p-4">
        <UiActivityTimeline :items="timelineItems" />
      </div>
    </template>

    <!-- 26. Adaptive Navigation -->
    <template v-else-if="id === 'adaptive-navigation'">
      <UiAdaptiveNavPreview />
    </template>

    <!-- 27. Inline Interaction -->
    <template v-else-if="id === 'inline-interaction'">
      <div class="space-y-3 rounded-xl border border-outline-variant bg-surface-container/30 p-3">
        <UiInlineEdit
          v-model="inlineTitle"
          label="タイトル（クリックして編集）"
          :validate="validateInlineTitle"
          @save="saveInlineTitle"
        />

        <div class="flex items-center justify-between rounded-lg bg-surface-container/40 px-3 py-2">
          <span class="text-xs text-on-surface-variant">評価</span>
          <div class="flex items-center gap-0.5">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              class="p-1 transition active:scale-90"
              :aria-label="`${star}つ星`"
              @click="setRating(star)"
            >
              <Icon
                name="lucide:star"
                class="h-4 w-4"
                :class="star <= inlineRating ? 'fill-amber-400 text-amber-400' : 'text-on-surface-variant'"
              />
            </button>
          </div>
        </div>

        <button type="button" class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition hover:bg-white/5" :class="inlineLiked ? 'text-rose-400' : 'text-on-surface-variant'" @click="toggleInlineLike">
          <Icon name="lucide:heart" class="h-4 w-4" :class="inlineLiked ? 'fill-current' : ''" />
          {{ inlineLikes }} いいね
        </button>
      </div>
    </template>

    <!-- 28. Live Layout Editor -->
    <template v-else-if="id === 'live-layout-editor'">
      <LabLiveLayoutPanel />
    </template>

    <!-- 29. Design Tokens -->
    <template v-else-if="id === 'design-tokens'">
      <LabDesignTokenPanel />
    </template>

    <!-- 30. Modular Navigation -->
    <template v-else-if="id === 'modular-navigation'">
      <LabModularNavPanel />
    </template>

    <!-- 31. Interaction Mapping -->
    <template v-else-if="id === 'interaction-mapping'">
      <LabInteractionMapPanel />
    </template>

    <!-- 32. Workspace Profiles -->
    <template v-else-if="id === 'workspace-profiles'">
      <LabWorkspacePanel />
    </template>

    <!-- 33. Theme & Layout Presets -->
    <template v-else-if="id === 'theme-presets'">
      <LabThemePresetPanel />
    </template>

    <p v-else class="py-8 text-center text-xs text-on-surface-variant">
      このパターンのデモは準備中です。
    </p>
  </div>
</template>
