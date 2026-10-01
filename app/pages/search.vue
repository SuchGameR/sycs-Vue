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

const tabs = [
  { key: 'all', label: 'すべて', icon: 'lucide:layout-grid' },
  { key: 'posts', label: '投稿', icon: 'lucide:message-square' },
  { key: 'hashtags', label: 'ハッシュタグ', icon: 'lucide:hash' },
  { key: 'users', label: 'ユーザー', icon: 'lucide:users' },
  { key: 'servers', label: 'サーバー', icon: 'lucide:server' },
] as const

// A `#tag` query is a hashtag lookup; hide the other tabs so the result list
// doesn't render empty "no posts" / "no users" sections. A bare word is NOT a
// tag query -- the tag grammar accepts plain words, so matching `#?` here
// would blank the tab bar whenever someone searched for a username.
const isTagQuery = computed(() => /^#[A-Za-z0-9_\u3040-\u30FF]+$/.test(queryStr.value.trim()))

function tagHref(tag: string) {
  return '/hashtag/' + encodeURIComponent(tag)
}

async function runSearch(silent = false) {
  const q = queryStr.value.trim()
  if (!q) return
  if (!silent) loading.value = true
  error.value = ''
  try {
    const data = await $fetch<{ users: any[]; posts: any[]; servers: any[]; hashtags: any[] }>('/api/search', {
      params: { q, type: tab.value === 'all' ? 'all' : tab.value },
    })
    results.value = data
    searched.value = true
  } catch (e: any) {
    error.value = e.data?.message || '検索に失敗しました'
  } finally {
    if (!silent) loading.value = false
  }
}

function submit() {
  const q = queryStr.value.trim()
  if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null }
  router.replace({ path: '/search', query: { q, type: tab.value } })
  if (q) runSearch()
}

function switchTab(t: 'all' | 'posts' | 'users' | 'servers' | 'hashtags') {
  tab.value = t
  router.replace({ path: '/search', query: { q: queryStr.value.trim() || undefined, type: t === 'all' ? undefined : t } })
  if (queryStr.value.trim()) runSearch()
}

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
watch(queryStr, (v) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { if (v.trim()) runSearch(true) }, 400)
})
onBeforeUnmount(() => { if (debounceTimer) clearTimeout(debounceTimer) })

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
  <div class="max-w-2xl mx-auto pb-24 min-[681px]:pb-6 min-h-full">
    <div class="sticky top-14 bg-surface/95 backdrop-blur z-20 border-b border-outline-variant">
      <form class="p-3" @submit.prevent="submit">
        <div class="flex items-center gap-3 h-12 px-4 rounded-full bg-surface-container/70 border border-transparent focus-within:border-indigo-500/60 transition">
          <Icon name="lucide:search" class="w-[18px] h-[18px] text-on-surface-variant shrink-0" />
          <input
            v-model="queryStr"
            type="search"
            placeholder="投稿・ユーザー・サーバーを検索"
            class="flex-1 min-w-0 bg-transparent text-on-surface placeholder-on-surface-variant focus:outline-none text-[15px]"
            autofocus
          />
          <button v-if="queryStr" type="button" class="w-6 h-6 flex items-center justify-center rounded-full bg-on-surface/10 text-on-surface-variant hover:text-on-surface hover:bg-on-surface/20 transition shrink-0"
            @click="queryStr = ''" title="クリア">
            <Icon name="lucide:x" class="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      <div class="flex gap-1.5 px-3 pb-3 overflow-x-auto">
        <button
          v-for="t in tabs" :key="t.key"
          @click="switchTab(t.key)"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition shrink-0"
          :class="tab === t.key ? 'bg-indigo-600/20 text-indigo-400' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50'"
        >
          <Icon :name="t.icon" class="w-3.5 h-3.5" /> {{ t.label }}
        </button>
      </div>
    </div>

    <div v-if="error" class="m-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{{ error }}</div>
    <div v-if="loading" class="text-center text-on-surface-variant py-10">検索中...</div>

    <div v-else-if="searched" class="divide-y divide-outline-variant">
      <!-- Posts -->
      <template v-if="tab !== 'servers'">
        <div v-if="tab === 'all'" class="px-3 py-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">投稿</div>
        <button v-for="p in results.posts" :key="p.id" @click="openMedia(p)"
          class="w-full text-left px-3 py-3 flex gap-3 hover:bg-surface-container/30 transition">
          <img v-if="avatarSrc(p.user?.avatarUrl)" :src="avatarSrc(p.user.avatarUrl)" class="w-9 h-9 rounded-full object-cover shrink-0" />
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
                :src="a.url" class="w-12 h-12 rounded-lg object-cover" />
              <span v-if="p.attachments.some((x: any) => !String(x.mime || '').startsWith('image/'))"
                class="flex items-center gap-1 text-[11px] text-on-surface-variant px-2 rounded-lg bg-surface-container/60">
                <Icon name="lucide:paperclip" class="w-3 h-3" />{{ p.attachments.filter((x: any) => !String(x.mime || '').startsWith('image/')).length }}
              </span>
            </div>
          </div>
        </button>
        <div v-if="tab !== 'all' && !results.posts.length" class="px-3 py-8 text-center text-on-surface-variant text-sm">投稿が見つかりません</div>
      </template>

      <!-- Hashtags -->
      <template v-if="tab !== 'servers'">
        <div v-if="tab === 'all'" class="px-3 py-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-t border-outline-variant">ハッシュタグ</div>
        <NuxtLink v-for="h in results.hashtags" :key="h.tag" :to="tagHref(h.tag)"
          class="w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-container/30 transition">
          <div class="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Icon name="lucide:hash" class="w-4 h-4 text-indigo-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-on-surface truncate">#{{ h.displayTag }}</p>
            <p class="text-xs text-on-surface-variant">{{ h.postCount }} 件の投稿</p>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-on-surface-variant shrink-0" />
        </NuxtLink>
        <div v-if="tab === 'hashtags' && !results.hashtags.length" class="px-3 py-8 text-center text-on-surface-variant text-sm">ハッシュタグが見つかりません</div>
      </template>

      <!-- Users -->
      <template v-if="tab !== 'posts' && tab !== 'hashtags'">
        <div v-if="tab === 'all'" class="px-3 py-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-t border-outline-variant">ユーザー</div>
        <NuxtLink v-for="u in results.users" :key="u.id" :to="`/profile/@${u.username}`"
          class="w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-container/30 transition">
          <img v-if="avatarSrc(u.avatarUrl)" :src="avatarSrc(u.avatarUrl)" class="w-9 h-9 rounded-full object-cover shrink-0" />
          <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">{{ u.displayName?.charAt(0) || '?' }}</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-on-surface truncate flex items-center gap-1">{{ u.displayName }}<UserBadges :badges="u.badges" /><UserTitle :title="u.title" /></p>
            <p class="text-xs text-on-surface-variant truncate">@{{ u.username }}<span v-if="u.bio"> · {{ u.bio }}</span></p>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-on-surface-variant shrink-0" />
        </NuxtLink>
        <div v-if="tab === 'users' && !results.users.length" class="px-3 py-8 text-center text-on-surface-variant text-sm">ユーザーが見つかりません</div>
      </template>

      <!-- Servers -->
      <template v-if="tab === 'servers' || tab === 'all'">
        <div v-if="tab === 'all'" class="px-3 py-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-t border-outline-variant">サーバー</div>
        <NuxtLink v-for="s in results.servers" :key="s.id" :to="`/servers/${s.id}`"
          class="w-full flex items-center gap-3 px-3 py-3 hover:bg-surface-container/30 transition">
          <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
            <img v-if="s.icon_url || s.iconUrl" :src="s.icon_url || s.iconUrl" class="w-full h-full object-cover" />
            <template v-else>{{ s.name?.charAt(0) || '?' }}</template>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-on-surface truncate">{{ s.name }}</p>
            <p class="text-xs text-on-surface-variant line-clamp-1">{{ s.description || `メンバー ${s.member_count ?? 0} 人` }}</p>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-on-surface-variant shrink-0" />
        </NuxtLink>
        <div v-if="tab === 'servers' && !results.servers.length" class="px-3 py-8 text-center text-on-surface-variant text-sm">サーバーが見つかりません</div>
      </template>

      <div v-if="!results.users.length && !results.posts.length && !results.servers.length && !results.hashtags.length"
        class="px-3 py-10 text-center text-on-surface-variant text-sm">「{{ queryStr }}」に一致する結果はありませんでした</div>
    </div>

    <div v-else class="px-4 py-12 text-center">
      <div class="w-14 h-14 mx-auto rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <Icon name="lucide:search" class="w-6 h-6 text-on-surface-variant" />
      </div>
      <p class="font-bold text-on-surface">何を探しますか？</p>
      <p class="text-on-surface-variant text-sm mt-1">投稿・ユーザー・サーバー・ハッシュタグを横断して探せます</p>
      <div class="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button v-for="ex in examples" :key="ex.q" @click="tryExample(ex.q)"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container/70 text-sm text-on-surface hover:bg-surface-container transition">
          <Icon :name="ex.icon" class="w-4 h-4 text-on-surface-variant" />
          {{ ex.q }}
        </button>
      </div>
    </div>
  </div>
</template>