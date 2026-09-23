<script setup lang="ts">
definePageMeta({ layout: 'default', middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const mediaPane = useMediaPane()
const { map: customEmojiMap } = useCustomEmojis()

const queryStr = ref(String(route.query.q || ''))
const tab = ref<'all' | 'posts' | 'users' | 'servers'>(String(route.query.type || 'all') as any)
const results = ref<{ users: any[]; posts: any[]; servers: any[] }>({ users: [], posts: [], servers: [] })
const loading = ref(false)
const error = ref('')
const searched = ref(false)

const tabs = [
  { key: 'all', label: 'すべて', icon: 'lucide:layout-grid' },
  { key: 'posts', label: '投稿', icon: 'lucide:message-square' },
  { key: 'users', label: 'ユーザー', icon: 'lucide:users' },
  { key: 'servers', label: 'サーバー', icon: 'lucide:server' },
] as const

async function runSearch(silent = false) {
  const q = queryStr.value.trim()
  if (!q) return
  if (!silent) loading.value = true
  error.value = ''
  try {
    const data = await $fetch<{ users: any[]; posts: any[]; servers: any[] }>('/api/search', {
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
  router.replace({ path: '/search', query: { q, type: tab.value } })
  if (q) runSearch()
}

function switchTab(t: 'all' | 'posts' | 'users' | 'servers') {
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
</script>

<template>
  <div class="max-w-2xl mx-auto pb-24 min-[681px]:pb-6 min-h-full">
    <div class="sticky top-14 bg-[#0b0f19]/95 backdrop-blur z-20 border-b border-slate-800">
      <form class="p-3 flex items-center gap-2" @submit.prevent="submit">
        <div class="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition">
          <Icon name="lucide:search" class="w-4 h-4 text-slate-500 shrink-0" />
          <input
            v-model="queryStr"
            type="search"
            placeholder="投稿・ユーザー・サーバーを検索"
            class="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
            autofocus
          />
          <button v-if="queryStr" type="button" class="p-0.5 text-slate-500 hover:text-white transition" @click="queryStr = ''">
            <Icon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>
        <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 transition shrink-0">
          検索
        </button>
      </form>

      <div class="flex gap-1 px-3 pb-2 overflow-x-auto">
        <button
          v-for="t in tabs" :key="t.key"
          @click="switchTab(t.key)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0"
          :class="tab === t.key ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'"
        >
          <Icon :name="t.icon" class="w-3.5 h-3.5" /> {{ t.label }}
        </button>
      </div>
    </div>

    <div v-if="error" class="m-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">{{ error }}</div>
    <div v-if="loading" class="text-center text-slate-500 py-10">検索中...</div>

    <div v-else-if="searched" class="divide-y divide-slate-800">
      <!-- Posts -->
      <template v-if="tab !== 'servers'">
        <div v-if="tab === 'all'" class="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">投稿</div>
        <button v-for="p in results.posts" :key="p.id" @click="openMedia(p)"
          class="w-full text-left px-3 py-3 flex gap-3 hover:bg-slate-800/30 transition">
          <img v-if="avatarSrc(p.user?.avatarUrl)" :src="avatarSrc(p.user.avatarUrl)" class="w-9 h-9 rounded-full object-cover shrink-0" />
          <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">{{ p.user?.displayName?.charAt(0) || '?' }}</div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-bold text-white text-sm truncate">{{ p.user?.displayName || '不明' }}</span>
              <span class="text-slate-500 text-xs shrink-0">@{{ p.user?.username }} · {{ timeAgo(p.createdAt) }}</span>
            </div>
            <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-3"
              v-html="renderRichText(p.content, { custom: customEmojiMap })" />
            <div v-if="p.attachments?.length" class="flex gap-1 mt-1.5">
              <img v-for="a in p.attachments.filter((x: any) => String(x.mime || '').startsWith('image/')).slice(0, 3)" :key="a.id"
                :src="a.url" class="w-12 h-12 rounded-lg object-cover" />
              <span v-if="p.attachments.some((x: any) => !String(x.mime || '').startsWith('image/'))"
                class="flex items-center gap-1 text-[11px] text-slate-500 px-2 rounded-lg bg-slate-800/60">
                <Icon name="lucide:paperclip" class="w-3 h-3" />{{ p.attachments.filter((x: any) => !String(x.mime || '').startsWith('image/')).length }}
              </span>
            </div>
          </div>
        </button>
        <div v-if="tab !== 'all' && !results.posts.length" class="px-3 py-8 text-center text-slate-600 text-sm">投稿が見つかりません</div>
      </template>

      <!-- Users -->
      <template v-if="tab !== 'posts'">
        <div v-if="tab === 'all'" class="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-800">ユーザー</div>
        <NuxtLink v-for="u in results.users" :key="u.id" :to="`/profile/@${u.username}`"
          class="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-800/30 transition">
          <img v-if="avatarSrc(u.avatarUrl)" :src="avatarSrc(u.avatarUrl)" class="w-9 h-9 rounded-full object-cover shrink-0" />
          <div v-else class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">{{ u.displayName?.charAt(0) || '?' }}</div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-white truncate flex items-center gap-1">{{ u.displayName }}<UserBadges :badges="u.badges" /><UserTitle :title="u.title" /></p>
            <p class="text-xs text-slate-500 truncate">@{{ u.username }}<span v-if="u.bio" class="text-slate-600"> · {{ u.bio }}</span></p>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-slate-600 shrink-0" />
        </NuxtLink>
        <div v-if="tab === 'users' && !results.users.length" class="px-3 py-8 text-center text-slate-600 text-sm">ユーザーが見つかりません</div>
      </template>

      <!-- Servers -->
      <template v-if="tab === 'servers' || tab === 'all'">
        <div v-if="tab === 'all'" class="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-800">サーバー</div>
        <NuxtLink v-for="s in results.servers" :key="s.id" :to="`/servers/${s.id}`"
          class="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-800/30 transition">
          <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
            <img v-if="s.icon_url || s.iconUrl" :src="s.icon_url || s.iconUrl" class="w-full h-full object-cover" />
            <template v-else>{{ s.name?.charAt(0) || '?' }}</template>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-white truncate">{{ s.name }}</p>
            <p class="text-xs text-slate-500 line-clamp-1">{{ s.description || `メンバー ${s.member_count ?? 0} 人` }}</p>
          </div>
          <Icon name="lucide:chevron-right" class="w-4 h-4 text-slate-600 shrink-0" />
        </NuxtLink>
        <div v-if="tab === 'servers' && !results.servers.length" class="px-3 py-8 text-center text-slate-600 text-sm">サーバーが見つかりません</div>
      </template>

      <div v-if="!results.users.length && !results.posts.length && !results.servers.length"
        class="px-3 py-10 text-center text-slate-600 text-sm">「{{ queryStr }}」に一致する結果はありませんでした</div>
    </div>

    <div v-else class="px-4 py-10 text-center">
      <Icon name="lucide:search" class="w-10 h-10 mx-auto text-slate-700 mb-3" />
      <p class="text-slate-500 text-sm">投稿・ユーザー・サーバーを横断検索</p>
      <p class="text-slate-700 text-xs mt-1">例: ゲーム、@ユーザー名、サーバー名</p>
    </div>
  </div>
</template>