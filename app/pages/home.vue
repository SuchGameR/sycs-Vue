<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const posts = ref<any[]>([])
const loading = ref(true)
const manualRefreshing = ref(false)
const postError = ref('')
const composerOpen = ref(false)

const timelines = useCustomTimelines()
const mediaPane = useMediaPane()
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
    const data = await $fetch('/api/posts', {
      params: { ...timelines.buildQuery(), limit: FEED_PAGE_SIZE, offset: offset.value, cursor: cursor.value },
    })
    const incoming = data.posts || []
    offset.value = data.nextOffset ?? (offset.value + incoming.length)
    if (typeof data.nextCursor === 'string' && data.nextCursor) cursor.value = data.nextCursor
    hasMore.value = data.hasMore ?? incoming.length === FEED_PAGE_SIZE
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
  pollTimer = setTimeout(async function tick() {
    try { await pollTop() } catch {}
    if (refreshMode.value === 'auto') pollTimer = setTimeout(tick, 5000)
  }, 5000)
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

onMounted(() => {
  const el = document.querySelector('main')
  el?.addEventListener('scroll', onMainScroll, { passive: true })
  onMainScroll()
  loadPosts(true).then(startPolling)
})

onUnmounted(() => {
  document.querySelector('main')?.removeEventListener('scroll', onMainScroll)
  stopPolling()
})

watch(() => timelines.activeId.value, () => {
  stopPolling()
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
  try {
    if (p.reposted) {
      await $fetch(`/api/posts/${postId}/unrepost`, { method: 'POST' })
      p.reposted = false; p.repostCount = Math.max(0, (p.repostCount || 0) - 1)
    } else {
      await $fetch(`/api/posts/${postId}/repost`, { method: 'POST' })
      p.reposted = true; p.repostCount = (p.repostCount || 0) + 1
    }
  } catch {}
}

async function toggleBookmark(postId: string) {
  const p = posts.value.find(x => x.id === postId)
  if (!p) return
  try {
    const res = await $fetch<{ bookmarked: boolean }>('/api/bookmarks/toggle', { method: 'POST', body: { postId } })
    p.bookmarked = res.bookmarked
  } catch {}
}

async function deletePost(postId: string) {
  await $fetch(`/api/posts/${postId}`, { method: 'DELETE' })
  posts.value = posts.value.filter(p => p.id !== postId)
}

function reportPost(postId: string) { alert('報告しました') }
</script>

<template>
  <div class="max-w-2xl mx-auto pb-24 min-[681px]:pb-6">
    <div class="p-0 space-y-4">
      <div v-if="postError" class="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{{ postError }}</div>

      <button v-if="refreshMode === 'manual'" @click="manualRefresh" :disabled="manualRefreshing"
        class="mx-auto flex items-center gap-2 px-6 py-2 rounded-full bg-slate-800 text-sm text-slate-300 hover:bg-slate-700 transition disabled:opacity-50">
        <Icon name="lucide:refresh-ccw" class="w-4 h-4" :class="{ 'animate-spin': manualRefreshing }" />
        更新
      </button>

      <button v-if="pending.length" @click="flushPending"
        class="fixed top-16 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition">
        <Icon name="lucide:arrow-up" class="w-4 h-4" />
        新着 {{ pending.length }} 件
      </button>

      <div class="bg-slate-800/50 rounded-xl p-4 mt-4">
        <PostComposer @submit="createPost" />
      </div>

      <div v-if="loading" class="text-center text-slate-500 py-8">読み込み中...</div>
      <template v-else>
        <div class="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/20">
          <PostItem v-for="post in posts" :key="post.id" :post="post"
            :show-view-count="userSettings.showViewCount ?? true" :current-user-id="me?.user?.id"
            @toggle-repost="toggleRepost" @toggle-bookmark="toggleBookmark"
            @delete="deletePost" @report="reportPost" @open-media="openMedia" />
          <p v-if="!posts.length" class="text-center text-slate-500 py-8">まだ投稿がありません</p>
        </div>

        <div ref="sentinel" class="h-1" aria-hidden="true"></div>
        <div v-if="loadingMore" class="text-center text-slate-500 py-4 text-sm">読み込み中...</div>
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
    <Transition name="sheet">
      <div v-if="composerOpen" class="min-[681px]:hidden fixed inset-0 z-[200] flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60" @click="composerOpen = false" />
        <div class="relative bg-[#0f1420] border-t border-slate-800 rounded-t-2xl p-4 pb-6 max-h-[85vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-3">
            <span class="font-bold text-white">新規投稿</span>
            <button @click="composerOpen = false" class="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition">
              <Icon name="lucide:x" class="w-5 h-5" />
            </button>
          </div>
          <PostComposer @submit="createFromSheet" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.sheet-enter-active, .sheet-leave-active { transition: opacity 0.2s ease; }
.sheet-enter-active .relative, .sheet-leave-active .relative { transition: transform 0.2s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .relative, .sheet-leave-to .relative { transform: translateY(24px); }
</style>
