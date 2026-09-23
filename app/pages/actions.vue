<script setup lang="ts">
const { map: customEmojiMap } = useCustomEmojis()

definePageMeta({ middleware: 'auth', layout: 'default' })

const route = useRoute()
const router = useRouter()

const categories = [
  { key: 'reactions', label: 'リアクション', icon: 'lucide:smile-plus' },
  { key: 'bookmarks', label: 'ブックマーク', icon: 'lucide:bookmark' },
  { key: 'reposts', label: 'リポスト', icon: 'lucide:repeat-2' },
  { key: 'history', label: '閲覧履歴', icon: 'lucide:eye' },
]
const categoryKeys = categories.map(c => c.key)
const activeTab = ref(categoryKeys.includes(String(route.query.tab)) ? String(route.query.tab) : 'notifications')

const endpoints: Record<string, string> = {
  reactions: '/api/actions/reactions',
  bookmarks: '/api/bookmarks',
  reposts: '/api/actions/reposts',
  history: '/api/actions/history',
}

const mediaPane = useMediaPane()
const { data: me } = useFetch('/api/auth/me', { key: 'activity-me' })

const items = ref<any[]>([])
const loading = ref(true)
const offset = ref(0)
const hasMore = ref(true)

const { sentinel, loading: loadingMore, reset: resetScroll } = useInfiniteScroll(async () => await load(false))

async function load(resetPage = true) {
  if (resetPage) {
    offset.value = 0
    hasMore.value = true
    items.value = []
    resetScroll()
    loading.value = true
  } else if (!hasMore.value) {
    return { hasMore: false }
  }
  try {
    let incoming: any[] = []
    if (activeTab.value === 'notifications') {
      const data = await $fetch<any>('/api/notifications', { params: { limit: FEED_PAGE_SIZE, offset: offset.value } })
      incoming = data.items || []
      offset.value = data.nextOffset ?? (offset.value + incoming.length)
      hasMore.value = data.hasMore ?? incoming.length === FEED_PAGE_SIZE
    } else {
      const data = await $fetch<any>(endpoints[activeTab.value], { params: { limit: FEED_PAGE_SIZE, offset: offset.value } })
      incoming = data.posts || []
      offset.value = data.nextOffset ?? (offset.value + incoming.length)
      hasMore.value = data.hasMore ?? incoming.length === FEED_PAGE_SIZE
    }
    if (resetPage) {
      items.value = incoming
    } else {
      const seen = new Set(items.value.map(x => x.id))
      items.value = [...items.value, ...incoming.filter(x => !seen.has(x.id))]
    }
    return { hasMore: hasMore.value }
  } catch {
    if (resetPage) items.value = []
    return { hasMore: false }
  } finally {
    if (resetPage) loading.value = false
  }
}

onMounted(() => load(true))

function selectTab(key: string) {
  activeTab.value = key
  router.replace({ query: key === 'notifications' ? {} : { tab: key } })
  load(true)
}

/* Realtime refresh for notifications */
const { on } = useRealtime()
let offs: Array<() => void> = []
function refreshNotifications() {
  if (activeTab.value === 'notifications') load(true)
}
onMounted(() => {
  offs = [
    on('activity.new', refreshNotifications),
    on('comment.new', refreshNotifications),
    on('reaction.update', refreshNotifications),
  ]
})
onUnmounted(() => offs.forEach(off => off()))

/* Open thread / media */
function openPost(post: any) {
  if (!post) return
  mediaPane.openSmart(post, 'アクティビティ')
}

function openNotification(n: any) {
  if (n.post) openPost(n.post)
  else if (n.actor) router.push(`/profile/@${n.actor.username}`)
}

/* Post action toggles */
function findPost(id: string) { return items.value.find(x => x.id === id) }

async function toggleRepost(postId: string) {
  const p = findPost(postId)
  if (!p) return
  try {
    if (p.reposted) { await $fetch(`/api/posts/${postId}/unrepost`, { method: 'POST' }); p.reposted = false; p.repostCount = Math.max(0, (p.repostCount || 0) - 1) }
    else { await $fetch(`/api/posts/${postId}/repost`, { method: 'POST' }); p.reposted = true; p.repostCount = (p.repostCount || 0) + 1 }
  } catch { /* ignore */ }
}

async function toggleBookmark(postId: string) {
  const p = findPost(postId)
  if (!p) return
  try {
    const res = await $fetch<{ bookmarked: boolean }>('/api/bookmarks/toggle', { method: 'POST', body: { postId } })
    p.bookmarked = res.bookmarked
  } catch { /* ignore */ }
}

/* Playlists */
const { playlists, loading: playlistsLoading, fetchList: fetchPlaylists } = usePlaylists()
onMounted(() => fetchPlaylists(true))

/* Notification helpers */
const notifMeta: Record<string, { icon: string; color: string; text: string }> = {
  like: { icon: 'lucide:heart', color: 'text-indigo-400', text: 'がいいねしました' },
  repost: { icon: 'lucide:repeat-2', color: 'text-green-400', text: 'がリポストしました' },
  comment: { icon: 'lucide:message-circle', color: 'text-sky-400', text: 'がコメントしました' },
  reaction: { icon: 'lucide:smile-plus', color: 'text-amber-400', text: 'がリアクションしました' },
  follow: { icon: 'lucide:user-plus', color: 'text-fuchsia-400', text: 'がフォローしました' },
  friend_request: { icon: 'lucide:users', color: 'text-emerald-400', text: 'が友達リクエストを送りました' },
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
</script>

<template>
  <div class="max-w-2xl mx-auto p-4 space-y-4">
    <h1 class="text-2xl font-bold text-white hidden min-[681px]:block">アクティビティ</h1>

    <!-- Notifications (primary) -->
    <button
      @click="selectTab('notifications')"
      class="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition"
      :class="activeTab === 'notifications' ? 'bg-indigo-600/20 border-indigo-500/50 text-white' : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:text-slate-200'"
    >
      <Icon name="lucide:bell" class="w-5 h-5" />
      <span class="font-medium">通知</span>
    </button>

    <!-- Categories (secondary) -->
    <div class="grid grid-cols-2 min-[681px]:grid-cols-4 gap-2">
      <button
        v-for="cat in categories"
        :key="cat.key"
        @click="selectTab(cat.key)"
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition border"
        :class="activeTab === cat.key ? 'bg-slate-800 border-slate-600 text-white' : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300'"
      >
        <Icon :name="cat.icon" class="w-4 h-4 shrink-0" />
        <span class="truncate">{{ cat.label }}</span>
      </button>
    </div>

    <div v-if="loading" class="text-center text-slate-500 py-8">読み込み中...</div>
    <template v-else>
      <!-- Notifications list -->
      <div v-if="activeTab === 'notifications'">
        <div v-if="!items.length" class="text-center text-slate-500 py-8">通知はまだありません</div>
        <div v-else class="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/20">
          <button
            v-for="n in items"
            :key="n.id"
            @click="openNotification(n)"
            class="w-full flex items-start gap-3 px-4 py-3 border-b border-slate-800 last:border-b-0 text-left hover:bg-slate-800/30 transition"
          >
            <div class="relative shrink-0">
              <img v-if="n.actor?.avatarUrl" :src="n.actor.avatarUrl" class="w-9 h-9 rounded-full object-cover" />
              <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {{ n.actor?.displayName?.charAt(0) || '?' }}
              </div>
              <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <Icon :name="notifMeta[n.type]?.icon || 'lucide:bell'" class="w-3 h-3" :class="notifMeta[n.type]?.color || 'text-slate-400'" />
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm text-slate-300">
                <span class="font-bold text-white">{{ n.actor?.displayName || '不明' }}</span>
                {{ notifMeta[n.type]?.text || 'がアクティビティをしました' }}
                <EmojiIcon v-if="n.type === 'reaction' && n.emoji" :emoji="n.emoji" size="sm" class="inline-block align-text-bottom" />
              </p>
              <p v-if="n.type === 'comment' && n.content" class="text-xs text-slate-500 truncate mt-0.5">{{ n.content }}</p>
              <p v-else-if="n.post?.content" class="text-xs text-slate-500 truncate mt-0.5">{{ n.post.content }}</p>
              <p class="text-[11px] text-slate-600 mt-0.5">{{ timeAgo(n.createdAt) }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Category post lists -->
      <div v-else>
        <div v-if="!items.length" class="text-center text-slate-500 py-8">
          {{ { reactions: 'リアクションした投稿がありません', bookmarks: 'ブックマークがありません', reposts: 'リポストした投稿がありません', history: '閲覧履歴がありません' }[activeTab] }}
        </div>
        <div v-else class="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/20">
          <PostItem
            v-for="post in items"
            :key="post.id"
            :post="post"
            :current-user-id="me?.user?.id"
            @toggle-repost="toggleRepost"
            @toggle-bookmark="toggleBookmark"
            @open-media="openPost"
          />
        </div>
      </div>

      <div ref="sentinel" class="h-1" aria-hidden="true"></div>
      <div v-if="loadingMore" class="text-center text-slate-500 py-4 text-sm">読み込み中...</div>
      <p v-else-if="items.length && !hasMore" class="text-center text-slate-600 py-4 text-xs">すべて表示しました</p>
    </template>

    <!-- Playlists -->
    <section class="pt-2">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <Icon name="lucide:list-video" class="w-5 h-5 text-indigo-400" />
          プレイリスト
        </h2>
        <button @click="fetchPlaylists(true)" class="text-xs text-slate-500 hover:text-slate-300 transition">更新</button>
      </div>
      <p class="text-xs text-slate-500 mb-3">動画や投稿をまとめて整理できます。</p>
      <div class="grid grid-cols-2 min-[681px]:grid-cols-3 gap-3">
        <NuxtLink
          v-for="list in playlists"
          :key="list.id"
          :to="`/playlists/${list.id}`"
          class="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-800/40 hover:border-indigo-500/60 transition"
        >
          <div class="aspect-video bg-slate-800 flex items-center justify-center">
            <img v-if="list.coverUrl" :src="list.coverUrl" class="w-full h-full object-cover" />
            <Icon v-else name="lucide:list-video" class="w-7 h-7 text-slate-600" />
          </div>
          <div class="p-2">
            <p class="text-sm text-white truncate">{{ list.name }}</p>
            <p class="text-[11px] text-slate-500">{{ list.count }} 件</p>
          </div>
        </NuxtLink>
      </div>
      <p v-if="!playlists.length && !playlistsLoading" class="text-center text-slate-600 text-sm py-4">
        プレイリストがありません。投稿の「…」→「プレイリストに追加」から作成できます。
      </p>
    </section>
  </div>
</template>
