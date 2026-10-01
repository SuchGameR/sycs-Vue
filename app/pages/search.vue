<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const mediaPane = useMediaPane()
const { map: customEmojiMap } = useCustomEmojis()

const queryStr = ref(String(route.query.q || ''))
const tab = ref<'all' | 'posts' | 'users' | 'servers' | 'hashtags'>(String(route.query.type || 'all') as any)
const results = ref<{ users: any[]; posts: any[]; servers: any[]; hashtags: any[] }>({ users: [], posts: [], servers: [], hashtags: [] })
const loading = ref(false)
const error = ref('')
const searched = ref(false)

/* ==========================================================================
   Filters
   --------------------------------------------------------------------------
   `media` / `sort` / `since` are the "genre" chips and the long-press panel.
   They live in the URL so a filtered search is shareable and survives reload.
   ========================================================================== */
type MediaKind = '' | 'image' | 'video' | 'audio' | 'model'

const GENRES: Array<{ value: MediaKind; label: string; icon: string }> = [
  { value: '', label: 'すべて', icon: 'lucide:layers' },
  { value: 'image', label: '画像', icon: 'lucide:image' },
  { value: 'video', label: '動画', icon: 'lucide:clapperboard' },
  { value: 'audio', label: '音楽', icon: 'lucide:music-4' },
  { value: 'model', label: '3D', icon: 'lucide:box' },
]

const SORTS = [
  { value: 'relevance', label: '関連度', icon: 'lucide:sparkles' },
  { value: 'new', label: '新しい順', icon: 'lucide:arrow-down-narrow-wide' },
  { value: 'old', label: '古い順', icon: 'lucide:arrow-up-narrow-wide' },
  { value: 'popular', label: '人気順', icon: 'lucide:flame' },
] as const

const PERIODS = [
  { value: '', label: 'すべての期間' },
  { value: 'day', label: '今日' },
  { value: 'week', label: '過去1週間' },
  { value: 'month', label: '過去1か月' },
  { value: 'year', label: '過去1年' },
] as const

const media = ref<MediaKind>((route.query.media as MediaKind) || '')
const sort = ref(String(route.query.sort || 'relevance'))
const since = ref(String(route.query.since || ''))

const filtersOpen = ref(false)
const advancedOpen = ref(false)

/** Badge on the filter button, so a hidden filter is never silently applied. */
const activeFilterCount = computed(() =>
  (media.value ? 1 : 0) + (sort.value !== 'relevance' ? 1 : 0) + (since.value ? 1 : 0)
)

/* ==========================================================================
   Compact header on scroll
   --------------------------------------------------------------------------
   The 56px app header is hidden on this page (see the layout), so the search UI
   owns the top of the screen. Past a small scroll threshold it shrinks and
   goes translucent, keeping the input reachable without eating the results.
   ========================================================================== */
const compact = ref(false)
const scroller = ref<HTMLElement | null>(null)

function onScroll() {
  const el = scroller.value
  if (!el) return
  compact.value = el.scrollTop > 24
}

/** Empty query switches the whole page into the Reels feed. */
const isReelMode = computed(() => !queryStr.value.trim())

const tabs = [
  { key: 'all', label: 'すべて', icon: 'lucide:layout-grid' },
  { key: 'posts', label: '投稿', icon: 'lucide:message-square' },
  { key: 'users', label: 'ユーザー', icon: 'lucide:users' },
  { key: 'hashtags', label: 'タグ', icon: 'lucide:hash' },
  { key: 'servers', label: 'サーバー', icon: 'lucide:server' },
] as const

/**
 * A `#tag` query is a hashtag lookup. A bare word is NOT: the tag grammar
 * accepts plain words, so matching `#?` here would blank the tab bar whenever
 * someone searched for a username.
 */
const isTagQuery = computed(() => /^#[A-Za-z0-9_\u3040-\u30FF]{1,20}$/.test(queryStr.value.trim()))

/** Tab bar shrinks to just the relevant filter while a tag lookup is active. */
const visibleTabs = computed(() => (isTagQuery.value ? tabs.filter(t => t.key === 'hashtags') : tabs))

/** Per-section totals, so each group header can say how many it holds. */
const counts = computed(() => ({
  posts: results.value.posts.length,
  users: results.value.users.length,
  servers: results.value.servers.length,
  hashtags: results.value.hashtags.length,
}))
const totalCount = computed(() => counts.value.posts + counts.value.users + counts.value.servers + counts.value.hashtags)

function tagHref(tag: string) {
  return '/hashtag/' + encodeURIComponent(tag)
}

async function runSearch(silent = false) {
  const q = queryStr.value.trim()
  if (!q) {
    results.value = { users: [], posts: [], servers: [], hashtags: [] }
    searched.value = false
    return
  }
  if (!silent) loading.value = true
  error.value = ''
  try {
    const data = await $fetch<{ users: any[]; posts: any[]; servers: any[]; hashtags: any[] }>('/api/search', {
      params: {
        q,
        type: tab.value === 'all' ? 'all' : tab.value,
        media: media.value || undefined,
        sort: sort.value !== 'relevance' ? sort.value : undefined,
        since: since.value || undefined,
      },
    })
    results.value = data
    searched.value = true
  } catch (e: any) {
    error.value = e?.data?.message || '検索に失敗しました'
  } finally {
    if (!silent) loading.value = false
  }
}

function syncUrl() {
  router.replace({
    path: '/search',
    query: {
      q: queryStr.value.trim() || undefined,
      type: tab.value === 'all' ? undefined : tab.value,
      media: media.value || undefined,
      sort: sort.value !== 'relevance' ? sort.value : undefined,
      since: since.value || undefined,
    },
  })
}

function submit() {
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null }
  syncUrl()
  runSearch()
}

function switchTab(t: 'all' | 'posts' | 'users' | 'servers' | 'hashtags') {
  tab.value = t
  syncUrl()
  if (queryStr.value.trim()) runSearch()
}

/** Genre chips: applying one re-runs the search and closes the panel. */
function setMedia(m: MediaKind) {
  media.value = m
  filtersOpen.value = false
  if (queryStr.value.trim()) { syncUrl(); runSearch() } else { syncUrl() }
}

function resetFilters() {
  media.value = ''
  sort.value = 'relevance'
  since.value = ''
  if (queryStr.value.trim()) { syncUrl(); runSearch() } else { syncUrl() }
}

function clearQuery() {
  queryStr.value = ''
  submit()
}

/* ==========================================================================
   Long press on the search box -> advanced filters
   --------------------------------------------------------------------------
   Pointer Events rather than touch events so it works with a mouse held down
   too. The timer is cancelled on movement past the slop threshold, so a normal
   drag-to-select or a scroll that begins on the box still behaves normally.
   ========================================================================== */
const inputRef = ref<HTMLInputElement | null>(null)
let pressTimer: ReturnType<typeof setTimeout> | null = null
let pressOrigin = { x: 0, y: 0 }
/** Set when the long press fires, so the trailing click can be swallowed. */
let suppressNextClick = false

function cancelPress() {
  if (pressTimer) { clearTimeout(pressTimer); pressTimer = null }
}

function onBoxPointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  pressOrigin = { x: e.clientX, y: e.clientY }
  suppressNextClick = false
  cancelPress()
  pressTimer = setTimeout(() => {
    pressTimer = null
    suppressNextClick = true
    advancedOpen.value = true
    filtersOpen.value = false
    // Drop focus so the keyboard does not cover the panel that just opened.
    inputRef.value?.blur()
    navigator.vibrate?.(12)
  }, 520)
}

function onBoxPointerMove(e: PointerEvent) {
  if (!pressTimer) return
  if (Math.hypot(e.clientX - pressOrigin.x, e.clientY - pressOrigin.y) > 10) cancelPress()
}

function onBoxPointerUp() {
  cancelPress()
}

function onBoxClick() {
  if (!suppressNextClick) return
  suppressNextClick = false
}

function onBoxContextMenu(e: MouseEvent) {
  // Only swallow the native callout when our own long press just handled it;
  // otherwise right-click paste on desktop would stop working.
  if (suppressNextClick) e.preventDefault()
}

/** Clicking outside the field closes whichever panel is open. */
function onPageClick(e: MouseEvent) {
  const el = searchFieldRef.value
  if (el && !el.contains(e.target as Node)) {
    filtersOpen.value = false
    advancedOpen.value = false
  }
}

const searchFieldRef = ref<HTMLElement | null>(null)

function openMedia(post: any) {
  mediaPane.openSmart(post, '検索')
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(queryStr, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  // Clearing the box returns to the reel feed, so the timer has to own that
  // transition too rather than leaving the previous results on screen.
  debounceTimer = setTimeout(() => { runSearch(true) }, 400)
})
onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  cancelPress()
})

const examples = [
  { q: '#ゲーム', icon: 'lucide:hash' },
  { q: 'お知らせ', icon: 'lucide:megaphone' },
  { q: '画像', icon: 'lucide:image' },
]

function tryExample(q: string) {
  queryStr.value = q
  submit()
}
</script>

<template>
  <div class="h-full flex flex-col" @click="onPageClick">
    <!-- ===== 検索ヘッダー: スクロールで縮む ===== -->
    <div
      class="sticky top-0 z-30 shrink-0 border-b transition-colors duration-300"
      :class="compact
        ? 'bg-surface/70 backdrop-blur-xl border-outline-variant/30'
        : 'bg-surface/95 backdrop-blur-md border-outline-variant'"
    >
      <form class="flex items-stretch gap-2 px-3 transition-all duration-300" :class="compact ? 'py-1.5' : 'py-3'" @submit.prevent="submit">
        <!-- 検索ボックス (長押しで詳細フィルター) -->
        <div
          ref="searchFieldRef"
          class="relative flex-1 min-w-0 flex items-center gap-2.5 rounded-2xl bg-surface-container/70 border transition-all duration-300 select-none"
          :class="compact
            ? 'h-10 px-3'
            : 'h-14 px-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.35)]'"
          @pointerdown="onBoxPointerDown"
          @pointermove="onBoxPointerMove"
          @pointerup="onBoxPointerUp"
          @pointercancel="onBoxPointerUp"
          @pointerleave="onBoxPointerUp"
          @contextmenu="onBoxContextMenu"
          @click="onBoxClick"
        >
          <Icon name="lucide:search" class="shrink-0 text-on-surface-variant" :class="compact ? 'w-4 h-4' : 'w-5 h-5'" />
          <input
            ref="inputRef"
            v-model="queryStr"
            type="search"
            placeholder="検索..."
            class="flex-1 min-w-0 bg-transparent text-on-surface placeholder-on-surface-variant focus:outline-none transition-all"
            :class="compact ? 'text-sm' : 'text-base'"
          />
          <button
            v-if="queryStr"
            type="button"
            class="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-on-surface/10 text-on-surface-variant hover:text-on-surface hover:bg-on-surface/20 transition"
            @click="clearQuery"
            title="クリア"
          >
            <Icon name="lucide:x" class="w-3.5 h-3.5" />
          </button>
          <!-- 長押しヒント -->
          <span
            v-if="!compact"
            class="hidden min-[681px]:flex items-center gap-1 shrink-0 text-[10px] text-on-surface-variant/70 border border-outline-variant rounded px-1.5 py-0.5"
          >長押しで詳細</span>
        </div>

        <!-- フィルター (右) -->
        <button
          type="button"
          @click="filtersOpen = !filtersOpen; advancedOpen = false"
          class="relative shrink-0 rounded-2xl bg-surface-container/70 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface transition-all duration-300 flex flex-col items-center justify-center gap-0.5"
          :class="compact ? 'w-12 h-10' : 'w-14 h-14'"
          :aria-expanded="filtersOpen"
          title="フィルター"
        >
          <Icon name="lucide:sliders-horizontal" :class="compact ? 'w-4 h-4' : 'w-5 h-5'" />
          <span v-if="!compact" class="text-[9px] font-bold leading-none">フィルタ</span>
          <span
            v-if="activeFilterCount"
            class="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface"
          >{{ activeFilterCount }}</span>
        </button>
      </form>

      <!-- ジャンルパネル: 下へ展開する -->
      <div class="grid transition-[grid-template-rows,opacity] duration-300 ease-out" :class="filtersOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
        <div class="overflow-hidden">
          <div class="px-3 pb-3">
            <p class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">ジャンル</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="g in GENRES" :key="g.value" type="button"
                @click="setMedia(g.value)"
                class="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold transition"
                :class="media === g.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'"
              >
                <Icon :name="g.icon" class="w-4 h-4 shrink-0" />
                {{ g.label }}
              </button>
            </div>
            <button
              v-if="activeFilterCount"
              type="button"
              @click="resetFilters"
              class="mt-3 flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-on-surface transition"
            >
              <Icon name="lucide:rotate-ccw" class="w-3.5 h-3.5" />
              フィルターをリセット
            </button>
          </div>
        </div>
      </div>

      <!-- 詳細フィルター (長押し) -->
      <div class="grid transition-[grid-template-rows,opacity] duration-300 ease-out" :class="advancedOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
        <div class="overflow-hidden">
          <div class="px-3 pb-3 space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">詳細フィルター</p>
              <button type="button" @click="advancedOpen = false" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface transition" title="閉じる">
                <Icon name="lucide:x" class="w-4 h-4" />
              </button>
            </div>

            <div>
              <p class="text-xs font-bold text-on-surface-variant mb-1.5">並び順</p>
              <div class="grid grid-cols-4 gap-1">
                <button
                  v-for="s in SORTS" :key="s.value" type="button"
                  @click="sort = s.value; syncUrl(); queryStr.trim() && runSearch()"
                  class="flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-bold transition"
                  :class="sort === s.value ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/60' : 'bg-surface-container/60 text-on-surface-variant hover:text-on-surface'"
                >
                  <Icon :name="s.icon" class="w-4 h-4" />
                  {{ s.label }}
                </button>
              </div>
            </div>

            <div>
              <p class="text-xs font-bold text-on-surface-variant mb-1.5">期間</p>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="p in PERIODS" :key="p.value" type="button"
                  @click="since = p.value; syncUrl(); queryStr.trim() && runSearch()"
                  class="px-3 py-1.5 rounded-full text-xs font-bold transition"
                  :class="since === p.value ? 'bg-indigo-600 text-white' : 'bg-surface-container/60 text-on-surface-variant hover:text-on-surface'"
                >
                  {{ p.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- タブ: スクロールで畳む -->
      <div
        class="flex gap-1 px-3 overflow-x-auto transition-all duration-300"
        :class="compact ? 'h-0 opacity-0 pb-0' : 'pb-3 opacity-100'"
      >
        <button
          v-for="t in visibleTabs"
          :key="t.key"
          @click="switchTab(t.key)"
          class="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 whitespace-nowrap"
          :class="tab === t.key
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface bg-surface-container/40'"
        >
          <Icon :name="t.icon" class="w-3.5 h-3.5 shrink-0" />
          {{ t.label }}
          <span
            v-if="tab === 'all' && !isTagQuery && t.key !== 'all' && counts[t.key as 'posts' | 'users' | 'servers' | 'hashtags']"
            class="opacity-70"
          >{{ counts[t.key as 'posts' | 'users' | 'servers' | 'hashtags'] }}</span>
        </button>
      </div>
    </div>

    <!-- ===== リールモード: 検索枠が空ならメディアがランダムに流れる ===== -->
    <div v-if="isReelMode" class="flex-1 min-h-0 pb-[var(--app-nav-clear)]">
      <MediaReelFeed :media="media" :sort="sort" />
    </div>

    <!-- ===== 検索結果 ===== -->
    <div v-else ref="scroller" class="flex-1 min-h-0 overflow-y-auto pb-[calc(var(--app-nav-clear)+1rem)]" @scroll.passive="onScroll">
      <div v-if="error" class="m-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{{ error }}</div>
      <div v-if="loading" class="text-center text-on-surface-variant py-10">検索中...</div>

      <template v-else-if="searched">
        <!-- 適用中のフィルター -->
        <div v-if="activeFilterCount" class="flex items-center gap-1.5 px-3 py-2 overflow-x-auto bg-surface-container/30">
          <Icon name="lucide:filter" class="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
          <span
            v-for="g in GENRES.filter(x => x.value === media)" :key="'m' + g.value"
            class="px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 text-[11px] font-bold shrink-0"
          >{{ g.label }}</span>
          <span
            v-if="sort !== 'relevance'"
            class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold shrink-0"
          >{{ SORTS.find(s => s.value === sort)?.label }}</span>
          <span
            v-if="since"
            class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold shrink-0"
          >{{ PERIODS.find(p => p.value === since)?.label }}</span>
        </div>

        <!-- 投稿 -->
        <section v-if="tab !== 'servers' && tab !== 'hashtags' && (counts.posts || tab === 'posts')">
          <h2 class="sticky top-0 z-10 bg-surface/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/60">
            投稿
            <span v-if="counts.posts" class="ml-1 opacity-70">{{ counts.posts }}</span>
          </h2>
          <button
            v-for="p in results.posts" :key="p.id" @click="openMedia(p)"
            class="w-full text-left px-3 py-3 flex gap-3 hover:bg-surface-container/30 transition border-b border-outline-variant/30"
          >
            <img v-if="avatarSrc(p.user?.avatarUrl)" :src="avatarSrc(p.user.avatarUrl)" class="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
            <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">{{ p.user?.displayName?.charAt(0) || '?' }}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-on-surface text-sm truncate">{{ p.user?.displayName || '不明' }}</span>
                <span class="text-on-surface-variant text-xs shrink-0">@{{ p.user?.username }} · {{ timeAgo(p.createdAt) }}</span>
              </div>
              <p class="text-on-surface text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-3"
                v-html="renderRichText(p.content, { custom: customEmojiMap })" />
              <div v-if="p.attachments?.length" class="flex gap-1 mt-1.5">
                <img v-for="a in p.attachments.filter((x: any) => String(x.mime || '').startsWith('image/')).slice(0, 3)" :key="a.id"
                  :src="a.url" class="w-12 h-12 rounded-lg object-cover" alt="" />
                <span v-if="p.attachments.some((x: any) => !String(x.mime || '').startsWith('image/'))"
                  class="flex items-center gap-1 text-[11px] text-on-surface-variant px-2 rounded-lg bg-surface-container/60">
                  <Icon name="lucide:paperclip" class="w-3 h-3" />{{ p.attachments.filter((x: any) => !String(x.mime || '').startsWith('image/')).length }}
                </span>
              </div>
            </div>
          </button>
        </section>

        <!-- ハッシュタグ -->
        <section v-if="tab !== 'servers' && tab !== 'posts' && (counts.hashtags || tab === 'hashtags')">
          <h2 class="sticky top-0 z-10 bg-surface/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-y border-outline-variant/60">
            ハッシュタグ
            <span v-if="counts.hashtags" class="ml-1 opacity-70">{{ counts.hashtags }}</span>
          </h2>
          <NuxtLink v-for="h in results.hashtags" :key="h.tag" :to="tagHref(h.tag)"
            class="w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-container/30 transition border-b border-outline-variant/30">
            <div class="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Icon name="lucide:hash" class="w-4 h-4 text-indigo-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-on-surface truncate">#{{ h.displayTag }}</p>
              <p class="text-xs text-on-surface-variant">{{ h.postCount }} 件の投稿</p>
            </div>
            <Icon name="lucide:chevron-right" class="w-4 h-4 text-on-surface-variant shrink-0" />
          </NuxtLink>
        </section>

        <!-- ユーザー -->
        <section v-if="tab !== 'posts' && tab !== 'hashtags' && (counts.users || tab === 'users')">
          <h2 class="sticky top-0 z-10 bg-surface/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-y border-outline-variant/60">
            ユーザー
            <span v-if="counts.users" class="ml-1 opacity-70">{{ counts.users }}</span>
          </h2>
          <NuxtLink v-for="u in results.users" :key="u.id" :to="`/profile/@${u.username}`"
            class="w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-container/30 transition border-b border-outline-variant/30">
            <img v-if="avatarSrc(u.avatarUrl)" :src="avatarSrc(u.avatarUrl)" class="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
            <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">{{ u.displayName?.charAt(0) || '?' }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-on-surface truncate flex items-center gap-1">{{ u.displayName }}<UserBadges :badges="u.badges" /><UserTitle :title="u.title" /></p>
              <p class="text-xs text-on-surface-variant truncate">@{{ u.username }}<span v-if="u.bio"> · {{ u.bio }}</span></p>
            </div>
            <Icon name="lucide:chevron-right" class="w-4 h-4 text-on-surface-variant shrink-0" />
          </NuxtLink>
        </section>

        <!-- サーバー -->
        <section v-if="tab === 'servers' || tab === 'all'">
          <h2 class="sticky top-0 z-10 bg-surface/95 backdrop-blur px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-y border-outline-variant/60">
            サーバー
            <span v-if="counts.servers" class="ml-1 opacity-70">{{ counts.servers }}</span>
          </h2>
          <NuxtLink v-for="s in results.servers" :key="s.id" :to="`/servers/${s.id}`"
            class="w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-container/30 transition border-b border-outline-variant/30">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
              <img v-if="s.icon_url || s.iconUrl" :src="s.icon_url || s.iconUrl" class="w-full h-full object-cover" alt="" />
              <template v-else>{{ s.name?.charAt(0) || '?' }}</template>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-on-surface truncate">{{ s.name }}</p>
              <p class="text-xs text-on-surface-variant line-clamp-1">{{ s.description || `メンバー ${s.member_count ?? 0} 人` }}</p>
            </div>
            <Icon name="lucide:chevron-right" class="w-4 h-4 text-on-surface-variant shrink-0" />
          </NuxtLink>
        </section>

        <p v-if="!totalCount" class="px-4 py-12 text-center text-on-surface-variant text-sm">
          「{{ queryStr }}」に一致する結果はありません
        </p>
      </template>

      <!-- 入力前: リールの説明 -->
      <div v-else class="px-4 py-10 text-center space-y-4">
        <div class="w-12 h-12 mx-auto rounded-2xl bg-surface-container flex items-center justify-center">
          <Icon name="lucide:search" class="w-5 h-5 text-on-surface-variant" />
        </div>
        <div>
          <p class="font-bold text-on-surface">下へスクロールでリール</p>
          <p class="text-on-surface-variant text-sm mt-1">検索枠に何も入れなければ、動画や画像、音楽がランダムに流れてきます</p>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2">
          <button v-for="ex in examples" :key="ex.q" @click="tryExample(ex.q)"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container/70 text-sm text-on-surface hover:bg-surface-container transition">
            <Icon :name="ex.icon" class="w-4 h-4 text-on-surface-variant" />
            {{ ex.q }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>