<script setup lang="ts">
const route = useRoute()
const mediaPane = useMediaPane()
const { map: customEmojiMap } = useCustomEmojis()

const rawTag = computed(() => {
  const p = route.params.tag
  return decodeURIComponent(Array.isArray(p) ? String(p[0] ?? '') : String(p ?? ''))
})

const tag = computed(() => rawTag.value.replace(/^#+/, '').toLowerCase())

const posts = ref<any[]>([])
const meta = ref<{ displayTag: string; postCount: number; recentPosts: number } | null>(null)
const loading = ref(true)
const loadingMore = ref(false)
const error = ref('')
const hasMore = ref(false)
const cursor = ref<string | null>(null)

const offset = ref(0)
const { sentinel, loading: sentinelBusy, reset: resetScroll } = useInfiniteScroll(async () => {
  await loadMore()
})

async function load(reset = true) {
  if (reset) {
    offset.value = 0
    cursor.value = null
    posts.value = []
    loading.value = true
    resetScroll()
  }
  error.value = ''
  try {
    const data = await $fetch<any>(`/api/hashtags/${encodeURIComponent(tag.value)}`, {
      params: reset ? { limit: 20 } : { limit: 20, cursor: cursor.value || undefined },
    })
    meta.value = {
      displayTag: data.displayTag,
      postCount: data.postCount,
      recentPosts: data.recentPosts,
    }
    if (reset) {
      posts.value = data.posts || []
    } else {
      const seen = new Set(posts.value.map(p => p.id))
      posts.value = [...posts.value, ...(data.posts || []).filter((p: any) => !seen.has(p.id))]
    }
    cursor.value = data.nextCursor || null
    hasMore.value = !!data.hasMore && !!cursor.value
  } catch (e: any) {
    error.value = e?.data?.message || 'ハッシュタグを読み込めませんでした'
    if (reset) posts.value = []
    hasMore.value = false
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function loadMore() {
  if (loading.value || loadingMore.value || !hasMore.value || !cursor.value) return
  loadingMore.value = true
  await load(false)
}

function openMedia(post: any) {
  mediaPane.openSmart(post, `#${meta.value?.displayTag || tag.value}`)
}

watch(tag, () => { load(true) })
onMounted(() => { load(true) })
</script>

<template>
  <div class="max-w-2xl mx-auto pb-24 min-[681px]:pb-6 min-h-full">
    <!-- Header -->
    <div class="sticky top-14 z-20 bg-surface/95 backdrop-blur border-b border-outline-variant">
      <div class="px-4 pt-4 pb-3">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Icon name="lucide:hash" class="h-6 w-6 text-indigo-400" />
          </div>
          <div class="min-w-0">
            <h1 class="text-lg font-bold text-on-surface truncate">#{{ meta?.displayTag || tag }}</h1>
            <p class="text-xs text-on-surface-variant">
              <template v-if="meta?.postCount">
                投稿 {{ meta.postCount }} 件
                <template v-if="meta.recentPosts > 0"> · 過去24時間で {{ meta.recentPosts }} 件</template>
              </template>
              <template v-else>ハッシュタグ</template>
            </p>
          </div>
        </div>
      </div>

      <!-- Search this tag -->
      <form class="px-4 pb-3" @submit.prevent="navigateTo({ path: '/search', query: { q: '#' + tag, type: 'posts' } })">
        <button
          type="submit"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container/50 border border-outline-variant text-sm text-on-surface-variant hover:text-on-surface hover:border-outline transition text-left"
        >
          <Icon name="lucide:search" class="w-4 h-4 shrink-0" />
          <span class="truncate">#{{ meta?.displayTag || tag }} で投稿を検索</span>
        </button>
      </form>
    </div>

    <p v-if="error" class="m-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{{ error }}</p>
    <p v-if="loading" class="text-center text-on-surface-variant py-10">読み込み中...</p>

    <template v-else-if="posts.length">
      <div class="divide-y divide-outline-variant">
        <button v-for="p in posts" :key="p.id" @click="openMedia(p)"
          class="w-full text-left px-4 py-3 flex gap-3 hover:bg-surface-container/30 transition">
          <img v-if="avatarSrc(p.user?.avatarUrl)" :src="avatarSrc(p.user.avatarUrl)" class="w-9 h-9 rounded-full object-cover shrink-0" alt="" />
          <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {{ p.user?.displayName?.charAt(0) || '?' }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-bold text-on-surface text-sm truncate">{{ p.user?.displayName || '不明' }}</span>
              <UserBadges :badges="p.user?.badges" />
              <span class="text-on-surface-variant text-xs shrink-0">@{{ p.user?.username }}</span>
            </div>
            <p class="text-on-surface text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-4"
              v-html="renderRichText(p.content, { custom: customEmojiMap })" />
          </div>
        </button>
      </div>

      <div ref="sentinel" class="h-1" aria-hidden="true" />
      <p v-if="loadingMore" class="text-center text-on-surface-variant py-4 text-sm">読み込み中...</p>
      <p v-else-if="!hasMore" class="text-center text-slate-600 py-4 text-xs">すべて表示しました</p>
    </template>

    <p v-else class="text-center text-on-surface-variant py-16">
      #{{ meta?.displayTag || tag }} の投稿はまだありません
    </p>
  </div>
</template>