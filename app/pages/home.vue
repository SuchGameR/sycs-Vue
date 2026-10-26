<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const posts = ref<any[]>([])
const loading = ref(true)
const manualRefreshing = ref(false)
const postError = ref('')
const composerOpen = ref(false)

const timelines = useCustomTimelines()
const mediaPane = useMediaPane()
const settings = useInteractionSettings()
const toast = useToast()
const { pulse } = useHaptics()
const { data: me } = useFetch('/api/auth/me', { key: 'home-me' })
const userSettings = ref(JSON.parse(me.value?.user?.settings || '{}'))
const refreshMode = computed(() => userSettings.value.refreshMode || 'auto')

let pollTimer: ReturnType<typeof setTimeout> | null = null
const offset = ref(0)
const cursor = ref('')
const hasMore = ref(true)

const { sentinel, loading: loadingMore, done, reset: resetScroll } = useInfiniteScroll(async () => {
  return await loadPosts(false)
})

async function loadPosts(reset = true, silent = false) {
  if (reset && !silent) loading.value = true
  if (reset) {
    offset.value = 0
    cursor.value = ''
    hasMore.value = true
    resetScroll()
  }
  if (!hasMore.value) return { hasMore: false }
  try {
    const pageSize = reset ? FEED_PAGE_SIZE : 5
    const data = await $fetch('/api/posts', {
      params: { ...timelines.buildQuery(), limit: pageSize, offset: offset.value, cursor: cursor.value },
    })
    const incoming = data.posts || []
    offset.value = data.nextOffset ?? (offset.value + incoming.length)
    if (typeof data.nextCursor === 'string' && data.nextCursor) cursor.value = data.nextCursor
    hasMore.value = data.hasMore ?? incoming.length === pageSize
    if (reset) {
      posts.value = incoming
    } else {
      const seen = new Set(posts.value.map(x => x.id))
      posts.value = [...posts.value, ...incoming.filter(p => !seen.has(p.id))]
    }
    return { hasMore: hasMore.value }
  } catch (e: any) {
    postError.value = e.data?.message || 'タイムラインの読み込みに失敗しました'
    if (reset) posts.value = []
  } finally {
    if (!silent) loading.value = false
  }
}

const pending = ref<any[]>([])
const atTop = ref(true)

function onMainScroll() {
  const el = document.querySelector('main')
  atTop.value = (el?.scrollTop ?? 0) <= 120
  if (atTop.value && pending.value.length) {
    posts.value = [...pending.value, ...posts.value]
    pending.value = []
  }
}

async function pollTop() {
  if (import.meta.client && document.hidden) return
  const data = await $fetch('/api/posts', {
    params: { ...timelines.buildQuery(), limit: FEED_PAGE_SIZE, offset: 0 },
  })
  const incoming = data.posts || []
  const existing = new Map(posts.value.map(p => [p.id, p]))
  const fresh: any[] = []
  for (const p of incoming) {
    const cur = existing.get(p.id)
    if (cur) Object.assign(cur, p)
    else if (!pending.value.some(x => x.id === p.id)) fresh.push(p)
  }
  if (!fresh.length) return
  // Only prepend when the user is already at the very top, otherwise stash the
  // new posts so the current scroll position is never yanked back.
  if (atTop.value) {
    posts.value = [...fresh, ...posts.value]
    pending.value = []
  } else {
    pending.value = [...fresh, ...pending.value]
  }
}

function startPolling() {
  stopPolling()
  if (refreshMode.value !== 'auto') return
  // The feed already rides on SSE for new posts; this poll only exists to pick up
  // edits/deletes to posts that are already on screen. Those are rare, so backing
  // off to 15s keeps the top of the feed fresh without re-fetching a whole page
  // of posts every 5 seconds on every open tab.
  pollTimer = setTimeout(async function tick() {
    try { await pollTop() } catch {}
    if (refreshMode.value === 'auto') pollTimer = setTimeout(tick, 15000)
  }, 15000)
}

function stopPolling() {
  if (pollTimer) { clearTimeout(pollTimer); pollTimer = null }
}

async function manualRefresh() {
  manualRefreshing.value = true
  try { await pollTop() } catch {} finally { manualRefreshing.value = false }
}

function flushPending() {
  if (!pending.value.length) return
  posts.value = [...pending.value, ...posts.value]
  pending.value = []
  document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
}

interface FeedScrollMemory {
  tabId: string
  topId: string
  offset: number
}

const scrollMemory = useState<FeedScrollMemory | null>('home-scroll-memory', () => null)

function mainEl() {
  return document.querySelector('main')
}

function captureScrollMemory() {
  const el = mainEl()
  if (!el) return
  const nodes = el.querySelectorAll<HTMLElement>('[data-post-id]')
  let topId = ''
  let offset = 0
  for (const node of nodes) {
    const rect = node.getBoundingClientRect()
    const top = rect.top - el.getBoundingClientRect().top
    if (top <= 8) {
      topId = node.dataset.postId || ''
      offset = top
    } else break
  }
  if (!topId && nodes.length) {
    const first = nodes[0]
    topId = first.dataset.postId || ''
    offset = first.getBoundingClientRect().top - el.getBoundingClientRect().top
  }
  if (!topId) { scrollMemory.value = null; return }
  scrollMemory.value = { tabId: timelines.activeId.value, topId, offset }
}

async function restoreScrollMemory() {
  const memory = scrollMemory.value
  const el = mainEl()
  if (!memory || !el || memory.tabId !== timelines.activeId.value) return

  for (let attempt = 0; attempt < 6; attempt++) {
    const node = el.querySelector<HTMLElement>(`[data-post-id="${CSS.escape(memory.topId)}"]`)
    if (node) {
      const delta = node.getBoundingClientRect().top - el.getBoundingClientRect().top
      el.scrollTop += delta - memory.offset
      onMainScroll()
      return
    }
    const before = posts.value.length
    const { hasMore } = await loadPosts(false, true)
    await nextTick()
    if (!hasMore || posts.value.length === before) return
  }
}

onMounted(() => {
  settings.hydrate()
  const el = mainEl()
  el?.addEventListener('scroll', onMainScroll, { passive: true })
  onMainScroll()
  loadPosts(true).then(async () => {
    await restoreScrollMemory()
    startPolling()
  })
})

onUnmounted(() => {
  captureScrollMemory()
  mainEl()?.removeEventListener('scroll', onMainScroll)
  stopPolling()
})

watch(() => timelines.activeId.value, () => {
  stopPolling()
  scrollMemory.value = null
  posts.value = []
  pending.value = []
  loadPosts(true).then(startPolling)
})

async function createPost(content: string, attachments?: Array<any>, visibility?: string, visibleTo?: string[]) {
  postError.value = ''
  try {
    await $fetch('/api/posts', { method: 'POST', body: { content, attachments, visibility, visibleTo } })
    await loadPosts(true, true)
    startPolling()
  } catch (e: any) {
    postError.value = e.data?.message || '投稿に失敗しました'
  }
}

function createFromSheet(content: string, attachments?: Array<any>, visibility?: string, visibleTo?: string[]) {
  composerOpen.value = false
  createPost(content, attachments, visibility, visibleTo)
}

function openMedia(post: any) {
  const label = timelines.activeTab.value.label
  mediaPane.openSmart(post, label)
}

async function toggleRepost(postId: string) {
  const p = posts.value.find(x => x.id === postId)
  if (!p) return

  // 楽観的 UI: 先に画面を更新し、失敗したら元へ戻す。
  const next = !p.reposted
  const prevCount = p.repostCount || 0
  p.reposted = next
  p.repostCount = Math.max(0, prevCount + (next ? 1 : -1))
  pulse('light')

  try {
    await $fetch(`/api/posts/${postId}/${next ? 'repost' : 'unrepost'}`, { method: 'POST' })
    toast.success(next ? 'リポストしました' : 'リポストを取り消しました', {
      icon: 'lucide:repeat-2',
      duration: 1800,
    })
  } catch {
    p.reposted = !next
    p.repostCount = prevCount
    toast.error('リポストに失敗しました')
  }
}

async function toggleBookmark(postId: string) {
  const p = posts.value.find(x => x.id === postId)
  if (!p) return

  const next = !p.bookmarked
  p.bookmarked = next
  pulse('light')

  try {
    const res = await $fetch<{ bookmarked: boolean }>('/api/bookmarks/toggle', { method: 'POST', body: { postId } })
    p.bookmarked = res.bookmarked
    toast.success(res.bookmarked ? 'ブックマークしました' : 'ブックマークを外しました', {
      icon: 'lucide:bookmark',
      duration: 1800,
    })
  } catch {
    p.bookmarked = !next
    toast.error('ブックマークに失敗しました')
  }
}

async function deletePost(postId: string) {
  if (!posts.value.some(p => p.id === postId)) return
  try {
    await $fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    posts.value = posts.value.filter(p => p.id !== postId)
    toast.success('投稿を削除しました', { icon: 'lucide:trash-2' })
  } catch {
    toast.error('投稿を削除できませんでした')
  }
}

function reportPost(postId: string) {
  void postId
  toast.info('投稿を報告しました。確認までしばらくお待ちください。', { icon: 'lucide:shield-alert' })
}
</script>

<template>
  <UiPullToRefresh
    :on-refresh="manualRefresh"
    :disabled="!settings.isEnabled('pull-to-refresh')"
    scroll-selector="main"
  >
    <div class="max-w-2xl mx-auto pb-24 min-[681px]:pb-6">
      <div class="p-0 space-y-4">
      <div v-if="postError" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{{ postError }}</div>

      <button v-if="refreshMode === 'manual'" @click="manualRefresh" :disabled="manualRefreshing"
        class="mx-auto flex items-center gap-2 px-6 py-2 rounded-full bg-surface-container text-sm text-on-surface hover:bg-surface-container-high transition disabled:opacity-50">
        <Icon name="lucide:refresh-ccw" class="w-4 h-4" :class="{ 'animate-spin': manualRefreshing }" />
        更新
      </button>

      <button v-if="pending.length" @click="flushPending"
        class="fixed top-16 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition">
        <Icon name="lucide:arrow-up" class="w-4 h-4" />
        新着 {{ pending.length }} 件
      </button>

      <!-- Composer stays inline on desktop only. On mobile the floating action
           button + sheet is the single entry point, so an inline box would push
           the feed below the fold and waste the top of the screen. -->
      <div class="hidden min-[681px]:block bg-surface-container/50 rounded-xl p-4 mt-4 border border-outline-variant overflow-hidden">
        <PostComposer @submit="createPost" />
      </div>

        <div v-if="loading" class="space-y-3" aria-busy="true" aria-label="タイムラインを読み込み中">
          <div
            v-for="i in 4"
            :key="i"
            class="rounded-xl border border-outline-variant bg-surface-container/20 p-3"
          >
            <UiSkeletonBlock circle />
            <UiSkeletonBlock :lines="3" class="mt-3" />
          </div>
        </div>
      <template v-else>
        <!-- Mobile: a hairline between posts so entries are separable while scrolling.
             Desktop keeps the single bordered card, where the posts already read
             as one panel. -->
        <div class="min-[681px]:rounded-xl min-[681px]:border min-[681px]:border-outline-variant overflow-hidden bg-surface/20">
          <div
            v-for="(post, idx) in posts" :key="post.id" :data-post-id="post.id"
            class="border-b border-outline-variant/40 min-[681px]:border-b-0"
            :class="idx === posts.length - 1 ? 'border-b-0' : ''"
          >
            <PostItem :post="post"
              :show-view-count="userSettings.showViewCount ?? true" :current-user-id="me?.user?.id"
              @toggle-repost="toggleRepost" @toggle-bookmark="toggleBookmark"
              @delete="deletePost" @report="reportPost" @open-media="openMedia" />
          </div>
          <UiEmptyState
            v-if="!posts.length"
            icon="lucide:sparkles"
            title="まだ投稿がありません"
            description="最初の投稿をして、タイムラインを始めましょう。フォローすると、ここに最新の投稿が流れます。"
            action-label="最初の投稿をする"
            @action="composerOpen = true"
          />
        </div>

        <div ref="sentinel" class="h-1" aria-hidden="true"></div>
        <div v-if="loadingMore" class="text-center text-on-surface-variant py-4 text-sm">読み込み中...</div>
        <p v-else-if="posts.length && !hasMore" class="text-center text-slate-600 py-4 text-xs">すべて表示しました</p>
      </template>
    </div>

    <!-- Mobile floating post button -->
    <button
      v-if="!composerOpen"
      @click="composerOpen = true"
      class="min-[681px]:hidden fixed right-4 bottom-20 z-[90] w-14 h-14 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-900/50 flex items-center justify-center active:scale-95 transition"
      title="投稿する"
    >
      <Icon name="lucide:plus" class="w-6 h-6" />
    </button>

    <!-- Mobile composer sheet -->
    <BottomSheet :open="composerOpen" height="min(85dvh, 40rem)" :dismiss-on-backdrop="true" @close="composerOpen = false">
      <div class="p-4">
        <div class="flex items-center justify-between mb-3">
          <span class="font-bold text-white">新規投稿</span>
          <button @click="composerOpen = false" class="p-1.5 rounded-lg text-on-surface-variant hover:text-white hover:bg-surface-container transition">
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>
        <PostComposer @submit="createFromSheet" />
      </div>
      </BottomSheet>
    </div>
  </UiPullToRefresh>
</template>
